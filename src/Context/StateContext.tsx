import React from "react"
import { Settings } from "../Types/index.js"

export type State<F extends object> = {
    settings?: Settings
    loading: boolean
    saving: boolean
    submitted: boolean
    markSectionComplete?: (section: keyof F, complete?: boolean) => Promise<void> | void
    save: () => Promise<void | boolean> | void | boolean
    submit: () => Promise<void | boolean> | void | boolean
}

export const StateContext = React.createContext<State<any> | null>(null)

export function useTheState<F extends object>() {
    const context = React.useContext(StateContext)
    if (!context) throw new Error("useFormAState must be used within a provider")
    return context as State<F>
}
