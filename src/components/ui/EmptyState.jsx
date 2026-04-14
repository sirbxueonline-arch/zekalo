import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && <Icon className="w-12 h-12 text-purple-mid mb-4" />}
      <h3 className="font-serif text-2xl text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
