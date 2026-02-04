import React from "react"

type RowProps = {
    children: React.ReactNode
}

const Row: React.FC<RowProps> = ({ children }) => {
    return <div className="form-a__row">{children}</div>
}

export default Row
