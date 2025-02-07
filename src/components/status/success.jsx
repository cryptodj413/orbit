"use client";
import React from 'react'
import { useRouter } from "next/navigation";
import { useStatus } from '../../contexts/status';

const SuccessComponent = () => {
    const router = useRouter();
    const {setStatus} = useStatus()

    const handleReturn = () => {
        setStatus(undefined)
    }

    const handleToDashboard = () => {
        setStatus(undefined)
        router.push("/dashboard");
    }
    return(
        <div className="flex items-center justify-center">
            <div className='flex flex-col items-center justify-center'>
                <div className="flex items-center justify-center w-32 h-32 bg-lime-500 rounded-2xl">
                    <svg
                        className="w-20 h-20 text-black"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={5}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    </div>
                <p className='mt-6 text-[32px]'>Transaction submitted successfully!</p>
                <p className='text-[16px] text-gray-400'>View the transaction details</p>
                <div className="w-full flex flex-col gap-1 mt-6">
                    <button className="h-[44px] rounded-md bg-[#E2E2E2] text-[#030615CC]" onClick={handleReturn}>Return to Transaction Builder &#8594;</button>
                    <button className="h-[56px] border-[1.29px] border-[#E2E2E2CC] rounded-[5.16px]" onClick={handleToDashboard}>Dashboard</button>
                </div>
            </div>
        </div>
    )
}

export default SuccessComponent