import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Parses raw OCR text into structured JSON using the Gemini API.
 * 
 * @param extractedText Raw text dumped from OCR
 * @param apiKey Google AI API Key
 * @returns Parsed JSON array of items
 */
export async function parseTextWithGemini(extractedText: string, apiKey: string): Promise<any> {
  if (!apiKey) {
    throw new Error('Google Gemini API Key is missing. Please configure it in Settings.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // User specifically requested gemini-3-flash-preview
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
당신은 비정형 거래명세서 및 발주서 데이터를 정형화된 JSON 포맷으로 배열 형태로 추출하는 데이터 파싱 전문가입니다.
다음 OCR 추출 텍스트를 분석하여 품목별 분할 데이터를 추출해 주세요.

필수 속성:
- itemName: 품명 (문자열)
- qty: 수량 (숫자, 없으면 0)
- unitPrice: 단가 (숫자, 없으면 0)
- spec_w: 규격 가로 (숫자, 없으면 0)
- spec_d: 규격 세로 (숫자, 없으면 0)
- spec_h: 규격 두께 (숫자, 없으면 0)

[OCR 문자열 데이터 시작]
${extractedText}
[OCR 문자열 데이터 끝]
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Parse Error:', error);
    throw error;
  }
}
