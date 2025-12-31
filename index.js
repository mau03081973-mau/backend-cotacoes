import express from "express";
import cors from "cors";
import YahooFinance from "yahoo-finance2";

const app = express();
app.use(cors());
app.use(express.json());

const yahooFinance = new YahooFinance();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("🚀 Backend de cotações rodando!");
});

app.get("/cotacao/:ticker", async (req, res) => {
  try {
    const rawTicker = req.params.ticker.toUpperCase();
    const ticker = rawTicker.includes(".SA")
      ? rawTicker
      : rawTicker + ".SA";

    const quote = await yahooFinance.quote(ticker);

    if (!quote || !quote.regularMarketPrice) {
      throw new Error("Cotação não encontrada");
    }

    res.json({
      ticker,
      precoAtual: quote.regularMarketPrice,
      dataHora: new Date(quote.regularMarketTime * 1000),
      moeda: quote.currency,
    });
  } catch (error) {
    console.error("❌ ERRO REAL:", error.message);
    res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
