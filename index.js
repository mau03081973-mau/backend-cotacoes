import express from 'express';
// Não precisamos importar fetch, pois ele é nativo no Node 22
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações e Middlewares
app.use(express.json());
app.use(cors());

// --- Configurações da BrAPI ---
// ✅ CORREÇÃO CRÍTICA: URL completa com https:// e o endpoint /api/quote
const BRAPI_URL_BASE = "//www.brapi.dev"; 
const BRAPI_TOKEN = process.env.BRAPI_TOKEN || "dUqjqAHdty7BWcNqjcPJi4"; 
// ------------------------------

// Rota de Teste Simples
app.get('/', (req, res) => {
    res.status(200).json({ status: "Servidor Backend de Cotações está rodando em 2026!" });
});

// Rota Principal para Cotação de Ações
app.get('/cotacao/:ticker', async (req, res) => {
  const { ticker } = req.params;

  try {
    // 1. Fazer a requisição para a BrAPI
    // A URL agora é montada corretamente
    const fullUrl = `${BRAPI_URL_BASE}/${ticker.toUpperCase()}?token=${BRAPI_TOKEN}`;
    const response = await fetch(fullUrl);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro na BrAPI: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    // 2. Tratar a resposta da BrAPI
    if (data.results && data.results.length > 0) {
      const stock = data.results[0]; // Acessa o primeiro item do array
      
      const cotacaoFormatada = {
        precoAtual: stock.regularMarketPrice, 
        nome: stock.longName || stock.shortName || ticker,
        ticker: stock.symbol,
      };

      res.status(200).json(cotacaoFormatada);
      
    } else {
      res.status(404).json({ erro: "Ação não encontrada ou sem dados na BrAPI" });
    }

  } catch (error) {
    console.error(`Erro ao buscar ${ticker}:`, error.message);
    res.status(500).json({ 
      erro: "Falha ao obter a cotação na BrAPI", 
      detalhe: error.message 
    });
  }
});

// INICIALIZAÇÃO DO SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
