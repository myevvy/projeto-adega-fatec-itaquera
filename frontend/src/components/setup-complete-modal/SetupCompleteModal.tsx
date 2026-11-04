type SetupCompleteModalProps = {
  onContinue: () => void
}

function SetupCompleteModal({ onContinue }: SetupCompleteModalProps) {
  return (
    <section
      aria-labelledby="setup-complete-title"
      aria-modal="true"
      className="setup-complete-modal"
      role="dialog"
    >
      <p aria-hidden="true">✓</p>
      <h2 id="setup-complete-title">Tudo pronto!</h2>
      <p>
        Sua adega já está configurada. Agora é só começar a registrar vendas e
        controlar o estoque.
      </p>
      <button onClick={onContinue} type="button">
        Ir para o painel
      </button>
    </section>
  )
}

export default SetupCompleteModal
