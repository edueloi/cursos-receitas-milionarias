import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCourseOutline = async (topic: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Erro: API Key não configurada.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Crie um esboço curto e atraente para um curso sobre "${topic}". 
      O público alvo são afiliados vendendo receitas.
      Retorne APENAS um texto com:
      1. Uma descrição chamativa de 1 parágrafo.
      2. Uma lista de 3 módulos sugeridos com nomes criativos.
      Use um tom profissional, inspirador e rico, focado em vendas e gastronomia.`,
    });
    
    return response.text || "Não foi possível gerar o conteúdo.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao comunicar com a IA.";
  }
};