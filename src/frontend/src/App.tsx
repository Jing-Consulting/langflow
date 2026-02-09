import "@xyflow/react/dist/style.css";
import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { LoadingPage } from "./pages/LoadingPage";
import router from "./routes";
import { useDarkStore } from "./stores/darkStore";

export default function App() {
  const { dark, macp } = useDarkStore((state) => ({
    dark: state.dark,
    macp: state.macp,
  }));

  useEffect(() => {
    const body = document.getElementById("body")!;
    // Remove both potential classes first
    body.classList.remove("dark", "macp-theme");

    if (dark) {
      body.classList.add("dark");
    } else if (macp) {
      body.classList.add("macp-theme");
    }
    // If neither, it's standard light (no class, default white)
  }, [dark, macp]);
  return (
    <Suspense fallback={<LoadingPage />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
