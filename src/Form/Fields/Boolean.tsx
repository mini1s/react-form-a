import React, { useMemo, useEffect } from "react"
import { useForm, usePath, useTheState, useValidation, Validator } from "../../Context"
import { FaCircleExclamation } from "react-icons/fa6"

type BooleanProps = {
    label: string
    pathSegment: string
    showIf?: (form: Record<string, any>, path?: string) => boolean
    validate?: Validator
    yes?: string
    no?: string
}

const Boolean: React.FC<BooleanProps> = ({ label, pathSegment, showIf, validate, yes = "Yes", no = "No" }) => {
    const { getError, removeError, addValidator, removeValidator } = useValidation()
    const { settings } = useTheState()
    const { getValue, setValue, form } = useForm()
    const { segments, string } = usePath()

    const path = useMemo(() => [...segments, pathSegment].join("."), [segments, pathSegment])
    const show = useMemo(() => (showIf ? showIf(form, string) : true), [showIf, form])

    const value = getValue(path)
    const error = getError(path)

    const activeStyle = {
        backgroundColor: settings?.activeColor,
        color: settings?.activeTextColor,
        borderColor: settings?.activeBorderColor || settings?.activeColor,
    }
    const inactiveStyle = {
        backgroundColor: settings?.inactiveColor,
        color: settings?.inactiveTextColor,
        borderColor: settings?.inactiveBorderColor || settings?.inactiveColor,
    }

    useEffect(() => {
        if (!show) {
            if (error) removeError(path)
            if (value !== undefined) setValue(path, undefined)
        }
    }, [show, path, value, setValue])

    useEffect(() => {
        if (!validate || !show) return
        addValidator(path, validate)
        return () => removeValidator(path)
    }, [validate, show, path])

    if (!show) return null

    return (
        <div className="form-a__form__label-1">
            <div className="form-a__form__label-1__input-row">
                <p>
                    {label}
                    {validate && "\u2060*"}
                </p>
                <div className="form-a__form__booleans">
                    <button
                        type="button"
                        className="form-a__form__boolean"
                        style={value === true ? activeStyle : inactiveStyle}
                        onClick={() => {
                            setValue(path, true)
                            removeError(path)
                        }}
                    >
                        {yes}
                    </button>
                    <button
                        type="button"
                        className="form-a__form__boolean"
                        style={value === false ? activeStyle : inactiveStyle}
                        onClick={() => {
                            setValue(path, false)
                            removeError(path)
                        }}
                    >
                        {no}
                    </button>
                </div>
            </div>
            {error && (
                <div className="form-a__form__label-1__error-row">
                    <div className="form-a__form__label-1__error-icon">
                        <FaCircleExclamation />
                    </div>
                    <p>{error}</p>
                </div>
            )}
        </div>
    )
}

export default Boolean
