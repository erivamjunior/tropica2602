import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "obrasStorage",
  access: (allow) => ({
    "obras/*": [
      allow.groups(["ADMIN", "GERENTE", "ENGENHEIRO"]).to(["read", "write", "delete"]),
      allow.groups(["OPERADOR"]).to(["read"])
    ]
  })
});
