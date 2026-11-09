type FormFieldProps = {
  autoComplete?: string
  id: string
  label: string
  name: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: 'email' | 'password' | 'tel' | 'text'
  value: string
}

function FormField({
  autoComplete,
  id,
  label,
  name,
  onChange,
  placeholder,
  required = true,
  type = 'text',
  value,
}: FormFieldProps) {
  return (
    <p>
      <label htmlFor={id}>{label}</label>
      <br />
      <input
        autoComplete={autoComplete ?? (type === 'password' ? 'current-password' : undefined)}
        id={id}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1c1f1a] placeholder:text-gray-400 focus:border-[#3d4d35] focus:outline-none focus:ring-2 focus:ring-[#3d4d35]/20"
      />
    </p>
  )
}

export default FormField
