import React from "react"
import * as Fields from "./Fields/index.js"
import { DotPaths } from "../Types/index.js"

type FormChild<F extends object, PParent extends DotPaths<F>> =
    | React.ReactElement<Fields.BigTextareaProps<F, PParent, any>, typeof Fields.BigTextarea>
    | React.ReactElement<Fields.BooleanProps<F, PParent, any>, typeof Fields.Boolean>
    | React.ReactElement<Fields.CheckboxProps<F, PParent, any>, typeof Fields.Checkbox>
    | React.ReactElement<Fields.InputDateProps<F, PParent, any>, typeof Fields.InputDate>
    | React.ReactElement<Fields.InputTextProps<F, PParent, any>, typeof Fields.InputText>
    | React.ReactElement<Fields.SelectProps<F, PParent, any>, typeof Fields.Select>
    | React.ReactElement<Fields.TextareaProps<F, PParent, any>, typeof Fields.Textarea>

type FormProps<F extends object, PParent extends DotPaths<F>> = {
    children: FormChild<F, PParent> | FormChild<F, PParent>[]
}

const Form = <F extends object, PParent extends DotPaths<F>>({ children }: FormProps<F, PParent>) => {
    return (
        <form onSubmit={(e) => e.preventDefault()} className="form-a__form">
            {children}
        </form>
    )
}

export default Form
