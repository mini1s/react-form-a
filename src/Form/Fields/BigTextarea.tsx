import React, { useEffect, useMemo } from "react"
import { useForm, usePath, useValidation, Validator } from "../../Context/index.js"
import { FaCircleExclamation } from "react-icons/fa6"

type BigTextareaProps = {
    placeholder?: string
    pathSegment: string
    showIf?: (form: Record<string, any>, path?: string) => boolean
    validate?: Validator
}

const BigTextarea: React.FC<BigTextareaProps> = ({ placeholder, pathSegment, showIf, validate }) => {
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

    if (!show) return null

    return (
        <div className="form-a__form__big-textarea-container">
            <textarea
                placeholder={placeholder || ""}
                value={value}
                onChange={(e) => {
                    setValue(path, e.target.value)
                    removeError(path)
                }}
            ></textarea>
            {error && (
                <div className="form-a__form__big-textarea-container__error-row">
                    <div className="form-a__form__big-textarea-container__error-icon">
                        <FaCircleExclamation />
                    </div>
                    <p>{error}</p>
                </div>
            )}
        </div>
    )
}

export default BigTextarea
