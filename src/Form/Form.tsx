import React from "react"

type FormProps = {
    children: React.ReactNode
}

const Form: React.FC<FormProps> = ({ children }) => {
    return (
        <form onSubmit={(e) => e.preventDefault()} className="form-a__form">
            {children}
        </form>
    )
}

export default Form
