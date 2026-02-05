import React from "react"
import { DotPaths, GetValue, PathValue, SetValue } from "../Types/index.js"

export type Form<F extends object> = {
    form: F
    setForm: React.Dispatch<React.SetStateAction<F>>
    getValue: GetValue<F>
    setValue: SetValue<F>
}

export const FormContext = React.createContext<Form<any> | null>(null)

export function useForm<F extends object>() {
    const context = React.useContext(FormContext)
    if (!context) throw new Error("useForm must be used within a provider")
    return context as Form<F>
}

export function useFormField<F extends object, P extends DotPaths<F>>(path: P) {
    const { getValue, setValue } = useForm<F>()
    const value = getValue(path)
    const set = React.useCallback((v: PathValue<F, P>) => setValue(path, v), [setValue, path])
    return [value, set] as const
}
