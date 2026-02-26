"use client";

import { useEffect, useMemo, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData, getUrl } from "aws-amplify/storage";
import { fetchAuthSession } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type ObraForm = { nome: string; local: string; descricao: string; status: "PLANEJADA" | "EM_ANDAMENTO" | "PAUSADA" | "CONCLUIDA" };

export default function Dashboard() {
  const [obras, setObras] = useState<Schema["Obra"]["type"][]>([]);
  const [selectedObraId, setSelectedObraId] = useState<string>("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [groups, setGroups] = useState<string[]>([]);

  const [obraForm, setObraForm] = useState<ObraForm>({
    nome: "",
    local: "",
    descricao: "",
    status: "PLANEJADA"
  });

  const isManager = useMemo(() => groups.includes("ADMIN") || groups.includes("GERENTE"), [groups]);

  useEffect(() => {
    fetchAuthSession().then((s) => {
      const cognitoGroups = (s.tokens?.accessToken.payload["cognito:groups"] as string[]) ?? [];
      setGroups(cognitoGroups);
    });

    const sub = client.models.Obra.observeQuery().subscribe({
      next: ({ items }) => {
        setObras(items);
        if (!selectedObraId && items[0]?.id) {
          setSelectedObraId(items[0].id);
        }
      }
    });

    return () => sub.unsubscribe();
  }, [selectedObraId]);

  async function criarObra(e: React.FormEvent) {
    e.preventDefault();
    await client.models.Obra.create(obraForm);
    setObraForm({ nome: "", local: "", descricao: "", status: "PLANEJADA" });
  }

  async function criarTarefa(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedObraId) return;
    await client.models.Tarefa.create({
      obraId: selectedObraId,
      titulo: taskTitle,
      descricao: taskDesc,
      responsavel: taskAssignee,
      status: "PENDENTE"
    });
    setTaskTitle("");
    setTaskDesc("");
    setTaskAssignee("");
  }

  async function uploadDocumento(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedObraId) return;
    const key = `obras/${selectedObraId}/${Date.now()}-${file.name}`;
    await uploadData({ path: key, data: file }).result;

    await client.models.Documento.create({
      obraId: selectedObraId,
      nome: file.name,
      storagePath: key,
      contentType: file.type || "application/octet-stream",
      tamanhoBytes: file.size
    });

    setFile(null);
  }

  return (
    <main>
      <h1>Sistema de Gestão de Obras</h1>
      <small>Permissões do usuário: {groups.join(", ") || "Nenhum grupo atribuído"}</small>

      <div className="grid" style={{ marginTop: 16 }}>
        {isManager && (
          <section className="card">
            <h2>Cadastrar obra</h2>
            <form onSubmit={criarObra} className="row" style={{ flexDirection: "column" }}>
              <input value={obraForm.nome} placeholder="Nome da obra" onChange={(e) => setObraForm((s) => ({ ...s, nome: e.target.value }))} required />
              <input value={obraForm.local} placeholder="Local" onChange={(e) => setObraForm((s) => ({ ...s, local: e.target.value }))} required />
              <textarea value={obraForm.descricao} placeholder="Descrição" onChange={(e) => setObraForm((s) => ({ ...s, descricao: e.target.value }))} required />
              <select value={obraForm.status} onChange={(e) => setObraForm((s) => ({ ...s, status: e.target.value as ObraForm["status"] }))}>
                <option value="PLANEJADA">Planejada</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="PAUSADA">Pausada</option>
                <option value="CONCLUIDA">Concluída</option>
              </select>
              <button type="submit">Salvar obra</button>
            </form>
          </section>
        )}

        <section className="card">
          <h2>Obras</h2>
          <ul>
            {obras.map((obra) => (
              <li key={obra.id}>
                <button className="secondary" onClick={() => setSelectedObraId(obra.id)}>
                  {obra.nome} · {obra.status}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Nova tarefa</h2>
          <form onSubmit={criarTarefa} className="row" style={{ flexDirection: "column" }}>
            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Título" required />
            <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Descrição" required />
            <input value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} placeholder="Responsável (nome)" required />
            <button type="submit">Criar tarefa</button>
          </form>
        </section>

        <section className="card">
          <h2>Documentos</h2>
          <form onSubmit={uploadDocumento} className="row" style={{ flexDirection: "column" }}>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
            <button type="submit">Upload</button>
          </form>
        </section>
      </div>

      <section className="card">
        <h2>Documentos da obra selecionada</h2>
        <DocumentList obraId={selectedObraId} />
      </section>
    </main>
  );
}

function DocumentList({ obraId }: { obraId: string }) {
  const [docs, setDocs] = useState<Schema["Documento"]["type"][]>([]);

  useEffect(() => {
    if (!obraId) {
      setDocs([]);
      return;
    }

    const sub = client.models.Documento.observeQuery({
      filter: { obraId: { eq: obraId } }
    }).subscribe({
      next: ({ items }) => setDocs(items)
    });

    return () => sub.unsubscribe();
  }, [obraId]);

  async function abrirArquivo(path: string) {
    const url = await getUrl({ path, options: { expiresIn: 300 } });
    window.open(url.url.toString(), "_blank");
  }

  return (
    <ul>
      {docs.map((d) => (
        <li key={d.id} className="row" style={{ justifyContent: "space-between" }}>
          <span>{d.nome} ({Math.round(d.tamanhoBytes / 1024)} KB)</span>
          <button onClick={() => abrirArquivo(d.storagePath)}>Download</button>
        </li>
      ))}
    </ul>
  );
}
