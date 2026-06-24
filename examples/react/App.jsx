// React usage of @one-million-lines/email-builder.
// React/ReactDOM are PEER dependencies — provided by your app.
import { useState } from "react";
import { EmailBuilder } from "@one-million-lines/email-builder";
import "@one-million-lines/email-builder/styles.css";

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
