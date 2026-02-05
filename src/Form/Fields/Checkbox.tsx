import React, { useMemo, useEffect } from "react"
import { FaCheck, FaCircleExclamation } from "react-icons/fa6"
import { useForm, usePath, useTheState, useValidation, Validator } from "../../Context/index.js"
import { DotPaths, ChildKey, SpecificFullPath } from "../../Types/index.js"

export type CheckboxProps<F extends object, PParent extends DotPaths<F>, PChild extends ChildKey<F, PParent>> = {
    label: string
    pathSegment: PChild
    showIf?: (form: F, path?: SpecificFullPath<F, PParent, PChild>) => boolean
    validate?: Validator<F>
}

const Checkbox: React.FC<CheckboxProps> = ({ label, pathSegment, showIf, validate }) => {
    const { getError, removeError, addValidator, removeValidator } = useValidation()
    const { settings } = useTheState()
    const { getValue, setValue, form } = useForm()
    const { segments, string } = usePath()

    const path = useMemo(() => [...segments, pathSegment].join("."), [segments, pathSegment])
    const show = useMemo(() => (showIf ? showIf(form, string) : true), [showIf, form])

    const value = getValue(path)
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

    if (!show) return null

    return (
        <div className="form-a__form__label-checkbox">
            <label className="form-a__form__label-checkbox__input-row">
                <span
                    className="checkbox"
                    style={{
                        backgroundColor: value ? settings?.activeColor : "transparent",
                    }}
                >
                    <FaCheck />
                    <input
                        type="checkbox"
                        checked={value == true}
                        onChange={(e) => {
                            setValue(path, e.target.checked || undefined)
                            removeError(path)
                        }}
                    />
                </span>
                <p>
                    {label}
                    {validate && "\u2060*"}
                </p>
            </label>
            {error && (
                <div className="form-a__form__label-checkbox__error-row">
                    <div className="form-a__form__label-checkbox__error-icon">
                        <FaCircleExclamation />
                    </div>
                    <p>{error}</p>
                </div>
            )}
        </div>
    )
}

export default Checkbox
