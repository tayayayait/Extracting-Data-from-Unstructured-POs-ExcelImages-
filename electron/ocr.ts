import { readFileSync } from 'node:fs';

/**
 * Sends image buffer to Google Cloud Vision API to extract text.
 * 
 * @param imagePath Absolute path to the local image file
 * @param apiKey Google Cloud API Key
 * @returns Extracted string
 */
export async function performOCR(imagePath: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Google Cloud Vision API Key is missing. Please configure it in Settings.');
  }

  try {
    const base64Image = readFileSync(imagePath, { encoding: 'base64' });

    const payload = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: "DOCUMENT_TEXT_DETECTION"
            }
          ]
        }
      ]
    };

    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Vision API Error (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    
    // Extract full text annotation
    let extractedText = '';
    if (json.responses && json.responses.length > 0 && json.responses[0].fullTextAnnotation) {
      extractedText = json.responses[0].fullTextAnnotation.text;
    }
    
    return extractedText;
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
}
