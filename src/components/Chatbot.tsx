import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const INITIAL_MESSAGE = "Bonjour ! Je suis l'assistant BRB Auto Pro. Avez-vous une question sur nos véhicules, nos services d'importation, ou le detailing ?";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const contents = [
        "Tu es un assistant virtuel pour BRB Auto Pro, un concessionnaire automobile et centre de detailing situé à Nîmes.",
        "Tu dois répondre de manière professionnelle, experte et passionnée. Tu aides les clients avec l'import de véhicules (surtout d'Allemagne), l'achat/vente de voitures d'occasion, et les services de nettoyage et detailing.",
        "Sois concis, courtois et utilise un ton expert.",
        ...messages.map((m) => `${m.role === "assistant" ? "Assistant:" : "Client:"} ${m.content}`),
        `Client: ${userMessage}`
      ].join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
      });

      if (response.text) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.text }]);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, je rencontre des difficultés techniques. Veuillez nous contacter par téléphone au 04 66 00 00 00." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover hover:scale-105 transition-all duration-300 z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Ouvrir le chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-anthracite text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-heading font-bold text-sm">Assistant BRB</h3>
                <p className="text-xs text-gray-400">En ligne</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 min-h-80 bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-anthracite" : "bg-primary"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div 
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === "user" 
                      ? "bg-anthracite-light text-white rounded-tr-none" 
                      : "bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-3 bg-white border border-gray-200 shadow-sm rounded-lg rounded-tl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input block */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary text-white p-2 rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
