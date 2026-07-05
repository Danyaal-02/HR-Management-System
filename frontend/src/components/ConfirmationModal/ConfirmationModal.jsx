import { useState, useEffect } from 'react'

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  requireComment = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) {
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (isOpen) {
      setComment('')
    }
  }, [isOpen])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm(comment)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isLoading) return
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  const confirmBtnClass = isDestructive
    ? 'bg-status-error/90 hover:bg-status-error shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.5)]'
    : 'bg-status-success/90 hover:bg-status-success shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_25px_rgba(34,197,94,0.5)]'

  const iconClass = isDestructive ? 'bg-status-error/10 text-status-error' : 'bg-status-success/10 text-status-success'

  return (
    <div
      className="fixed inset-0 bg-[#050508]/85 backdrop-blur-md flex items-center justify-center z-[1000] p-5 transition-all duration-200"
      onClick={handleOverlayClick}
      id="confirmation-modal-overlay"
    >
      <div className="bg-bg-card border border-border-color rounded-lg w-full max-w-[500px] p-7 relative shadow-card transition-all duration-300" id="confirmation-modal">
        {/* Close button */}
        <button
          type="button"
          className="absolute top-5 right-5 bg-transparent text-text-muted w-8 h-8 flex items-center justify-center rounded-full transition-all duration-fast hover:bg-bg-card-hover hover:text-text-primary"
          onClick={onClose}
          aria-label="Close modal"
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-14 h-14 rounded-md flex items-center justify-center mb-4 ${iconClass}`}>
            {isDestructive ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <h2 className="text-[1.35rem] font-bold text-text-primary mb-2">{title}</h2>
          <p className="text-[0.9rem] text-text-secondary">
            {message}
          </p>
        </div>

        {/* Optional Comment Field */}
        {requireComment && (
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[0.85rem] font-semibold text-text-secondary uppercase tracking-wide">
              Add a Comment (Optional)
            </label>
            <textarea
              className="bg-bg-input border border-border-color text-text-primary px-3.5 py-3 rounded-md text-[0.9rem] focus:border-primary-purple focus:bg-bg-input-focus outline-none resize-y min-h-[80px] transition-all duration-200"
              placeholder="Provide a reason or extra details..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-5 py-2.5 border border-border-color bg-transparent hover:bg-bg-input text-text-primary rounded-md text-[0.9rem] font-semibold transition-all duration-200 disabled:opacity-50 cursor-pointer"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 text-white rounded-md text-[0.9rem] font-semibold transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px] cursor-pointer ${confirmBtnClass} disabled:opacity-60 disabled:hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)]`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
