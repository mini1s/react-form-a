import React from "react"
import { Settings } from "../Types"
import { FormContext, StateContext, useTheState, ValidationProvider } from "../Context/index.js"
import { useMinHeight } from "@minisquare/react-context"
import { GetValue, valueFromObject, updateObject } from "../helpful/helpers.js"
import { BackButton, Loading } from "../Elements/index.js"
import { FaArrowRight } from "react-icons/fa6"
import { Link } from "react-router-dom"

const LoadingPage = () => {
    return (
        <div className="form-a__page">
            <Loading />
        </div>
    )
}

const SubmittedPage = () => {
    return (
        <div className="form-a__page form-a__page--submitted">
            <BackButton />
            <h1>Already submitted</h1>
            <p>This form has already been submitted, and cannot be changed unless it is returned to you for edits to be made.</p>
            <Link to="/" className="button--x button--cornflower-blue">
                Go to home <FaArrowRight />
            </Link>
        </div>
    )
}

type OneChildProps = {
    children: React.ReactNode
}

const OneChild: React.FC<OneChildProps> = ({ children }) => {
    const { loading, submitted } = useTheState()

    if (loading) return <LoadingPage />
    if (submitted) return <SubmittedPage />

    return children
}

type OneProps = {
    backgroundImage?: string
    settings?: Settings
    children: React.ReactNode
    form: Record<string, any>
    setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>
    loading: boolean
    saving: boolean
    submitted: boolean
    save: () => Promise<void | boolean> | void | boolean
    submit: () => Promise<void | boolean> | void | boolean
}

const One: React.FC<OneProps> = ({ backgroundImage, children, form, setForm, settings, loading, saving, save, submit, submitted }) => {
    const { minHeight } = useMinHeight()

    const getValue = React.useCallback<GetValue>((path: string, type?: any) => valueFromObject(form, path, type), [form])
    const setValue = React.useCallback((path: string, value: any) => updateObject(setForm, path, value), [setForm])

    const formProviderValue = React.useMemo(() => ({ form, setForm, getValue, setValue }), [form, setForm, getValue, setValue])

    const stateProviderValue = React.useMemo(
        () => ({ settings, loading, saving, save, submit, submitted }),
        [settings, loading, saving, save, submit, submitted],
    )

    return (
        <StateContext.Provider value={stateProviderValue}>
            <FormContext.Provider value={formProviderValue}>
                <ValidationProvider>
                    <div className="form-a form-a--one" style={{ minHeight }}>
                        {backgroundImage && <img src={backgroundImage} alt="" className="form-a__background-image" />}
                        <OneChild>{children}</OneChild>
                    </div>
                </ValidationProvider>
            </FormContext.Provider>
        </StateContext.Provider>
    )
}

export default One
