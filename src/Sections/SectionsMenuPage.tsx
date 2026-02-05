import React, { ReactElement, useState } from "react"
import { FaCheck, FaXmark, FaEllipsis, FaArrowRight } from "react-icons/fa6"
import { useForm, usePage, useTheState } from "../Context/index.js"
import { isObjectEmpty } from "../helpful/helpers.js"
import SectionsPage, { SectionsPageProps } from "./SectionsPage.js"
import { BackButton } from "../Elements/index.js"

type TheXProps = {
    completed: boolean
    started: boolean
}

export type SectionsMenuPageProps<F extends object> = {
    title: string
    image?: string
    children?: React.ReactNode
    completeSections: Partial<Record<keyof F, boolean>>
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

const SectionsMenuPage = <F extends object>({ title, children, image, completeSections }: SectionsMenuPageProps<F>) => {
    const { setPage, pageArray } = usePage()
    const { getValue } = useForm<F>()
    const { markSectionComplete, submit } = useTheState<F>()

    const [submitting, setSubmitting] = useState<boolean>(false)

    if (!markSectionComplete) throw new Error("A formA sections component must have a markSectionComplete function")

    const { normalPages, isComplete } = React.useMemo(() => {
        const normalPages = pageArray.map((page, j) => ({ ...page, j })).filter((page) => page.type === SectionsPage) as Array<
            ReactElement<SectionsPageProps<F>> & { j: number }
        >
        const sections = normalPages.map((page) => page.props.pathSegment as keyof F)
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
                    const path = page.props.pathSegment as keyof F
                    const completed = completeSections[path]
                    const started = !isObjectEmpty(getValue(path as any))

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
                                    <TheIcon completed={completed ?? false} started={started} />
                                </div>
                                <div>
                                    <h2 className="t4">{page.props.title}</h2>
                                    <p className="t7">
                                        <TheStatus completed={completed ?? false} started={started} />
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
