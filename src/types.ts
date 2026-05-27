export interface Scene {
  id: string;
  number: number;
  visualPrompt: string;
  cameraDirection: string;
  voiceoverText: string;
  imageUrl?: string;
  duration: number; // in seconds
  audioEffects?: string;
}

export type AspectRatio = "16:9" | "9:16" | "1:1";

export interface VideoProject {
  id: string;
  title: string;
  prompt: string;
  aspectRatio: AspectRatio;
  style: string;
  cameraMovement: string;
  fps: number;
  resolution: "720p" | "1080p" | "4K";
  duration: number;
  scenes: Scene[];
  soundtrack: string; // lo-fi, synthwave, ambient, etc.
  voicePreset: string;
  createdAt: string;
  status: "draft" | "queued" | "generating" | "completed" | "failed";
  operationName?: string;
  videoUrl?: string;
  logs?: string[];
}

export interface PresetStyle {
  id: string;
  name: string;
  description: string;
  promptAddon: string;
  icon: string;
}

export interface CameraPreset {
  id: string;
  name: string;
  description: string;
  movementType: "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down" | "orbit";
}
