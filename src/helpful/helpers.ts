import { DotPaths, PathValue } from "../Types"

export function valueFromObject<Obj extends object, P extends DotPaths<Obj>>(object: Obj | undefined, path: P | undefined): PathValue<Obj, P> | undefined {
    if (!object || !path) return undefined

    const keys = path.split(".").filter(Boolean)

    let acc: unknown = object

    for (const key of keys) {
        if (acc == null) {
            return undefined
        }
        acc = (acc as Record<string, unknown>)[key]
    }

    return acc as PathValue<Obj, P> | undefined
}

export function updateObject<F extends object, P extends DotPaths<F>>(setObject: React.Dispatch<React.SetStateAction<F>>, path: P, value: PathValue<F, P>) {
    setObject((prevObject) => {
        const newObject = (Array.isArray(prevObject) ? [...prevObject] : { ...prevObject }) as F

        const splitPath = path.split(".")

        splitPath.reduce((weakAcc, key, i) => {
            const acc = weakAcc as Record<string, any>
            const isLast = i === splitPath.length - 1
            const nextKey = splitPath[i + 1]
            const isNextIndex = !isNaN(Number(nextKey))

            if (isLast) {
                if (value === undefined) delete acc[key]
                else acc[key] = value
            } else {
                const isCurrentArray = Array.isArray(acc[key])
                if (!acc[key]) {
                    acc[key] = isNextIndex ? [] : {}
                } else if (typeof acc[key] === "object") {
                    acc[key] = isCurrentArray ? [...acc[key]] : { ...acc[key] }
                }
            }

            return acc[key]
        }, newObject)

        return newObject
    })
}

export const isObjectEmpty = (value: unknown): boolean => {
    if (value == null) return true
    if (Array.isArray(value)) {
        return value.length === 0
    }
    if (typeof value === "object") {
        const vals = Object.values(value as Record<string, unknown>)
        return (
            vals.length === 0 ||
            vals.every((v) => {
                if (v == null) return true
                if (typeof v === "string") return v.trim() === ""
                if (Array.isArray(v)) return v.length === 0
                if (typeof v === "object") return Object.keys(v as object).length === 0
                return false
            })
        )
    }
    return false
}
