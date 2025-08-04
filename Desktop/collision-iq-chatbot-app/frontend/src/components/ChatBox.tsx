'use client';

import { useState } from 'react';

export default function ChatBox() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: 'bot', content: data.reply }]);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Collision Academy Chatbot</h2>
      <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <span className="inline-block px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-sm text-gray-500">Typing...</p>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
