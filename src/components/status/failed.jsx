import React from 'react';
import { useWallet, TxStatus } from '../../contexts/wallet';

const FailComponent = () => {
  const {setTxStatus} = useWallet()

  const handleReturn = () => {
      setTxStatus(TxStatus.NONE)
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-[570px] h-[337px] rounded-2xl flex flex-col items-center justify-center p-6">
        {/* Error Icon */}
        <div className="w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="none"
              stroke="#EF4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 2h9l5.5 5.5v9l-5.5 5.5h-9L2 16.5v-9L7.5 2z"
            />
            <path
              fill="none"
              stroke="#EF4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9l6 6m0-6l-6 6"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h2 className="text-[32px] font-semibold mt-4">Mmm... Something went wrong</h2>
        <p className="text-gray-400 mt-2">Transaction was cancelled on your transaction signer</p>

        {/* Button */}
        <button className="mt-6 w-full max-w-[500px] h-14 bg-gray-200 text-black text-[15.49px] rounded-xl flex items-center justify-center gap-2 py-4 hover:bg-gray-300 transition" onClick={handleReturn}>
          Return to Transaction Builder
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
};

export default FailComponent;
