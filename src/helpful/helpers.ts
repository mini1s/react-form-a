import { Timestamp } from "firebase/firestore"

export type TypeStrings = "undefined" | "object" | "boolean" | "number" | "string" | "function" | "array" | "timestamp"

export type TypeMap = {
    undefined: undefined
    object: Record<string, unknown>
    boolean: boolean
    number: number
    string: string
    function: (...args: any[]) => unknown
    array: unknown[]
    timestamp: Timestamp
}

const DEFAULTS = {
    undefined: undefined,
    object: {} as Record<string, unknown>,
    boolean: false,
    number: 0,
    string: "",
    function: ((..._args: any[]) => undefined) as (...args: any[]) => unknown,
    array: [] as unknown[],
    timestamp: undefined as unknown as Timestamp,
} satisfies { [K in TypeStrings]: TypeMap[K] }

function defaultValueFromTypeString<T extends TypeStrings>(theType: T): TypeMap[T] {
    return DEFAULTS[theType]
}

function isRuntimeType<T extends TypeStrings>(value: unknown, theType: T): value is TypeMap[T] {
    if (theType === "array") return Array.isArray(value)
    if (theType === "object") return typeof value === "object" && value !== null && !Array.isArray(value)
    if (theType === "timestamp") return value instanceof Timestamp
    return typeof value === theType
}

export function valueFromObject<T extends TypeStrings>(
    object: Record<string, any> | undefined,
    path: string | undefined,
    theType: T
): TypeMap[T]
export function valueFromObject(object: Record<string, any> | undefined, path: string | undefined): unknown

export function valueFromObject(
    object: Record<string, any> | undefined,
    path: string | undefined,
    theType?: TypeStrings
) {
    if (!object) return theType ? defaultValueFromTypeString(theType) : undefined

    const keys = (path ?? "").split(".").filter(Boolean)

    let acc: unknown = object
    for (const key of keys) {
        if (acc == null) {
            // handles null/undefined mid-path
            acc = undefined
            break
        }
        acc = (acc as Record<string, unknown>)[key]
    }

    const value = acc

    if (theType) {
        if (isRuntimeType(value, theType)) {
            return value
        }
        return defaultValueFromTypeString(theType)
    }

    return value
}

export type GetValue = {
    <T extends TypeStrings>(path: string, theType: T): TypeMap[T]
    (path: string): unknown
}

export function updateObject(
    setObject: React.Dispatch<React.SetStateAction<object>>,
    path: string | string[],
    value: any
) {
    setObject((prevObject) => {
        const newObject = Array.isArray(prevObject) ? [...prevObject] : { ...prevObject }
        let current = newObject

        if (typeof path === "string") path = path.split(".")

        path.reduce((weakAcc, key, i) => {
            const acc = weakAcc as Record<string, any>
            const isLast = i === path.length - 1
            const nextKey = path[i + 1]
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
        }, current)

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
