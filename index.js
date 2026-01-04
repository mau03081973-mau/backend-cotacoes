const express = require('express');
const fetch = require('node-fetch'); // Necessário se você estiver em uma versão antiga do Node.
const cors = require('cors'); // Importe o CORS para evitar erros de segurança no frontend

const app = express();
const PORT = process.env.PORT || 3000; // Usa a porta do Render ou 3000 localmente

// Configurações e Middlewares
app.use(express.json());
app.use(cors()); // Permite que seu frontend no Expo acesse este backend

// --- Configurações da BrAPI ---
// Importante: use HTTPS na URL base
const BRAPI_URL_BASE = "brapi.dev"; 
const BRAPI_TOKEN = process.env.BRAPI_TOKEN || "dUqjqAHdty7BWcNqjcPJi4"; // Use variáveis de ambiente no Render!
// ------------------------------

// Rota de Teste Simples
app.get('/', (req, res) => {
    res.status(200).json({ status: "Servidor Backend de Cotações está rodando!" });
});

// Rota Principal para Cotação de Ações
app.get('/cotacao/:ticker', async (req, res) => {
  const { ticker } = req.params;

  try {
    // 1. Fazer a requisição para a BrAPI
    const fullUrl = `${BRAPI_URL_BASE}/${ticker}?token=${BRAPI_TOKEN}`;
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
        // Captura erros específicos da BrAPI, como 404 (não encontrado)
        const errorData = await response.json();
        throw new Error(`Erro na BrAPI: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    // 2. Tratar a resposta da BrAPI
    if (data.results && data.results.length > 0) {
      // A BrAPI retorna um array, pegamos o primeiro item (o [0])
      const stock = data.results[0];
      
      // Mapear os dados para o formato que seu Front-end espera
      const cotacaoFormatada = {
        precoAtual: stock.regularMarketPrice, // Campo principal da BrAPI
        nome: stock.longName || stock.shortName || ticker,
        ticker: stock.symbol,
        // Inclua outros campos se necessário
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
