import { PresetStyle, CameraPreset } from "../types";

export const PRESET_STYLES: PresetStyle[] = [
  {
    id: "cinematic",
    name: "Cinematic Epic",
    description: "Anamorphic lenses, atmospheric mist, volumetric golden hour shadows.",
    promptAddon: "modern anamorphic lenses, atmospheric dust particles, volumetric lighting, rich shadows, 8k resolution, IMAX masterpiece style",
    icon: "lucide-clapperboard"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description: "Drenched in neon rain, towering holographic billboards, reflection puddles.",
    promptAddon: "cyberpunk aesthetic, heavy glowing neon accents, wet streets with puddle reflections, tall futuristic high-rises, rain-slicked surfaces",
    icon: "lucide-zap"
  },
  {
    id: "ghibli",
    name: "Anime Ghibli",
    description: "Hand-painted organic backgrounds, lush deep green meadows, soft ambient wind.",
    promptAddon: "beautiful anime studio ghibli hand-painted style, soft watercolor textures, rich natural green foliage, glowing direct sunshine rays",
    icon: "lucide-sparkles"
  },
  {
    id: "synthwave",
    name: "Synthwave Retro",
    description: "1980s glowing magenta grids, vector mountains, wireframe suns.",
    promptAddon: "1980s retro synthwave, sunset wireframe grid horizon, pink glass mountains, neon driving lines, laser aesthetics",
    icon: "lucide-disc"
  },
  {
    id: "claymation",
    name: "Stop-Motion Clay",
    description: "Artisanal clay textures, subtle fingerprints, dynamic stop-motion frame lag.",
    promptAddon: "charming stop-motion claymation, realistic modeling clay textures, tiny fingerprints on surface, warm organic miniature studio set lighting",
    icon: "lucide-smile"
  },
  {
    id: "vintage",
    name: "Vintage 35mm film",
    description: "Scratched film grain, soft warm sepia/cyan contrast, nostalgic light leaks.",
    promptAddon: "authentic retro 35mm analog photograph, organic film grain pattern, dust and scratches, light leak flares, high nostalgist color palette",
    icon: "lucide-camera"
  }
];

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: "zoom-in",
    name: "Ken Burns Zoom In",
    description: "Slow progressive movement directly into the center, intensifying dramatic focus.",
    movementType: "zoom-in"
  },
  {
    id: "zoom-out",
    name: "Dramatic Zoom Out",
    description: "Slow visual pull outward to reveal the breadth of the surrounding background environment.",
    movementType: "zoom-out"
  },
  {
    id: "pan-left",
    name: "Cinematic Left Sweep",
    description: "Camera glides horizontally leftward, uncovering sequential layout features.",
    movementType: "pan-left"
  },
  {
    id: "pan-right",
    name: "Cinematic Right Sweep",
    description: "Camera glides horizontally rightward in a smooth horizontal dolly motion.",
    movementType: "pan-right"
  },
  {
    id: "tilt-up",
    name: "Crane Elevation Up",
    description: "Camera tilts upwards towards the sky/ceiling, shifting the perspective.",
    movementType: "tilt-up"
  },
  {
    id: "tilt-down",
    name: "Drop Down Tilt",
    description: "Camera angles downwards, centering on ground-level movements or subjects.",
    movementType: "tilt-down"
  },
  {
    id: "orbit",
    name: "3D Spatial Orbit",
    description: "An elegant rotating orbital glide circling around the central point of interest.",
    movementType: "orbit"
  }
];

export const SOUNDTRACKS = [
  { id: "none", name: "Silent Cinema (Mute)", description: "Raw audio-less video compilation." },
  { id: "cyberpunk", name: "Cyberpunk Sub-Bass Drone", description: "Deep, moving retro synthesizer lines with low sweeps." },
  { id: "cinematic", name: "Epic Orchestral Strings", description: "Lush orchestral cello and violins shifting suspended minor chords." },
  { id: "ambient", name: "Stardust Ethereal Space Wave", description: "Weightless, ambient bell drones and shimmering delay echoes." },
  { id: "lofi", name: "Warm Cozy Vinyl Lofi Beat", description: "Soft filtered chords with crackle hiss backdrop." }
];

export const VOICE_VOICES = [
  { id: "uk-male", name: "Arthur (UK Cinematic)", lang: "en-GB", rate: 0.85, pitch: 0.9 },
  { id: "us-female", name: "Elena (US Horizon)", lang: "en-US", rate: 0.95, pitch: 1.1 },
  { id: "in-female", name: "Kore (Mystic Narrative)", lang: "en-IN", rate: 0.82, pitch: 0.95 },
  { id: "us-deep", name: "Zephyr (Deep Cosmic Director)", lang: "en-US", rate: 0.82, pitch: 0.75 }
];
