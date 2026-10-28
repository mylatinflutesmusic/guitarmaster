import { createRoot } from "react-dom/client";
import { StoreProvider } from "./store";
import { App } from "./App";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing");

createRoot(container).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
