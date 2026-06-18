export default function Card({ children, className = '', hover = true, flat = false, ...props }) {
  if (flat) {
    return (
      <div
        className={`bg-surface border border-hairline rounded-card p-6 transition-all duration-150 ${
          hover ? 'hover:-translate-y-0.5 hover:shadow-soft-lg hover:border-hairline-strong' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={`liquid-card p-6 ${hover ? '' : 'hover:!transform-none hover:!shadow-none'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
