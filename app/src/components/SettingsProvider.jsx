import React, { createContext, useState, useEffect, useRef } from 'react';
import { saveImage } from "../services/db/imageStore.js"

export const SettingsContext = createContext();

export const SettingsProvider = ({children}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bgType, setBgType] = useState('default'); 
  const [bgFile, setBgFile] = useState(null); 
  const [bgFileName, setBgFileName] = useState('');

  // const [bgBlur, setBgBlur] = useState(0);
  // const [bgBrightness, setBgBrightness] = useState(100);  
  // const [widgetOpacity, setWidgetOpacity] = useState(100);
  

  // Lazy initialization - load from localStorage immediately
  const [bgBlur, setBgBlur] = useState(() => {
    const stored = localStorage.getItem("bgBlur");
    return stored !== null ? Number(stored) : 0;
  });

  const [bgBrightness, setBgBrightness] = useState(() => {
    const stored = localStorage.getItem("bgBrightness");
    return stored !== null ? Number(stored) : 100;
  });

  const [widgetOpacity, setWidgetOpacity] = useState(() => {
    const stored = localStorage.getItem("widgetOpacity");
    return stored !== null ? Number(stored) : 100;
  });
  

  const [imgUrl, setImgUrl] = useState(null); 

  // Save changes - now safe because initial values are already correct
  useEffect(() => {
    localStorage.setItem("bgBrightness", bgBrightness);
  }, [bgBrightness]);
  
  useEffect(() => {
    localStorage.setItem("bgBlur", bgBlur);
  }, [bgBlur]);
  
  useEffect(() => {
    localStorage.setItem("widgetOpacity", widgetOpacity);
  }, [widgetOpacity]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if(!file || !file.name) return;

    // validate extension ( png, jpg, jpeg)
    const allowedExtension = ["png", "jpg", "jpeg", "mp4", "webm"]
    const ext = file.name.split(".").pop().toLowerCase();
    if(!allowedExtension.includes(ext)) {
      alert("Only JPG PNG JPEG MP4 WebM allowed");
    return;
    }

    // Evalutate Size
    if (file.size > 50 * 1024 * 1024) {
      alert("File must be smaller than 50MB");
      return;
    }

    setBgFileName(file.name);

    const key = "background-image";

    // store in db
    await saveImage(key, file);

    // Determine if it's a video
    const isVideo = ["mp4", "webm"].includes(ext);

    
    // store url in localstorage
    localStorage.setItem("bgImageKey", key);
    localStorage.setItem("bgType", "local")
    localStorage.setItem("bgIsVideo", isVideo);  // Store the media type


    const url = URL.createObjectURL(file);
    setBgFile(url);
    setBgType("local");
    setImgUrl(url);
    
  }

  const value = {
    settingsOpen, setSettingsOpen,
    bgType, setBgType,
    bgFile, setBgFile,
    bgFileName, setBgFileName,
    bgBlur, setBgBlur,
    bgBrightness, setBgBrightness,
    widgetOpacity, setWidgetOpacity,
    imgUrl, setImgUrl,
    handleFileUpload
  }
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}