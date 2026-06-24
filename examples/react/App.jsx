// React usage of openpostcards-builder.
// React/ReactDOM are PEER dependencies — provided by your app.
import { useState } from "react";
import { EmailBuilder } from "openpostcards-builder";
import "openpostcards-builder/styles.css";

export default function App() {
  const [doc, setDoc] = useState(null);

  return (
    <div style={{ height: "100vh" }}>
      <EmailBuilder
        initialDocument={doc ?? undefined}
        onChange={(next) => setDoc(next)}
        onExportHtml={(html) => console.log("html length", html.length)}
      />
    </div>
  );
}
