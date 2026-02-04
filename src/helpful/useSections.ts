import { User } from "firebase/auth"
import { DocumentReference, DocumentData, getDoc, updateDoc, deleteField, setDoc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAlerts } from "@minisquare/react-context"

type UseSectionsOptions = {
    docRef: DocumentReference<DocumentData, DocumentData> | null
    user: User | null
    path: string
}

type UseSectionsReturnValue = {
    form: Record<string, any>
    setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>
    completeSections: Record<string, boolean>
    setCompleteSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
    loading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    saving: boolean
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
    submitted: boolean
    setSubmitted: React.Dispatch<React.SetStateAction<boolean>>
    save: () => void | Promise<void>
    submit: () => void | Promise<void>
    markSectionComplete: (section: string, complete?: boolean) => void | Promise<void>
}

type UseSections = (options: UseSectionsOptions) => UseSectionsReturnValue

export const useSections: UseSections = ({ docRef, user, path }) => {
    const { addAlert, removeAlert } = useAlerts()
    const navigate = useNavigate()

    const [form, setForm] = useState<Record<string, any>>({})
    const [completeSections, setCompleteSections] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)
    const [submitted, setSubmitted] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            if (!user || !docRef) {
                setForm({})
                setCompleteSections({})
                setSubmitted(false)
                return
            }

            setLoading(true)

            try {
                const snap = await getDoc(docRef)
                const data = snap.data()

                setForm((path ? data?.[path]?.form : data?.form) || {})
                setCompleteSections((path ? data?.[path]?.completeSections : data?.completeSections) || {})
                setSubmitted((path ? data?.[path]?.submitted : data?.submitted) || false)
                setLoading(false)
            } catch (error) {
                console.error(error)
                addAlert("error", "Failed to load form data.")
            }
        })()
    }, [docRef, user, path])

    const save = async () => {
        if (!user) throw new Error("user is undefined when saving")
        if (!docRef) throw new Error("docRef is undefined when saving")

        const alertId = addAlert("info", "Saving...")
        setSaving(true)

        try {
            await setDoc(docRef, { [path ? `${path}.form` : "form"]: form }, { merge: true })
            addAlert("success", "Form saved!")
        } catch (error) {
            console.error(error)
            addAlert("error", "Failed to save form.")
        } finally {
            removeAlert(alertId)
            setSaving(false)
        }
    }

    const submit = async () => {
        if (!user) throw new Error("user is undefined when submitting")
        if (!docRef) throw new Error("docRef is undefined when submitting")

        const alertId = addAlert("info", "Submitting...")

        try {
            await setDoc(docRef, { [path ? `${path}.submitted` : "submitted"]: true }, { merge: true })
            addAlert("success", "Form submitted!")
            setSubmitted(true)
        } catch (error) {
            console.error(error)
            addAlert("error", "Failed to submit form.")
        } finally {
            removeAlert(alertId)
            navigate("/")
        }
    }

    const markSectionComplete = async (section: string, complete: boolean = true) => {
        if (!user) throw new Error("user is undefined when completing section")
        if (!docRef) throw new Error("docRef is undefined when completing section")

        setCompleteSections((prev) => {
            const next = { ...(prev as any) }
            if (complete) next[section] = true
            else delete next[section]
            return next
        })

        const alertId = addAlert("info", "Updating section...")

        try {
            const value = complete ? true : deleteField()
            const updateData = path
                ? {
                      [path]: {
                          completeSections: {
                              [section]: value,
                          },
                      },
                  }
                : {
                      completeSections: {
                          [section]: value,
                      },
                  }

            await setDoc(docRef, updateData, { merge: true })
            addAlert("success", "Updated section!")
        } catch (error) {
            setCompleteSections((prev) => {
                const next = { ...(prev as any) }
                if (complete) delete next[section]
                else next[section] = true
                return next
            })
            addAlert("error", "Failed to update section.")
        } finally {
            removeAlert(alertId)
        }
    }

    return {
        form,
        setForm,
        completeSections,
        setCompleteSections,
        loading,
        setLoading,
        saving,
        setSaving,
        submitted,
        setSubmitted,
        save,
        submit,
        markSectionComplete,
    }
}
