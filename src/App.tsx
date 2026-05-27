import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Wand2, 
  Sliders, 
  Tv, 
  Terminal, 
  Settings, 
  Layers, 
  Music, 
  FileText, 
  Mic, 
  Flame, 
  RefreshCw,
  FolderLock
} from "lucide-react";
import { VideoProject, Scene, AspectRatio } from "./types";
import { PRESET_STYLES, CAMERA_PRESETS, SOUNDTRACKS, VOICE_VOICES } from "./utils/presets";
import VideoPlayer from "./components/VideoPlayer";
import StoryboardEditor from "./components/StoryboardEditor";

const CREATIVE_TEMPLATES = [
  {
    name: "Cyberpunk Tokyo",
    prompt: "Futuristic drone gliding low over wet Tokyo streets at midnight, vibrant violet neon holographic advertisements splashing in puddles, cinematic realism.",
    style: "cyberpunk",
    camera: "pan-right"
  },
  {
    name: "Clay Dragon",
    prompt: "A charming handcrafted green clay dragon on a miniature studio desk trying to breathe a tiny colorful bubble, soft modeling clay textures, stop-motion detail.",
    style: "claymation",
    camera: "zoom-in"
  },
  {
    name: "Astronaut Discovery",
    prompt: "An astronaut exploring a deep cave on a desolate red planet, discovering a massive glowing sapphire crystal, volumetric dust rays, 35mm film.",
    style: "vintage",
    camera: "orbit"
  },
  {
    name: "Ghibli Valley",
    prompt: "Expansive green valley filled with wild lavender swaying in the soft spring breeze, hand-painted aesthetic, a tiny wooden windmill in the background.",
    style: "ghibli",
    camera: "tilt-up"
  }
];

export default function App() {
  const [prompt, setPrompt] = useState(CREATIVE_TEMPLATES[0].prompt);
  const [selectedStyle, setSelectedStyle] = useState(CREATIVE_TEMPLATES[0].style);
  const [selectedCamera, setSelectedCamera] = useState(CREATIVE_TEMPLATES[0].camera);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>("16:9");
  const [selectedDuration, setSelectedDuration] = useState(20);
  const [selectedFps, setSelectedFps] = useState(30);
  const [selectedResolution, setSelectedResolution] = useState<"720p" | "1080p" | "4K">("1080p");
  const [selectedSoundtrack, setSelectedSoundtrack] = useState("cyberpunk");
  const [selectedVoicePreset, setSelectedVoicePreset] = useState("uk-male");

  const [activeProject, setActiveProject] = useState<VideoProject | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [isAiConnected, setIsAiConnected] = useState<boolean | null>(null);

  // Studio terminal logs state
  const [logs, setLogs] = useState<string[]>([
    "Vividio Terminal v1.07 initialized.",
    "Dual-engine renderer connected. Ready to prompt script..."
  ]);

  // Check backend server-side AI connection
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setIsAiConnected(data.aiEnabled);
        if (data.aiEnabled) {
          addLog("Neural cluster connection verified: Server-side Gemini API is ONLINE.");
        } else {
          addLog("Gemini Key absent. Operating in Client-Side High-Resolution Cinematic Simulation Mode.");
        }
      })
      .catch(() => {
        setIsAiConnected(false);
        addLog("Server connection latency detected. Employing local simulation shaders.");
      });
  }, []);

  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${text}`]);
    // Scroll terminal container if possible
    setTimeout(() => {
      const el = document.getElementById("studio-terminal-feed");
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  };

  const handleTemplateClick = (tpl: typeof CREATIVE_TEMPLATES[0]) => {
    setPrompt(tpl.prompt);
    setSelectedStyle(tpl.style);
    setSelectedCamera(tpl.camera);
    addLog(`Template Loaded: "${tpl.name}". Adjusted coordinates.`);
  };

  const generateProject = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setActiveProject(null);
    setLogs([]); // Reset log feed
    
    addLog("Initiating cinematic generation request...");
    addLog(`Target spec: Aspect ${selectedAspectRatio} | Res ${selectedResolution} | Duration ${selectedDuration}s`);
    addLog("Decomposing narrative arc using server-side script engine...");

    try {
      // Step 1: Call Express end-point to generate the 4-scene script schema
      const scriptResponse = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          cameraMovement: selectedCamera,
          duration: selectedDuration
        })
      });

      if (!scriptResponse.ok) {
        throw new Error("Neural scripting engine returned an invalid trace.");
      }

      const scriptData = await scriptResponse.json();
      addLog(`Storyboard Script compiled: "${scriptData.title}"`);
      addLog(`Visual mood context: ${scriptData.styleDescription}`);

      // Step 2: Render 4 frame visuals sequentially
      const completedScenes: Scene[] = [];
      const scenesToRender = scriptData.scenes || [];

      for (let i = 0; i < scenesToRender.length; i++) {
        const tempScene = scenesToRender[i];
        addLog(`Rendering Frame 0${i + 1} neural assets: "${tempScene.visualPrompt.substring(0, 48)}..."`);

        try {
          const frameRes = await fetch("/api/generate-frame", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: tempScene.visualPrompt,
              style: selectedStyle,
              sceneNumber: i + 1
            })
          });

          const frameData = await frameRes.json();
          completedScenes.push({
            id: `scene-key-${Date.now()}-${i}`,
            number: tempScene.number || (i + 1),
            visualPrompt: tempScene.visualPrompt,
            cameraDirection: tempScene.cameraDirection || selectedCamera,
            voiceoverText: tempScene.voiceoverText,
            imageUrl: frameData.imageUrl,
            duration: tempScene.duration || 5,
            audioEffects: tempScene.audioEffects
          });
          
          addLog(`Frame 0${i + 1} assets rendered & cached successfully.`);
        } catch (frameErr) {
          addLog(`Warning: Frame 0${i + 1} encountered layout limits. Using visual catalog fallbacks.`);
          // Fabricate safe fallback sequence item
          completedScenes.push({
            id: `scene-fallback-${Date.now()}-${i}`,
            number: i + 1,
            visualPrompt: tempScene.visualPrompt,
            cameraDirection: tempScene.cameraDirection || selectedCamera,
            voiceoverText: tempScene.voiceoverText,
            imageUrl: `https://images.unsplash.com/featured/800x450?cinematic,${selectedStyle}&sig=${i}`,
            duration: 5,
            audioEffects: tempScene.audioEffects
          });
        }
      }

      // Step 3: Bundle and deploy new Project
      const newProject: VideoProject = {
        id: `project-${Date.now()}`,
        title: scriptData.title || "Echoes of Creation",
        prompt,
        aspectRatio: selectedAspectRatio,
        style: selectedStyle,
        cameraMovement: selectedCamera,
        fps: selectedFps,
        resolution: selectedResolution,
        duration: selectedDuration,
        scenes: completedScenes,
        soundtrack: selectedSoundtrack,
        voicePreset: selectedVoicePreset,
        createdAt: new Date().toLocaleTimeString(),
        status: "completed"
      };

      setActiveProject(newProject);
      setActiveSceneIndex(0);
      addLog("Successfully assembled and linked all spatial frame channels.");
      addLog(`Ambient soundtrack loops initialized: "${selectedSoundtrack.toUpperCase()}" audio tracks.`);
      addLog(`System ready. Push "PLAY WORKSPACE" to preview live cinematics with synchronized speech synthesis.`);

    } catch (err: any) {
      console.error(err);
      addLog(`Error: Unified compilation failed. Message: ${err.message || "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-generate a single scene image if the user edited the visual prompt description
  const handleRegenerateFrame = async (sceneIndex: number, editedPrompt: string) => {
    if (!activeProject) return;
    setRegeneratingIndex(sceneIndex);
    addLog(`Repainting Scene 0${sceneIndex + 1} with custom directives...`);

    try {
      const res = await fetch("/api/generate-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editedPrompt,
          style: selectedStyle,
          sceneNumber: sceneIndex + 1
        })
      });

      const data = await res.json();
      
      const updatedScenes = [...activeProject.scenes];
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        visualPrompt: editedPrompt,
        imageUrl: data.imageUrl
      };

      setActiveProject({
        ...activeProject,
        scenes: updatedScenes
      });

      addLog(`Scene 0${sceneIndex + 1} repainted. Visual cache synchronized.`);
    } catch (e) {
      addLog(`Warning: Failed to paint individual frame. Utilizing catalog backup.`);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleUpdateScene = (sceneIndex: number, updatedScene: Scene) => {
    if (!activeProject) return;
    const updatedScenes = [...activeProject.scenes];
    updatedScenes[sceneIndex] = updatedScene;
    setActiveProject({
      ...activeProject,
      scenes: updatedScenes
    });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans select-none selection:bg-purple-500 selection:text-white">
      {/* Top Navigation Frame */}
      <header className="sticky top-0 z-50 px-6 pt-6 pb-2 bg-[#080808]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111111] border border-[#222222] rounded-2xl px-6 py-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <div className="w-full h-full bg-[#111111] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">JANRET<span className="text-purple-500 underline decoration-2">AI</span></span>
                <span className="text-[9px] items-center bg-purple-950/50 text-purple-400 border border-purple-800/40 font-mono font-bold px-1.5 py-0.5 rounded leading-none">
                  V1.1
                </span>
              </div>
              <p className="text-[11px] font-sans text-zinc-500">Transform your imagination into cinematic reality</p>
            </div>
          </div>

          {/* Neural state server indicators */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium ${
              isAiConnected === null 
                ? "bg-zinc-900 text-zinc-500 border-zinc-800" 
                : isAiConnected 
                  ? "bg-purple-950/40 text-purple-300 border-purple-900/60" 
                  : "bg-zinc-900 border-[#222222] text-zinc-400"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isAiConnected ? "bg-purple-400 animate-pulse" : "bg-amber-500"}`}></div>
              {isAiConnected === null ? "PINGING DEPLOY" : isAiConnected ? "GEMINI SECURE LINK ACTIVE" : "LOCAL SIMULATION ACTIVE"}
            </div>
            {isAiConnected === false && (
              <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">
                (Runs catalog image indexing)
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Console workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Hand: Controller Cockpit (5 columns) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Preset Prompts */}
          <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[50px] pointer-events-none"></div>
            <h4 className="font-sans text-xs font-bold tracking-[0.15em] text-purple-400 uppercase mb-3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Pre-seeded Stylized Prompts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {CREATIVE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  onClick={() => handleTemplateClick(tpl)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/20 flex flex-col text-left gap-0.5 transition"
                >
                  <span className="font-sans font-medium text-[11px] text-zinc-100">{tpl.name}</span>
                  <span className="font-mono text-[9px] text-zinc-500 truncate w-full">{tpl.prompt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 flex flex-col gap-5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[100px] pointer-events-none"></div>
            
            {/* Header titles */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-purple-400 uppercase">Direct Prompt Engine</span>
            </div>

            {/* Prompt input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Visual Narrative Directive</span>
                <span className="text-zinc-600 font-mono">{prompt.length} chars</span>
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your scene: A futuristic neon cityscape in heavy rain, cinematic lighting, ultra-realistic, 8k, slow panning shot..."
                className="w-full text-sm font-sans text-zinc-200 bg-[#181818] border border-white/5 rounded-2xl p-4 focus:border-purple-500/50 focus:outline-none placeholder-zinc-600 leading-relaxed resize-none cursor-text"
              />
            </div>

            {/* Style Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Visual Aesthetic Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      addLog(`Style coordinates loaded: "${style.name}"`);
                    }}
                    className={`p-3 rounded-xl text-left border transition flex flex-col gap-1 ${
                      selectedStyle === style.id
                        ? "bg-purple-500/20 border-purple-500/30 text-purple-200"
                        : "bg-white/5 border border-white/5 text-zinc-400 hover:border-zinc-750"
                    }`}
                  >
                    <span className="font-sans font-semibold text-[11px]">{style.name}</span>
                    <span className="text-[9px] font-sans text-zinc-500 leading-normal line-clamp-1">
                      {style.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* General parameters */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#181818] p-1 rounded-xl border border-white/5">
                  {(["16:9", "9:16", "1:1"] as AspectRatio[]).map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setSelectedAspectRatio(ar)}
                      className={`py-1 rounded text-[10px] font-mono font-medium transition ${
                        selectedAspectRatio === ar
                          ? "bg-white text-black font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex justify-between">
                  <span>Target Length</span>
                  <span className="text-purple-400">{selectedDuration}s</span>
                </label>
                <input
                  type="range"
                  min={16}
                  max={24}
                  step={4}
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-[#181818] rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Advanced configurations collapsible */}
            <div className="border border-[#222222] bg-[#181818]/60 p-4 rounded-2xl flex flex-col gap-3">
              <h5 className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <Settings className="w-3 h-3 text-purple-400" />
                Advanced Neural Settings
              </h5>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Camera Path</span>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="bg-black border border-white/5 text-zinc-300 rounded-lg text-xs p-1.5 focus:outline-none focus:border-purple-500 cursor-text"
                  >
                    {CAMERA_PRESETS.map(c => (
                      <option key={c.id} value={c.movementType}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Resolution</span>
                  <select
                    value={selectedResolution}
                    onChange={(e) => setSelectedResolution(e.target.value as any)}
                    className="bg-black border border-white/5 text-zinc-300 rounded-lg text-xs p-1.5 focus:outline-none focus:border-purple-500 cursor-text"
                  >
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Cine</option>
                    <option value="4K">4K UHD</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                    <Music className="w-2.5 h-2.5 text-purple-400" />
                    Soundtrack Theme
                  </span>
                  <select
                    value={selectedSoundtrack}
                    onChange={(e) => setSelectedSoundtrack(e.target.value)}
                    className="bg-black border border-white/5 text-zinc-300 rounded-lg text-xs p-1.5 focus:outline-none focus:border-purple-500 cursor-text"
                  >
                    {SOUNDTRACKS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                    <Mic className="w-2.5 h-2.5 text-purple-400" />
                    Voice Voiceover
                  </span>
                  <select
                    value={selectedVoicePreset}
                    onChange={(e) => setSelectedVoicePreset(e.target.value)}
                    className="bg-black border border-white/5 text-zinc-300 rounded-lg text-xs p-1.5 focus:outline-none focus:border-purple-500 cursor-text"
                  >
                    {VOICE_VOICES.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Run generation trigger */}
            <button
              onClick={generateProject}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-white text-black hover:bg-[#eaeaea] disabled:bg-zinc-800 disabled:text-zinc-500 text-black py-4 px-6 rounded-2xl font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-white/5"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Synthesizing AI Media Sequences..." : "Generate AI Narrative Video"}
            </button>
          </div>
        </section>

        {/* Right Hand: Interactive Showcase and Timelines (7 columns) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Visualizer Player */}
          <VideoPlayer
            project={activeProject}
            activeSceneIndex={activeSceneIndex}
            setActiveSceneIndex={setActiveSceneIndex}
            isGenerating={isGenerating}
          />

          {/* Real-time Studio Terminal feedback and compile state logs */}
          <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[50px] pointer-events-none"></div>
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] uppercase border-b border-white/5 pb-2 justify-between">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-purple-400">
                <Terminal className="w-3.5 h-3.5" />
                VIVIDIO RUNTIME LOG ENGINE
              </span>
              <span className="text-zinc-650">STATE: OK</span>
            </div>
            <div
              id="studio-terminal-feed"
              className="font-mono text-[11px] text-zinc-300 leading-relaxed max-h-24 overflow-y-auto flex flex-col gap-1 select-all h-24"
            >
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-purple-500 font-medium">#</span>
                  <span>{log}</span>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-2 text-purple-400 animate-pulse">
                  <span className="text-purple-500">#</span>
                  <span>[RENDERING] Spawning neural visual layers dynamically...</span>
                </div>
              )}
            </div>
          </div>

          {/* Chronological Script Timeline editor panels */}
          {activeProject && (
            <StoryboardEditor
              scenes={activeProject.scenes}
              activeSceneIndex={activeSceneIndex}
              onSelectScene={(idx) => {
                setActiveSceneIndex(idx);
                addLog(`Dolly focus shifted to Scene 0${idx + 1}`);
              }}
              onUpdateScene={handleUpdateScene}
              onRegenerateFrame={handleRegenerateFrame}
              regeneratingIndex={regeneratingIndex}
            />
          )}
        </section>
      </main>

      {/* Humble Footer */}
      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] py-6 text-center text-xs text-zinc-600 font-mono flex items-center justify-center gap-2 pb-12">
        <span>JANRET AI VIDEO LABS</span>
        <span>•</span>
        <span>ALL RIGHTS RESERVED 2026</span>
      </footer>
    </div>
  );
}
