import React from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa6"
import "./BackButton.scss"

type BackButtonProps = {
    text?: string
    to?: string
}

const BackButton: React.FC<BackButtonProps> = ({ text, to }) => {
    const navigate = useNavigate()

    return (
        <button
            className="back-button lilly button"
            onClick={() => (to ? navigate(to) : window.history.length < 2 ? navigate("/") : navigate(-1))}
        >
            <FaArrowLeft />
            {text ? text : "Go back"}
        </button>
    )
}

export default BackButton
