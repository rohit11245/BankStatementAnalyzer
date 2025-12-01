import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Define the response schema for strict JSON output
const transactionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      transaction_date: {
        type: Type.STRING,
        description: "The date of the transaction in YYYY-MM-DD format.",
      },
      transaction_title_or_description: {
        type: Type.STRING,
        description: "The description or title of the transaction.",
      },
      amount: {
        type: Type.NUMBER,
        description: "The transaction amount. Use negative values for debits/withdrawals and positive values for credits/deposits.",
      },
      notes: {
        type: Type.STRING,
        description: "Any additional notes, categories, reference numbers, or comments about ambiguity.",
      },
    },
    required: ["transaction_date", "transaction_title_or_description", "amount"],
  },
};

export const extractTransactions = async (
  fileBase64: string,
  mimeType: string
): Promise<Transaction[]> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `
            Analyze this bank statement image or PDF document. 
            Your task is to detect and extract every valid transaction row from the statement.

            Rules:
            1. Extract the 'transaction_date' and normalize it to YYYY-MM-DD.
            2. Extract the 'transaction_title_or_description'.
            3. Extract the 'amount'. Ensure debits (outflows) are negative numbers and credits (inflows) are positive numbers.
            4. Add any extra context found (like categories, check numbers) to 'notes'.
            5. Ignore headers, footers, page numbers, running balances, and advertisements. 
            6. If a line is ambiguous, make a best guess and add a note about the ambiguity.
            7. If no transactions are found, return an empty array.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
        temperature: 0.1, // Low temperature for more deterministic extraction
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      return [];
    }

    const data = JSON.parse(jsonText) as Transaction[];
    return data;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    throw new Error(error.message || "Failed to process document with Gemini.");
  }
};
