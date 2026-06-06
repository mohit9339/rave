import { useEffect, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";

import AppRoutes from "./app/router/AppRoutes";
import ExitDialog from "./shared/components/ExitDialog";

function App() {
  const [showExitDialog, setShowExitDialog] =
    useState(false);

  useEffect(() => {
    let listener;

    async function setupBackButton() {
      listener =
        await CapacitorApp.addListener(
          "backButton",
          () => {
            if (
              window.location.pathname === "/"
            ) {
              setShowExitDialog(true);
            } else {
              window.history.back();
            }
          }
        );
    }

    setupBackButton();

    return () => {
      listener?.remove();
    };
  }, []);

  return (
    <>
      <AppRoutes />

      <ExitDialog
        open={showExitDialog}
        onCancel={() =>
          setShowExitDialog(false)
        }
        onExit={() =>
          CapacitorApp.exitApp()
        }
      />
    </>
  );
}

export default App;