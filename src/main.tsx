import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Card typography substitutes (see .claude/knowledge/research/pokemon-card-fonts.md).
import "@fontsource/cabin/400.css";
import "@fontsource/cabin/700.css";
import "@fontsource/cabin-condensed/700.css";
import "@fontsource/jost/700.css";
import "@fontsource/jost/800.css";
import "@fontsource/jost/700-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/700-italic.css";
import "@fontsource/tenor-sans/400.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
