import React from "react"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6"
import { PathSegment, useForm, usePage, useTheState, useValidation } from "../Context/index.js"

type SectionsPageProps = {
    children?: React.ReactNode
    title: string
    image?: string
    pathSegment: string
    show?: boolean
}

const SectionsPage: React.FC<SectionsPageProps> = ({ title, image, children, pathSegment, show = true }) => {
    const { form } = useForm()
    const { validateSection } = useValidation()
    const { save, markSectionComplete } = useTheState()
    const { setPage } = usePage()

    if (!show) return null

    if (!markSectionComplete) throw new Error("A formA sections component must have a markSectionComplete function")

    return (
        <PathSegment segment={pathSegment}>
            <div className="form-a__page form-a__sections-page">
                <div className="form-a__page__top">
                    <button
                        className="ceramic button"
                        onClick={async () => {
                            await save()
                            setPage(0)
                        }}
                    >
                        <FaArrowLeft /> Save and go back
                    </button>
                </div>
                <div className="form-a__page__head form-a__sections-page__head">
                    {image && <img src={image} alt="" className="form-a__page__image" />}
                    <h1>{title}</h1>
                </div>
                {children}
                <div className="form-a__page__bottom">
                    <button
                        className="cornflower button"
                        onClick={async () => {
                            const ok = await validateSection(pathSegment) // only works at top level
                            if (!ok) return
                            await save()
                            await markSectionComplete(pathSegment, true)
                            setPage(0)
                        }}
                    >
                        Save and complete section <FaArrowRight />
                    </button>
                </div>
            </div>
        </PathSegment>
    )
}

export default SectionsPage
