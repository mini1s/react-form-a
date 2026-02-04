import React, { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { deleteObject, getDownloadURL, getMetadata, listAll, ref, StorageReference, uploadBytesResumable } from "firebase/storage"
import { FaBook, FaVolumeHigh, FaVideo, FaFile, FaTrash } from "react-icons/fa6"
import "./FileUpload.scss"

type Layout = "list" | "card"
type Count = "one" | "many"

type FormAFileUploadProps = {
    storageRef: StorageReference
    layout: Layout
    count: Count
    accept?: string[]
}

type AFile = {
    id: string
    name: string
    mime: string
    url?: string
    status: "stored" | "uploaded" | "uploading" | "to_upload" | "error" | "deleting"
    progress?: number
    file?: File
}

const FormAFileUpload: React.FC<FormAFileUploadProps> = ({ storageRef, layout, count, accept }) => {
    const [files, setFiles] = useState<AFile[]>([])
    const [flag, setFlag] = useState<number>(0)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const refresh = () => setFlag((prev) => prev + 1)

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()

        const fileArray = Array.from(e.dataTransfer.files)

        if (!fileArray) return

        setFiles((prev) => [
            ...prev,
            ...fileArray.map((file) => ({
                id: uuidv4(),
                name: file.name,
                mime: file.type,
                status: "to_upload" as const,
                url: URL.createObjectURL(file),
                file,
            })),
        ])
    }

    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        const inputFiles = input?.files
        if (!inputFiles) return
        const fileArray = Array.from(inputFiles)
        setFiles((x) => [
            ...x,
            ...fileArray.map((file) => ({
                id: uuidv4(),
                name: file.name,
                mime: file.type,
                status: "to_upload" as const,
                url: URL.createObjectURL(file),
                file,
            })),
        ])
    }

    const deleteFile = (file: AFile) => {
        const i = files.findIndex((x) => x.id == file.id)

        setFiles((prev) => {
            const updated = [...prev]
            updated[i] = { ...updated[i], status: "deleting" }
            return updated
        })

        const fileRef = count == "many" ? ref(storageRef, file.name) : storageRef

        deleteObject(fileRef).finally(() => refresh())
    }

    useEffect(() => {
        ;(async () => {
            setLoading(true)

            try {
                if (count == "one") {
                    const [url, meta] = await Promise.all([getDownloadURL(storageRef), getMetadata(storageRef)])
                    setFiles([
                        {
                            id: uuidv4(),
                            url,
                            name: storageRef.name,
                            mime: meta.contentType || "/",
                            status: "stored" as const,
                        },
                    ])
                } else {
                    const listing = await listAll(storageRef)
                    const items = await Promise.all(
                        listing.items.map(async (fileRef) => {
                            const url = await getDownloadURL(fileRef)
                            const meta = await getMetadata(fileRef)
                            return {
                                id: uuidv4(),
                                url,
                                name: fileRef.name,
                                mime: meta.contentType || "/",
                                status: "stored" as const,
                            }
                        })
                    )
                    setFiles(items)
                }
            } catch (error: any) {
                if (count == "one" && error?.code === "storage/object-not-found") setFiles([])
                else console.error(error)
            } finally {
                setLoading(false)
            }
        })()
    }, [flag, storageRef])

    useEffect(() => {
        files.forEach((file, i) => {
            if (file.status != "to_upload") return
            if (!file.file) return

            const fileRef = count == "many" ? ref(storageRef, file.name) : storageRef
            const uploadTask = uploadBytesResumable(fileRef, file.file)

            setFiles((prev) => {
                const newFiles = [...prev]
                newFiles[i].status = "uploading"
                return newFiles
            })

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

                    setFiles((prev) => {
                        const updated = [...prev]
                        updated[i] = { ...updated[i], progress }
                        return updated
                    })
                },
                (error) => {
                    console.error(error)
                    setFiles((prev) => {
                        const updated = [...prev]
                        updated[i] = { ...updated[i], status: "error" }
                        return updated
                    })
                },
                async () => {
                    setFiles((prev) => {
                        const updated = [...prev]
                        updated[i] = { ...updated[i], status: "uploaded" }
                        return updated
                    })
                }
            )
        })
    }, [files.length])

    useEffect(() => {
        const noneUploading = files.every((f) => f.status !== "uploading" && f.status !== "to_upload")
        const someUploaded = files.some((f) => f.status === "uploaded")

        if (noneUploading && someUploaded) {
            refresh()
            setLoading(true)
        }
    }, [files])

    return (
        <div className="form-a-file-upload">
            <List {...{ files, loading, layout, deleteFile }} />
            <div
                className="form-a-file-upload__drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} multiple={count == "many"} onChange={handleInputChange} />
                <p>Drag and drop a file here or click to select one.</p>
            </div>
        </div>
    )
}

// ...

interface ListProps {
    files: AFile[]
    loading: boolean
    layout: Layout
    deleteFile: (file: AFile) => void
}

const List: React.FC<ListProps> = ({ files, loading, layout, deleteFile }) => {
    if (loading) return <p>Loading...</p>
    if (files.length == 0) return <p>No files uploaded yet.</p>

    return (
        <div className={`form-a-file-upload__list  form-a-file-upload__list--${layout}`}>
            {files.map((file) => (
                <File {...{ file, layout, deleteFile }} key={file.id} />
            ))}
        </div>
    )
}

interface FileLayoutDeleteProps {
    file: AFile
    layout: Layout
    deleteFile: (file: AFile) => void
}

interface FileDeleteProps {
    file: AFile
    deleteFile: (file: AFile) => void
}

interface TheFileProp {
    file: AFile
}

const File: React.FC<FileLayoutDeleteProps> = ({ file, layout, deleteFile }) => {
    if (layout == "list") return <FileList {...{ file, deleteFile }} />
    if (layout == "card") return <FileCard {...{ file, deleteFile }} />
}

const FileList: React.FC<FileDeleteProps> = ({ file, deleteFile }) => {
    return (
        <div className="form-a-file-upload__file form-a-file-upload__file--list">
            <div className="form-a-file-upload__file__left">
                <Preview file={file} />
                <p>{file.name}</p>
            </div>
            <div className="form-a-file-upload__file__right">
                <Stuff {...{ file, deleteFile }} />
            </div>
        </div>
    )
}

const FileCard: React.FC<FileDeleteProps> = ({ file, deleteFile }) => {
    return (
        <div className="form-a-file-upload__file form-a-file-upload__file--card">
            <div className="form-a-file-upload__file__top">
                <Preview file={file} />
            </div>
            <div className="form-a-file-upload__file__bottom">
                <p>{file.name}</p>
                <Stuff {...{ file, deleteFile }} />
            </div>
        </div>
    )
}

// ...

const Preview: React.FC<TheFileProp> = ({ file }) => {
    if (file.url)
        return (
            <a href={file.url} target="blank" className="form-a-file-upload__preview">
                <PreviewX file={file} />
            </a>
        )

    return (
        <div className="form-a-file-upload__preview">
            <PreviewX file={file} />
        </div>
    )
}

const PreviewX: React.FC<TheFileProp> = ({ file }) => {
    const filetype = file.mime.split("/")[0]

    if (filetype == "image") return <img src={file.url} alt="" loading="lazy" />
    if (filetype == "text") return <FaBook />
    if (filetype == "audio") return <FaVolumeHigh />
    if (filetype == "video") return <FaVideo />

    return <FaFile />
}

// ...

const Stuff: React.FC<FileDeleteProps> = ({ file, deleteFile }) => {
    return (
        <>
            {file.progress !== undefined && <ProgressBar file={file} />}
            {file.status == "stored" && (
                <button className="form-a-file-upload__button" onClick={() => deleteFile(file)}>
                    <FaTrash />
                </button>
            )}
            {file.status == "to_upload" && <p>Preparing to upload...</p>}
            {file.status == "deleting" && <p>Deleting...</p>}
        </>
    )
}

// ...

const ProgressBar: React.FC<TheFileProp> = ({ file }) => {
    return (
        <div className="form-a-file-upload__progress__track">
            <div className="form-a-file-upload__progress__bar" style={{ width: `${file.progress}%` }}></div>
        </div>
    )
}

export default FormAFileUpload
