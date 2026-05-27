import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX, Code, Sparkles } from "lucide-react";
import { VideoProject, Scene } from "../types";
import { audioEngine } from "../utils/audioEngine";
import { VOICE_VOICES } from "../utils/presets";

interface VideoPlayerProps {
  project: VideoProject | null;
  onSceneChange?: (sceneIndex: number) => void;
  activeSceneIndex: number;
  setActiveSceneIndex: (idx: number) => void;
  isGenerating?: boolean;
}

export default function VideoPlayer({
  project,
  activeSceneIndex,
  setActiveSceneIndex,
  isGenerating = false
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [enableVoiceover, setEnableVoiceover] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // simulation time within current scene
  const [cumulativeProgress, setCumulativeProgress] = useState(0);

  const prevActiveIndex = useRef(activeSceneIndex);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop everything on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  // Set soundtrack and playback events on toggling play
  useEffect(() => {
    if (isPlaying && project) {
      audioEngine.play(project.soundtrack);
      playActiveSceneVoiceover();
    } else {
      audioEngine.stop();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isPlaying, project?.soundtrack]);

  // Handle auto-advancing scenes
  useEffect(() => {
    if (!isPlaying || !project || project.scenes.length === 0) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const activeScene = project.scenes[activeSceneIndex];
    const durationMs = (activeScene?.duration || 5) * 1000;
    setCurrentTime(0);

    // Track detailed progress frame increments
    let startInstant = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startInstant) / 1000;
      setCurrentTime(elapsed);

      if (elapsed >= (activeScene?.duration || 5)) {
        // Advance to next scene or loop back
        if (activeSceneIndex < project.scenes.length - 1) {
          const nextIdx = activeSceneIndex + 1;
          setActiveSceneIndex(nextIdx);
        } else {
          // Finished the whole script sequence!
          setIsPlaying(false);
          setActiveSceneIndex(0);
          setCurrentTime(0);
        }
      }
    }, 100);

    // Play next voiceover if index changed
    if (prevActiveIndex.current !== activeSceneIndex) {
      playActiveSceneVoiceover();
      prevActiveIndex.current = activeSceneIndex;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeSceneIndex, project]);

  // Read visual scene text-to-speech
  const playActiveSceneVoiceover = () => {
    if (!enableVoiceover || !project) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop old narrating

    const activeScene = project.scenes[activeSceneIndex];
    if (!activeScene || !activeScene.voiceoverText) return;

    try {
      const utterance = new SpeechSynthesisUtterance(activeScene.voiceoverText);
      
      // Match voice presets
      const selectedPreset = VOICE_VOICES.find(v => v.id === project.voicePreset) || VOICE_VOICES[0];
      utterance.lang = selectedPreset.lang;
      utterance.rate = selectedPreset.rate;
      utterance.pitch = selectedPreset.pitch;

      // Find actual matching platform browser voices
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try searching by language code
        const fitVoice = voices.find(v => v.lang.startsWith(selectedPreset.lang)) || voices[0];
        utterance.voice = fitVoice;
      }

      voiceUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis Voiceover init skipped", e);
    }
  };

  const handlePlayToggle = () => {
    if (!project || project.scenes.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setActiveSceneIndex(0);
    setCurrentTime(0);
    audioEngine.stop();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleNext = () => {
    if (!project) return;
    if (activeSceneIndex < project.scenes.length - 1) {
      setActiveSceneIndex(activeSceneIndex + 1);
    } else {
      setActiveSceneIndex(0);
    }
  };

  const handlePrev = () => {
    if (!project) return;
    if (activeSceneIndex > 0) {
      setActiveSceneIndex(activeSceneIndex - 1);
    } else {
      setActiveSceneIndex(project.scenes.length - 1);
    }
  };

  // Setup motion properties for cinema frames
  const getCameraAnimationConfigs = (movementType: string) => {
    switch (movementType) {
      case "zoom-in":
        return {
          initial: { scale: 1.0, rotate: 0, x: 0, y: 0 },
          animate: { scale: 1.18, rotate: 0.3 }
        };
      case "zoom-out":
        return {
          initial: { scale: 1.25, rotate: -0.3, x: 0, y: 0 },
          animate: { scale: 1.05, rotate: 0 }
        };
      case "pan-left":
        return {
          initial: { scale: 1.15, rotate: 0, x: 30, y: 0 },
          animate: { x: -30 }
        };
      case "pan-right":
        return {
          initial: { scale: 1.15, rotate: 0, x: -30, y: 0 },
          animate: { x: 30 }
        };
      case "tilt-up":
        return {
          initial: { scale: 1.15, rotate: 0, x: 0, y: 30 },
          animate: { y: -30 }
        };
      case "tilt-down":
        return {
          initial: { scale: 1.15, rotate: 0, x: 0, y: -30 },
          animate: { y: 30 }
        };
      case "orbit":
        return {
          initial: { scale: 1.1, rotate: -1.5, x: -10, y: -10 },
          animate: { rotate: 1.5, x: 10, y: 10 }
        };
      default:
        // Ken Burns zoom fallback
        return {
          initial: { scale: 1.0, rotate: 0 },
          animate: { scale: 1.12 }
        };
    }
  };

  const activeScene: Scene | undefined = project?.scenes[activeSceneIndex];
  const motionConfig = activeScene ? getCameraAnimationConfigs(activeScene.cameraDirection) : null;
  const currentDurationLimit = activeScene?.duration || 5;
  const progressPercent = Math.min(100, (currentTime / currentDurationLimit) * 100);

  // Aspect ratio styles
  const getAspectClass = () => {
    if (!project) return "aspect-video";
    if (project.aspectRatio === "9:16") return "aspect-[9/16] max-h-[500px]";
    if (project.aspectRatio === "1:1") return "aspect-square max-h-[420px]";
    return "aspect-video"; // 16:9
  };

  return (
    <div id="video-preview-canvas-container" className="flex flex-col gap-4 bg-[#111111] border border-[#222222] rounded-[32px] overflow-hidden shadow-2xl relative">
      {/* Viewport Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></div>
          <span className="font-mono text-xs text-zinc-300 uppercase tracking-widest font-semibold">Cinematic Preview Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEnableVoiceover(!enableVoiceover)}
            className={`p-1.5 px-3 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition ${
              enableVoiceover 
                ? "bg-purple-950/40 text-purple-400 border border-purple-800/50" 
                : "bg-white/5 text-zinc-500 border border-transparent"
            }`}
            title="Toggle Voiceover Narration"
          >
            {enableVoiceover ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {enableVoiceover ? "VOICE ON" : "VOICE OFF"}
          </button>
          {project && (
            <span className="bg-white/5 text-zinc-400 font-mono text-[11px] px-2.5 py-1 rounded-lg border border-white/5">
              {project.aspectRatio} | {project.resolution} | {project.fps} FPS
            </span>
          )}
        </div>
      </div>

      {/* Main Screen Frame */}
      <div className="flex items-center justify-center p-4 bg-black relative overflow-hidden min-h-[340px]">
        {/* Absolute cosmic grid backdrops */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06)_0,transparent_70%)] pointer-events-none"></div>

        {isGenerating ? (
          <div className="flex flex-col items-center text-center gap-4 p-8 max-w-md z-10 animate-fade-in">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-purple-400 w-5 h-5 animate-bounce" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h4 className="font-sans text-base font-medium text-zinc-200">Generating Script & Spatial Frames</h4>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Calling server-side neural models to write storyboard sequences, script narration paths, and fetch camera anchors...
              </p>
            </div>
          </div>
        ) : !project ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm z-10 text-zinc-400">
            <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#222222] flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-zinc-650 pl-0.5" />
            </div>
            <h4 className="font-sans text-sm font-semibold text-zinc-300">Workspace Pending Input</h4>
            <p className="font-sans text-xs text-zinc-500 mt-1 leading-relaxed">
              Fill out your creative storyboard details on the left, then click <strong className="text-purple-400">"Generate AI Narrative Video"</strong> to start the cinema renderer!
            </p>
          </div>
        ) : (
          /* Active Interactive Screen */
          <div className={`relative w-full ${getAspectClass()} max-w-2xl bg-[#080808] rounded-2xl overflow-hidden border border-[#222222] w-full select-none shadow-2xl`}>
            <AnimatePresence mode="wait">
              {activeScene ? (
                <motion.div
                  key={activeScene.id}
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Dynamic Zooming Camera Movement container */}
                  <motion.div
                    className="w-full h-full"
                    initial={motionConfig?.initial}
                    animate={isPlaying ? motionConfig?.animate : {}}
                    transition={{
                      duration: currentDurationLimit,
                      ease: "linear"
                    }}
                  >
                    <img
                      src={activeScene.imageUrl || `https://picsum.photos/seed/${activeScene.id}/800/450`}
                      alt={activeScene.visualPrompt}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>

                  {/* Top Floating Scene Tag */}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono text-[10px] text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    SCENE 0{activeScene.number} / 0{project.scenes.length}
                  </div>

                  {/* Dynamic Camera Action Banner */}
                  <div className="absolute top-3 right-3 bg-purple-950/70 backdrop-blur-md border border-purple-800/40 px-2.5 py-1 rounded-md font-mono text-[10px] text-purple-300 capitalize">
                    🎥 {activeScene.cameraDirection.replace("-", " ")}
                  </div>

                  {/* Subtitle Voiceover Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-10 rounded-b-lg flex flex-col gap-1.5 justify-end text-center">
                    <p className="font-sans text-xs md:text-sm text-white font-medium drop-shadow leading-relaxed text-shadow max-w-xl mx-auto">
                      "{activeScene.voiceoverText}"
                    </p>
                    {activeScene.audioEffects && (
                      <span className="font-mono text-[9px] text-purple-400 flex items-center justify-center gap-1 uppercase tracking-wider">
                        🔊 {activeScene.audioEffects}
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Playback Progress Scrubber */}
      {project && !isGenerating && (
        <div className="px-6">
          <div className="relative h-1.5 w-full bg-[#181818] rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-1.5">
            <span>SCENE {activeSceneIndex + 1} PROGRESS</span>
            <span>{currentTime.toFixed(1)}s / {currentDurationLimit}s</span>
          </div>
        </div>
      )}

      {/* Viewport Control Panel Bar */}
      {project && !isGenerating && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition"
              title="Previous Scene"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayToggle}
              className={`p-2 px-6 rounded-xl font-sans text-xs font-semibold tracking-wider flex items-center gap-2 transition ${
                isPlaying 
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25" 
                  : "bg-white hover:bg-zinc-100 text-black shadow-md shadow-white/5"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current animate-pulse" />
                  PAUSE CINEMA
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  PLAY WORKSPACE
                </>
              )}
            </button>
            <button
              onClick={stopPlayback}
              className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition"
              title="Stop Cinema"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition"
              title="Next Scene"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Scene Select Indicators */}
          <div className="flex items-center gap-1.5">
            {project.scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveSceneIndex(idx);
                  setCurrentTime(0);
                }}
                className={`py-1.5 px-3 rounded-lg font-mono text-[10px] transition ${
                  idx === activeSceneIndex
                    ? "bg-purple-950/80 text-purple-400 border border-purple-800/40"
                    : "bg-white/5 text-zinc-400 hover:text-white border border-transparent"
                }`}
              >
                0{scene.number}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Scenario Information Panel */}
      {project && activeScene && !isGenerating && (
        <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex flex-col gap-2">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h5 className="font-sans text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                Active Frame Prompt Description
              </h5>
              <p className="font-sans text-xs text-zinc-500 leading-relaxed mt-1 italic select-all">
                "{activeScene.visualPrompt}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
