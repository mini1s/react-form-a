import React from "react"
import { useMinHeight } from "@minisquare/react-context"
import { Settings } from "../Types"
import { FormContext, PageProvider, AllowedPages, StateContext, ValidationProvider, usePage, useTheState } from "../Context"
import { GetValue, updateObject, valueFromObject } from "../helpful/helpers"
import { BackButton, Loading } from "../Elements"
import { Link, useParams } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa6"

type SectionsProps = {
    backgroundImage?: string
    settings?: Settings
    children: AllowedPages
    form: Record<string, any>
    setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>
    loading: boolean
    saving: boolean
    submitted: boolean
    save: () => Promise<void | boolean> | void | boolean
    markSectionComplete: (section: string, complete?: boolean) => Promise<void> | void
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

const SectionsChild = () => {
    const { thePage } = usePage()
    const { loading, submitted } = useTheState()

    if (loading) return <LoadingPage />
    if (submitted) return <SubmittedPage />

    return thePage
}

const Sections: React.FC<SectionsProps> = ({
    backgroundImage,
    children,
    form,
    setForm,
    settings,
    loading,
    saving,
    save,
    markSectionComplete,
    submit,
    submitted,
}) => {
    const { minHeight } = useMinHeight()

    const getValue = React.useCallback<GetValue>((path: string, type?: any) => valueFromObject(form, path, type), [form])
    const setValue = React.useCallback((path: string, value: any) => updateObject(setForm, path, value), [setForm])

    const formProviderValue = React.useMemo(() => ({ form, setForm, getValue, setValue }), [form, setForm, getValue, setValue])

    const stateProviderValue = React.useMemo(
        () => ({ settings, loading, saving, save, markSectionComplete, submit, submitted }),
        [settings, loading, saving, save, markSectionComplete, submit, submitted],
    )

    return (
        <StateContext.Provider value={stateProviderValue}>
            <FormContext.Provider value={formProviderValue}>
                <PageProvider grandchildren={children}>
                    <ValidationProvider>
                        <div className="form-a form-a--sections" style={{ minHeight }}>
                            {backgroundImage && <img src={backgroundImage} alt="" className="form-a__background-image" />}
                            <SectionsChild />
                        </div>
                    </ValidationProvider>
                </PageProvider>
            </FormContext.Provider>
        </StateContext.Provider>
    )
}

export default Sections
