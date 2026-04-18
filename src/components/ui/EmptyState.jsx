import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="border-2 border-dashed border-border-soft rounded-2xl py-16 px-8 flex flex-col items-center text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-purple-light flex items-center justify-center">
          <Icon className="w-8 h-8 text-purple" />
        </div>
      )}
      <h3 className="font-serif text-xl text-gray-900 mt-4">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-xs text-center">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="primary">{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}
