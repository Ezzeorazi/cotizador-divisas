const ARS_ORDER = ["oficial", "blue", "bolsa", "contadoconliqui", "cripto", "tarjeta", "mayorista"];

function formatRate(value) {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 2 }).format(value);
}

function RateSettings({ settings, onChange, ars, mxnBase, effective }) {
  const update = (patch) => onChange({ ...settings, ...patch });
  const arsCasas = ARS_ORDER.filter((c) => ars[c]);

  return (
    <div className="mt-4 border rounded p-3 text-sm space-y-3 bg-gray-50">
      <div>
        <label className="block font-medium mb-1">🇦🇷 Dólar en Argentina</label>
        {arsCasas.length ? (
          <select
            value={settings.ars}
            onChange={(e) => update({ ars: e.target.value })}
            className="w-full border rounded p-2 bg-white"
          >
            {arsCasas.map((casa) => (
              <option key={casa} value={casa}>
                {ars[casa].nombre} · ${formatRate(ars[casa].venta)}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-500">Sin datos de dolarapi, se usa el oficial de mercado.</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Se usa el precio de venta.</p>
      </div>

      <div>
        <label className="block font-medium mb-1">🇲🇽 Dólar en México</label>
        <select
          value={settings.mxnMode}
          onChange={(e) => update({ mxnMode: e.target.value })}
          className="w-full border rounded p-2 bg-white"
        >
          <option value="mercado">Mercado · ${formatRate(mxnBase)}</option>
          <option value="casa">Casa de cambio Playa (estimado)</option>
          <option value="manual">Manual (lo que dice la pizarra)</option>
        </select>

        {settings.mxnMode === "casa" && (
          <label className="flex items-center gap-2 mt-2">
            Paga
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              max="20"
              value={settings.mxnMargin}
              onChange={(e) => update({ mxnMargin: e.target.value })}
              className="w-16 border rounded p-1 bg-white"
            />
            % menos que el mercado
          </label>
        )}

        {settings.mxnMode === "manual" && (
          <label className="flex items-center gap-2 mt-2">
            1 USD =
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder={formatRate(mxnBase)}
              value={settings.mxnManual}
              onChange={(e) => update({ mxnManual: e.target.value })}
              className="w-24 border rounded p-1 bg-white"
            />
            MXN
          </label>
        )}

        <p className="text-xs text-gray-500 mt-1">
          Usando 1 USD = {formatRate(effective)} MXN
          {settings.mxnMode === "casa" &&
            " · No hay datos públicos de las casas de cambio; ajustá el % según lo que veas."}
        </p>
      </div>
    </div>
  );
}

export default RateSettings;
