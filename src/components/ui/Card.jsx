export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`bg-white border border-border-soft rounded-xl p-6 transition-all duration-200 ${hover ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-purple/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
