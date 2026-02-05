import React from "react"
import { useForm } from "./index.js"
import { valueFromObject } from "../helpful/helpers.js"
import { DotPaths } from "../Types/index.js"

export type Validator<F extends object> = (value: any, form: F) => true | string | Promise<true | string>

type Validators<F extends object> = Map<string, Validator<F>>
type Errors = Record<string, string>

type Validation<F extends object> = {
    addValidator: (path: DotPaths<F>, f: Validator<F>) => void
    removeValidator: (path: DotPaths<F>) => void
    validateAll: () => Promise<boolean>
    validateSection: (section: keyof F) => Promise<boolean>
    getError: (path: DotPaths<F>) => string | undefined
    removeError: (path: DotPaths<F>) => void
    errors: Errors
}

type ValidationProviderProps = { children: React.ReactNode }

const ValidationContext = React.createContext<Validation<any> | null>(null)

export const useValidation = <F extends object>() => {
    const context = React.useContext(ValidationContext)
    if (!context) throw new Error("useValidation must be used within a provider")
    return context as Validation<F>
}

export const ValidationProvider = <F extends object>({ children }: ValidationProviderProps) => {
    const { form } = useForm<F>()
    const validatorsRef = React.useRef<Validators<F>>(new Map())
    const [errors, setErrors] = React.useState<Errors>({})

    const addValidator = React.useCallback((path: string, f: Validator<F>) => {
        validatorsRef.current.set(path, f)
    }, [])

    const removeValidator = React.useCallback((path: DotPaths<F>) => {
        validatorsRef.current.delete(path)
        setErrors((prev) => {
            if (!(path in prev)) return prev
            const { [path]: _, ...rest } = prev
            return rest
        })
    }, [])

    const getError = React.useCallback((path: DotPaths<F>) => errors[path], [errors])

    const removeError = React.useCallback((path: DotPaths<F>) => {
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
            const value = valueFromObject(form, path as any)
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
        async (section: keyof F) => {
            const entries = Array.from(validatorsRef.current.entries()).filter(([path]) => path.startsWith(`${String(section)}.`) || path === section)

            let flag = true
            const updatedErrors: Errors = {}

            for (const [path, f] of entries) {
                const value = valueFromObject(form, path as any)
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

    const value = React.useMemo<Validation<F>>(
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
