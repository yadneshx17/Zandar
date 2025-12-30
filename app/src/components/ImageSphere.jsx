import React, { useState, useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsProvider';
import { Settings } from 'lucide-react';
import { BG_PRESETS } from "../utils/backgroundPresets";

// Data defining the 5 spheres.
const standardSize = 'w-16 h-16 md:w-20 md:h-20';

const ImageSpheres = ({setPresetId, setPreviewPreset}) => {
  // State to track which sphere index is currently hovered
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const {
    setBgType,
    setBgBlur,
    setBgBrightness,
    setWidgetOpacity,
    setBgPreset,
  } = useContext(SettingsContext);
  
  
  const applyPreset = (presetId) => {
    const preset = BG_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setBgPreset(presetId);
    localStorage.setItem("bgPreset", presetId);

    setBgType("preset");
    localStorage.setItem("bgType", "preset");
    setPresetId(preset.id);
    setBgBlur(preset.defaults.blur);
    setBgBrightness(preset.defaults.brightness);
    setWidgetOpacity(preset.defaults.widgetOpacity);
  };

  return (
    // Container: Using gap-4 here handles the base spacing
    <div 
      className="flex items-center justify-center gap-4 py-8 h-32 select-none"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      
      {BG_PRESETS.map((preset, index) => {

        // --- Dynamic Style Logic ---
        // Added 'translate-x-0' to base state
        let transformClass = 'scale-100 translate-y-0 opacity-90 translate-x-0'; 
        let zIndexClass = 'z-0';
        let shadowClass = 'shadow-lg'; 

        if (hoveredIndex !== null) {
            // Logic for the HOVERED item
            if (index === hoveredIndex) {
                // Main item: Grows big, lifts up, stays centered horizontally
                transformClass = 'scale-[1.35] -translate-y-2 opacity-100 translate-x-0 brightness-130';
                zIndexClass = 'z-20';
                shadowClass = 'shadow-2xl';
            } 
            // Logic for IMMEDIATE NEIGHBORS
            else if (index === hoveredIndex - 1) {
                // Left neighbor: Moves further LEFT (-translate-x-4) to make room
                transformClass = 'scale-[1.15] -translate-y-1 opacity-100 -translate-x-4';
                zIndexClass = 'z-10';
                shadowClass = 'shadow-xl';
            } 
            else if (index === hoveredIndex + 1) {
                // Right neighbor: Moves further RIGHT (translate-x-4) to make room
                transformClass = 'scale-[1.15] -translate-y-1 opacity-100 translate-x-4';
                zIndexClass = 'z-10';
                shadowClass = 'shadow-xl';
            } 
            // Logic for DISTANT items
            else {
                // Move them slightly aside so the whole line breathes
                const direction = index < hoveredIndex ? '-translate-x-2' : 'translate-x-2';
                transformClass = `scale-90 opacity-70 blur-[0.5px] ${direction}`;
            }
        }

        return (
          
            <div
              key={preset.id}
              // Set hover state on enter
              onMouseEnter={() => {
                setHoveredIndex(index);
                setPreviewPreset(preset);
                console.log("Enter")
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setPreviewPreset(null);
                console.log("Leave")
              }}
            onClick={() => {
              applyPreset(preset.id)
              setSelectedPreset(preset.id)
            }}
              // Combine standardized size with dynamic transform classes
              className={`relative rounded-full overflow-hidden cursor-pointer ${standardSize} ${transformClass} ${zIndexClass} ${shadowClass} ${selectedPreset === preset.id ? "border-4 border-green-500 shadow-lime-100" : ""}
                          transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] origin-bottom active:scale-95`}
            >
              {/* Render content */}
              {/* {sphere.type === 'color' ? (
                <div className={`w-full h-full ${sphere.className}`} />
              ) : (*/}
                <img
                  src={preset.bg}
                  alt={`Texture ${index}`}
                  className="w-full h-full object-cover"
                />
              )
              {/* }*/}

              {/* Gloss overlay */}
              <div className={`absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 transition-opacity duration-500 pointer-events-none
                             ${index === hoveredIndex ? 'opacity-100' : 'opacity-0'}`}>
              </div>
            </div>
        );
      })}
    </div>
  );
};

export default ImageSpheres;