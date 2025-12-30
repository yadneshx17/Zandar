interface Backgrounddefaults {
  blur: number;
  brightness: number;
  widgetOpacity: number;
}

interface BackgroundPreset {
  id: string;
  label: string;
  type: "preset" | "custom";
  bg: string;
  defaults: Backgrounddefaults;
}

interface Preset {
  glass: string;
  nature: string;
  "abstract": string;  // wrapped in quotes. abstract is TS keyword
  vibrant: string;
  game: string;
}

export const PRESET_IMAGES: Preset = {
  glass: "/assets/backgrounds/glass.jpg",
  nature: "/assets/backgrounds/nature.jpg",
  abstract: "/assets/backgrounds/abstract.jpg",
  vibrant: "/assets/backgrounds/vibrant.jpg",
  game: "/assets/backgrounds/game.jpg",
};

export const BG_PRESETS: ReadonlyArray<BackgroundPreset> = [
  {
    id: "glass",
    label: "Glass",
    type: "preset",
    bg: "/assets/backgrounds/glass.jpg",
    defaults: {
      blur: 20,
      brightness: 100,
      widgetOpacity: 20,
    },
  },
  {
    id: "nature",
    label: "Nature",
    type: "preset",
    bg: "/assets/backgrounds/nature.jpg",
    defaults: {
      blur: 14,
      brightness: 92,
      widgetOpacity: 34,
    },
  },
  {
    id: "abstract",
    label: "Abstract",
    type: "preset",
    bg: "/assets/backgrounds/abstract.jpg",
    defaults: {
      blur: 11,
      brightness: 100,
      widgetOpacity: 20,
    },
  },
  {
    id: "vibrant",
    label: "Vibrant",
    type: "preset",
    bg: "/assets/backgrounds/vibrant.jpg",
    defaults: {
      blur: 18,
      brightness: 100,
      widgetOpacity: 36,
    },
  },
  {
    id: "game",
    label: "Game",
    type: "preset",
    bg: "/assets/backgrounds/game.jpg",
    defaults: {
      blur: 18,
      brightness: 100,
      widgetOpacity: 26,
    },
  },
];
