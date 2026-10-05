import { useCallback, useEffect, useState } from "react";

const GLOBAL_URL = "https://open.er-api.com/v6/latest/USD";
const ARS_URL = "https://dolarapi.com/v1/dolares";
const MXN_URL = "https://mx.dolarapi.com/v1/cotizaciones";
const CACHE_KEY = "exchange-rates-v2";
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

// Valores de respaldo si no hay red ni caché
const FALLBACK = {
  rates: { USD: 1, MXN: 18.2, ARS: 1540 },
  ars: {},
  mxn: null,
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

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function fetchAll() {
  return Promise.allSettled([
    getJson(GLOBAL_URL),
    getJson(ARS_URL),
    getJson(MXN_URL),
  ]);
}

function isStale(cached) {
  return !cached || Date.now() - cached.fetchedAt > CACHE_TTL;
}

function useExchangeRates() {
  const [data, setData] = useState(() => readCache() ?? FALLBACK);
  // idle | loading | error
  const [status, setStatus] = useState(() =>
    isStale(readCache()) ? "loading" : "idle"
  );

  const apply = useCallback(([global, ars, mxn]) => {
    setData((prev) => {
      const next = { ...prev, fetchedAt: Date.now() };

      if (global.status === "fulfilled" && global.value.result === "success") {
        next.rates = global.value.rates;
        next.updatedAt = global.value.time_last_update_unix * 1000;
      }

      // { oficial: { nombre, compra, venta, fecha }, blue: {...}, ... }
      if (ars.status === "fulfilled") {
        next.ars = Object.fromEntries(
          ars.value.map((d) => [
            d.casa,
            {
              nombre: d.nombre,
              compra: d.compra,
              venta: d.venta,
              fecha: d.fechaActualizacion,
            },
          ])
        );
      }

      if (mxn.status === "fulfilled") {
        const usd = mxn.value.find((d) => d.moneda === "USD");
        if (usd) {
          next.mxn = {
            compra: usd.compra,
            venta: usd.venta,
            fix: usd.fix,
            fecha: usd.fechaActualizacion,
          };
        }
      }

      writeCache(next);
      return next;
    });

    const failed = [global, ars, mxn].some((r) => r.status === "rejected");
    setStatus(failed ? "error" : "idle");
  }, []);

  const refresh = useCallback(() => {
    setStatus("loading");
    fetchAll().then(apply);
  }, [apply]);

  useEffect(() => {
    if (isStale(readCache())) fetchAll().then(apply);
  }, [apply]);

  return { ...data, status, refresh };
}

export default useExchangeRates;
