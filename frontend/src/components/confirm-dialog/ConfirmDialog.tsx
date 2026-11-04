type ConfirmDialogProps = {
  description: string
  onCancel: () => void
  onConfirm: () => void
  title: string
}

function ConfirmDialog({
  description,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  return (
    <section aria-labelledby="confirm-dialog-title" aria-modal="true" role="dialog">
      <h2 id="confirm-dialog-title">{title}</h2>
      <p>{description}</p>
      <button onClick={onCancel} type="button">
        Cancelar
      </button>
      <button onClick={onConfirm} type="button">
        Confirmar
      </button>
    </section>
  )
}

export default ConfirmDialog
