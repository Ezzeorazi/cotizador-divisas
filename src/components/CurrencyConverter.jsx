import { useState } from "react";

const RATES = {
  USD: 1,
  MXN: 18.0,
  ARS: 1500.0,
};

function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MXN");

  const value = parseFloat(amount);
  const usd = !isNaN(value)
    ? currency === "USD"
      ? value
      : value / RATES[currency]
    : 0;

  return (
    <>
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
        <p>USD: <strong>{usd.toFixed(2)}</strong></p>
        <p>MXN: <strong>{(usd * RATES.MXN).toFixed(2)}</strong></p>
        <p>ARS: <strong>{(usd * RATES.ARS).toFixed(2)}</strong></p>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Ref: 1 USD = {RATES.MXN} MXN · {RATES.ARS} ARS
      </p>
    </>
  );
}

export default CurrencyConverter;
