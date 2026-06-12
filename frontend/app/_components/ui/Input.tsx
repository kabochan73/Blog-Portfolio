type Props = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: Props) {
  return (
    <input
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white ${className}`}
      {...props}
    />
  )
}
