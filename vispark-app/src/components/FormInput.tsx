import type { FC, InputHTMLAttributes } from "react"
import clsx from "clsx"

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  helperText?: string
}

const FormInput: FC<FormInputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-zinc-300 text-sm font-medium"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-zinc-500 rounded-lg hover:border-white/40 focus:border-blue-400 focus:outline-none transition-colors",
          {
            "border-red-500/50 focus:border-red-400": error,
            "pr-10": props.type === "password"
          },
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-zinc-400 text-sm">{helperText}</p>
      )}
    </div>
  )
}

export default FormInput
