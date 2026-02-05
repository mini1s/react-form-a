import React from "react"
import { useMinHeight } from "@minisquare/react-context"
import { DotPaths, GetValue, PathValue, Settings, SetValue } from "../Types/index.js"
import { FormContext, PageProvider, AllowedPages, StateContext, ValidationProvider, usePage, useTheState, State, Form } from "../Context/index.js"
import { updateObject, valueFromObject } from "../helpful/helpers.js"
import { BackButton, Loading } from "../Elements/index.js"
import { Link, useParams } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa6"

type SectionsProps<F extends object> = {
    backgroundImage?: string
    settings?: Settings
    children: AllowedPages<F>
    form: F
    setForm: React.Dispatch<React.SetStateAction<F>>
    loading: boolean
    saving: boolean
    submitted: boolean
    save: () => Promise<void | boolean> | void | boolean
    markSectionComplete: (section: keyof F, complete?: boolean) => Promise<void> | void
    submit: () => Promise<void | boolean> | void | boolean
}

const LoadingPage = () => {
    return (
        <div className="form-a__page">
            <Loading />
        </div>
    )
}

const SubmittedPage = () => {
    const { applicationId } = useParams()

    return (
        <div className="form-a__page form-a__page--submitted">
            <BackButton />
            <h1>Already submitted</h1>
            <p>This form has already been submitted, and cannot be changed unless it is returned to you for edits to be made.</p>
            <Link to={applicationId ? `/application/${applicationId}` : "/"} className="cornflower button">
                Go to home <FaArrowRight />
            </Link>
        </div>
    )
}

const SectionsChild = <F extends object>() => {
    const { thePage } = usePage()
    const { loading, submitted } = useTheState<F>()

    if (loading) return <LoadingPage />
    if (submitted) return <SubmittedPage />

    return thePage
}

const Sections = <F extends object>(props: SectionsProps<F>) => {
    const { backgroundImage, children, form, setForm, settings, loading, saving, save, markSectionComplete, submit, submitted } = props

    const { minHeight } = useMinHeight()

    const setValue = React.useCallback<SetValue<F>>(
        ((path, value) => {
            updateObject(setForm, path as any, value as any)
        }) as SetValue<F>,
        [setForm],
    )

    const getValue = React.useCallback(
        ((path: string) => {
            return valueFromObject(form, path as any)
        }) as GetValue<F>,
        [form],
    )

    const formProviderValue: Form<F> = React.useMemo(() => ({ form, setForm, getValue, setValue }), [form, setForm, getValue, setValue])

    const stateProviderValue: State<F> = React.useMemo(
        () => ({
            settings,
            loading,
            saving,
            save,
            markSectionComplete,
            submit,
            submitted,
        }),
        [settings, loading, saving, save, markSectionComplete, submit, submitted],
    )

    return (
        <StateContext.Provider value={stateProviderValue}>
            <FormContext.Provider value={formProviderValue}>
                <PageProvider grandchildren={children}>
                    <ValidationProvider>
                        <div className="form-a form-a--sections" style={{ minHeight }}>
                            {backgroundImage && <img src={backgroundImage} alt="" className="form-a__background-image" />}
                            <SectionsChild<F> />
                        </div>
                    </ValidationProvider>
                </PageProvider>
            </FormContext.Provider>
        </StateContext.Provider>
    )
}

export default Sections
