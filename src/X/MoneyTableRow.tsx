import React, { useEffect, useMemo, useRef } from "react"
import { useForm, usePath } from "../Context/index.js"
import { FaSterlingSign } from "react-icons/fa6"

type MoneyTableRowProps = {
    label: string
    sublabel?: string
    pathSegment: string
    total?: boolean
}

type X = {
    amount?: string
    notes?: string
}

const MoneyTableRow: React.FC<MoneyTableRowProps> = ({ label, sublabel, pathSegment, total }) => {
    const { getValue, setValue, form } = useForm()
    const { segments } = usePath()

    const notesRef = useRef<HTMLTextAreaElement | null>(null)
    const updateNotesHeight = () => {
        const textarea = notesRef.current
        if (!textarea) return
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight + 0}px`
    }
    useEffect(() => updateNotesHeight(), [form])

    const totalValue = total
        ? (() => {
              const all = getValue(segments.join("."), "object")
              const list = Object.entries(all) as [string, X][]
              const filtered = list.filter(([key, _]) => key !== pathSegment).map(([_, value]) => parseFloat(value?.amount || "0"))
              let total = 0
              for (const value of filtered) {
                  total += value
              }
              return total || ""
          })()
        : 0

    return (
        <tr>
            <td>
                <p>{label}</p>
                {sublabel && <p className="form-a__money-table__sublabel">{sublabel}</p>}
            </td>
            <td className="form-a__money-table__amount">
                <label>
                    <FaSterlingSign />
                    <input
                        type="number"
                        value={total ? totalValue : getValue([...segments, pathSegment, "amount"].join("."), "string")}
                        onChange={(e) => {
                            setValue([...segments, pathSegment, "amount"].join("."), e.target.value)
                        }}
                        readOnly={total}
                    />
                </label>
            </td>
            <td className="form-a__money-table__notes">
                <textarea
                    ref={notesRef}
                    placeholder="Notes"
                    value={getValue([...segments, pathSegment, "notes"].join("."), "string")}
                    onChange={(e) => setValue([...segments, pathSegment, "notes"].join("."), e.target.value)}
                    rows={1}
                />
            </td>
        </tr>
    )
}

export default MoneyTableRow
