import React from "react"

import SectionsMenuPage from "../Sections/SectionsMenuPage"
import SectionsPage from "../Sections/SectionsPage"

type Allowed = typeof SectionsMenuPage | typeof SectionsPage
export type AllowedElement = React.ReactElement<any, Allowed>
export type AllowedPages = AllowedElement | AllowedElement[]

type Page = {
    pageArray: AllowedElement[]
    currentPage: number
    pageCount: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    nextPage: () => void
    prevPage: () => void
    isFirstPage: boolean
    isLastPage: boolean
    thePage: React.ReactNode
}

type PageProviderProps = {
    children: React.ReactNode
    grandchildren: AllowedPages
}

const PageContext = React.createContext<Page | null>(null)

export const usePage = () => {
    const context = React.useContext(PageContext)
    if (!context) throw new Error("usePage must be used within a provider")
    return context
}

export const PageProvider: React.FC<PageProviderProps> = ({ children, grandchildren }) => {
    const pageArray = React.useMemo<AllowedElement[]>(() => {
        const pages = Array.isArray(grandchildren) ? [...grandchildren] : [grandchildren]

        return pages.filter((page) => {
            if (page.type === SectionsPage) {
                const show: boolean | undefined = page.props?.show
                return show !== false
            }

            return true
        })
    }, [grandchildren])

    const pageCount = React.useMemo(() => pageArray.length, [pageArray])

    const [currentPage, setPage] = React.useState<number>(0)

    React.useEffect(() => {
        setPage((prev) => Math.min(Math.max(0, prev), Math.max(0, pageCount - 1)))
    }, [pageCount])

    const thePage = React.useMemo(() => pageArray[currentPage], [pageArray, currentPage])

    const nextPage = React.useCallback(() => setPage((prev) => Math.min(pageCount - 1, prev + 1)), [pageCount])
    const prevPage = React.useCallback(() => setPage((prev) => Math.max(0, prev - 1)), [])

    const isFirstPage = currentPage === 0
    const isLastPage = currentPage === pageCount - 1

    const value = React.useMemo<Page>(
        () => ({ pageArray, currentPage, pageCount, setPage, nextPage, prevPage, isFirstPage, isLastPage, thePage }),
        [pageArray, currentPage, pageCount, nextPage, prevPage, isFirstPage, isLastPage, thePage]
    )

    return <PageContext.Provider value={value}>{children}</PageContext.Provider>
}
