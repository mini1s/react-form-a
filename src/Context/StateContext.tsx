import React from "react"
import { Settings } from "../Types"

export type State = {
    settings?: Settings
    loading: boolean
    saving: boolean
    submitted: boolean
    markSectionComplete?: (section: string, complete?: boolean) => Promise<void> | void
    save: () => Promise<void | boolean> | void | boolean
    submit: () => Promise<void | boolean> | void | boolean
}

export const StateContext = React.createContext<State | null>(null)

export const useTheState = () => {
    const context = React.useContext(StateContext)
    if (!context) throw new Error("useFormAState must be used within a provider")
    return context
}
