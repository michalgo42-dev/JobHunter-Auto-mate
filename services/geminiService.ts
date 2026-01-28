import { GoogleGenAI } from "@google/genai";
import { ScanResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkWebsiteForJobs = async (
  siteName: string,
  url: string,
  keywords: string
): Promise<ScanResult> => {
  try {
    const model = "gemini-3-flash-preview"; 
    
    // Construct a prompt that forces the model to use search grounding to look at the specific site
    const prompt = `
      Twoim zadaniem jest sprawdzenie strony internetowej pod kątem nowych ofert pracy.
      
      Strona docelowa: ${url} (Nazwa firmy: ${siteName})
      Słowa kluczowe (opcjonalne): ${keywords ? keywords : "Wszystkie nowe oferty"}
      
      Użyj Google Search, aby znaleźć aktualną stronę "Kariera" lub "Praca" dla tej firmy i wylistuj znalezione, aktualne oferty pracy.
      Jeśli użytkownik podał słowa kluczowe, skup się na nich. Jeśli nie, wymień najnowsze pozycje.
      
      Format odpowiedzi:
      Proszę o zwięzłą listę w formacie Markdown. Każda oferta powinna być w nowej linii.
      Jeśli nie znaleziono ofert, napisz to wyraźnie.
      Na koniec podaj bezpośredni link do strony, na której znaleziono informacje.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Jesteś pomocnym asystentem HR. Odpowiadaj zawsze w języku polskim. Bądź konkretny i zwięzły.",
      },
    });

    // Extract text
    const text = response.text || "Nie udało się wygenerować podsumowania.";

    // Extract grounding metadata (links)
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title) || [];

    return {
      text,
      sources
    };

  } catch (error) {
    console.error("Błąd podczas sprawdzania strony:", error);
    throw new Error("Nie udało się sprawdzić strony. Upewnij się, że klucz API jest poprawny.");
  }
};
