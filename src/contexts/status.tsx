import React, { useContext, useState } from 'react'

export enum StatusType {
    LOADING,
    SUCCESS,
    FAILED
}

export interface IStatusContext {
    status: StatusType
    setStatus: React.Dispatch<React.SetStateAction<StatusType>>
}

const StatusContext = React.createContext<IStatusContext | undefined>(undefined)

export const StatusProvider = ({ children = null as any }) => {
    const [status, setStatus] = useState<StatusType | undefined>(undefined)

    return (
        <StatusContext.Provider value={{ status, setStatus }}>
            {children}
        </StatusContext.Provider>
    )
}

export const useStatus = () => {
    const context = useContext(StatusContext)

    if (!context) {
        throw new Error('Component rendered outside the provider tree')
    }

    return context
}
