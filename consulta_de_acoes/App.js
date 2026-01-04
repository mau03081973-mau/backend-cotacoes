import { useEffect, useState } from "react";
import { initDB, getDB } from "./src/database/db";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform, Button, ScrollView
} from "react-native";

export default function App() {
  useEffect(() => {
    initDB();
  }, []);
  useEffect(() => {
  initDB();
  atualizarCarteira();
}, []);

  async function salvarAcao(ticker, quantidade, precoCompra) {
  const db = await getDB();

  await db.runAsync(
    `INSERT INTO acoes (ticker, quantidade, preco_compra, data_compra)
     VALUES (?, ?, ?, datetime('now'))`,
    [ticker.toUpperCase(), quantidade, precoCompra]
  );

  alert("Ação salva com sucesso!");
}
async function listarAcoes(setAcoes) {
  const db = await getDB();
  const result = await db.getAllAsync("SELECT * FROM acoes");
  setAcoes(result);
}
useEffect(() => {
  initDB();
  listarAcoes();
}, []);
async function atualizarCarteira() {
  const db = await getDB();
  const acoesSalvas = await db.getAllAsync("SELECT * FROM acoes");
  const carteiraAtualizada = [];

  for (const acao of acoesSalvas) {
    try {
      const response = await fetch(
        `${BACKEND_URL}/cotacao/${acao.ticker}`
      );

      const dados = await response.json();

      const precoAtual = dados.preco;
      const valorInvestido = acao.quantidade * acao.preco_compra;
      const valorAtual = acao.quantidade * precoAtual;
      const lucro = valorAtual - valorInvestido;
      const percentual = (lucro / valorInvestido) * 100;

      carteiraAtualizada.push({
        ...acao,
        precoAtual,
        valorInvestido,
        valorAtual,
        lucro,
        percentual,
      });
    } catch (error) {
      console.log("Erro ao atualizar", acao.ticker);
    }
  }

  setAcoes(carteiraAtualizada);
  consolidarCarteira(carteiraAtualizada);

}
  const [acoes, setAcoes] = useState([]);
  const [ticker, setTicker] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [precoCompra, setPrecoCompra] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [totalInvestido, setTotalInvestido] = useState(0);
  const [totalAtual, setTotalAtual] = useState(0);
  const [lucroTotal, setLucroTotal] = useState(0);
  const [percentualTotal, setPercentualTotal] = useState(0);


  // ⚠️ TROQUE PELO IP DA SUA MÁQUINA
  const BACKEND_URL = "http://192.168.1.11:3000";

  const consultarCotacao = async () => {
    setErro("");
    setResultado(null);

    if (!ticker || !quantidade || !precoCompra) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${BACKEND_URL}/cotacao/${ticker}`
      );

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.erro);
      }

      const qtd = Number(quantidade);
      const preco = Number(precoCompra);

      const valorInvestido = qtd * preco;
      const valorAtual = qtd * data.precoAtual;
      const lucro = valorAtual - valorInvestido;
      const percentual = (lucro / valorInvestido) * 100;

      setResultado({
        ticker: data.ticker,
        precoAtual: data.precoAtual,
        valorInvestido,
        valorAtual,
        lucro,
        percentual,
        dataHora: data.dataHora,
      });
    } catch (error) {
      setErro("Erro ao consultar cotação");
    } finally {
      setLoading(false);
    }
  };

  
    <ScrollView>

      <Button
        title="Atualizar Carteira"
        onPress={atualizarCarteira}
      />

      {acoes.map(item => (
        <View key={item.id}>
          <Text>{item.ticker}</Text>
          <Text>Valor atual: R$ {item.valorAtual?.toFixed(2)}</Text>
        </View>
      ))}

    </ScrollView>
    ; 
function consolidarCarteira(carteira) {
  let investido = 0;
  let atual = 0;

  carteira.forEach(item => {
    investido += item.valorInvestido || 0;
    atual += item.valorAtual || 0;
  });

  const lucro = atual - investido;
  const percentual = investido > 0
    ? (lucro / investido) * 100
    : 0;

  setTotalInvestido(investido);
  setTotalAtual(atual);
  setLucroTotal(lucro);
  setPercentualTotal(percentual);
}


  return (   

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
<View style={{ padding: 10, backgroundColor: "#eee", marginBottom: 15 }}>
  <Text>Total investido: R$ {totalInvestido.toFixed(2)}</Text>
  <Text>Valor atual: R$ {totalAtual.toFixed(2)}</Text>
  <Text style={{ color: lucroTotal >= 0 ? "green" : "red" }}>
  Lucro/Prejuízo: R$ {lucroTotal.toFixed(2)}
</Text>
  <Text>Variação: {percentualTotal.toFixed(2)}%</Text>
</View>

      <Text style={styles.title}>📈 Consulta de Ações</Text>

      <TextInput
        style={styles.input}
        placeholder="Ticker (ex: PETR4)"
        value={ticker}
        onChangeText={setTicker}
        autoCapitalize="characters"
      />

      <TextInput
        style={styles.input}
        placeholder="Quantidade de ações"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <TextInput
        style={styles.input}
        placeholder="Preço de compra (R$)"
        keyboardType="numeric"
        value={precoCompra}
        onChangeText={setPrecoCompra}
      />

      <TouchableOpacity style={styles.button} onPress={consultarCotacao}>
        <Text style={styles.buttonText}>Consultar</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0066cc" />}

      {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

      {resultado && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{resultado.ticker}</Text>

          <Text>Preço atual: R$ {resultado.precoAtual.toFixed(2)}</Text>
          <Text>Valor investido: R$ {resultado.valorInvestido.toFixed(2)}</Text>
          <Text>Valor atual: R$ {resultado.valorAtual.toFixed(2)}</Text>

          <Text
            style={{
              color: resultado.lucro >= 0 ? "green" : "red",
              marginTop: 5,
            }}
          >
            Resultado: R$ {resultado.lucro.toFixed(2)} (
            {resultado.percentual.toFixed(2)}%)
          </Text>

          <Text style={styles.data}>
            Atualizado em: {new Date(resultado.dataHora).toLocaleString()}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  erro: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  card: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  data: {
    marginTop: 8,
    fontSize: 12,
    color: "#555",
  },
});
