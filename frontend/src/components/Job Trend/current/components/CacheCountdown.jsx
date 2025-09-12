import React, { useState, useEffect } from 'react';

const CacheCountdown = React.memo(({ cacheInfo }) => {
  const [dynamicExpiresIn, setDynamicExpiresIn] = useState(null);

  useEffect(() => {
    let countdownInterval;
    if (cacheInfo && cacheInfo.cached && cacheInfo.expires_in > 0) {
      setDynamicExpiresIn(cacheInfo.expires_in);
      
      countdownInterval = setInterval(() => {
        setDynamicExpiresIn(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setDynamicExpiresIn(null);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [cacheInfo]);

  if (!dynamicExpiresIn || dynamicExpiresIn <= 0) {
    return cacheInfo?.expires_in > 0 
      ? `${Math.floor(cacheInfo.expires_in / 60)}m ${String(cacheInfo.expires_in % 60).padStart(2, '0')}s`
      : 'Expired';
  }

  const minutes = Math.floor(dynamicExpiresIn / 60);
  const seconds = dynamicExpiresIn % 60;
  
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
});

export default CacheCountdown;