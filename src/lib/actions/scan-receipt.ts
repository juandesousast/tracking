"use server";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Account, PropFirm } from "@/types/database";

export interface ScannedReceiptResult {
  amount: number;
  type: "expense" | "withdrawal";
  category: string;
  firm_name: string;
  date: string;
  description: string;
  account_number_candidate?: string;
  alias_candidate?: string;
}



export async function scanReceiptAction(payload: {
  base64Data: string;
  mimeType: string;
}): Promise<{ success: boolean; data?: ScannedReceiptResult; error?: string }> {
  const { base64Data, mimeType } = payload;
  const rawOpenRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterApiKey = rawOpenRouterKey ? rawOpenRouterKey.trim().replace(/^["']|["']$/g, "") : "";

  const imageUrl = base64Data.startsWith("data:")
    ? base64Data
    : `data:${mimeType};base64,${base64Data}`;

  if (openRouterApiKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "PropFirm Tracker",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: 'Analiza este comprobante financiero o certificado de prop trading. Responde EXCLUSIVAMENTE con un JSON válido (sin bloques de código markdown ni texto adicional) con esta estructura exacta: {"amount": number, "type": "expense" | "withdrawal", "category": string, "firm_name": string, "date": "YYYY-MM-DD", "description": string, "account_number_candidate": string | null, "alias_candidate": string | null}',
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || "";
        const cleanJsonStr = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData: ScannedReceiptResult = JSON.parse(cleanJsonStr);

        // Normalize type
        if (parsedData.type !== "withdrawal") {
          parsedData.type = "expense";
        }

        return { success: true, data: parsedData };
      } else {
        const errText = await response.text();
        console.warn("Error en respuesta de OpenRouter:", errText);
      }
    } catch (err: any) {
      console.warn("Fallo OpenRouter, intentando fallback Gemini direct SDK:", err?.message || err);
    }
  }

  // Fallback to Gemini Direct SDK
  try {
    const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const apiKey = rawGeminiKey ? rawGeminiKey.trim().replace(/^["']|["']$/g, "") : "";
    if (!apiKey) {
      return {
        success: false,
        error: "Falta OPENROUTER_API_KEY o GEMINI_API_KEY en .env.local",
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ["gemini-2.0-flash-lite", "gemini-2.0-flash-exp", "gemini-2.0-flash"];

    const cleanBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    const prompt = `Analiza este comprobante o factura de trading/fondeo y extrae la información financiera requerida en formato JSON. Si aparece en el comprobante el número de cuenta de trading o alias de la cuenta, extráelos en account_number_candidate o alias_candidate. Formato de fecha obligatorio: YYYY-MM-DD.`;

    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                amount: { type: SchemaType.NUMBER },
                type: { type: SchemaType.STRING },
                category: { type: SchemaType.STRING },
                firm_name: { type: SchemaType.STRING },
                date: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                account_number_candidate: { type: SchemaType.STRING },
                alias_candidate: { type: SchemaType.STRING },
              },
              required: ["amount", "type", "category", "firm_name", "date", "description"],
            },
          },
        });

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: cleanBase64, mimeType } },
        ]);

        const responseText = typeof result?.response?.text === "function" ? result.response.text() : "";
        if (!responseText) {
          throw new Error("El modelo retornó una respuesta vacía.");
        }
        const parsedData: ScannedReceiptResult = JSON.parse(responseText);

        return { success: true, data: parsedData };
      } catch (err: any) {
        lastError = err?.message || err;
      }
    }

    return {
      success: false,
      error: typeof lastError === "string" ? lastError : lastError?.message || "Error al procesar el comprobante con IA.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Error al procesar el comprobante.",
    };
  }
}

