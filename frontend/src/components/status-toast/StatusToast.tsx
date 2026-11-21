type StatusToastProps = {
  message: string
  onClose: () => void
  title: string
}

function StatusToast({ message, onClose, title }: StatusToastProps) {
  return (
    <aside
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-[#cfd7c2] bg-[#f4f7ed] p-4 text-[#2f3a25] shadow-[0_12px_32px_rgba(57,69,45,0.18)] sm:right-6 sm:bottom-6"
      role="status"
    >
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#39452d] text-lg font-bold text-white"
      >
        ✓
      </span>
      <div className="min-w-0 flex-1">
        <strong className="block text-sm leading-5">{title}</strong>
        <p className="mt-1 text-sm leading-5 text-[#5f6954]">{message}</p>
      </div>
      <button
        aria-label="Fechar notificação"
        className="grid size-8 shrink-0 place-items-center rounded-full text-xl leading-none text-[#69725f] transition hover:bg-[#e1e7d7] hover:text-[#39452d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
    </aside>
  )
}

export default StatusToast
