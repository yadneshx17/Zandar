import React, {useEffect, useContext} from "react";
import {SettingsContext} from "./SettingsProvider";
import { getImageBlob } from "../services/db/imageStore";

const BackgroundWrapper = () => {
    const { bgType, setBgType, setBgFile, bgFile, bgBrightness, bgBlur, imgUrl, setImgUrl } = useContext(SettingsContext);

    // Load image from IndexedDB + localStorage
    useEffect(() => {
      const key = localStorage.getItem("bgImageKey");
      if (!key) return;

      getImageBlob(key).then(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setImgUrl(url);
        setBgType("local");
        setBgFile(url);
      });
    }, []);

    useEffect(() => {
      const storedType = localStorage.getItem("bgType");
      if (storedType) {
        setBgType(storedType);
      }

      if (storedType === "local") {
        const key = localStorage.getItem("bgImageKey");
        if (key) {
          getImageBlob(key).then(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setBgFile(url);
            }
          });
        }
      }
    }, []);


    const backgroundStyle = {
      filter: `brightness(${bgBrightness}%) blur(${bgBlur}px)`,
      transition: 'filter 0.3s ease',
    };
  
    return (
      <div className="absolute inset-0 z-0 bg-[#0a0a0a] overflow-hidden">
        {bgType === 'local' && bgFile && (
          <>
            {bgFile.startsWith('data:video') ? (
               <video 
                 src={imgUrl} autoPlay loop muted 
                 className="absolute inset-0 w-full h-full object-cover"
                 style={backgroundStyle}
               />
            ) : (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${imgUrl})`, ...backgroundStyle }} 
              />
            )}
          </>
        )}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>
    );
};

export default BackgroundWrapper;