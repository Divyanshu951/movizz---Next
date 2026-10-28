"use client";

import { motion } from "framer-motion";

const Loader = ({ loaderTitle }: { loaderTitle?: string }) => {
  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-2 bg-background">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-3 h-3 rounded-full bg-primary"
            animate={{
              y: [0, -12, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: dot * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <p className="mt-2 italic font-medium text-xl">
        Loading {loaderTitle ? loaderTitle : ""}...
      </p>
    </div>
  );
};

export default Loader;
