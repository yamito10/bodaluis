const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

export async function extractPaymentInfo(file: File) {
  try {
    const base64 = await fileToBase64(file);
    
    // Usamos el modelo gratuito de Gemini 2.0 Flash Lite a través de OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost:5173", // Required by OpenRouter
        "X-Title": "Cancun Payment Tracker", // Required by OpenRouter
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Modelo gratuito con visión
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the following information from this payment receipt image: 'monto' (number), 'fecha' (YYYY-MM-DD or readable format), 'codigoAutorizacion' (string). Return ONLY a JSON object with these keys. No markdown blocks, just the JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: base64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter Error Data:", errorData);
      throw new Error(`API Request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    // Parse potentially markdown wrapped JSON
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("OpenRouter Error:", error);
    throw new Error("Failed to extract information from image.");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
