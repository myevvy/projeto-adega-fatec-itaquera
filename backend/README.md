# API do backend

## Firebase Auth

- Localmente, defina `FIREBASE_API_KEY` no `backend/.env` e mantenha a credencial JSON em `backend/config/serviceAccountKey.json` (arquivo ignorado pelo Git).
- No GitHub, cadastre `FIREBASE_SERVICE_ACCOUNT` com o conteúdo JSON da conta de serviço e `VITE_FIREBASE_API_KEY` com a chave Web do Firebase. O workflow grava essas configurações no Azure; a chave Web é usada pelo frontend e pela verificação da redefinição no backend.
- No Firebase Console, configure a URL de ação do template de redefinição de senha para a página publicada `/esqueci-senha` e autorize o domínio do frontend. Essa página recebe o código do Firebase, define a nova senha e sincroniza o hash usado pelo login do sistema.
- O backend requer Node.js 22 ou superior, definido no Dockerfile, no pacote e no deploy do Azure para atender à versão do Firebase Admin SDK.
- Para executar os testes locais do serviço Firebase Auth, rode `npm test` dentro de `backend/`. Eles simulam as respostas HTTP e não enviam e-mails nem chamam o Firebase real.

## Relatório de vendas

`GET /relatorios/vendas` retorna dados de vendas concluídas para uso em cards e gráficos. A rota exige autenticação e perfil de administrador.

Parâmetros opcionais:

- `inicio`: data inicial no formato `YYYY-MM-DD`.
- `fim`: data final no formato `YYYY-MM-DD`.

Sem parâmetros, o período compreende os últimos 30 dias, incluindo hoje. A comparação usa o período imediatamente anterior com a mesma quantidade de dias. Vendas canceladas e vendas não concluídas não entram nos totais.

Exemplo de resposta:

```json
{
  "periodo": {
    "inicio": "2026-10-11",
    "fim": "2026-11-09",
    "quantidadeDias": 30
  },
  "resumo": {
    "totalVendas": 0,
    "faturamento": 0,
    "produtosVendidos": 0,
    "ticketMedio": 0
  },
  "comparacao": {
    "periodoAnterior": {
      "inicio": "2026-09-11",
      "fim": "2026-10-10"
    },
    "totalVendas": {
      "atual": 0,
      "anterior": 0,
      "diferenca": 0,
      "variacaoPercentual": null
    },
    "faturamento": {
      "atual": 0,
      "anterior": 0,
      "diferenca": 0,
      "variacaoPercentual": null
    },
    "produtosVendidos": {
      "atual": 0,
      "anterior": 0,
      "diferenca": 0,
      "variacaoPercentual": null
    }
  },
  "graficos": {
    "vendasPorDia": [
      {
        "data": "2026-11-09",
        "totalVendas": 0,
        "faturamento": 0,
        "produtosVendidos": 0
      }
    ],
    "produtosMaisVendidos": [
      {
        "produtoId": 1,
        "produto": "Nome do produto cadastrado",
        "quantidadeVendida": 0,
        "faturamento": 0
      }
    ],
    "vendasPorFormaPagamento": [
      {
        "formaPagamento": "PIX",
        "totalVendas": 0,
        "faturamento": 0
      }
    ]
  }
}
```

Os arrays de gráficos contêm somente agrupamentos existentes no banco para o período; não há preenchimento de datas ou produtos sem vendas. Quando o período anterior não tem valores, `variacaoPercentual` é `null`.

## Relatório de estoque

`GET /relatorios/estoque` exige autenticação e perfil de administrador. O relatório representa a posição atual do estoque e inclui somente produtos ativos.

- `resumo`: quantidade de produtos cadastrados, unidades em estoque, valor total calculado pelo custo de aquisição atual e quantidade de produtos em alerta.
- `alertas`: produtos zerados ou com estoque igual ou abaixo do mínimo, ordenados primeiro pelos níveis mais críticos.
- `produtos`: dados atuais de estoque por produto, úteis para tabelas e exportação.
- `estoquePorCategoria`: agrupamento por categoria, pronto para gráficos.

## Relatório de despesas

`GET /relatorios/despesas` exige autenticação e perfil de administrador. Aceita os mesmos parâmetros opcionais `inicio` e `fim` (`YYYY-MM-DD`). Sem parâmetros, usa os últimos 7 dias, incluindo hoje. A data final é inclusiva. Despesas estornadas não entram nos valores nem no histórico.

- `resumo`: total de lançamentos e total de despesas no período.
- `graficos.despesasPorCategoria`: totais por categoria e percentual sobre o total do período.
- `historico`: lançamentos detalhados no período, ordenados do mais recente para o mais antigo, para tabela e exportação.

Exemplo da estrutura:

```json
{
  "periodo": {
    "inicio": "2026-11-03",
    "fim": "2026-11-09"
  },
  "resumo": {
    "totalLancamentos": 0,
    "totalDespesas": 0
  },
  "graficos": {
    "despesasPorCategoria": [
      {
        "categoriaId": 1,
        "categoria": "Categoria cadastrada",
        "totalLancamentos": 0,
        "totalDespesas": 0,
        "percentual": 0
      }
    ]
  },
  "historico": [
    {
      "id": 1,
      "data": "2026-11-09",
      "descricao": "Descrição registrada",
      "categoria": "Categoria cadastrada",
      "valor": 0,
      "formaPagamento": null,
      "compraId": null,
      "usuario": "Usuário responsável"
    }
  ]
}
```

Os exemplos acima descrevem o formato; a API retorna apenas registros existentes no banco.
