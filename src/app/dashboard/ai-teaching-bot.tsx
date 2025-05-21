"use client";
import { useState, useRef, useEffect } from "react";
import { FiClock, FiX } from "react-icons/fi";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface ChatHistory {
  id: string;
  messages: Message[];
  lastMessage: string;
  timestamp: string;
}

const COHERE_API_KEY = "ZKMxV3lOJOeFwGOxWAbJwFZBrWmP96Y38AYyKyS7";

export default function AiTeachingBot({ token }: { token?: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages
        .slice(-5) // Keep last 5 messages for context
        .map((m) => `${m.sender === "user" ? "Human" : "Assistant"}: ${m.text}`)
        .join("\n");

      const prompt = `You are an AI teaching assistant helping students with their studies. 
Previous conversation:
${conversationHistory}
Human: ${input}
Assistant:`;

      const response = await fetch("https://api.cohere.ai/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${COHERE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "command-r-plus",
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.7,
          k: 0,
          stop_sequences: ["Human:"],
          return_likelihoods: "NONE",
          num_generations: 1,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to get response from AI");
      }

      const botReply = data.generations?.[0]?.text?.trim() || "I apologize, but I couldn't generate a response at this time.";

      const botMessage: Message = {
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString(),
      };

      const newMessages: Message[] = [...messages, userMessage, botMessage];
      setMessages(newMessages);

      // Save to chat history
      const newHistory: ChatHistory = {
        id: Date.now().toString(),
        messages: newMessages,
        lastMessage: input,
        timestamp: new Date().toLocaleString(),
      };
      setChatHistories(prev => [newHistory, ...prev]);
    } catch (error) {
      console.error("Error in AI response:", error);
      const errorMessage: Message = {
        sender: "bot",
        text: "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 min-h-[500px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Primal</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <FiClock />
          {showHistory ? "Hide History" : "View History"}
        </button>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto mb-4 border rounded p-3 bg-gray-50">
          {chatHistories.length === 0 ? (
            <div className="text-gray-400 text-center">No chat history yet</div>
          ) : (
            <div className="space-y-2">
              {chatHistories.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => loadChatHistory(history)}
                  >
                    <div className="font-medium text-gray-800 truncate">
                      {history.lastMessage}
                    </div>
                    <div className="text-xs text-gray-500">
                      {history.timestamp}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteChatHistory(history.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center">
            <p className="mb-2">👋 {getGreeting()} I'm Primal, your AI teaching assistant.</p>
            <p>I can help you with:</p>
            <ul className="list-disc list-inside text-left mt-2">
              <li>Explaining difficult concepts</li>
              <li>Answering study-related questions</li>
              <li>Providing learning resources</li>
              <li>Helping with homework problems</li>
            </ul>
          </div>
        )}
        {messages.map((msg, idx) => (
            <div key={idx} className={`mb-4 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.sender === "user" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-xs mt-1 ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                  {msg.timestamp}
                </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ask me anything about your studies..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
} 