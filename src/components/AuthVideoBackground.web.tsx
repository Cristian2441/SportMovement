import React, { useEffect } from 'react';

const STYLE_ID = 'auth-video-style';
const VIDEO_ID = 'auth-video-bg';

export default function AuthVideoBackground() {
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = `
      body, #root { background: transparent !important; }
      [data-testid="stack-view"],
      .css-view-175oi2r,
      [style*="background-color: rgb(255, 255, 255)"],
      [style*="background-color: white"] {
        background-color: transparent !important;
      }
      #root > div { background-color: transparent !important; }
      #root > div > div { background-color: transparent !important; }
      #root > div > div > div { background-color: transparent !important; }
    `;
    document.head.appendChild(styleEl);

    const wrapper = document.createElement('div');
    wrapper.id = VIDEO_ID;
    Object.assign(wrapper.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
    });

    const rawSrc = require('@/assets/images/bg-fitness.mp4');
    const src: string = typeof rawSrc === 'string' ? rawSrc : rawSrc?.default ?? rawSrc?.uri ?? '';

    const vid = document.createElement('video');
    vid.src = src;
    vid.autoplay = true;
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    Object.assign(vid.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    });

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute',
      inset: '0',
      background: 'rgba(8,16,36,0.60)',
      pointerEvents: 'none',
    });

    wrapper.appendChild(vid);
    wrapper.appendChild(overlay);

    const root = document.getElementById('root');
    document.body.insertBefore(wrapper, root ?? document.body.firstChild);

    vid.play().catch(() => {});
    if (root) {
      root.style.position = 'relative';
      root.style.zIndex = '1';
      root.style.background = 'transparent';
    }
    document.body.style.background = 'transparent';

    return () => {
      vid.pause();
      vid.src = '';
      if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
      const style = document.getElementById(STYLE_ID);
      if (style) document.head.removeChild(style);
    };
  }, []);

  return null;
}
