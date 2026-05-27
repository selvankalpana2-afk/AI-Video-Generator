import { useState } from "react";
import { Scene, CameraPreset } from "../types";
import { CAMERA_PRESETS } from "../utils/presets";
import { Edit2, RefreshCw, Film, Volume2, Music, Check, ArrowRight } from "lucide-react";

interface StoryboardEditorProps {
  scenes: Scene[];
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateScene: (index: number, updatedScene: Scene) => void;
  onRegenerateFrame: (index: number, prompt: string) => Promise<void>;
  regeneratingIndex: number | null;
}

export default function StoryboardEditor({
  scenes,
  activeSceneIndex,
  onSelectScene,
  onUpdateScene,
  onRegenerateFrame,
  regeneratingIndex
}: StoryboardEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleFieldChange = (idx: number, field: keyof Scene, value: any) => {
    const updated = { ...scenes[idx], [field]: value };
    onUpdateScene(idx, updated);
  };

  return (
    <div id="storyboard-timeline-editor" className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-purple-400" />
          <h3 className="font-sans text-sm font-semibold text-zinc-100">Narrative Scene Timeline</h3>
        </div>
        <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
          {scenes.length} Scenes Compiled
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;
          const isRegenerating = regeneratingIndex === idx;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`flex flex-col rounded-2xl border p-4 transition duration-200 cursor-pointer ${
                isActive
                  ? "bg-purple-950/10 border-purple-500/50 shadow-lg shadow-purple-950/20"
                  : "bg-white/5 border border-white/5 hover:border-purple-500/10"
              }`}
            >
              {/* Card Meta Header */}
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <span className="font-mono text-xs font-bold text-purple-400 flex items-center gap-1.5 bg-purple-950/40 px-2.5 py-0.5 rounded-lg border border-purple-900/40">
                  SCENE 0{scene.number}
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  Duration: {scene.duration}s
                </span>
              </div>

              {/* Main Content Form */}
              <div className="flex flex-col gap-3.5" onClick={(e) => e.stopPropagation()}>
                {/* Visual Generator Prompt */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Visual Composition Prompt</span>
                    <button
                      onClick={() => onRegenerateFrame(idx, scene.visualPrompt)}
                      disabled={isRegenerating}
                      className="text-purple-400 hover:text-purple-300 font-mono text-[10px] flex items-center gap-1 transition"
                      title="Request server-side Gemini image generation"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
                      {isRegenerating ? "Generating..." : "Regen View"}
                    </button>
                  </label>
                  <textarea
                    rows={2}
                    value={scene.visualPrompt}
                    onChange={(e) => handleFieldChange(idx, "visualPrompt", e.target.value)}
                    className="w-full text-xs font-sans text-zinc-300 bg-[#0a0a0a] border border-white/5 rounded-xl p-2.5 focus:border-purple-500 focus:outline-none leading-relaxed resize-none cursor-text"
                  />
                </div>

                {/* Narrative Voiceover Script */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-purple-400" />
                    <span>Narration Voiceover (TTS)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={scene.voiceoverText}
                    onChange={(e) => handleFieldChange(idx, "voiceoverText", e.target.value)}
                    className="w-full text-xs font-sans text-zinc-300 bg-[#0a0a0a] border border-white/5 rounded-xl p-2.5 focus:border-purple-500 focus:outline-none leading-relaxed resize-none cursor-text"
                  />
                </div>

                {/* Camera Action Preset */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Camera Dolly
                    </label>
                    <select
                      value={scene.cameraDirection}
                      onChange={(e) => handleFieldChange(idx, "cameraDirection", e.target.value)}
                      className="w-full text-xs font-sans text-zinc-300 bg-[#0a0a0a] border border-white/5 rounded-xl p-2 focus:border-purple-500 focus:outline-none cursor-text"
                    >
                      {CAMERA_PRESETS.map((cam) => (
                        <option key={cam.id} value={cam.movementType}>
                          {cam.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Music className="w-3 h-3 text-purple-400" />
                      <span>Sound FX</span>
                    </label>
                    <input
                      type="text"
                      value={scene.audioEffects || ""}
                      onChange={(e) => handleFieldChange(idx, "audioEffects", e.target.value)}
                      placeholder="e.g. ambient wind"
                      className="w-full text-xs font-sans text-zinc-300 bg-[#0a0a0a] border border-white/5 rounded-xl p-2 focus:border-purple-500 focus:outline-none cursor-text"
                    />
                  </div>
                </div>
              </div>

              {/* Focus Active Scene Button */}
              {!isActive && (
                <div className="mt-3 flex items-center justify-end text-purple-400 hover:text-purple-300 font-sans text-[11px] gap-1 select-none font-medium">
                  Select and Preview Scene
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
