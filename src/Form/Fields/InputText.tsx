import React, { useEffect, useMemo } from "react"
import { useForm, usePath, useValidation, Validator } from "../../Context/index.js"
import { FaCircleExclamation } from "react-icons/fa6"
import { ChildKey, DotPaths, FullPath, SpecificFullPath } from "../../Types/index.js"

export type InputTextProps<F extends object, PParent extends DotPaths<F>, PChild extends ChildKey<F, PParent>> = {
    label: string
    after?: React.ReactNode
    placeholder?: string
    pathSegment: PChild
    showIf?: (form: F, path?: SpecificFullPath<F, PParent, PChild>) => boolean
    validate?: Validator<F>
}

const InputText = <F extends object, PParent extends DotPaths<F>, PChild extends ChildKey<F, PParent>>({
    label,
    after,
    placeholder,
    pathSegment,
    showIf,
    validate,
}: InputTextProps<F, PParent, PChild>) => {
    const { getError, removeError, addValidator, removeValidator } = useValidation<F>()
    const { getValue, setValue, form } = useForm<F>()
    const { segments } = usePath()

    const path = useMemo(() => [...segments, pathSegment].join(".") as SpecificFullPath<F, PParent, PChild>, [segments, pathSegment])
    const show = useMemo(() => (showIf ? showIf(form, path) : true), [showIf, form])

    const rawValue = getValue(path as any)
    const value = (rawValue ?? "") as string
    const error = getError(path as any)

    useEffect(() => {
        if (!show) {
            if (error) removeError(path as any)
            if (rawValue !== undefined) setValue(path as any, undefined as any)
        }
    }, [show, path, value, setValue, removeError])

    useEffect(() => {
        if (!validate || !show) return
        addValidator(path as any, validate)
        return () => removeValidator(path as any)
    }, [validate, show, path])

    if (!show) return null

    return (
        <label className="form-a__form__label-1">
            <div className="form-a__form__label-1__input-row">
                <p>
                    {label}
                    {validate && "\u2060*"}
                </p>
                <input
                    type="text"
                    placeholder={placeholder || label}
                    value={value}
                    onChange={(e) => {
                        setValue(path as any, e.target.value as any)
                        removeError(path as any)
                    }}
                />
                {after && after}
            </div>
            {error && (
                <div className="form-a__form__label-1__error-row">
                    <div className="form-a__form__label-1__error-icon">
                        <FaCircleExclamation />
                    </div>
                    <p>{error}</p>
                </div>
            )}
        </label>
    )
}

export default InputText
