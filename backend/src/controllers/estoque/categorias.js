import categoriasModel from "../../models/estoque/categorias.js";

const getCategorias = async (_req, res) => {
  try {
    return res.status(200).json(await categoriasModel.getCategorias());
  } catch (erro) {
    console.error("Erro ao buscar categorias de produtos:", erro.message);
    return res.status(500).json({
      mensagem: "Não foi possível carregar as categorias.",
    });
  }
};

const postCategoria = async (req, res) => {
  try {
    const nome = req.body?.nome;
    if (typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({ mensagem: "Informe o nome da categoria." });
    }

    const id = await categoriasModel.postCategorias(nome.trim());
    if (id === null) {
      return res.status(409).json({ mensagem: "Essa categoria já está cadastrada." });
    }

    const categoria = await categoriasModel.getCategorias(id);
    return res.status(201).json({ categoria });
  } catch (erro) {
    console.error("Erro ao cadastrar categoria de produto:", erro.message);
    return res.status(500).json({
      mensagem: "Não foi possível cadastrar a categoria.",
    });
  }
};

export default { getCategorias, postCategoria };
