import { useEffect, useState } from "react";

// useState que se guarda en localStorage
function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return saved ?? initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // sin almacenamiento disponible: se ignora
    }
  }, [key, value]);

  return [value, setValue];
}

export default useStoredState;
