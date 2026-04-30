import { useEmailStore } from "../store/emailStore";
import { Undo2, Redo2, Save, Download, Upload, Eye, FileCode, Monitor, Smartphone, LayoutTemplate, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { TemplatesModal } from "./TemplatesModal";

export function TopBar() {
  const { doc, updateMeta, undo, redo, past, future, exportJson, importJson, exportHtml, saveToLocalStorage, viewMode, setViewMode, resetDocument } =
    useEmailStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewing, setPreviewing] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const handleReset = () => {
    if (doc.modules.length === 0) return;
    if (window.confirm("Reset the editor? Your current email will be cleared.")) {
      resetDocument();
    }
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const html = exportHtml();
    downloadFile(`${doc.meta.name || "email"}.html`, html, "text/html");
  };

  const handleExportJson = () => {
    downloadFile(`${doc.meta.name || "email"}.json`, exportJson(), "application/json");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const r = importJson(text);
      if (!r.ok) alert(`Import failed: ${r.error}`);
    });
    e.target.value = "";
  };

  const handlePreview = () => {
    const html = exportHtml();
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
    setPreviewing(true);
    setTimeout(() => setPreviewing(false), 600);
  };

  return (
    <div className="flex items-center gap-2 h-12 px-4 bg-white border-b border-gray-200 shrink-0">
      <input
        className="font-medium text-sm px-2 py-1 rounded hover:bg-gray-50 focus:bg-gray-50 outline-none w-64"
        value={doc.meta.name}
        onChange={(e) => updateMeta({ name: e.target.value })}
      />
      <div className="ml-auto flex items-center gap-1">
        <div className="inline-flex items-center bg-gray-100 rounded p-0.5 mr-2">
          <button
            title="Desktop preview"
            onClick={() => setViewMode("desktop")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              viewMode === "desktop" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            title="Mobile preview"
            onClick={() => setViewMode("mobile")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              viewMode === "mobile" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>
        <ToolButton title="Browse templates" onClick={() => setTemplatesOpen(true)}>
          <LayoutTemplate size={16} /> Templates
        </ToolButton>
        <ToolButton title="Reset editor" onClick={handleReset} disabled={doc.modules.length === 0}>
          <RotateCcw size={16} /> Reset
        </ToolButton>
        <Divider />
        <ToolButton title="Undo" onClick={undo} disabled={past.length === 0}>
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton title="Redo" onClick={redo} disabled={future.length === 0}>
          <Redo2 size={16} />
        </ToolButton>
        <Divider />
        <ToolButton title="Save draft (local)" onClick={saveToLocalStorage}>
          <Save size={16} />
        </ToolButton>
        <ToolButton title="Preview" onClick={handlePreview}>
          <Eye size={16} /> {previewing ? "Opened" : "Preview"}
        </ToolButton>
        <Divider />
        <ToolButton title="Import JSON" onClick={() => fileRef.current?.click()}>
          <Upload size={16} /> Import
        </ToolButton>
        <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
        <ToolButton title="Export JSON" onClick={handleExportJson}>
          <Download size={16} /> JSON
        </ToolButton>
        <ToolButton title="Export HTML" onClick={handleExportHtml} primary>
          <FileCode size={16} /> Export HTML
        </ToolButton>
      </div>
      <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
  title,
  primary,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  primary?: boolean;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm transition-colors ${
        primary
          ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          : "text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}
