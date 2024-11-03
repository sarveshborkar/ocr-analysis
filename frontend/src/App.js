import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const OCRApp = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [ocrText, setOcrText] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle image selection
    const handleImageUpload = (event) => {
        setSelectedImage(event.target.files[0]);
        setOcrText('');
    };

    // Function to send image to backend and fetch OCR text
    const handleExtractText = async () => {
        if (!selectedImage) {
            alert('Please upload an image first.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedImage);

        try {
            const response = await axios.post('http://localhost:5001/api/ocr', formData);
            setOcrText(response.data.text || 'No text recognized');
        } catch (error) {
            console.error('Error with OCR processing:', error);
            setOcrText('An error occurred while processing the image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Header>OCR Analytics</Header>

            {/* Image Upload Section */}
            <UploadSection>
                <FileInputLabel htmlFor="file-input">Select an image file</FileInputLabel>
                <FileInput id="file-input" type="file" accept="image/*" onChange={handleImageUpload} />
                {selectedImage && (
                    <Preview src={URL.createObjectURL(selectedImage)} alt="Uploaded preview" />
                )}
                <StartButton onClick={handleExtractText}>Analyze Text</StartButton>
            </UploadSection>

            {/* Loading and OCR Result Display */}
            {loading && <Loading>Processing...</Loading>}
            {!loading && ocrText && (
                <ResultSection>
                    <TextContainer>
                        <OCRText>{ocrText}</OCRText>
                    </TextContainer>
                </ResultSection>
            )}
        </Container>
    );
};

// Styled components for sleek design
const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Roboto', sans-serif;
    background: linear-gradient(135deg, #e0eafc, #cfdef3);
    min-height: 100vh;
    padding: 20px;
`;

const Header = styled.h1`
    font-size: 2.5rem;
    color: #333;
    margin-top: 30px;
    font-weight: 700;
    letter-spacing: 0.5px;
`;

const UploadSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    margin-top: 30px;
`;

const FileInputLabel = styled.label`
    font-size: 1rem;
    color: rgba(50, 50, 50, 0.8);
    margin-bottom: 15px;
    font-weight: 500;
`;

const FileInput = styled.input`
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid rgba(200, 200, 200, 0.5);
    border-radius: 8px;
    width: 100%;
    max-width: 300px;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.05);
`;

const Preview = styled.img`
    width: 300px;
    height: auto;
    margin-top: 15px;
    border-radius: 10px;
    transition: transform 0.3s ease;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);

    &:hover {
        transform: scale(1.05);
    }
`;

const StartButton = styled.button`
    padding: 14px 28px;
    font-size: 1rem;
    font-weight: 600;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0px 4px 20px rgba(106, 17, 203, 0.4);
    }
`;

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const Loading = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    color: rgba(50, 50, 50, 0.8);
    font-weight: bold;
    margin-top: 20px;

    &::before {
        content: '';
        width: 24px;
        height: 24px;
        margin-right: 10px;
        border: 3px solid rgba(106, 17, 203, 0.5);
        border-top: 3px solid transparent;
        border-radius: 50%;
        animation: ${spin} 1s linear infinite;
    }
`;

const ResultSection = styled.div`
    display: flex;
    justify-content: center;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    margin-top: 30px;
    width: 100%;
    max-width: 800px;
    padding: 20px;
`;

const TextContainer = styled.div`
    max-width: 90%;
    padding: 20px;
    background-color: rgba(240, 240, 240, 0.8);
    border-radius: 10px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.05);
`;

const OCRText = styled.p`
    white-space: pre-wrap;
    font-size: 1rem;
    color: #333;
    line-height: 1.6;
`;

export default OCRApp;