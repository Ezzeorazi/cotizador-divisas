import { useState } from "react";

function WeightConverter() {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg");

  const num = parseFloat(value);

  const kg =
    !isNaN(num) ? (unit === "kg" ? num : num * 0.453592) : 0;

  const lb =
    !isNaN(num) ? (unit === "lb" ? num : num * 2.20462) : 0;

  return (
    <>
      <input
        type="number"
        inputMode="decimal"
        placeholder="Peso"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border rounded p-2 mb-3 text-lg"
      />

      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="w-full border rounded p-2 mb-4 text-lg"
      >
        <option value="kg">Kilogramos (kg)</option>
        <option value="lb">Libras (lb)</option>
      </select>

      <div className="space-y-2 text-lg">
        <p>KG: <strong>{kg.toFixed(2)}</strong></p>
        <p>LBS: <strong>{lb.toFixed(2)}</strong></p>
      </div>
    </>
  );
}

export default WeightConverter;
