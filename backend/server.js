const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer(); // Initialize multer to handle file uploads
app.use(cors()); // Enable CORS for frontend-backend communication
app.use(express.json());

const subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
const endpoint = process.env.AZURE_ENDPOINT;
const visionUrl = `${endpoint}/vision/v3.2/read/analyze`;

app.post('/api/ocr', upload.single('file'), async (req, res) => {
    try {
        const imageBuffer = req.file.buffer; // Get image file buffer from multer

        // Send the image to Azure Computer Vision API
        const response = await axios.post(visionUrl, imageBuffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            }
        });

        // Retrieve the operation-location URL for the OCR result
        const operationLocation = response.headers['operation-location'];

        // Poll the operationLocation URL until the OCR process is complete
        let result;
        let pollCount = 0;
        while (pollCount < 10) { // Limit polling attempts to prevent infinite loop
            pollCount++;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds between polls

            const resultResponse = await axios.get(operationLocation, {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                }
            });

            result = resultResponse.data;
            if (result.status === 'succeeded') {
                break;
            } else if (result.status === 'failed') {
                return res.status(500).json({ error: 'OCR processing failed.' });
            }
        }

        if (result.status !== 'succeeded') {
            return res.status(500).json({ error: 'OCR processing timed out.' });
        }

        // Extract text from OCR result
        const extractedText = result.analyzeResult.readResults
            .map((page) => page.lines.map((line) => line.text).join('\n'))
            .join('\n');

        res.json({ text: extractedText });
    } catch (error) {
        console.error('Error during OCR processing:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
