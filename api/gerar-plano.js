import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Serverless Function para gerar plano alimentar usando Google Gemini
 * Esta função roda no lado do servidor, protegendo a GOOGLE_API_KEY.
 */
export default async function handler(req, res) {
  // Garantir que é um método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { patientData, consultations } = req.body;

  if (!patientData) {
    return res.status(400).json({ error: 'Dados do paciente não fornecidos' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Configuração da API Key do Gemini ausente no servidor' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Usando modelo estável para 2026
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Preparar os dados para o prompt
    const formatValue = (val) => (val === null || val === undefined || val === '') ? 'Não informado' : val;
    
    // Calcular IMC se não vier pronto
    let imc = patientData.imc || 'Não informado';
    if (imc === 'Não informado' && patientData.peso_inicial && patientData.altura) {
      const h = patientData.altura > 3 ? patientData.altura / 100 : patientData.altura;
      imc = (patientData.peso_inicial / (h * h)).toFixed(1);
    }

    // Evolução de peso
    const evolucaoPeso = (consultations || [])
      .map(c => `${c.data_consulta}: ${c.peso}kg`)
      .join(', ') || 'Nenhuma consulta registrada';

    const prompt = `Você é um nutricionista clínico especialista. Gere um plano alimentar semanal (7 dias) personalizado para o paciente: ${patientData.nome}.
    
    PERFIL CRÍTICO DO PACIENTE (RESPEITE RIGOROSAMENTE):
    - Idade: ${formatValue(patientData.idade)}
    - Objetivos: ${formatValue(patientData.objetivos?.join(', '))} ${formatValue(patientData.objetivo_texto)}
    - Deficiência: ${patientData.possui_deficiencia ? `Sim (${patientData.tipo_deficiencia})` : 'Não informada'}
    - Alergias Alimentares: ${formatValue(patientData.alergias_texto)}
    - Restrições e Preferências: ${formatValue(patientData.restricoes_texto)}
    - Patologias: ${formatValue(patientData.patologias?.join(', '))}
    - Medicamentos/Suplementos: ${formatValue(patientData.medicamentos)} / ${formatValue(patientData.suplementos)}
    - Histórico de Evolução: ${evolucaoPeso}

    REGRAS DE GERAÇÃO:
    1. PROIBIDO sugerir alimentos que causem alergia ao paciente.
    2. Adaptar consistência e facilidade de preparo caso o paciente possua deficiências que impactem a alimentação.
    3. Respeitar as preferências e restrições (ex: se for vegano, não sugerir carne).
    4. O plano deve ser equilibrado e focado nos objetivos citados.

    ESTRUTURA OBRIGATÓRIA (JSON puro, sem markdown):
    {
      "titulo": "Plano Alimentar - ${patientData.nome}",
      "observacao_professional": "Sugestões personalizadas baseadas no seu perfil.",
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
    
    Repita para os 7 dias da semana. Use chaves exatas: cafe_da_manha, lanche_manha, almoco, lanche_tarde, jantar. Responda APENAS o JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpeza de segurança para garantir JSON válido
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    try {
      const jsonResponse = JSON.parse(cleanJson);
      return res.status(200).json(jsonResponse);
    } catch (parseError) {
      console.error("Erro ao processar JSON da IA:", cleanJson);
      return res.status(500).json({ error: 'Falha ao formatar o plano. Tente gerar novamente.' });
    }

  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    return res.status(500).json({ error: 'Erro ao conectar com a IA. Verifique sua chave de API.' });
  }
}
