import React from "react"

import SectionsMenuPage, { SectionsMenuPageProps } from "../Sections/SectionsMenuPage.js"
import SectionsPage, { SectionsPageProps } from "../Sections/SectionsPage.js"

type SectionsPageElement<F extends object> = React.ReactElement<SectionsPageProps<F>, typeof SectionsPage>
type SectionsMenuElement<F extends object> = React.ReactElement<SectionsMenuPageProps<F>, typeof SectionsMenuPage>

export type AllowedElement<F extends object> = SectionsPageElement<F> | SectionsMenuElement<F>
export type AllowedPages<F extends object> = AllowedElement<F> | AllowedElement<F>[]

type Page<F extends object> = {
    pageArray: AllowedElement<F>[]
    currentPage: number
    pageCount: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    nextPage: () => void
    prevPage: () => void
    isFirstPage: boolean
    isLastPage: boolean
    thePage: React.ReactNode
}

type PageProviderProps<F extends object> = {
    children: React.ReactNode
    grandchildren: AllowedPages<F>
}

const PageContext = React.createContext<Page<any> | null>(null)

export const usePage = () => {
    const context = React.useContext(PageContext)
    if (!context) throw new Error("usePage must be used within a provider")
    return context
}

export const PageProvider = <F extends object>({ children, grandchildren }: PageProviderProps<F>) => {
    const pageArray = React.useMemo<AllowedElement<F>[]>(() => {
        const pages = Array.isArray(grandchildren) ? [...grandchildren] : [grandchildren]

        return pages.filter((page) => {
            if (page.type === SectionsPage) {
                const show: boolean | undefined = (page as any).props?.show
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

    const value: Page<F> = React.useMemo(
        () => ({ pageArray, currentPage, pageCount, setPage, nextPage, prevPage, isFirstPage, isLastPage, thePage }),
        [pageArray, currentPage, pageCount, nextPage, prevPage, isFirstPage, isLastPage, thePage],
    )

    return <PageContext.Provider value={value}>{children}</PageContext.Provider>
}
