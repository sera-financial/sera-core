const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');

// Set your API key and image path
const API_KEY = 'YOUR_ROBOFLOW_API_KEY';
const IMAGE_PATH = './container1.jpeg';

const runOCR = async () => {
    try {
        // Load and process the image
        const imageBuffer = await sharp(IMAGE_PATH)
            .resize({ width: 800 }) // Resize if necessary
            .toBuffer();

        // Convert image to base64
        const base64Image = imageBuffer.toString('base64');

        // Prepare data for OCR request
        const data = {
            image: {
                type: 'base64',
                value: base64Image
            }
        };

        // Make a request to the OCR endpoint
        const ocrResponse = await axios.post(`https://infer.roboflow.com/doctr/ocr?api_key=${API_KEY}`, data);
        console.log(ocrResponse.data);
        
    } catch (error) {
        console.error('Error during OCR:', error);
    }
};

runOCR();
