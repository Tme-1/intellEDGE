"use client";
import { useState, useRef, useEffect } from "react";
import { FiClock, FiX, FiMic, FiMicOff, FiVolume2, FiVolumeX } from "react-icons/fi";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface ChatHistory {
  id: string;
  date: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  timestamp: string;
}

const GEMINI_API_KEY = "AIzaSyD95GsOoKvAOxjrpQH7mZ1osE6HK58gOPg";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export default function AiTeachingBot({ token }: { token?: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          
          setInput(transcript);

          // Reset silence timer on new speech
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Set new silence timer
          silenceTimerRef.current = setTimeout(() => {
            if (isListening) {
              recognitionRef.current.stop();
              if (transcript.trim()) {
                handleSend();
              }
            }
          }, 10000); // Stop after 10 seconds of silence
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Handle specific error cases
          switch (event.error) {
            case 'no-speech':
              // Don't show an error for no-speech, just stop listening
              break;
            case 'audio-capture':
              alert('No microphone was found. Please ensure that a microphone is installed and working.');
              break;
            case 'not-allowed':
              alert('Permission to use microphone was denied. Please allow microphone access to use voice input.');
              break;
            case 'network':
              alert('Network error occurred. Please check your internet connection.');
              break;
            default:
              console.error('Speech recognition error:', event.error);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
        };
      }
    }

    // Cleanup
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [isListening]);

  // Load chat histories from localStorage on component mount
  useEffect(() => {
    const savedHistories = localStorage.getItem('chatHistories');
    if (savedHistories) {
      setChatHistories(JSON.parse(savedHistories));
    }
  }, []);

  // Save chat histories to localStorage whenever they change
  useEffect(() => {
    if (chatHistories.length > 0) {
      localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
    }
  }, [chatHistories]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use a modern browser like Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Error starting voice input. Please try again.');
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!synthesisRef.current) return;

    // Stop any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!input.trim()) return;
    
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

      const conversationHistory = messages
        .slice(-5)
        .map((m) => `${m.sender === "user" ? "Human" : "Assistant"}: ${m.text}`)
        .join("\n");

      let prompt = `You are Primal, an AI teaching assistant helping students with their studies. 
Previous conversation:
${conversationHistory}
Human: ${userMessage.text}
Assistant:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botReply = response.text().trim() || "I apologize, but I couldn't generate a response at this time.";

      const botMessage: Message = {
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString(),
      };

      const newMessages: Message[] = [...messages, userMessage, botMessage];
      setMessages(newMessages);
      speakText(botReply);

      // Group conversations by date
      const today = new Date().toLocaleDateString();
      const existingHistory = chatHistories.find(h => h.date === today);
      
      if (existingHistory) {
        // Update existing history for today
        const updatedHistory = {
          ...existingHistory,
          messages: [...existingHistory.messages, userMessage, botMessage],
          lastMessage: userMessage.text,
          timestamp: new Date().toLocaleString(),
        };
        setChatHistories(prev => prev.map(h => h.id === existingHistory.id ? updatedHistory : h));
      } else {
        // Create new history for today
        const newHistory: ChatHistory = {
          id: Date.now().toString(),
          date: today,
          title: `Conversation - ${today}`,
          messages: newMessages,
          lastMessage: userMessage.text,
          timestamp: new Date().toLocaleString(),
        };
        setChatHistories(prev => [newHistory, ...prev]);
      }
    } catch (error: any) {
      console.error("Error in AI response:", error);
      const errorMessage: Message = {
        sender: "bot",
        text: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = (history: ChatHistory) => {
    setMessages(history.messages);
    setShowHistory(false);
  };

  const deleteChatHistory = (id: string) => {
    setChatHistories(prev => prev.filter(history => history.id !== id));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Primal</h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showHistory ? "Back to Chat" : "View History"}
            </button>
          </div>

          {showHistory ? (
            <div className="h-[500px] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Chat History</h3>
              <div className="space-y-4">
                {chatHistories.map((history) => (
                  <div
                    key={history.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      loadChatHistory(history);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-800">{history.title}</h4>
                          <span className="text-xs text-gray-500">({history.timestamp})</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{history.lastMessage}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatHistory(history.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))}
                {chatHistories.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No chat history available
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="h-[500px] overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                    <p className="text-xl font-semibold">{getGreeting()}</p>
                    <p className="text-center max-w-md">
                      I'm Primal, your AI teaching assistant. I can help you with:
                    </p>
                    <ul className="list-disc list-inside text-left space-y-2">
                      <li>Answering questions about your courses</li>
                      <li>Explaining complex concepts</li>
                      <li>Providing study tips and resources</li>
                      <li>Helping with homework and assignments</li>
                      <li>Practicing through interactive discussions</li>
                    </ul>
                    <p className="text-sm mt-4">
                      Type your question or click the microphone icon to start speaking.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${
                        message.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-lg ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white transition-colors`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <FiMicOff /> : <FiMic />}
                </button>
                <button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : () => speakText(messages[messages.length - 1]?.text || "")}
                  className={`p-2 rounded-lg ${
                    isSpeaking
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white transition-colors`}
                  title={isSpeaking ? "Stop speaking" : "Speak last message"}
                >
                  {isSpeaking ? <FiVolumeX /> : <FiVolume2 />}
                </button>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`p-2 rounded-lg ${
                    loading || !input.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white transition-colors`}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 