import React from "react"
import "./MoneyTable.scss"

type MoneyTableProps = {
    children: React.ReactNode
}

const MoneyTable: React.FC<MoneyTableProps> = ({ children }) => {
    return (
        <table className="form-a__money-table">
            <thead>
                <tr>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
    )
}

export default MoneyTable
