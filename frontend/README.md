# Frontend

Aplicação de gestão da adega construída com React, TypeScript e Vite. Este
README descreve a organização, a configuração e os comandos do frontend.

- [Visão geral do sistema](../README.md)
- [Estrutura e API do backend](../backend/README.md)
- [Aplicação publicada](https://salmon-field-075eac610.6.azurestaticapps.net/)

## Estrutura

```text
src/
├── App.tsx                estado global e composição dos provedores
├── main.tsx               inicialização React e registro do service worker
├── routes/                rotas e coordenação dos fluxos da aplicação
├── pages/                 telas agrupadas por área de negócio
├── components/            componentes reutilizáveis
├── contexts/               contexto de autenticação
├── hooks/                  hooks de autenticação, API e interface
├── services/               clientes HTTP e integração com os endpoints
├── types/                  tipos de entidades por domínio
├── utils/                  utilitários
└── assets/                 recursos importados pelo código
```

### Áreas de páginas

| Pasta | Responsabilidade |
| --- | --- |
| `pages/cadastro`, `pages/login`, `pages/esqueci-senha` | Entrada e acesso à conta |
| `pages/dashboard` | Resumo da operação |
| `pages/produtos`, `pages/estoque` | Produtos, estoque e movimentações |
| `pages/venda`, `pages/compras` | Vendas e compras |
| `pages/fornecedores` | Cadastro e consulta de fornecedores |
| `pages/financeiro`, `pages/relatorios` | Despesas, indicadores e relatórios |
| `pages/configuracoes`, `pages/usuarios`, `pages/perfil` | Administração e conta |

`routes/AppRoutes.tsx` liga as telas aos serviços e protege as rotas conforme
o perfil do usuário. `services/api.ts` configura o cliente HTTP; `authService.ts`
cuida da autenticação, e `businessDataService.ts` integra os dados de negócio.

## Tecnologias

- React e React Router
- TypeScript e Vite
- Tailwind CSS pelo plugin oficial do Vite
- Axios para chamadas HTTP
- `vite-plugin-pwa` para manifesto, instalação e atualização do service worker

## Configuração local

Requer Node.js compatível com Vite (Node 22 é usado no workflow de deploy).

```sh
cd frontend
npm ci
cp .env.example .env
npm run dev
```

O servidor de desenvolvimento inicia em `http://localhost:5173`.

### Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `VITE_API_URL` | URL base do backend. No desenvolvimento, o padrão é `http://localhost:3000`; builds de produção exigem uma URL HTTP(S). |
| `VITE_FIREBASE_API_KEY` | Chave do Firebase usada no fluxo de recuperação de senha. |

O Vite incorpora essas variáveis no build. Alterações em produção requerem um
novo deploy. Use `frontend/.env.example` como referência e não versione valores
secretos.

## Comandos

```sh
npm run dev      # servidor de desenvolvimento
npm run build    # verificação TypeScript e build de produção
npm run preview  # pré-visualização do build
npm run lint     # ESLint
```

## Deploy

O workflow de Azure Static Web Apps publica o conteúdo de `frontend/dist` ao
receber alterações na branch `main` e em pull requests. Configure no GitHub:

- variável `VITE_API_URL`, apontando para a URL do backend;
- secret `VITE_FIREBASE_API_KEY`, para habilitar a recuperação de senha;
- secret de publicação do Azure Static Web Apps, usado pelo workflow.

Consulte o [workflow de publicação](../.github/workflows/azure-static-web-apps-salmon-field-075eac610.yml)
e o [guia geral](../README.md#deploy).
