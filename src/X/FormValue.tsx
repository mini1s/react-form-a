import React from "react"
import { usePath, useForm } from "../Context/index.js"

export default ({ pathSegment }: { pathSegment: string }) => {
    const { segments } = usePath()
    const { getValue } = useForm()

    return <>{getValue([...segments, pathSegment].join("."))}</>
}
