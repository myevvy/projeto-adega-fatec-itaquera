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
      />
    </p>
  )
}

export default FormField
