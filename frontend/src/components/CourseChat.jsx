import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, doubtsAPI } from '../services/api';
import { X, Send, MessageSquare } from 'lucide-react';

export default function CourseChat({ courseId, course = null, topic = null, visible: initialVisible = false, onClose, inline = false, side = false }) {
  const [visible, setVisible] = useState(initialVisible);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    setVisible(initialVisible);
  }, [initialVisible]);

  useEffect(() => {
    // Load history when opened or when topic changes
    if (visible) {
      // If a topic is provided, load doubts history scoped to that topic
      if (topic && topic.title) {
        doubtsAPI.getMyDoubts({ topic: topic.title }).then(res => {
          const doubts = res.data.doubts || [];
          const msgs = [];
          // Map doubts for this topic into chat messages (ordered oldest->newest)
          doubts.slice().reverse().forEach(d => {
            msgs.push({ role: 'user', content: d.question });
            if (d.answer) msgs.push({ role: 'assistant', content: d.answer });
          });
          setMessages(msgs);
        }).catch(() => setMessages([]));
      } else if (course || courseId) {
        // If no topic, fall back to course-level doubts
        doubtsAPI.getMyDoubts({ subject: course?.subject }).then(res => {
          const doubts = res.data.doubts || [];
          const msgs = [];
          doubts.slice().reverse().forEach(d => {
            msgs.push({ role: 'user', content: d.question });
            if (d.answer) msgs.push({ role: 'assistant', content: d.answer });
          });
          setMessages(msgs);
        }).catch(() => setMessages([]));
      } else {
        chatAPI.getHistory().then(res => setMessages(res.data.messages || [])).catch(() => setMessages([]));
      }
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [visible, course, courseId, topic]);

  const scrollToBottom = () => {
    try { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; } catch (_) { }
  };

  const handleSend = async () => {
    const text = (input || '').trim();
    if (!text) return;
    // Client-side validation for doubt question length
    if ((course || topic || courseId) && text.length < 10) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Please enter a question with at least 10 characters.' }
      ]);
      return;
    }
    setLoading(true);
    try {
      // Optimistic UI
      const userMsg = { role: 'user', content: text };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      scrollToBottom();

      // If we have course/topic context, use doubts RAG endpoint to get material-backed answers
      if (course || topic || courseId) {
        const payload = { question: text };
        if (course?.subject) payload.subject = course.subject;
        if (topic?.title) payload.topic = topic.title;
        const res = await doubtsAPI.submit(payload);
        const d = res.data.doubt;
        const ans = d?.answer || 'No answer received.';
        setMessages(prev => [...prev, { role: 'assistant', content: ans }]);
      } else {
        const res = await chatAPI.sendMessage(text);
        const assistant = res.data.assistantMessage;
        if (assistant) {
          setMessages(prev => [...prev, { role: 'assistant', content: assistant.content }]);
        }
      }
      scrollToBottom();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get a reply. Try again later.' }]);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  // For side panel we render the container so we can animate open/close.
  if (!visible && !side) return null;

  // Choose layout: modal (default) or inline panel
  if (inline) {
    return (
      <div className="w-full max-w-2xl pointer-events-auto p-4">
        <div className="rounded-2xl bg-white shadow-lg ring-1 ring-[#e2e8f0] overflow-hidden flex flex-col" style={{ height: '60vh' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#4338ca]" />
              <h3 className="text-sm font-semibold">Topic AI Chat</h3>
              <span className="text-xs text-[#94a3b8] ml-2">{topic?.title ? `Topic: ${topic.title}` : 'Ask questions about this topic'}</span>
            </div>
            <div>
              <button onClick={() => { setVisible(false); if (onClose) onClose(); }} className="rounded-full p-2 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-white">

            {messages.length === 0 && (
              <div className="text-center text-sm text-[#94a3b8]">No messages yet — ask anything about this topic.</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`max-w-full ${m.role === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                <div className={`inline-block px-4 py-2 rounded-2xl ${m.role === 'user' ? 'bg-[#4338ca] text-white' : 'bg-[#f1f5f9] text-[#0f172a]'}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} className="flex-1 rounded-full border px-4 py-2 text-sm" placeholder="Type your question about this topic..." />
              <button onClick={handleSend} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-[#4338ca] px-3 py-2 text-white text-sm">
                <Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (side) {
    return (
      <div className={`fixed inset-0 z-[9999] pointer-events-auto flex justify-end ${visible ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          onClick={() => { setVisible(false); if (onClose) onClose(); }}
          className={`absolute inset-0 bg-black/40 transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Panel */}
        <div className={`relative w-96 p-4 h-full transform transition-transform ${visible ? 'translate-x-0' : 'translate-x-full'}`} style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          <div className="rounded-2xl bg-white shadow-lg ring-1 ring-[#e2e8f0] overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#4338ca]" />
                <h3 className="text-sm font-semibold">Topic AI Chat</h3>
                <span className="text-xs text-[#94a3b8] ml-2">{topic?.title ? `Topic: ${topic.title}` : 'Ask questions'}</span>
              </div>
              <div>
                <button onClick={() => { setVisible(false); if (onClose) onClose(); }} className="rounded-full p-2 hover:bg-gray-50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-white">
              {messages.length === 0 && (
                <div className="text-center text-sm text-[#94a3b8]">No messages yet — ask anything about the topic.</div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`max-w-full ${m.role === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded-2xl ${m.role === 'user' ? 'bg-[#4338ca] text-white' : 'bg-[#f1f5f9] text-[#0f172a]'}`}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t bg-white">
              <div className="flex items-center gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} className="flex-1 rounded-full border px-4 py-2 text-sm" placeholder="Type your question about this topic..." />
                <button onClick={handleSend} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-[#4338ca] px-3 py-2 text-white text-sm">
                  <Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-6 bottom-6 z-[9999] pointer-events-auto">
      <div className="w-96 pointer-events-auto p-4">
        <div className="rounded-2xl bg-white shadow-lg ring-1 ring-[#e2e8f0] overflow-hidden flex flex-col" style={{ height: '70vh', width: '24rem' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#4338ca]" />
              <h3 className="text-sm font-semibold">Topic AI Chat</h3>
              <span className="text-xs text-[#94a3b8] ml-2">{topic?.title ? `Topic: ${topic.title}` : 'Ask questions'}</span>
            </div>
            <div>
              <button onClick={() => { setVisible(false); if (onClose) onClose(); }} className="rounded-full p-2 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-white">
            {messages.length === 0 && (
              <div className="text-center text-sm text-[#94a3b8]">No messages yet — ask anything about the course.</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`max-w-full ${m.role === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                <div className={`inline-block px-4 py-2 rounded-2xl ${m.role === 'user' ? 'bg-[#4338ca] text-white' : 'bg-[#f1f5f9] text-[#0f172a]'}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} className="flex-1 rounded-full border px-4 py-2 text-sm" placeholder="Type your question here..." />
              <button onClick={handleSend} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-[#4338ca] px-3 py-2 text-white text-sm">
                <Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
