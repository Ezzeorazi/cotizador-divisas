import { useState } from "react";

const RATES = {
  USD: 1,
  MXN: 18.0,
  ARS: 1500.0,
};

function App() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MXN");

  const convert = () => {
    const value = parseFloat(amount);
    if (isNaN(value)) {
      return { USD: 0, MXN: 0, ARS: 0 };
    }

    // Pasar todo a USD
    const usd =
      currency === "USD" ? value : value / RATES[currency];

    return {
      USD: usd,
      MXN: usd * RATES.MXN,
      ARS: usd * RATES.ARS,
    };
  };

  const converted = convert();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-4">
        <h1 className="text-lg font-semibold text-center mb-4">
          Conversor de Monedas
        </h1>

        <input
          type="number"
          inputMode="decimal"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded p-2 mb-3 text-lg"
        />

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full border rounded p-2 mb-4 text-lg"
        >
          <option value="MXN">Peso Mexicano (MXN)</option>
          <option value="USD">Dólar (USD)</option>
          <option value="ARS">Peso Argentino (ARS)</option>
        </select>

        <div className="space-y-2 text-lg">
          <p>
            USD: <strong>{converted.USD.toFixed(2)}</strong>
          </p>
          <p>
            MXN: <strong>{converted.MXN.toFixed(2)}</strong>
          </p>
          <p>
            ARS: <strong>{converted.ARS.toFixed(2)}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
