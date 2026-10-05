import { useCallback, useEffect, useState } from "react";

const API_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_KEY = "exchange-rates";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

// Valores de respaldo si no hay red ni caché
const FALLBACK = {
  rates: { USD: 1, MXN: 16.5, ARS: 1450 },
  updatedAt: null,
};

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // sin almacenamiento disponible: se ignora
  }
}

function useExchangeRates() {
  const [data, setData] = useState(() => readCache() ?? FALLBACK);
  const [status, setStatus] = useState("idle"); // idle | loading | error

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json.result !== "success") throw new Error("Respuesta inválida");

      const fresh = {
        rates: json.rates,
        updatedAt: json.time_last_update_unix * 1000,
        fetchedAt: Date.now(),
      };
      writeCache(fresh);
      setData(fresh);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const cached = readCache();
    if (!cached || Date.now() - cached.fetchedAt > CACHE_TTL) refresh();
  }, [refresh]);

  return { ...data, status, refresh };
}

export default useExchangeRates;
