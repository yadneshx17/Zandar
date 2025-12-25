import React, { useEffect, useContext, useState } from "react";
import { SettingsContext } from "../contexts/SettingsProvider";
import { getImageBlob } from "../core/db/imageStore.js";

const BackgroundWrapper = ({ previewPreset }) => {
  const {
    bgType,
    setBgType,
    setBgFile,
    bgFile,
    bgBrightness,
    bgBlur,
    imgUrl,
    setImgUrl,
    bgPreset,
  } = useContext(SettingsContext);
  const [isVideo, setIsVideo] = useState(false);

  const PRESET_IMAGES = {
    glass: "/assets/backgrounds/glass.jpg",
    nature: "/assets/backgrounds/nature.jpg",
    gradient: "/assets/backgrounds/gradient.jpg",
    vibrant: "/assets/backgrounds/vibrant.jpg",
    game: "/assets/backgrounds/game.jpg",
  };

  useEffect(() => {
    console.log("previewPreset:", previewPreset);
  }, [previewPreset]);

  useEffect(() => {
    const storedType = localStorage.getItem("bgType");
    if (storedType) {
      setBgType(storedType);
    }

    if (storedType === "local") {
      const key = localStorage.getItem("bgImageKey");
      const storedIsVideo = localStorage.getItem("bgIsVideo") === "true";
      setIsVideo(storedIsVideo);

      if (key) {
        getImageBlob(key).then((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setImgUrl(url);
            setBgFile(url);
          }
        });
      }
    }
  }, [setBgType, setBgFile, setImgUrl]);

  const backgroundStyle = {
    filter: `brightness(${bgBrightness}%) blur(${bgBlur}px)`,
    transition: "filter 0.3s ease",
  };

  return (
    <div className="absolute inset-0 z-0 bg-[#0a0a0a] overflow-hidden">
      {bgType === "preset" && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${PRESET_IMAGES[bgPreset] || PRESET_IMAGES.glass})`,
            ...backgroundStyle,
          }}
        />
      )}

      {bgType === "local" && bgFile && (
        <>
          {isVideo ? (
            <video
              src={imgUrl}
              autoPlay
              loop
              muted
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

      {previewPreset && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div
            className="
              absolute inset-0 bg-cover bg-center
              transition-all duration-500 ease-out
              opacity-100
              translate-y-0
              blur-[14px]
              scale-105
            "
            style={{
              backgroundImage: `url(${previewPreset.bg})`,
              animation: "previewFadeIn 0.5s ease-out forwards",
            }}
          />
        </div>
      )}
      {/* <div className="absolute inset-0 bg-black/20 pointer-events-none" />*/}
    </div>
  );
};

export default BackgroundWrapper;
