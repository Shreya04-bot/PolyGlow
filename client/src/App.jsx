import { useState, useEffect } from "react";
import { Languages } from "./languages";
import { toast, Toaster } from "react-hot-toast";
import { Copy, Mic, Trash2, Volume2, Sun, Moon, RefreshCw } from "lucide-react";
import { Particles } from "@tsparticles/react";
import { loadSlim } from "tsparticles-slim";

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fromLang, setFromLang] = useState("en");
  const [toLang, setToLang] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";

  const [voices, setVoices] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);


  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      if (allVoices.length > 0) setVoices(allVoices);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    // Setup speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = fromLang;
      recog.continuous = false;
      recog.interimResults = false;

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
        toast.success("🎙️ Voice captured!");
      };

      recog.onerror = (event) => {
        toast.error("❌ Mic error: " + event.error);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      toast.error("Speech recognition not supported in this browser.");
    }
  }, [fromLang]);


  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  async function handleTranslate() {
    setLoading(true);
    try {
      const res = await fetch("https://polyglow.onrender.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: input,
          source: fromLang,
          target: toLang,
          format: "text",
        }),
      });
      const data = await res.json();
      setOutput(data.translatedText);
    } catch (err) {
      setOutput("⚠️ Error translating text.");
    }
    setLoading(false);
  }

  function swapLanguages() {
    setFromLang(toLang);
    setToLang(fromLang);
    setInput(output);
    setOutput("");
  }

  function copyToClipboard() {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success("✅ Translation copied!");
    }
  }

  function speakText() {
    if (!output) return;

    const utterance = new SpeechSynthesisUtterance(output);
    const match = voices.find((v) =>
      v.lang.toLowerCase().startsWith(toLang.toLowerCase())
    );

    if (match) utterance.voice = match;
    utterance.lang = match?.lang || "en-US";

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };
  function handleMic() {
    if (!recognition) {
      toast.error("Speech Recognition not available.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.lang = fromLang;
      recognition.start();
      setIsListening(true);
    }
  }


  return (
    <div className={`relative`}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: isDark ? "#0f0c29" : "#f5e9ff",
            },
          },
          particles: {
            number: {
              value: 40,
              density: {
                enable: true,
                area: 800,
              },
            },
            color: {
              value: isDark ? "#d8b4fe" : "#a855f7",
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.5,
            },
            size: {
              value: { min: 1, max: 5 },
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              outModes: {
                default: "out",
              },
            },
          },
          fullScreen: {
            enable: true,
            zIndex: -1,
          },
        }}
      />

      <div
        className={`min-h-screen w-screen overflow-auto p-6 transition-colors duration-500 ${isDark
            ? "bg-gradient-to-tr from-[#0a0014] via-[#120027] to-[#1e0038] text-white"
            : "bg-gradient-to-tr from-[#f3e8ff] via-[#ede9fe] to-[#f5f3ff] text-black"
          }`}
      >
        <Toaster position="bottom-right" />
        <header className="flex justify-between items-center mb-4">
          <h1 className="ml-10 text-xl md:text-2xl font-bold">🌐PolyGlow</h1>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full mr-9 ${isDark
                    ? "bg-gray-900 text-white border-gray-700  hover:shadow-glow"
                    : "bg-white text-black border-gray-300  hover:shadow-glow"
                  }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div
          className={`rounded-3xl shadow-2xl space-y-8 p-10 transition-all duration-500 ${isDark ? "bg-[#2e1065]/80 backdrop-blur-xl" : "bg-white/90"
            }`}
        >
          {/* Language Selectors */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm mb-1">From</label>
              <select
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
                className={`w-full p-3 rounded-xl border ${isDark
                    ? "bg-gray-900 text-white border-gray-700  hover:shadow-glow"
                    : "bg-white text-black border-gray-300  hover:shadow-glow"
                  }`}
              >
                {Languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-7 md:mt-5">
              <button
                onClick={swapLanguages}
                className={`p-2 rounded-lg border shadow-md ${isDark
                    ? "bg-purple-900 text-white border-purple-800 hover:bg-purple-700  hover:shadow-glow"
                    : "bg-purple-200 text-black border-purple-300 hover:bg-purple-300  hover:shadow-glow "
                  }`}
                title="Swap languages"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-sm mb-1">To</label>
              <select
                value={toLang}
                onChange={(e) => setToLang(e.target.value)}
                className={`w-full p-3 rounded-xl border ${isDark
                    ? "bg-gray-900 text-white border-gray-700  hover:shadow-glow"
                    : "bg-white text-black border-gray-300  hover:shadow-glow"
                  }`}
              >
                {Languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Input/Output Sections */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Input */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm">Input Text</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleMic}
                    className={`p-2 rounded-md border ${isDark
                        ? isListening
                          ? "bg-purple-700 border-purple-500  hover:shadow-glow"
                          : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700  hover:shadow-glow"
                        : isListening
                          ? "bg-purple-200 border-purple-400  hover:shadow-glow"
                          : "bg-pink-100 text-black border-pink-300 hover:bg-pink-200  hover:shadow-glow"
                      }`}
                    title={isListening ? "Stop Listening" : "Start Listening"}
                  >
                    <Mic size={16} />
                  </button>

                  <button
                    onClick={() => setInput("")}
                    className={`p-2 rounded-md border ${isDark
                        ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700  hover:shadow-glow"
                        : "bg-purple-100 text-black border-purple-300 hover:bg-purple-200  hover:shadow-glow"
                      }`}
                    title="Clear Text"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <textarea
                className={`w-full h-56 p-4 rounded-xl resize-none focus:outline-none focus:ring-2 border ${isDark
                    ? "bg-gray-900 text-white focus:ring-purple-500 border-gray-700  hover:shadow-glow"
                    : "bg-white text-black focus:ring-purple-400 border-purple-300  hover:shadow-glow"
                  }`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to translate..."
              />
            </div>

            {/* Output */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm">Translation</label>
                <div className="flex gap-2">
                  <button
                    onClick={speakText}
                    className={`p-2 rounded-md border ${isDark
                        ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700  hover:shadow-glow"
                        : "bg-purple-100 text-black border-purple-300 hover:bg-purple-200  hover:shadow-glow"
                      }`}
                    title="Speak"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className={`p-2 rounded-md border ${isDark
                        ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700  hover:shadow-glow"
                        : "bg-purple-100 text-black border-purple-300 hover:bg-purple-200  hover:shadow-glow"
                      }`}
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <textarea
                className={`w-full h-56 p-4 rounded-xl resize-none focus:outline-none focus:ring-2 border ${isDark
                    ? "bg-gray-900 text-white focus:ring-purple-500 border-gray-700  hover:shadow-glow"
                    : "bg-white text-black focus:ring-purple-400 border-purple-300  hover:shadow-glow"
                  }`}
                readOnly
                value={output}
                placeholder="Translation will appear here..."
              />
            </div>
          </div>

          {/* Translate Button */}
          <button
            className={`w-full mt-4 font-semibold py-3 rounded-xl text-lg shadow-xl border ${isDark
                ? "bg-purple-700 hover:bg-purple-800 text-white border-purple-500  hover:shadow-glow"
                : "bg-purple-500 hover:bg-purple-600 text-white border-purple-400  hover:shadow-glow"
              }`}
            onClick={handleTranslate}
            disabled={loading}
          >
            {loading ? "Translating..." : "Translate"}
          </button>
        </div>
        <footer
  className={`w-full mt-10 text-center py-6 rounded-2xl shadow-inner transition-colors duration-500 ${
    isDark
      ? "bg-[#1f002d] text-gray-300"
      : "bg-[#f3e8ff] text-gray-700"
  }`}
>
  <p className="text-sm">
    🌐 Built with 💜 by Shreya | © {new Date().getFullYear()} PolyGlow
  </p>
</footer>

      </div>
    </div>
  );
}
