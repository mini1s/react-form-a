import React from "react"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6"
import { useForm, useValidation, useTheState, usePage } from "../Context"
import { useNavigate } from "react-router-dom"

type OnePageProps = {
    children?: React.ReactNode
    title: string
    image?: string
    startButtonText?: string
    endButtonText?: string
    navigateTo?: string
}

const OnePage: React.FC<OnePageProps> = ({
    children,
    title,
    image,
    startButtonText = "Save and go back",
    endButtonText = "Save and submit",
    navigateTo = "/",
}) => {
    const { validateAll } = useValidation()
    const { save, submit, saving } = useTheState()
    const navigate = useNavigate()

    return (
        <div className="form-a__page form-a__one-page">
            <div className="form-a__page__top">
                <button
                    className="ceramic button"
                    onClick={async () => {
                        const z = await save()
                        if (z !== false) navigate(navigateTo)
                    }}
                >
                    <FaArrowLeft /> {startButtonText}
                </button>
            </div>
            <div className="form-a__page__head form-a__one-page__head">
                {image && <img src={image} alt="" className="form-a__page__image" />}
                <h1>{title}</h1>
            </div>
            {children}
            <div className="form-a__page__bottom">
                <button
                    className="cornflower button"
                    disabled={saving}
                    onClick={async () => {
                        const ok = await validateAll()
                        if (!ok) return
                        const z = await save()
                        const y = await submit()
                        if (z !== false && y !== false) navigate(navigateTo)
                    }}
                >
                    {endButtonText} <FaArrowRight />
                </button>
            </div>
        </div>
    )
}

export default OnePage
