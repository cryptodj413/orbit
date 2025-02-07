import React from 'react'
import GradientLoader from '../common/GradientLoader'

const LoadingComponent = () => {
    return(
        <div className='flex flex-col items-center justify-center'>
            <GradientLoader />
            <p className='text-[32px]'>Please confirm transaction in your wallet</p>
        </div>
    )
}

export default LoadingComponent