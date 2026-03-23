import React, { useEffect } from 'react';

const AdSenseComponent = ({ adSlot, style = { display: 'block' }, format = 'auto', responsive = 'true' }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense initialization failed', e);
    }
  }, []);

  return (
    <div className="ad-container my-4 text-center border-dashed border-2 border-dark-700/50 p-2 bg-dark-900 rounded flex justify-center items-center min-h-[90px]">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your Publisher ID
        data-ad-slot={adSlot}                    // Replace with your specific Ad Slot ID
        data-ad-format={format}
        data-full-width-responsive={responsive}
      ></ins>
      {/* Fallback visual for dev environment */}
      {!window.adsbygoogle && (
         <span className="text-dark-500 font-medium text-sm tracking-widest uppercase">Advertisement Space</span>
      )}
    </div>
  );
};

export default AdSenseComponent;
