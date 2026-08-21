"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type DisclaimerModalProps = {
  show: boolean;
  onClose: () => void;
};

export default function DisclaimerModal({ show, onClose }: DisclaimerModalProps) {
  const handleClose = () => {
    localStorage.setItem("prathomix_disclaimer_v2", `accepted_${Date.now()}`);
    onClose();
  };

  return (
    <React.Fragment>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="legal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-red-600 mb-4">ZERO LEGAL LIABILITY</h2>
              <p className="text-slate-600 mb-6">
                Prathomix AI and the consulting Doctors hold ZERO legal or medical liability for any injuries sustained while using this platform. This is strictly an AI-assistive tool and the patient assumes 100% risk.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                I Understand & Agree
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}
