import { useEffect, useMemo, useState } from "react";
import useExchangeRates from "../hooks/useExchangeRates";

const TARGETS_KEY = "currency-targets";
const DEFAULT_TARGETS = ["USD", "MXN", "ARS"];

const currencyNames = new Intl.DisplayNames(["es"], { type: "currency" });

function currencyLabel(code) {
  try {
    return currencyNames.of(code);
  } catch {
    return code;
  }
}

function formatAmount(value) {
  return new Intl.NumberFormat("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: value !== 0 && Math.abs(value) < 1 ? 4 : 2,
  }).format(value);
}

function loadTargets() {
  try {
    const saved = JSON.parse(localStorage.getItem(TARGETS_KEY));
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_TARGETS;
  } catch {
    return DEFAULT_TARGETS;
  }
}

function CurrencyConverter() {
  const { rates, updatedAt, status, refresh } = useExchangeRates();
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("MXN");
  const [targets, setTargets] = useState(loadTargets);

  useEffect(() => {
    try {
      localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
    } catch {
      // sin almacenamiento disponible: se ignora
    }
  }, [targets]);

  const codes = useMemo(
    () =>
      Object.keys(rates).sort((a, b) =>
        currencyLabel(a).localeCompare(currencyLabel(b), "es")
      ),
    [rates]
  );

  const available = codes.filter((c) => !targets.includes(c));
  const visibleTargets = targets.filter((c) => rates[c]);

  const value = parseFloat(amount);
  const usd = !isNaN(value) && rates[from] ? value / rates[from] : 0;

  const convert = (code) => usd * rates[code];

  // Tocar un resultado lo convierte en la moneda de origen
  const setAsSource = (code) => {
    if (code === from) return;
    const converted = convert(code);
    setFrom(code);
    if (amount !== "") setAmount(String(Number(converted.toFixed(4))));
  };

  const addTarget = (code) => {
    if (code) setTargets((t) => [...t, code]);
  };

  const removeTarget = (code) => {
    setTargets((t) => t.filter((c) => c !== code));
  };

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
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="w-full border rounded p-2 mb-4 text-lg"
      >
        {codes.map((code) => (
          <option key={code} value={code}>
            {currencyLabel(code)} ({code})
          </option>
        ))}
      </select>

      <ul className="space-y-2 text-lg">
        {visibleTargets.map((code) => (
          <li
            key={code}
            className={`flex items-center gap-2 rounded px-2 py-1
              ${code === from ? "bg-blue-50" : ""}`}
          >
            <button
              onClick={() => setAsSource(code)}
              className="flex-1 flex justify-between text-left"
              title="Usar como moneda de origen"
            >
              <span>{code}</span>
              <strong>{formatAmount(convert(code))}</strong>
            </button>
            <button
              onClick={() => removeTarget(code)}
              className="text-gray-400 hover:text-red-500 px-1"
              aria-label={`Quitar ${code}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <select
        value=""
        onChange={(e) => addTarget(e.target.value)}
        className="w-full border border-dashed rounded p-2 mt-3 text-sm text-gray-600"
      >
        <option value="">+ Agregar moneda…</option>
        {available.map((code) => (
          <option key={code} value={code}>
            {currencyLabel(code)} ({code})
          </option>
        ))}
      </select>

      <div className="text-xs text-gray-500 mt-3 text-center space-y-1">
        <p>
          {updatedAt
            ? `Cotización actualizada: ${new Date(updatedAt).toLocaleString("es")}`
            : "Usando cotización de referencia (sin conexión)"}
        </p>
        {status === "error" && (
          <p className="text-red-500">No se pudo actualizar la cotización</p>
        )}
        <button
          onClick={refresh}
          disabled={status === "loading"}
          className="text-blue-600 underline disabled:opacity-50"
        >
          {status === "loading" ? "Actualizando…" : "Actualizar"}
        </button>
      </div>
    </>
  );
}

export default CurrencyConverter;
