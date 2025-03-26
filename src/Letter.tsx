import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface LetterProps {
  onClose: () => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.5,
    },
  },
};

const lineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Letter: React.FC<LetterProps> = ({ onClose }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play background music when the letter opens
    audioRef.current = new Audio("/bgmusic.mp3");
    audioRef.current.play();

    // Stop music when the letter is closed
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const lines = [
    "Dear [Her Name],",
    "In the dance of stars and hearts, your smile lights up the universe.",
    "Wishing you a birthday as magical and vibrant as you are.",
    "With all my love,",
    "[Your Friend's Name]",
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background:
          "linear-gradient(135deg, rgba(255,105,180,0.3), rgba(138,43,226,0.3))",
        borderRadius: "12px",
        padding: "30px",
        width: "90%",
        height: "60%",
        maxWidth: "280px", // increased size
        maxHeight: "90vh", // limit height to enable scrolling if needed
        overflowY: "auto", // enable vertical scrolling on overflow
        textAlign: "center",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {lines.map((line, index) => (
          <motion.p
            key={index}
            variants={lineVariants}
            style={{ margin: "10px 0", fontSize: "1.2rem", color: "#fff" }}
          >
            {line}
          </motion.p>
        ))}
      </motion.div>
      <button
        onClick={onClose}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "1rem",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          background: "#ff4081",
          color: "white",
        }}
      >
        Close
      </button>
    </div>
  );
};

export default Letter;
