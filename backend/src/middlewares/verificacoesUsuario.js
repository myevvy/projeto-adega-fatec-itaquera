const verificaAdm = (req, res, next) => {
  if (req.usuario?.perfil !== "ADMINISTRADOR") {
    return res
      .status(403)
      .json({ mensagem: "Acesso restrito para administradores" });
  }
  next();
};

export default verificaAdm;