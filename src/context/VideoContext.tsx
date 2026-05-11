import React, { createContext, useContext, useRef } from 'react';

interface VideoContextType {
  currentTimeRef: React.RefObject<number>;
}

const VideoContext = createContext<VideoContextType | null>(null);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const currentTimeRef = useRef<number>(0);

  return (
    <VideoContext.Provider value={{ currentTimeRef }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideoContext() {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error('useVideoContext must be used inside VideoProvider');
  return ctx;
}
