"use client";

import { useState } from "react";
import Image from "next/image";

export default function MapButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all text-xl"
        aria-label="Haritayı Göster"
      >
        🗺️
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold text-sm">Yerleşke Haritası</p>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white text-lg transition-colors"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
          <div
            className="flex-1 overflow-auto flex items-center justify-center p-2"
            onClick={() => setOpen(false)}
          >
            <div onClick={e => e.stopPropagation()}>
              <Image
                src="/map.jpeg"
                alt="Yerleşke Haritası"
                width={1200}
                height={900}
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
