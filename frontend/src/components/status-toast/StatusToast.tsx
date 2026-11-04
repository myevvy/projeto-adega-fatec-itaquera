type StatusToastProps = {
  message: string
  onClose: () => void
  title: string
}

function StatusToast({ message, onClose, title }: StatusToastProps) {
  return (
    <aside aria-live="polite" role="status">
      <strong>{title}</strong>
      <p>{message}</p>
      <button aria-label="Fechar notificação" onClick={onClose} type="button">
        ×
      </button>
    </aside>
  )
}

export default StatusToast
