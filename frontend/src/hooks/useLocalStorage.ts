import { useEffect, useState } from 'react'

function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key)
    if (storedValue === null) {
      return initialValue
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (!isValid(parsedValue)) {
      throw new Error(`Os dados salvos em "${key}" têm um formato inválido.`)
    }
    return parsedValue
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

export default useLocalStorage
