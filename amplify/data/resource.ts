import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Obra: a
    .model({
      nome: a.string().required(),
      local: a.string().required(),
      descricao: a.string().required(),
      status: a.enum(["PLANEJADA", "EM_ANDAMENTO", "PAUSADA", "CONCLUIDA"]),
      tarefas: a.hasMany("Tarefa", "obraId"),
      documentos: a.hasMany("Documento", "obraId"),
    })
    .authorization((allow) => [
      allow.groups(["ADMIN", "GERENTE"]).to(["create", "update", "delete", "read"]),
      allow.groups(["ENGENHEIRO", "OPERADOR"]).to(["read"]),
    ]),

  Tarefa: a
    .model({
      obraId: a.id().required(),
      titulo: a.string().required(),
      descricao: a.string().required(),
      responsavel: a.string().required(),
      status: a.enum(["PENDENTE", "EM_EXECUCAO", "BLOQUEADA", "FINALIZADA"]),
      obra: a.belongsTo("Obra", "obraId"),
    })
    .authorization((allow) => [
      allow.groups(["ADMIN", "GERENTE", "ENGENHEIRO"]).to(["create", "update", "delete", "read"]),
      allow.groups(["OPERADOR"]).to(["read", "update"]),
    ]),

  Documento: a
    .model({
      obraId: a.id().required(),
      nome: a.string().required(),
      storagePath: a.string().required(),
      contentType: a.string().required(),
      tamanhoBytes: a.integer().required(),
      obra: a.belongsTo("Obra", "obraId"),
    })
    .authorization((allow) => [
      allow.groups(["ADMIN"]).to(["create", "delete", "read"]),
      allow.groups(["GERENTE"]).to(["create", "delete", "read"]),
      allow.groups(["ENGENHEIRO"]).to(["create", "delete", "read"]),
      allow.groups(["OPERADOR"]).to(["read"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
