import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { GoogleGenerativeAI } from "@google/generative-ai";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/gerar-plano': {
          target: 'http://localhost:5173',
          bypass: async (req, res) => {
            if (req.method === 'POST') {
              const apiKey = env.GOOGLE_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GOOGLE_API_KEY ausente' }));
                return;
              }

              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { patientData, consultations } = JSON.parse(body);
                  const genAI = new GoogleGenerativeAI(apiKey);
                  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                  const imc = patientData.imc || 'Não informado';
                  const prompt = `Você é um nutricionista especialista. Gere um plano alimentar semanal (7 dias) para o paciente: ${patientData.nome}.
                  
                  ESTRUTURA OBRIGATÓRIA (JSON puro, sem markdown):
                  {
                    "titulo": "Plano Alimentar - ${patientData.nome}",
                    "observacao_professional": "Sugestões personalizadas baseadas em seus objetivos.",
                    "plano_semanal": [
                      {
                        "dia": "Segunda-feira",
                        "refeicoes": {
                          "cafe_da_manha": ["Opção 1", "Opção 2"],
                          "lanche_manha": ["Opção 1"],
                          "almoco": ["Opção 1", "Opção 2"],
                          "lanche_tarde": ["Opção 1"],
                          "jantar": ["Opção 1"]
                        }
                      }
                    ]
                  }
                  
                  Repita para os 7 dias. Use as chaves exatas: cafe_da_manha, lanche_manha, almoco, lanche_tarde, jantar. Responda APENAS o JSON.`;
                  const result = await model.generateContent(prompt);
                  const response = await result.response;
                  const text = response.text();
                  const cleanJson = text.replace(/```json|```/g, "").trim();
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(cleanJson);
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
              return; // Isso diz ao Vite que o bypass lidou com a requisição
            }
          }
        }
      }
    }
  };
})
