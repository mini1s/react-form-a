import React, { useMemo } from "react"
import { useForm, usePath, PathSegment } from "../Context"
import { FaDeleteLeft, FaPlus } from "react-icons/fa6"

type FormListProps = {
    children: React.ReactNode
    noun: string
    pathSegment?: string
    noAdd?: boolean
    noRemove?: boolean
    noHead?: boolean
}

type WrapProps = {
    children: React.ReactNode
    pathSegment?: string
}

const Wrap: React.FC<WrapProps> = ({ pathSegment, children }) => {
    if (pathSegment) return <PathSegment segment={pathSegment}>{children}</PathSegment>

    return children
}

const FormList: React.FC<FormListProps> = ({
    children,
    noun,
    pathSegment,
    noAdd = false,
    noRemove = false,
    noHead = false,
}) => {
    const { getValue, setValue } = useForm()
    const { segments } = usePath()

    const path = useMemo(
        () => (pathSegment ? [...segments, pathSegment].join(".") : segments.join(".")),
        [segments, pathSegment],
    )

    const nounLower = noun.toLowerCase()
    const nounCapitalised = String(nounLower).charAt(0).toUpperCase() + String(nounLower).slice(1)

    const value = getValue(path, "array")

    const add = () => setValue(path, [...value, {}])
    const remove = (i: number) =>
        setValue(
            path,
            value.filter((_, j) => i !== j),
        )

    return (
        <Wrap pathSegment={pathSegment}>
            <form onSubmit={(e) => e.preventDefault()} className="form-a__form-list">
                {value.map((_, i) => (
                    <PathSegment segment={String(i)} key={i}>
                        <div className="form-a__form-list__row form-a__form">
                            {!noHead && (
                                <div className="form-a__form-list__head">
                                    <h2 className="t4">
                                        {nounCapitalised} {i + 1}
                                    </h2>
                                    {!noRemove && (
                                        <button className="button ceramic" onClick={() => remove(i)}>
                                            <FaDeleteLeft />
                                            Remove {nounLower}
                                        </button>
                                    )}
                                </div>
                            )}
                            {children}
                        </div>
                    </PathSegment>
                ))}
                {!noAdd && (
                    <button className="button midnight form-a__form-list__add" onClick={add}>
                        <FaPlus />
                        Add {noun}
                    </button>
                )}
            </form>
        </Wrap>
    )
}

export default FormList
