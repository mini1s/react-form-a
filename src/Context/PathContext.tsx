import React, { createContext, useContext, useMemo } from "react"

type Path = String[]

const PathContext = createContext<Path>([])

export const usePath = () => {
    const path = useContext(PathContext)
    return { segments: path, string: path.join(".") }
}

type PathSegmentProps = {
    segment: string | number
    children: React.ReactNode
}

export const PathSegment: React.FC<PathSegmentProps> = ({ segment, children }) => {
    const parent = useContext(PathContext)
    const value = useMemo(() => {
        if (segment == "") return parent
        return [...parent, String(segment)]
    }, [parent, segment])
    return <PathContext.Provider value={value}>{children}</PathContext.Provider>
}
