import React from "react"
import { useForm } from "./index.js"
import { valueFromObject } from "../helpful/helpers.js"

export type Validator = (value: any, form: Record<string, any>) => true | string | Promise<true | string>

type Validators = Map<string, Validator>
type Errors = Record<string, string>

type Validation = {
    addValidator: (path: string, f: Validator) => void
    removeValidator: (path: string) => void
    validateAll: () => Promise<boolean>
    validateSection: (section: string) => Promise<boolean>
    getError: (path: string) => string | undefined
    removeError: (path: string) => void
    errors: Errors
}

type ValidationProviderProps = { children: React.ReactNode }

const ValidationContext = React.createContext<Validation | null>(null)

export const useValidation = () => {
    const context = React.useContext(ValidationContext)
    if (!context) throw new Error("useValidation must be used within a provider")
    return context
}

export const ValidationProvider: React.FC<ValidationProviderProps> = ({ children }) => {
    const { form } = useForm()
    const validatorsRef = React.useRef<Validators>(new Map())
    const [errors, setErrors] = React.useState<Errors>({})

    const addValidator = React.useCallback((path: string, f: Validator) => {
        validatorsRef.current.set(path, f)
    }, [])

    const removeValidator = React.useCallback((path: string) => {
        validatorsRef.current.delete(path)
        setErrors((prev) => {
            if (!(path in prev)) return prev
            const { [path]: _, ...rest } = prev
            return rest
        })
    }, [])

    const getError = React.useCallback((path: string) => errors[path], [errors])

    const removeError = React.useCallback((path: string) => {
        setErrors((prev) => {
            if (!(path in prev)) return prev
            const { [path]: _, ...rest } = prev
            return rest
        })
    }, [])

    const validateAll = React.useCallback(async () => {
        const entries = Array.from(validatorsRef.current.entries())
        let flag = true
        const updatedErrors: Errors = {}

        for (const [path, f] of entries) {
            const value = valueFromObject(form, path)
            const result = await f(value, form)

            if (result !== true) {
                flag = false
                updatedErrors[path] = String(result)
            }
        }

        setErrors(updatedErrors)
        return flag
    }, [form])

    const validateSection = React.useCallback(
        async (section: string) => {
            const entries = Array.from(validatorsRef.current.entries()).filter(([path]) => path.startsWith(`${section}.`) || path === section)

            let flag = true
            const updatedErrors: Errors = {}

            for (const [path, f] of entries) {
                const value = valueFromObject(form, path)
                const result = await f(value, form)

                if (result !== true) {
                    flag = false
                    updatedErrors[path] = String(result)
                }
            }

            setErrors(updatedErrors)
            return flag
        },
        [form],
    )

    const value = React.useMemo<Validation>(
        () => ({
            addValidator,
            removeValidator,
            validateAll,
            validateSection,
            getError,
            removeError,
            errors,
        }),
        [addValidator, removeValidator, validateAll, validateSection, getError, removeError, errors],
    )

    return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>
}
