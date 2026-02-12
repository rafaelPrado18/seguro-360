import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RoleProvider } from "./contexts/RoleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <RoleProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </RoleProvider>
  </ThemeProvider>
);
