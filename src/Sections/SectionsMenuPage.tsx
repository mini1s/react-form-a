import React, { ReactElement, useState } from "react"
import { FaCheck, FaXmark, FaEllipsis, FaArrowRight } from "react-icons/fa6"
import { useForm, usePage, useTheState } from "../Context"
import { isObjectEmpty } from "../helpful/helpers"
import SectionsPage from "./SectionsPage"
import { BackButton } from "../Elements"

type TheXProps = {
    completed: boolean
    started: boolean
}

type SectionsMenuPageProps = {
    title: string
    image?: string
    children?: React.ReactNode
    completeSections: Record<string, boolean>
}

const TheIcon: React.FC<TheXProps> = ({ completed, started }) => {
    if (completed) return <FaCheck className="completed" />
    if (started) return <FaEllipsis className="in-progress" />
    return <FaXmark className="not-started" />
}

const TheStatus: React.FC<TheXProps> = ({ completed, started }) => {
    if (completed) return <>Completed</>
    if (started) return <>In progress</>
    return <>Not started</>
}

const SectionsMenuPage: React.FC<SectionsMenuPageProps> = ({ title, children, image, completeSections }) => {
    const { setPage, pageArray } = usePage()
    const { getValue } = useForm()
    const { markSectionComplete, submit } = useTheState()

    const [submitting, setSubmitting] = useState<boolean>(false)

    if (!markSectionComplete) throw new Error("A formA sections component must have a markSectionComplete function")

    const { normalPages, isComplete } = React.useMemo(() => {
        const normalPages = pageArray.map((page, j) => ({ ...page, j })).filter((page) => page.type === SectionsPage)
        const sections = normalPages.map((page) => page.props.pathSegment)
        let isComplete = true
        for (const section of sections) {
            if (!completeSections[section]) isComplete = false
        }
        return { normalPages, isComplete }
    }, [pageArray])

    return (
        <div className="form-a__page form-a__sections-menu">
            <BackButton />
            <div className="form-a__page__head form-a__sections-menu__head">
                {image && <img src={image} alt="" className="form-a__page__image" />}
                <h1>{title}</h1>
                {children}
            </div>
            <div className="form-a__sections-menu__list">
                {normalPages.map((page, i) => {
                    const path = page.props.pathSegment
                    const completed = completeSections[path]
                    const started = !isObjectEmpty(getValue(path))

                    return (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={completed ? () => {} : () => setPage(page.j)}
                            className={`form-a__sections-menu__row${completed ? "--completed" : ""}`}
                            key={i}
                        >
                            <div className="form-a__sections-menu__left">
                                <div className="form-a__sections-menu__icon">
                                    <TheIcon completed={completed} started={started} />
                                </div>
                                <div>
                                    <h2 className="t4">{page.props.title}</h2>
                                    <p className="t7">
                                        <TheStatus completed={completed} started={started} />
                                    </p>
                                </div>
                            </div>
                            <div className="form-a__sections-menu__right">
                                {completed && (
                                    <button className="t7 form-a__sections-menu__uncomplete" onClick={() => markSectionComplete(path, false)}>
                                        Edit section
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="form-a__sections-menu__submit">
                {isComplete ? (
                    <button
                        className="cornflower button"
                        disabled={submitting}
                        onClick={async () => {
                            setSubmitting(true)
                            await submit()
                            setSubmitting(false)
                        }}
                    >
                        Submit to social worker <FaArrowRight />
                    </button>
                ) : (
                    <p>You will be able to submit this form when all the sections are completed.</p>
                )}
            </div>
        </div>
    )
}

export default SectionsMenuPage
