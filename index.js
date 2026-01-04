import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// --- Configurações da BrAPI ---
const BRAPI_URL_BASE = "https://brapi.dev/api/quote";
const BRAPI_TOKEN = process.env.BRAPI_TOKEN || "dUqjqAHdty7BWcNqjcPJi4";
// --------------------------------

// Rota de Teste
app.get('/', (req, res) => {
  res.status(200).json({
    status: "Servidor Backend de Cotações está rodando em 2026!"
  });
});

// Rota Principal de Cotação
app.get('/cotacao/:ticker', async (req, res) => {
  let { ticker } = req.params;

  try {
    // 🔥 Normalização do ticker
    ticker = ticker.toUpperCase();
    if (!ticker.endsWith(".SA")) {
      ticker = `${ticker}.SA`;
    }

    const fullUrl = `${BRAPI_URL_BASE}/${ticker}?token=${BRAPI_TOKEN}`;

    const response = await fetch(fullUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BrAPI ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.results) || data.results.length === 0) {
      return res.status(404).json({
        erro: "Ativo não encontrado na BrAPI"
      });
    }

    const stock = data.results[0];

    const cotacaoFormatada = {
      ticker: stock.symbol,
      nome: stock.longName || stock.shortName || ticker,
      precoAtual: stock.regularMarketPrice,
      variacaoPercentual: stock.regularMarketChangePercent ?? null,
      horario: stock.regularMarketTime
    };

    res.status(200).json(cotacaoFormatada);

  } catch (error) {
    console.error(`Erro ao buscar ${ticker}:`, error.message);
    res.status(500).json({
      erro: "Falha ao obter a cotação na BrAPI",
      detalhe: error.message
    });
  }
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
