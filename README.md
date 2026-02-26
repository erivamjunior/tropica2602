# Sistema de Gestão de Obras (AWS Amplify Gen 2)

Sistema fullstack real para gestão de obras, pronto para deploy no **AWS Amplify Hosting Fullstack** com provisionamento automático do backend.

## Stack
- Next.js 14 (App Router)
- AWS Amplify Gen 2 (TypeScript backend)
- Amazon Cognito (autenticação)
- AWS AppSync + DynamoDB (persistência GraphQL/Data)
- Amazon S3 (upload/download de arquivos)

## Recursos implementados
- Login real com Cognito via Amplify Authenticator.
- Controle de permissões por grupos: `ADMIN`, `GERENTE`, `ENGENHEIRO`, `OPERADOR`.
- CRUD de obras e tarefas com regras de autorização no backend.
- Upload e download real de documentos no S3.
- Persistência 100% AWS (sem mocks, sem dados fake).

## Estrutura
- `amplify/`: backend Gen 2 (auth, data, storage)
- `app/`: frontend Next.js

## Execução local
1. Instale dependências:
   ```bash
   npm install
   ```
2. Faça deploy sandbox para gerar `amplify_outputs.json` real:
   ```bash
   npx ampx sandbox
   ```
3. Inicie frontend:
   ```bash
   npm run dev
   ```

## Deploy no Amplify Hosting Fullstack
1. Conecte o repositório no AWS Amplify Console.
2. Habilite Fullstack deploy (backend + frontend).
3. O Amplify provisionará Cognito, Data (AppSync/DynamoDB) e S3 automaticamente com base em `amplify/backend.ts`.

## Observações
- O arquivo `amplify_outputs.json` no repositório está como placeholder e será substituído no ambiente de deploy/sandbox pelo arquivo real do backend provisionado.
