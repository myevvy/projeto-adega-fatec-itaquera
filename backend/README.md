# Backend

API REST do Adega Bom Sabor, implementada com Node.js e Express. O backend
valida operações, aplica autenticação e autorização e persiste os dados em
MySQL.

- [Visão geral do sistema](../README.md)
- [Guia do frontend](../frontend/README.md)
- [API publicada](https://adega-bom-sabor-avbnangebvcvcgbc.chilecentral-01.azurewebsites.net/)

## Estrutura

```text
backend/
├── config/
│   ├── db.js                 pool MySQL e TLS
│   ├── env.js                carregamento de variáveis
│   └── ca.pem                certificado CA do banco
└── src/
    ├── app.js                configuração do Express, CORS e arquivos
    ├── server.js             inicialização HTTP
    ├── router.js             definição e proteção das rotas
    ├── controllers/          validação HTTP e respostas
    │   ├── estoque/
    │   └── financeiro/
    ├── models/               consultas e regras de persistência
    │   ├── auditoria/
    │   ├── auth/
    │   ├── comercial/
    │   ├── estoque/
    │   └── financeiro/
    ├── middlewares/          autenticação, autorização e upload
    └── services/             integrações externas, como Firebase
```

### Fluxo de uma requisição

1. `src/server.js` inicia o servidor e importa a configuração de ambiente.
2. `src/app.js` configura JSON, CORS, arquivos enviados e monta o router.
3. `src/router.js` direciona a requisição e aplica os middlewares da rota.
4. Controllers validam os dados e chamam os models.
5. Models consultam o MySQL por `mysql2/promise`.

## Configuração e execução local

Requer Node.js, npm e acesso a um banco MySQL compatível com o esquema usado
pelo sistema. O pool de banco exige o certificado TLS em `config/ca.pem`.

Copie o modelo e preencha os valores locais:

```sh
cp .env.example .env
```

`DB_PORT` usa `3306` como padrão; a porta HTTP usa `3000` (ou `PORTA`). `CORS`
também é aceito como alternativa a `CORS_ORIGINS`. `FIREBASE_API_KEY` pode ser
definida separadamente para os fluxos de autenticação do Firebase. Não versione
`.env` nem credenciais.

```sh
cd backend
npm install
npm run dev
```

`npm start` inicia o servidor sem Nodemon. Para iniciar frontend e backend em
conjunto, consulte [Executar localmente](../README.md#executar-localmente).

## Rotas

As rotas são montadas sem prefixo adicional. A autenticação JWT e a verificação
de administrador são aplicadas individualmente no router; rotas protegidas
recebem `Authorization: Bearer <token>`.

| Área | Rotas principais |
| --- | --- |
| Autenticação | `POST /login`, `POST /logout`, `POST /auth/register`, `POST /auth/login`, `POST /auth/esqueci-senha` |
| Usuários | `GET /usuarios`, `POST /cadastro`, `PUT /usuarios/:id`, `DELETE /usuarios/:id` |
| Produtos | `GET /produtos`, `POST /produtos`, `PUT /produtos/:id`, `DELETE /produtos/:id`, `PATCH /produtos/:id` |
| Estoque | `PUT /produtos/quantidade/:id`, `GET /produtos/alertas`, `GET /produtos/historico/:id`, `GET /produtos/inativos` |
| Categorias | `GET/POST /categorias/produtos`, `GET/POST /categorias/despesas` |
| Fornecedores | `GET/POST /fornecedores`, `PUT/DELETE /fornecedores/:id` |
| Compras | `GET/POST /compras`, `GET /compras/fornecedor/:id`, `DELETE /compras/:id` |
| Vendas | `GET/POST /vendas`, `GET /vendas/usuario/:id`, `DELETE /vendas/:id` |
| Despesas | `GET/POST /despesas`, `DELETE /despesas/:id` |
| Estabelecimento | `GET/PUT /estabelecimento` |
| Relatórios | `GET /relatorios/vendas`, `GET /relatorios/estoque`, `GET /relatorios/despesas` |

As rotas de escrita administrativa e relatórios verificam o perfil conforme
definido em `src/router.js`. A rota de cadastro administrativo (`POST /cadastro`)
também exige autenticação e perfil de administrador.

### Categorias

- `GET /categorias/produtos` lista categorias de produto ativas.
- `POST /categorias/produtos` recebe `{ "nome": "Tintos" }` e cadastra ou
  reativa uma categoria; requer perfil de administrador.
- `GET /categorias/despesas` lista categorias de despesa ativas, incluindo os
  tipos usados pelo banco.
- `POST /categorias/despesas` recebe `{ "nome": "Manutenção", "tipo": "..." }`;
  informe um tipo compatível com a tabela; a rota requer administrador.

### Estabelecimento

O estabelecimento é um registro único. `GET /estabelecimento` retorna o
registro ou `null` quando ainda não foi salvo. `PUT /estabelecimento` cria ou
atualiza o registro e exige perfil de administrador:

```json
{
  "nome_estabelecimento": "Adega Exemplo",
  "categoria_estabelecimento": "Vinhos",
  "telefone_comercial": "(11) 99999-9999"
}
```

O model grava `id = 1`, marca `onboarding_concluido` como verdadeiro e atualiza
`criado_em`/`atualizado_em`. Os campos do administrador pertencem à tabela de
usuários e são atualizados pela rota `PUT /usuarios/:id`.

### Relatório de vendas

`GET /relatorios/vendas` exige autenticação e perfil de administrador. Aceita
`inicio` e `fim` opcionais no formato `YYYY-MM-DD`. Sem parâmetros, usa os
últimos 30 dias, incluindo hoje, e compara com o período imediatamente anterior.
Vendas canceladas e não concluídas são excluídas.

A resposta contém `periodo`, `resumo`, `comparacao` e `graficos`. Os gráficos
incluem vendas por dia, produtos mais vendidos e vendas por forma de pagamento.
Os arrays incluem apenas agrupamentos presentes no banco; variações sem base
no período anterior são `null`.

### Relatório de estoque

`GET /relatorios/estoque` exige autenticação e perfil de administrador. Reflete
a posição atual e inclui somente produtos ativos:

- `resumo`: total de produtos, unidades em estoque, valor pelo custo de
  aquisição e quantidade de alertas.
- `alertas`: produtos zerados ou no mínimo, ordenados por criticidade.
- `produtos`: dados atuais de estoque para tabelas e exportação.
- `estoquePorCategoria`: agrupamento por categoria.

### Relatório de despesas

`GET /relatorios/despesas` exige autenticação e perfil de administrador. Aceita
`inicio` e `fim` (`YYYY-MM-DD`); sem parâmetros, usa os últimos 7 dias,
incluindo hoje. A data final é inclusiva e despesas estornadas são excluídas.

A resposta contém:

- `periodo`: limites considerados.
- `resumo`: total de lançamentos e de despesas.
- `graficos.despesasPorCategoria`: totais e percentual por categoria.
- `historico`: lançamentos detalhados, do mais recente para o mais antigo.

## Deploy

O workflow [`main_adega-bom-sabor.yml`](../.github/workflows/main_adega-bom-sabor.yml)
publica `backend/` no Azure Web App `adega-bom-sabor` em pushes para `main` ou
execução manual.

Configure no GitHub:

- **Repository variables:** `DB_HOST`, `DB_PORT`, `DB_NAME`.
- **Repository secrets:** `DB_USER`, `DB_PASSWORD` e credenciais de publicação
  do Azure usadas pelo workflow.
- **Azure App Settings:** `ASSINATURA_TOKEN`, `FIREBASE_API_KEY` e
  `CORS_ORIGINS`, além das configurações de banco.

Consulte a [URL da API](https://adega-bom-sabor-avbnangebvcvcgbc.chilecentral-01.azurewebsites.net/)
e o [guia geral de deploy](../README.md#deploy).
