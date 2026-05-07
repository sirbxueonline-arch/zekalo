export default function Card({ children, className = '', hover = true, flat = false, ...props }) {
  if (flat) {
    return (
      <div
        className={`bg-white border border-border-soft rounded-2xl p-6 transition-all duration-200 ${hover ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-[rgba(124,110,224,0.25)]' : ''} ${className}`}
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
