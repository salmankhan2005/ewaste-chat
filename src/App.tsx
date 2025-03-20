import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Camera } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ImageUpload } from './components/ImageUpload';
import { getChatResponse } from './lib/gemini';
import type { Message, ChatState } from './types';

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });
  const [input, setInput] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));
    setInput('');

    try {
      const response = await getChatResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error:', error);
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleImageAnalysis = async (prompt: string) => {
    try {
      // Hide image upload UI
      setShowImageUpload(false);
      setInput('');

      // Set loading state
      setChatState(prev => ({
        ...prev,
        isLoading: true,
      }));

      // Get analysis from Gemini
      const response = await getChatResponse(prompt);
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error:', error);
      setChatState(prev => ({ ...prev, isLoading: false }));
      // Show error to user
      alert('Error getting response. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">E-Waste Management Assistant</h1>
          <p className="text-gray-600">Ask me anything about electronic waste disposal and recycling</p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div className="flex-1 bg-white rounded-lg shadow-md p-4 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {chatState.messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {chatState.isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
            {showImageUpload && (
              <div className="my-4">
                <ImageUpload onAnalysisComplete={handleImageAnalysis} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about e-waste management..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={chatState.isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;