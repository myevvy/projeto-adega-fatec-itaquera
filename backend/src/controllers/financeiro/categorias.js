import categoriasModel from "../../models/financeiro/despesas.js";

const getCategorias = async (_req, res) => {
  try {
    return res.status(200).json(await categoriasModel.getCategorias());
  } catch (erro) {
    console.error("Erro ao buscar categorias de despesas:", erro.message);
    return res.status(500).json({
      mensagem: "Não foi possível carregar as categorias.",
    });
  }
};

const postCategoria = async (req, res) => {
  try {
    const nome = req.body?.nome;
    const tipo = req.body?.tipo;
    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      typeof tipo !== "string" ||
      !tipo.trim()
    ) {
      return res.status(400).json({
        mensagem: "Informe o nome e o tipo da categoria.",
      });
    }

    const categoria = await categoriasModel.postCategoria(
      nome.trim(),
      tipo.trim(),
    );
    if (!categoria) {
      return res.status(409).json({ mensagem: "Essa categoria já está cadastrada." });
    }

    return res.status(201).json({ categoria });
  } catch (erro) {
    console.error("Erro ao cadastrar categoria de despesa:", erro.message);
    return res.status(500).json({
      mensagem: "Não foi possível cadastrar a categoria.",
    });
  }
};

export default { getCategorias, postCategoria };
