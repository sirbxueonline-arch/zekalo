import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div
      className="liquid-card flex flex-col items-center text-center"
      style={{ padding: '56px 32px', borderStyle: 'dashed', borderColor: 'rgba(124,110,224,0.25)' }}
    >
      {Icon && (
        <div
          className="flex items-center justify-center"
          style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(124,110,224,0.18) 0%, rgba(93,184,163,0.18) 100%)',
            border: '1px solid rgba(124,110,224,0.25)',
          }}
        >
          <Icon className="w-8 h-8" style={{ color: '#7c6ee0' }} />
        </div>
      )}
      <h3
        className="mt-4"
        style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="mt-1.5 max-w-xs text-center"
          style={{ fontSize: 14, color: '#64748b', lineHeight: 1.55 }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="primary">{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}
