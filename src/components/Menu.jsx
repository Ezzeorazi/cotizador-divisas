function Menu({ active, onChange }) {
  return (
    <div className="flex mb-4 rounded-lg overflow-hidden border">
      <button
        onClick={() => onChange("currency")}
        className={`flex-1 py-2 text-center text-sm font-medium
          ${active === "currency"
            ? "bg-blue-600 text-white"
            : "bg-gray-100"}`}
      >
        💱 Monedas
      </button>

      <button
        onClick={() => onChange("weight")}
        className={`flex-1 py-2 text-center text-sm font-medium
          ${active === "weight"
            ? "bg-blue-600 text-white"
            : "bg-gray-100"}`}
      >
        🏋️ Peso
      </button>
    </div>
  );
}

export default Menu;
