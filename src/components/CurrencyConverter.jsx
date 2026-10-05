import { useMemo, useState } from "react";
import useExchangeRates from "../hooks/useExchangeRates";
import useStoredState from "../hooks/useStoredState";
import RateSettings from "./RateSettings";

const DEFAULT_TARGETS = ["USD", "MXN", "ARS"];
const DEFAULT_SETTINGS = {
  ars: "blue",
  mxnMode: "casa",
  mxnMargin: 5,
  mxnManual: "",
};

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

// Reemplaza ARS y MXN por el tipo de cambio elegido en la configuración
function applySettings(rates, ars, mxnBase, settings) {
  const result = { ...rates };

  const arsVenta = ars[settings.ars]?.venta;
  if (arsVenta) result.ARS = arsVenta;

  if (settings.mxnMode === "casa") {
    const margin = parseFloat(settings.mxnMargin) || 0;
    result.MXN = mxnBase * (1 - margin / 100);
  } else if (settings.mxnMode === "manual") {
    result.MXN = parseFloat(settings.mxnManual) || mxnBase;
  } else {
    result.MXN = mxnBase;
  }

  return result;
}

function CurrencyConverter() {
  const { rates: marketRates, ars, mxn, updatedAt, status, refresh } =
    useExchangeRates();
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("MXN");
  const [targets, setTargets] = useStoredState("currency-targets", DEFAULT_TARGETS);
  const [settings, setSettings] = useStoredState("rate-settings", DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const mxnBase = mxn?.fix ?? mxn?.venta ?? marketRates.MXN;
  const rates = applySettings(marketRates, ars, mxnBase, settings);

  const codes = useMemo(
    () =>
      Object.keys(marketRates).sort((a, b) =>
        currencyLabel(a).localeCompare(currencyLabel(b), "es")
      ),
    [marketRates]
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
        <p>
          1 USD = {formatAmount(rates.MXN)} MXN · {formatAmount(rates.ARS)} ARS
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={refresh}
            disabled={status === "loading"}
            className="text-blue-600 underline disabled:opacity-50"
          >
            {status === "loading" ? "Actualizando…" : "Actualizar"}
          </button>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="text-blue-600 underline"
          >
            {showSettings ? "Ocultar tipo de cambio" : "⚙️ Tipo de cambio"}
          </button>
        </div>
      </div>

      {showSettings && (
        <RateSettings
          settings={settings}
          onChange={setSettings}
          ars={ars}
          mxnBase={mxnBase}
          effective={rates.MXN}
        />
      )}
    </>
  );
}

export default CurrencyConverter;
