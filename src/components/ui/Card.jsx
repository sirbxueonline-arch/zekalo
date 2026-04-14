export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`bg-white border border-border-soft rounded-xl p-8 ${hover ? 'hover:border-purple-mid hover:-translate-y-0.5' : ''} transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
