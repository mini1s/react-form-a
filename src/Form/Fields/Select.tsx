import React, { useEffect, useMemo } from "react"
import { useForm, usePath, useValidation, Validator } from "../../Context/index.js"
import { FaCircleExclamation } from "react-icons/fa6"
import { DotPaths, ChildKey, SpecificFullPath } from "../../Types/index.js"

export type SelectProps<F extends object, PParent extends DotPaths<F>, PChild extends ChildKey<F, PParent>> = {
    label: string
    options: string[]
    pathSegment: PChild
    showIf?: (form: F, path?: SpecificFullPath<F, PParent, PChild>) => boolean
    validate?: Validator<F>
}

const Select: React.FC<SelectProps> = ({ label, options, pathSegment, showIf, validate }) => {
    const { getError, removeError, addValidator, removeValidator } = useValidation()
    const { getValue, setValue, form } = useForm()
    const { segments, string } = usePath()

    const path = useMemo(() => [...segments, pathSegment].join("."), [segments, pathSegment])
    const show = useMemo(() => (showIf ? showIf(form, string) : true), [showIf, form])

    const value = getValue(path, "string")
    const error = getError(path)

    useEffect(() => {
        if (!show) {
            if (error) removeError(path)
            if (value !== undefined) setValue(path, undefined)
        }
    }, [show, path, value, setValue, removeError])

    useEffect(() => {
        if (!validate || !show) return
        addValidator(path, validate)
        return () => removeValidator(path)
    }, [validate, show, path])

    useEffect(() => {
        if (!options.includes(value)) setValue(path, undefined)
    }, [options.length])

    if (!show) return null

    return (
        <label className="form-a__form__label-1">
            <div className="form-a__form__label-1__input-row">
                <p>
                    {label}
                    {validate && "\u2060*"}
                </p>
                <select
                    value={value || ""}
                    onChange={(e) => {
                        setValue(path, e.target.value)
                        removeError(path)
                    }}
                >
                    <option value="" disabled>
                        Select
                    </option>
                    {options.map((x, i) => (
                        <option value={x} key={`${x}-${i}`}>
                            {x}
                        </option>
                    ))}
                </select>
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

export default Select
