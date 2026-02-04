import React from "react"
import { GetValue } from "../helpful/helpers"

export type Form = {
    form: Record<string, any>
    setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>
    getValue: GetValue
    setValue: (path: string, value: any) => void
}

export const FormContext = React.createContext<Form | null>(null)

export const useForm = () => {
    const context = React.useContext(FormContext)
    if (!context) throw new Error("useForm must be used within a provider")
    return context
}

export const useFormField = <T = any>(path: string) => {
    const { getValue, setValue } = useForm()
    const value = getValue(path)
    const set = React.useCallback((v: any) => setValue(path, v), [setValue, path])
    return [value as T, set] as const
}
