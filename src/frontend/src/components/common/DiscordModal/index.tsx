import { useState, useEffect, useRef } from 'react';
import useAuthStore from '@/stores/authStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DiscordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatMessage {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    is_guest: boolean;
    avatar_url?: string | null;
    image_data?: string | null;
}

const V1_API_URL = "https://agents.jingconsult.online";

export default function DiscordModal({ isOpen, onClose }: DiscordModalProps) {
    const userData = useAuthStore((state) => state.userData);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [guestName, setGuestName] = useState('');
    const [pastedImage, setPastedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [chatError, setChatError] = useState('');
    const [showImageDelete, setShowImageDelete] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize guest name on mount/open
    useEffect(() => {
        if (isOpen) {
            if (userData?.username) {
                let coreName = userData.username;
                if (coreName.startsWith('Guest-')) {
                    coreName = coreName.substring(6);
                }
                if (coreName && coreName.length > 0) {
                    coreName = coreName.charAt(0).toUpperCase() + coreName.slice(1);
                }

                const name = `Guest-${coreName}`;
                if (guestName !== name) {
                    setGuestName(name);
                }
            } else if (!guestName) {
                const storedGuest = localStorage.getItem('guest_name');
                if (storedGuest) {
                    setGuestName(storedGuest);
                } else {
                    const newGuest = `Guest-${Math.floor(Math.random() * 9000) + 1000}`;
                    localStorage.setItem('guest_name', newGuest);
                    setGuestName(newGuest);
                }
            }
        }
    }, [isOpen, userData, guestName]);

    // Polling for messages
    useEffect(() => {
        if (!isOpen) return;

        const fetchMessages = async () => {
            try {
                const query = guestName ? `?guest_name=${encodeURIComponent(guestName)}` : '';
                const res = await fetch(`/api/guest-chat/history${query}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(prev => {
                        if (data.length > 0) {
                            const lastMsg = data[data.length - 1];
                            if (lastMsg && lastMsg.author !== guestName) {
                                setIsThinking(false);
                            }
                        }
                        return data;
                    });
                    setChatError('');
                }
            } catch (err) {
                console.error("Poll error", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);

        return () => clearInterval(interval);
    }, [isOpen, guestName]);

    // Auto-scroll to bottom on new messages or thinking status
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, isThinking, isOpen]);

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const result = event.target?.result as string;
                        setPastedImage(result);
                    };
                    reader.readAsDataURL(blob);
                    break;
                }
            }
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() && !pastedImage) return;

        const contentToSend = inputText;
        const imageToSend = pastedImage;
        const tempId = `temp-${Date.now()}`;

        setMessages(prev => [
            ...prev,
            {
                id: tempId,
                author: guestName,
                content: contentToSend,
                image_data: imageToSend,
                timestamp: new Date().toISOString(),
                is_guest: true
            }
        ]);

        setIsThinking(true);
        setInputText('');
        setPastedImage(null);
        setIsLoading(true);

        try {
            const res = await fetch(`${V1_API_URL}/api/guest-chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: contentToSend,
                    guest_name: guestName,
                    image_data: imageToSend
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                setChatError(err.detail || 'Failed to send message');
                setIsThinking(false);
            }
        } catch (err) {
            setChatError('Network error sending message');
            setIsThinking(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998,
                    backdropFilter: 'blur(4px)',
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e0e0e0',
                    width: 'calc(100% - 32px)',
                    maxWidth: 800,
                    height: '80vh',
                    zIndex: 9999,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: '#333',
                    textAlign: 'left'
                }}
            >
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: '#5865F2', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 'bold'
                        }}>
                            JC
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, color: '#1a1a1a' }}>#jc-support</h3>
                            <div style={{ fontSize: 12, color: '#666', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                Chatting as <b style={{ fontWeight: 700 }}>{guestName}</b> with <b style={{ fontWeight: 700 }}>Jimmy - JC AI Assistant</b>
                                <img
                                    src="/jimmy-logo.png"
                                    alt="Jimmy"
                                    style={{ height: 16, width: 'auto', display: 'inline-block', verticalAlign: 'middle' }}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            fontSize: 20,
                            color: '#666',
                            cursor: 'pointer',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            padding: 0
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
                            Loading history or channel is empty...
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isMe = msg.author === guestName;
                        return (
                            <div key={msg.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    fontSize: 11, color: '#888', marginBottom: 4,
                                    marginLeft: isMe ? 0 : 4, marginRight: isMe ? 4 : 0,
                                    display: 'flex', alignItems: 'center', gap: 4
                                }}>
                                    {!isMe && (msg.author === 'Jimmy' || msg.author === 'Clawdbot' || !msg.is_guest) && (
                                        <img
                                            src="/jimmy-logo.png"
                                            alt="Jimmy"
                                            style={{ height: 14, width: 'auto' }}
                                        />
                                    )}
                                    <span style={{
                                        fontWeight: 800,
                                        color: (msg.author === 'Jimmy' || msg.author === 'Clawdbot') ? '#333' : '#1a1a1a'
                                    }}>
                                        {msg.author === 'Clawdbot' ? 'Jimmy' : msg.author}
                                    </span>
                                    {' • '}
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '10px 14px',
                                    borderRadius: 16,
                                    borderTopLeftRadius: !isMe ? 4 : 16,
                                    borderTopRightRadius: isMe ? 4 : 16,
                                    backgroundColor: isMe ? '#5865F2' : '#f1f1f1',
                                    color: isMe ? 'white' : '#1a1a1a',
                                    fontSize: 14,
                                    lineHeight: 1.4,
                                    wordBreak: 'break-word',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: msg.image_data ? 10 : 0
                                }}>
                                    {msg.image_data && (
                                        <img
                                            src={msg.image_data}
                                            alt="Attachment"
                                            style={{
                                                height: 32,
                                                width: 32,
                                                objectFit: 'cover',
                                                borderRadius: 4,
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                flexShrink: 0
                                            }}
                                        />
                                    )}
                                    <div className={`markdown-content ${isMe ? 'text-white' : 'text-gray-900'}`} style={{
                                        flex: 1,
                                        minWidth: 0,
                                        width: '100%',
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'break-word'
                                    }}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ node, ...props }: any) => <p style={{ margin: 0, marginBottom: 4 }} {...props} />,
                                                a: ({ node, ...props }: any) => <a style={{ color: isMe ? '#cce5ff' : '#0066cc', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" {...props} />,
                                                code: ({ node, ...props }: any) => <code style={{ backgroundColor: isMe ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.9em' }} {...props} />,
                                                pre: ({ node, ...props }: any) => <pre style={{ backgroundColor: isMe ? 'rgba(0,0,0,0.2)' : '#e5e5e5', padding: 8, borderRadius: 8, overflowX: 'auto', margin: '4px 0' }} {...props} />,
                                                ul: ({ node, ...props }: any) => <ul style={{ margin: '4px 0', paddingLeft: 20 }} {...props} />,
                                                ol: ({ node, ...props }: any) => <ol style={{ margin: '4px 0', paddingLeft: 20 }} {...props} />,
                                                li: ({ node, ...props }: any) => <li style={{ margin: '2px 0' }} {...props} />,
                                                blockquote: ({ node, ...props }: any) => <blockquote style={{ borderLeft: `4px solid ${isMe ? 'rgba(255,255,255,0.4)' : '#ccc'}`, margin: '4px 0', paddingLeft: 8, fontStyle: 'italic' }} {...props} />,
                                                h1: ({ node, ...props }: any) => <h1 style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '4px 0' }} {...props} />,
                                                h2: ({ node, ...props }: any) => <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', margin: '4px 0' }} {...props} />,
                                                h3: ({ node, ...props }: any) => <h3 style={{ fontSize: '1em', fontWeight: 'bold', margin: '4px 0' }} {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isThinking && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }}>
                            <div style={{
                                padding: '10px 14px',
                                borderRadius: 16,
                                borderTopLeftRadius: 4,
                                backgroundColor: '#f1f1f1',
                                color: '#666',
                                fontSize: 13,
                                fontStyle: 'italic',
                                maxWidth: '80%'
                            }}>
                                <span style={{ fontWeight: 600 }}>Jimmy</span> is thinking...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {chatError && (
                    <div style={{ padding: '8px 16px', background: '#ffebee', color: '#c62828', fontSize: 13, textAlign: 'center' }}>
                        {chatError}
                    </div>
                )}

                <div style={{
                    padding: 16,
                    borderTop: '1px solid #eee',
                    backgroundColor: '#f9f9f9'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: 10,
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: '0 12px',
                        alignItems: 'center',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                        height: 48,
                        boxSizing: 'border-box',
                    }}>
                        {pastedImage && (
                            <div
                                onMouseEnter={() => setShowImageDelete(true)}
                                onMouseLeave={() => setShowImageDelete(false)}
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    height: 32,
                                    width: 32,
                                }}
                            >
                                <img
                                    src={pastedImage}
                                    alt="Pasted"
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 4,
                                        border: '1px solid #eee'
                                    }}
                                />
                                {showImageDelete && (
                                    <button
                                        onClick={() => setPastedImage(null)}
                                        style={{
                                            position: 'absolute',
                                            top: 1,
                                            right: 1,
                                            width: 14,
                                            height: 14,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 68, 68, 0.9)',
                                            color: 'white',
                                            border: 'none',
                                            fontSize: 10,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10,
                                            padding: 0,
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        )}
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onPaste={handlePaste}
                            placeholder={pastedImage ? "Add a caption..." : `Message #jc-support as ${guestName}...`}
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '0 8px',
                                margin: '0',
                                border: 'none',
                                outline: 'none',
                                fontSize: 14,
                                backgroundColor: 'transparent',
                                height: 32,
                                lineHeight: '32px',
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || (!inputText.trim() && !pastedImage)}
                            style={{
                                height: 32,
                                padding: '0 14px',
                                margin: '0',
                                borderRadius: 4,
                                backgroundColor: (isLoading || (!inputText.trim() && !pastedImage)) ? '#ccc' : '#5865F2',
                                color: 'white',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: (isLoading || (!inputText.trim() && !pastedImage)) ? 'default' : 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxSizing: 'border-box'
                            }}
                        >
                            {isLoading ? '...' : 'Send'}
                        </button>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: '#999', textAlign: 'center' }}>
                        Messages are relayed to Discord. Civility is required.
                    </div>
                </div>
            </div >
        </>
    );
}
