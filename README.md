# Adega Bom Sabor

Sistema web para administrar a operação de uma adega: produtos, estoque,
vendas, compras, fornecedores e despesas.

## Aplicação em produção

- **Frontend:** [Abrir Adega Bom Sabor](https://salmon-field-075eac610.6.azurestaticapps.net/)
- **API:** [Backend no Azure](https://adega-bom-sabor-avbnangebvcvcgbc.chilecentral-01.azurewebsites.net/)

Os deploys são feitos por GitHub Actions quando há alterações na branch `main`.
Consulte os workflows em [`.github/workflows/`](./.github/workflows/).

## Visão geral

O frontend é uma aplicação React responsiva e instalável (PWA). Ele consome uma
API REST em Node.js/Express, que autentica usuários, valida operações e acessa
um banco MySQL. As áreas de negócio usam o backend como fonte dos dados
operacionais.

### Funcionalidades

- Autenticação, recuperação de senha e perfis de acesso.
- Cadastro e manutenção de produtos, categorias e fornecedores.
- Controle e reposição de estoque.
- Registro e consulta de vendas, compras e despesas.
- Visão financeira, relatórios e exportação de dados.
- Configurações do estabelecimento, usuários e perfil.

## Estrutura do repositório

```text
.
├── backend/       API Express, regras de negócio e acesso MySQL
├── frontend/      Aplicação React, páginas e integração com a API
├── .github/       Workflows de CI/CD para Azure
└── docker-compose.yml
```

- [Guia do frontend](./frontend/README.md)
- [Guia do backend](./backend/README.md)

## Executar localmente

Requisitos: Docker Compose ou Node.js/npm nas versões compatíveis com os
projetos. O backend também precisa de acesso ao MySQL.

### Docker Compose

1. Crie o arquivo de ambiente do backend e preencha as variáveis:

   ```sh
   cp backend/.env.example backend/.env
   ```

   Como o Compose não inicia um contêiner MySQL, `DB_HOST` deve apontar para
   um banco acessível pelo contêiner do backend. Consulte a lista de variáveis
   no [README do backend](./backend/README.md).
2. Copie `frontend/.env.example` para `frontend/.env` e ajuste `VITE_API_URL`
   caso a API não esteja em `http://localhost:3000`.
3. Execute na raiz:

   ```sh
   docker compose up --build
   ```

4. Acesse o frontend em [http://localhost:5173](http://localhost:5173). O
   backend estará disponível em [http://localhost:3000](http://localhost:3000).

O backend usa TLS para conectar ao MySQL e carrega o certificado de
`backend/config/ca.pem`.

### Executar os projetos separadamente

Consulte os READMEs de [frontend](./frontend/README.md) e
[backend](./backend/README.md) para instalação, variáveis de ambiente e
comandos de desenvolvimento.

## Deploy

- **Frontend — Azure Static Web Apps:** o workflow
  [`azure-static-web-apps-salmon-field-075eac610.yml`](./.github/workflows/azure-static-web-apps-salmon-field-075eac610.yml)
  instala as dependências, gera o build e publica `frontend/dist`.
- **Backend — Azure Web App:** o workflow
  [`main_adega-bom-sabor.yml`](./.github/workflows/main_adega-bom-sabor.yml)
  configura as credenciais do banco e publica a pasta `backend`.

Os workflows dependem de variáveis e secrets configurados no GitHub; veja a
lista completa no README de cada área. Nunca salve credenciais em arquivos
versionados.
