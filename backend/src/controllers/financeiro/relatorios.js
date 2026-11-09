import dayjs from "dayjs";
import relatoriosModel from "../../models/financeiro/relatorios.js";

const validarData = (valor) =>
  typeof valor === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
  dayjs(valor).isValid() &&
  dayjs(valor).format("YYYY-MM-DD") === valor;

const calcularVariacao = (atual, anterior) => ({
  atual,
  anterior,
  diferenca: atual - anterior,
  variacaoPercentual:
    anterior === 0 ? null : ((atual - anterior) / anterior) * 100,
});

const getRelatorioVendas = async (req, res) => {
  try {
    const hoje = dayjs().format("YYYY-MM-DD");
    const inicioInformado = req.query.inicio;
    const fimInformado = req.query.fim;

    if (
      (inicioInformado !== undefined && !validarData(inicioInformado)) ||
      (fimInformado !== undefined && !validarData(fimInformado))
    ) {
      return res.status(400).json({
        mensagem: "Informe datas válidas no formato YYYY-MM-DD.",
      });
    }

    const fim = fimInformado ?? hoje;
    const inicio =
      inicioInformado ??
      dayjs(fim).subtract(29, "day").format("YYYY-MM-DD");

    if (dayjs(inicio).isAfter(dayjs(fim))) {
      return res.status(400).json({
        mensagem: "A data inicial não pode ser posterior à data final.",
      });
    }

    const quantidadeDias = dayjs(fim).diff(dayjs(inicio), "day") + 1;
    const inicioAnterior = dayjs(inicio)
      .subtract(quantidadeDias, "day")
      .format("YYYY-MM-DD");
    const fimAnterior = dayjs(inicio).subtract(1, "day").format("YYYY-MM-DD");
    const fimExclusivo = dayjs(fim).add(1, "day").format("YYYY-MM-DD");
    const fimAnteriorExclusivo = inicio;

    const relatorio = await relatoriosModel.obterRelatorioVendas({
      inicio: `${inicio} 00:00:00`,
      fimExclusivo: `${fimExclusivo} 00:00:00`,
      inicioAnterior: `${inicioAnterior} 00:00:00`,
      fimAnteriorExclusivo: `${fimAnteriorExclusivo} 00:00:00`,
    });

    return res.status(200).json({
      periodo: { inicio, fim, quantidadeDias },
      resumo: relatorio.resumo,
      comparacao: {
        periodoAnterior: { inicio: inicioAnterior, fim: fimAnterior },
        totalVendas: calcularVariacao(
          relatorio.resumo.totalVendas,
          relatorio.resumoAnterior.totalVendas,
        ),
        faturamento: calcularVariacao(
          relatorio.resumo.faturamento,
          relatorio.resumoAnterior.faturamento,
        ),
        produtosVendidos: calcularVariacao(
          relatorio.resumo.produtosVendidos,
          relatorio.resumoAnterior.produtosVendidos,
        ),
      },
      graficos: {
        vendasPorDia: relatorio.vendasPorDia,
        produtosMaisVendidos: relatorio.produtosMaisVendidos,
        vendasPorFormaPagamento: relatorio.vendasPorFormaPagamento,
      },
    });
  } catch (erro) {
    console.error("Erro ao gerar relatório de vendas:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao gerar relatório de vendas.",
    });
  }
};

const getRelatorioDespesas = async (req, res) => {
  try {
    const hoje = dayjs().format("YYYY-MM-DD");
    const inicioInformado = req.query.inicio;
    const fimInformado = req.query.fim;

    if (
      (inicioInformado !== undefined && !validarData(inicioInformado)) ||
      (fimInformado !== undefined && !validarData(fimInformado))
    ) {
      return res.status(400).json({
        mensagem: "Informe datas válidas no formato YYYY-MM-DD.",
      });
    }

    const fim = fimInformado ?? hoje;
    const inicio =
      inicioInformado ??
      dayjs(fim).subtract(6, "day").format("YYYY-MM-DD");

    if (dayjs(inicio).isAfter(dayjs(fim))) {
      return res.status(400).json({
        mensagem: "A data inicial não pode ser posterior à data final.",
      });
    }

    const fimExclusivo = dayjs(fim).add(1, "day").format("YYYY-MM-DD");
    const relatorio = await relatoriosModel.obterRelatorioDespesas({
      inicio: `${inicio} 00:00:00`,
      fimExclusivo: `${fimExclusivo} 00:00:00`,
    });

    return res.status(200).json({
      periodo: { inicio, fim },
      resumo: relatorio.resumo,
      graficos: {
        despesasPorCategoria: relatorio.despesasPorCategoria,
      },
      historico: relatorio.historico,
    });
  } catch (erro) {
    console.error("Erro ao gerar relatório de despesas:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao gerar relatório de despesas.",
    });
  }
};

export default { getRelatorioVendas, getRelatorioDespesas };
