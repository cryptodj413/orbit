import { motion } from "framer-motion";

const GradientLoader = () => {
  return (
    <div className=" mb-6">
      {/* <motion.div
        className="w-[80px] h-[80px] relative"
        animate={{ rotate: -360 }} // Counterclockwise rotation
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <svg
              className="absolute inset-0"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0211A9" />
                  <stop offset="100%" stopColor="#333" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#spinnerGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="200"
                strokeDashoffset="50"
                className="rotate-90"
        />
        </svg>
        <div className="absolute w-4 h-4 bg-[#0215D3] rounded-full animate-spin-dot" />
      </motion.div> */}

      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="blue"/>
            <stop offset="100%" stop-color="white" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="40" stroke="url(#gradient)" stroke-width="10" fill="none" stroke-linecap="round"
          stroke-dasharray="200" stroke-dashoffset="50">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
};

export default GradientLoader;
