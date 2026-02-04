import React from "react"
import "./Loading.scss"
import { useMinHeight } from "@minisquare/react-context"

type LoadingParametersType = { dark?: boolean }
const Loading: React.FC<LoadingParametersType> = ({ dark = false }) => {
    const { minHeight } = useMinHeight()

    return (
        <div className={`loading ${dark ? "loading--dark" : ""}`} style={{ minHeight }}>
            <div className="loading__dot"></div>
            <div className="loading__dot"></div>
            <div className="loading__dot"></div>
        </div>
    )
}

export default Loading
