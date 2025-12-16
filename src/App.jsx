import { useState } from "react";
import Menu from "./components/Menu";
import CurrencyConverter from "./components/CurrencyConverter";
import WeightConverter from "./components/WeightConverter";

function App() {
  const [section, setSection] = useState("currency");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-4">
        <Menu active={section} onChange={setSection} />

        {section === "currency" && <CurrencyConverter />}
        {section === "weight" && <WeightConverter />}
      </div>
    </div>
  );
}

export default App;
