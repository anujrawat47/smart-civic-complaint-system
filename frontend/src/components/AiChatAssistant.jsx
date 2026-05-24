import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AiChatAssistant() {
  const { t, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    {
      role: 'model',
      text: currentLanguage === 'hi' 
        ? 'नमस्ते! मैं सिविकरिजॉल्व एआई हूं। मैं शिकायतों की श्रेणियों का सुझाव देने, शिकायतों को दर्ज करने और नागरिक मामलों में आपकी सहायता कर सकता हूं। मैं आज आपकी क्या सहायता कर सकता हूं?'
        : 'Hello! I am CivicResolve AI, your smart municipal helper. I can suggest complaint categories, explain how to file complaints, or help you track current issues. How can I help you today?'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Update initial message language if the user changes language and no chat has happened yet
  useEffect(() => {
    if (history.length === 1) {
      setHistory([
        {
          role: 'model',
          text: currentLanguage === 'hi'
            ? 'नमस्ते! मैं सिविकरिजॉल्व एआई हूं। मैं शिकायतों की श्रेणियों का सुझाव देने, शिकायतों को दर्ज करने और नागरिक मामलों में आपकी सहायता कर सकता हूं। मैं आज आपकी क्या सहायता कर सकता हूं?'
            : 'Hello! I am CivicResolve AI, your smart municipal helper. I can suggest complaint categories, explain how to file complaints, or help you track current issues. How can I help you today?'
        }
      ]);
    }
  }, [currentLanguage]);

  // Scroll to bottom whenever history updates or chat opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    // Add user message to history
    const updatedHistory = [...history, { role: 'user', text }];
    setHistory(updatedHistory);
    setMessage('');
    setLoading(true);

    try {
      // Exclude system/initial message from API history to let backend prompt-engineer clean
      const apiHistory = updatedHistory
        .slice(1) // Remove initial welcome message
        .map(h => ({
          role: h.role, // 'user' or 'model'
          text: h.text
        }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: apiHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistory(prev => [...prev, { role: 'model', text: data.response }]);
        } else {
          setHistory(prev => [...prev, { role: 'model', text: currentLanguage === 'hi' ? 'क्षमा करें, प्रतिक्रिया उत्पन्न करने में विफल रहा।' : 'Sorry, I failed to generate a response: ' + data.error }]);
        }
      } else {
        setHistory(prev => [...prev, { role: 'model', text: currentLanguage === 'hi' ? 'सर्वर से कनेक्ट होने में विफल।' : 'Could not connect to the AI service. Please try again.' }]);
      }
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'model', text: currentLanguage === 'hi' ? 'नेटवर्क त्रुटि!' : 'Network error. Please verify your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickTriggers = currentLanguage === 'hi' ? [
    { label: 'गड्ढों की रिपोर्ट कैसे करें?', prompt: 'सड़क के गड्ढों की रिपोर्ट करने के लिए किस श्रेणी और प्राथमिकता का उपयोग करना चाहिए?' },
    { label: 'सीवेज रिसाव?', prompt: 'मेरे घर के पास सीवेज का पानी रिस रहा है। इसे कैसे दर्ज करूँ?' },
    { label: 'शिकायत का स्तर?', prompt: 'नागरिक शिकायतों के लिए प्राथमिकता स्तर (Priority Level) क्या हैं?' }
  ] : [
    { label: 'How to file potholes?', prompt: 'What category and priority should I use to report road damage and potholes?' },
    { label: 'Sewage leakage?', prompt: 'There is sewage water leaking near my house. How do I file it?' },
    { label: 'What is CivicResolve?', prompt: 'Can you explain how CivicResolve works and what it does?' }
  ];

  const resetChat = () => {
    setHistory([
      {
        role: 'model',
        text: currentLanguage === 'hi'
          ? 'नमस्ते! मैंने बातचीत रीसेट कर दी है। आज मैं आपकी क्या सहायता कर सकता हूँ?'
          : 'Hello! I have reset our conversation. How can I help you today?'
      }
    ]);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="card-glass" style={{
          width: '380px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          marginBottom: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.25s ease-out',
          zIndex: 1001,
          border: '1px solid var(--border-glass)'
        }}>
          
          {/* Header */}
          <div style={{
            background: 'var(--gradient-primary)',
            padding: '16px',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>CivicResolve AI</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85 }}>
                  {currentLanguage === 'hi' ? 'नगरपालिका सहायक' : 'Municipal Smart Assistant'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={resetChat} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85 }} title="Reset Chat">
                <RefreshCw size={15} />
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85 }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Logs Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'rgba(11, 15, 25, 0.4)'
          }}>
            {history.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  gap: '8px',
                  maxWidth: '85%'
                }}>
                  {!isUser && (
                    <div style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      <Bot size={14} />
                    </div>
                  )}
                  <div style={{
                    background: isUser ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: isUser ? '#fff' : 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    border: isUser ? 'none' : '1px solid var(--border-glass)',
                    boxShadow: 'var(--shadow-sm)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                  {isUser && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      <User size={14} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignSelf: 'flex-start', gap: '8px', maxWidth: '85%' }}>
                <div style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}>
                  <Bot size={14} />
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <Loader2 className="spinner" size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  {currentLanguage === 'hi' ? 'सोच रहा हूँ...' : 'Typing...'}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Triggers Chips */}
          {history.length < 5 && !loading && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              padding: '10px 12px',
              background: 'rgba(11, 15, 25, 0.6)',
              borderTop: '1px solid var(--border-glass)'
            }}>
              {quickTriggers.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(t.prompt)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: 'var(--primary)',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input Bar */}
          <div style={{
            display: 'flex',
            padding: '12px',
            borderTop: '1px solid var(--border-glass)',
            background: 'var(--bg-secondary)',
            gap: '8px'
          }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={currentLanguage === 'hi' ? 'कोई सवाल पूछें...' : 'Ask a question...'}
              style={{
                flex: 1,
                background: 'rgba(11, 15, 25, 0.6)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !message.trim()}
              style={{
                background: 'var(--gradient-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (loading || !message.trim()) ? 0.5 : 1
              }}
            >
              <Send size={14} />
            </button>
          </div>

        </div>
      )}

      {/* Floating Action Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
