import { useEffect } from "react";
import { TopBar } from "./editor/TopBar";
import { LeftSidebar } from "./editor/LeftSidebar";
import { Canvas } from "./editor/Canvas";
import { RightSidebar } from "./editor/RightSidebar";
import { registerDefaultModules } from "./modules/defaultModules";
import { moduleRegistry } from "./modules/registry";
import { useEmailStore } from "./store/emailStore";
// Register all built-in templates (each module self-registers on import).
import "./templates";

// Register default modules once at module load.
registerDefaultModules();

export function App() {
  const { doc, addModule, loadFromLocalStorage } = useEmailStore();

  useEffect(() => {
    loadFromLocalStorage();
    // Seed a starter email if empty.
    if (useEmailStore.getState().doc.modules.length === 0) {
      const seeds = ["header.hero", "content.headline_body", "cta.simple", "footer.simple"];
      for (const t of seeds) {
        const def = moduleRegistry.get(t);
        if (def) addModule(def.create());
      }
      useEmailStore.setState({ selection: { kind: "email" }, past: [], future: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage on doc change.
  useEffect(() => {
    const id = setTimeout(() => useEmailStore.getState().saveToLocalStorage(), 500);
    return () => clearTimeout(id);
  }, [doc]);

  return (
    <div className="oml-email-builder h-full w-full flex flex-col bg-gray-100">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
    </div>
  );
}
