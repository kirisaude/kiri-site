"use client";

import { useState, useRef, useCallback } from "react";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import Link from "next/link";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = (data.profissionais as Profissional[])
  .filter((p) => p.verificado)
  .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

function extractFolderId(url: string): string | null {
  const m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

type FileStatus = "pending" | "uploading" | "ok" | "erro";
type FileItem = { file: File; status: FileStatus; erro?: string; link?: string };

export default function DriveUploadPage() {
  const [profId, setProfId] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const prof = profissionais.find((p) => p.id === profId);
  const folderId = prof?.pasta_drive ? extractFolderId(prof.pasta_drive) : null;

  function addFiles(newFiles: FileList | File[]) {
    const arr = Array.from(newFiles).map((f) => ({ file: f, status: "pending" as FileStatus }));
    setFiles((prev) => [...prev, ...arr]);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, []);

  async function enviar() {
    if (!folderId || files.length === 0) return;
    setEnviando(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "ok") continue;
      setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f));

      const form = new FormData();
      form.append("folder_id", folderId);
      form.append("file", files[i].file);

      try {
        const res = await fetch("/api/admin/drive-upload", {
          method: "POST",
          credentials: "include",
          body: form,
        });
        const d = await res.json();
        if (res.ok) {
          setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "ok", link: d.file?.webViewLink } : f));
        } else {
          setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "erro", erro: d.error } : f));
        }
      } catch {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "erro", erro: "Erro de conexão" } : f));
      }
    }

    setEnviando(false);
  }

  const pendentes = files.filter((f) => f.status === "pending" || f.status === "erro").length;

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center gap-3">
        <KiriLogoCompact height={26} />
        <Link href="/admin" className="text-[13px] text-muted hover:text-carvao no-underline transition-colors ml-2">
          ← Admin
        </Link>
        <span className="text-[13px] font-semibold text-carvao ml-1">/ Enviar documentos ao Drive</span>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Seletor de profissional */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-carvao">Profissional</label>
          <select
            value={profId}
            onChange={(e) => setProfId(e.target.value)}
            className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
          >
            <option value="">Selecione o profissional…</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          {prof && (
            <a href={prof.pasta_drive!} target="_blank" rel="noopener noreferrer"
              className="text-[12px] text-ardosia hover:underline">
              Ver pasta no Drive ↗
            </a>
          )}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-[14px] px-6 py-10 text-center cursor-pointer transition-colors ${
            dragging ? "border-ardosia bg-[#EEF2F4]" : "border-linha hover:border-ardosia/50 hover:bg-[#FAFAF8]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <p className="text-[14px] font-semibold text-carvao">Arraste arquivos aqui</p>
          <p className="text-[12.5px] text-muted mt-1">ou clique para selecionar — PDF, imagens, qualquer formato</p>
        </div>

        {/* Lista de arquivos */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-linha rounded-[10px] px-3.5 py-2.5">
                <span className="text-[13px] flex-none">
                  {f.status === "ok" ? "✅" : f.status === "erro" ? "❌" : f.status === "uploading" ? "⏳" : "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-carvao truncate">{f.file.name}</p>
                  {f.status === "erro" && <p className="text-[11px] text-ferrugem">{f.erro}</p>}
                </div>
                {f.link && (
                  <a href={f.link} target="_blank" rel="noopener noreferrer"
                    className="text-[11.5px] text-ardosia hover:underline flex-none">
                    Ver ↗
                  </a>
                )}
                {f.status === "pending" && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFiles((prev) => prev.filter((_, idx) => idx !== i)); }}
                    className="text-[11px] text-muted hover:text-ferrugem transition-colors flex-none">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botão enviar */}
        {files.length > 0 && (
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || !folderId || pendentes === 0}
            className="bg-ardosia-escura text-white font-semibold text-[14px] rounded-[10px] py-[12px] cursor-pointer disabled:opacity-40 transition-opacity"
          >
            {enviando
              ? "Enviando…"
              : pendentes === 0
              ? "✓ Todos enviados"
              : `Enviar ${pendentes} arquivo${pendentes !== 1 ? "s" : ""} para o Drive`}
          </button>
        )}

        {!folderId && profId && (
          <p className="text-[12.5px] text-ferrugem">Este profissional não tem pasta do Drive vinculada.</p>
        )}
      </div>
    </div>
  );
}
