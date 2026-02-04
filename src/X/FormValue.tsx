import React from "react"
import { usePath, useForm } from "../Context"

export default ({ pathSegment }: { pathSegment: string }) => {
    const { segments } = usePath()
    const { getValue } = useForm()

    return <>{getValue([...segments, pathSegment].join("."))}</>
}
