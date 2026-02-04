import { User } from "firebase/auth"
import { DocumentReference, DocumentData, getDoc, updateDoc, deleteField, setDoc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAlerts } from "@minisquare/react-context"

type UseOneOptions = {
    docRef: DocumentReference<DocumentData, DocumentData> | null
    user: User | null
    path: string
}

type UseOneReturnValue = {
    form: Record<string, any>
    setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>
    loading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    saving: boolean
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
    submitted: boolean
    setSubmitted: React.Dispatch<React.SetStateAction<boolean>>
    save: () => void | Promise<void>
    submit: () => void | Promise<void>
}

type UseOne = (options: UseOneOptions) => UseOneReturnValue

export const useOne: UseOne = ({ docRef, user, path }) => {
    const { addAlert, removeAlert } = useAlerts()
    const navigate = useNavigate()

    const [form, setForm] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)
    const [submitted, setSubmitted] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            if (!user || !docRef) {
                setForm({})
                setSubmitted(false)
                return
            }

            setLoading(true)

            try {
                const snap = await getDoc(docRef)
                const data = snap.data()

                setForm((path ? data?.[path]?.form : data?.form) || {})
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
            navigate("/applicant/foster/tasks")
        }
    }

    return {
        form,
        setForm,
        loading,
        setLoading,
        saving,
        setSaving,
        submitted,
        setSubmitted,
        save,
        submit,
    }
}
