"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

/** Prototype toast: ink pill, bottom-centre, 2.6s, efgup entrance. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          className="np fixed bottom-[26px] left-1/2 z-100 -translate-x-1/2 rounded-xl bg-ink px-5 py-[11px] text-[13.5px] text-white shadow-[0_8px_24px_rgba(22,46,39,.3)]"
          style={{ animation: "efgup .25s ease" }}
          role="status"
        >
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}
