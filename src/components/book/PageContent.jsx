import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Calendar, Trash2, Send } from 'lucide-react';
import PortalModal from '../common/PortalModal';
import { useAuth } from '../../context/AuthContext';
import { photoService } from '../../services/photoService';

const PageContent = ({ photos, layout, side, pageNumber, onNext, onPrev, onOpenCalendar, isFirst, isLast, onDeletePhoto, isOwner, allowBothNav }) => {
    const { user } = useAuth();
    const [expandedPhoto, setExpandedPhoto] = useState(null);
    const [comments, setComments] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const commentBoxRef = useRef(null);

    // Fetch comments when photo opens
    useEffect(() => {
        if (expandedPhoto) {
            loadComments(expandedPhoto.id);
        } else {
            setComments([]);
        }
    }, [expandedPhoto]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (commentBoxRef.current) {
            commentBoxRef.current.scrollTop = commentBoxRef.current.scrollHeight;
        }
    }, [comments]);

    const loadComments = async (photoId) => {
        try {
            const data = await photoService.getComments(photoId);
            // Enrich with usernames
            const commentsWithUser = await Promise.all(data.map(async c => {
                const name = await photoService.getUsername(c.user_id);
                return { ...c, username: name };
            }));
            setComments(commentsWithUser);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !expandedPhoto) return;

        setIsSending(true);
        try {
            const newComment = await photoService.addComment(expandedPhoto.id, user.id, newMessage.trim());
            const username = await photoService.getUsername(user.id);
            setComments(prev => [...prev, { ...newComment, username }]);
            setNewMessage('');
        } catch (err) {
            alert("Failed to send message: " + err.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async () => {
        if (!onDeletePhoto || !expandedPhoto) return;
        if (window.confirm("Are you sure you want to delete this photo?")) {
            try {
                await onDeletePhoto(expandedPhoto.id, expandedPhoto.storage_path);
                setExpandedPhoto(null);
            } catch (err) {
                alert("Failed to delete photo");
            }
        }
    };

    const handleDownload = async () => {
        if (!expandedPhoto) return;
        try {
            const response = await fetch(expandedPhoto.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `photo-${expandedPhoto.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            // Fallback to direct link
            window.open(expandedPhoto.url, '_blank');
        }
    };

    const getGridStyle = () => {
        switch (layout) {
            case 1: return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
            case 6: return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' };
            case 9: return { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' };
            default: return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
        }
    };

    const headerTitle = photos.length > 0
        ? (() => {
            const parts = photos[0].date.split(' ');
            if (parts.length >= 3) return `${parts[0]} ${parts[2]}`;
            return photos[0].date;
        })()
        : 'Empty';

    return (
        <div style={{
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                borderBottom: '1px solid var(--color-text)',
                paddingBottom: '0.5rem',
                opacity: 0.7
            }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                    {headerTitle}
                </span>
                <span style={{ fontSize: '0.8rem' }}>Page {pageNumber}</span>
            </div>

            {/* Photo Grid */}
            <div style={{
                display: 'grid',
                ...getGridStyle(),
                gap: '10px',
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                width: '100%',
                height: '100%'
            }}>
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        onClick={() => setExpandedPhoto(photo)}
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${photo.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '2px solid white',
                            boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                ))}
            </div>

            {/* Pagination Controls */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    {(side === 'left' || allowBothNav) && !isFirst && (
                        <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            &larr; Prev
                        </button>
                    )}
                </div>

                <button
                    onClick={onOpenCalendar}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', opacity: 0.6 }}
                    title="Jump to Date"
                >
                    <Calendar size={20} />
                </button>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {(side === 'right' || allowBothNav) && !isLast && (
                        <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Next &rarr;
                        </button>
                    )}
                </div>
            </div>

            {/* Enhanced Modal (Redesigned with Chat) */}
            <PortalModal isOpen={!!expandedPhoto} onClose={() => setExpandedPhoto(null)}>
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: `
                            repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                            var(--color-ribbon)
                        `,
                        padding: '2rem',
                        borderRadius: '8px',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        minWidth: '350px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        overflowY: 'auto',
                        color: 'white'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setExpandedPhoto(null)}
                        style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>

                    {expandedPhoto && (
                        <>
                            <img
                                src={expandedPhoto.url}
                                alt="Expanded"
                                style={{
                                    maxHeight: '50vh', // Reduced to make room for chat
                                    maxWidth: '100%',
                                    border: '6px solid white',
                                    boxShadow: '0 5px 25px rgba(0,0,0,0.5)',
                                    marginBottom: '1rem',
                                    borderRadius: '2px'
                                }}
                            />

                            {/* Actions Bar */}
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem', justifyContent: 'center' }}>
                                <button
                                    onClick={handleDownload}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        color: '#333', background: 'var(--color-gold)', border: 'none',
                                        padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <Download size={18} /> Download
                                </button>

                                {isOwner && (
                                    <button
                                        onClick={handleDelete}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            color: '#ffcccc', background: 'rgba(100,0,0,0.5)',
                                            padding: '8px 16px', borderRadius: '4px', border: '1px solid rgba(255,200,200,0.2)', cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <Trash2 size={18} /> Delete
                                    </button>
                                )}
                            </div>

                            {/* Chat Section */}
                            <div style={{ width: '100%', maxWidth: '500px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* Messages Area */}
                                <div
                                    ref={commentBoxRef}
                                    style={{
                                        height: '150px',
                                        overflowY: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        paddingRight: '5px'
                                    }}
                                >
                                    {comments.length === 0 ? (
                                        <div style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                                            No thoughts yet. Write something!
                                        </div>
                                    ) : (
                                        comments.map((msg, idx) => (
                                            <div key={idx} style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                                <span style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>{msg.username}:</span>
                                                <span style={{ marginLeft: '5px', color: 'rgba(255,255,255,0.9)' }}>{msg.message}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Leave a thought..."
                                        style={{
                                            flex: 1, padding: '8px', borderRadius: '4px',
                                            border: 'none', background: 'rgba(255,255,255,0.9)',
                                            color: 'black', fontFamily: 'inherit'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        style={{
                                            background: 'var(--color-gold)', border: 'none',
                                            color: '#333', borderRadius: '4px', padding: '0 15px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </PortalModal>
        </div>
    );
};

export default PageContent;
