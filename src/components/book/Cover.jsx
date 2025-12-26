import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { albumService } from '../../services/albumService';
import { Book, LogOut, Plus, ChevronDown, ArrowRight } from 'lucide-react';

const Cover = ({ onOpenBook }) => {
    const { user, signIn, signUp, signOut } = useAuth();
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [albums, setAlbums] = useState([]);
    const [selectedAlbumId, setSelectedAlbumId] = useState('');
    const [newAlbumTitle, setNewAlbumTitle] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            loadAlbums();
            setMode('list');
        } else {
            setMode('login');
        }
    }, [user]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadAlbums = async () => {
        try {
            const data = await albumService.getMyAlbums();
            setAlbums(data || []);
            if (data?.length > 0) setSelectedAlbumId(data[0].id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                const { error } = await signIn({ email, password });
                if (error) throw error;
            } else {
                try {
                    const { data: exists } = await supabase.rpc('check_email_exists', { target_email: email });
                    if (exists) {
                        throw new Error("User already exists. Please Log In.");
                    }
                } catch (rpcError) {
                    if (rpcError.message === "User already exists. Please Log In.") {
                        throw rpcError;
                    }
                    console.warn("Email check failed", rpcError);
                }

                const { error } = await signUp({ email, password });
                if (error) throw error;
                alert("Account created! Check your email to confirm.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAlbum = async (e) => {
        e.preventDefault();
        if (!newAlbumTitle.trim()) return;
        setLoading(true);
        try {
            await albumService.createAlbum(newAlbumTitle, user.id);
            setNewAlbumTitle('');
            await loadAlbums();
            setMode('list');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        if (selectedAlbumId) {
            onOpenBook(selectedAlbumId);
        }
    };

    // Helper to get title
    const getSelectedAlbumTitle = () => {
        const album = albums.find(a => a.id === selectedAlbumId);
        return album ? album.title : "No Albums";
    };

    return (
        <div className="cover-inner" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%', // FORCE FULL WIDTH
            boxSizing: 'border-box', // INCLUDE PADDING IN WIDTH
            color: 'var(--color-gold)', // GOLD TEXT
            textAlign: 'center',
            position: 'relative'
        }}>

            {/* Title / Album Selector */}
            {user && mode === 'list' && albums.length > 0 ? (
                <div
                    ref={dropdownRef}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                        position: 'relative',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 20
                    }}
                >
                    {/* Centered Wrapper */}
                    <div style={{ position: 'relative', maxWidth: '60%' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '3rem',
                            margin: 0,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.2
                        }}>
                            {getSelectedAlbumTitle()}
                        </h1>

                        {/* Hanging Chevron */}
                        <div style={{
                            position: 'absolute',
                            left: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            paddingLeft: '10px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <ChevronDown size={24} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.7 }} />
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.95)',
                            border: '1px solid var(--color-gold)',
                            borderRadius: '4px',
                            padding: '5px 0',
                            minWidth: '220px',
                            zIndex: 1000,
                            boxShadow: '0 5px 25px rgba(0,0,0,0.8)',
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }}>
                            {albums.map(a => (
                                <div
                                    key={a.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAlbumId(a.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    style={{
                                        padding: '12px 20px',
                                        color: a.id === selectedAlbumId ? 'white' : 'var(--color-gold)',
                                        background: a.id === selectedAlbumId ? 'var(--color-gold)' : 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        fontFamily: 'var(--font-serif)',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                    onMouseOver={(e) => { if (a.id !== selectedAlbumId) e.target.style.background = 'rgba(255,255,255,0.1)' }}
                                    onMouseOut={(e) => { if (a.id !== selectedAlbumId) e.target.style.background = 'transparent' }}
                                >
                                    {a.title}
                                </div>
                            ))}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMode('create');
                                    setIsDropdownOpen(false);
                                }}
                                style={{
                                    padding: '12px 20px',
                                    color: 'rgba(255,255,255,0.7)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                    background: 'rgba(0,0,0,0.3)'
                                }}
                            >
                                <Plus size={14} /> Create New Album
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '0.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {user ? "My Albums" : "Shared Memories"}
                </h1>
            )}

            <div style={{ width: '60px', height: '2px', background: 'var(--color-gold)', marginBottom: '2rem', boxShadow: '0 0 10px var(--color-gold)' }}></div>

            {/* Error Message */}
            {error && <div style={{ background: 'rgba(255,0,0,0.2)', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', color: '#ffaaaa' }}>{error}</div>}

            {!user ? (
                // --- AUTH FORMS ---
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '280px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="passcode-input" // Reuse style
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-gold)', background: 'rgba(0,0,0,0.4)', color: 'var(--color-gold)' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="passcode-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-gold)', background: 'rgba(0,0,0,0.4)', color: 'var(--color-gold)' }}
                    />
                    <button type="submit" disabled={loading} style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        background: 'var(--color-gold)',
                        color: '#333',
                        fontFamily: 'var(--font-serif)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginTop: '10px',
                        boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
                    }}>
                        {loading ? 'Processing...' : (mode === 'login' ? 'Unlock Album' : 'Create Account')}
                    </button>

                    <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline'
                    }}>
                        {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </form>
            ) : (
                // --- ALBUM ACTIONS ---
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

                    {mode === 'list' && (
                        <>
                            {/* Open Button - CIRCLE at 80% Width */}
                            {albums.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    left: '90%', // Fixed at 80% for mobile safety
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 30,
                                    maxWidth: '100vw'
                                }}>
                                    <button
                                        onClick={handleOpen}
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            border: '2px solid var(--color-gold)',
                                            borderRadius: '50%',
                                            width: '60px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-gold)',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                            e.currentTarget.style.background = 'var(--color-gold)';
                                            e.currentTarget.style.color = '#1a1a1a';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                            e.currentTarget.style.color = 'var(--color-gold)';
                                        }}
                                        title="Open Album"
                                    >
                                        <ArrowRight size={32} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}

                            {albums.length === 0 && (
                                <p style={{ fontStyle: 'italic', opacity: 0.8 }}>No albums found.</p>
                            )}

                            {/* Create Button */}
                            {albums.length === 0 && (
                                <button onClick={() => setMode('create')} style={{
                                    background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--color-gold)', borderRadius: '4px', padding: '10px', color: 'var(--color-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}>
                                    <Plus size={16} /> Create First Album
                                </button>
                            )}

                            {/* Logic Info: Raised */}
                            <div style={{
                                marginTop: '4rem',
                                fontSize: '0.9rem',
                                opacity: 0.8,
                                color: 'rgba(255,255,255,0.8)',
                                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                            }}>
                                Logged in as {user.email}
                                <button onClick={signOut} style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'var(--color-gold)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>Log Out</button>
                            </div>
                        </>
                    )}

                    {mode === 'create' && (
                        <form onSubmit={handleCreateAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                            <input
                                type="text"
                                placeholder="Album Title (e.g. Summer 2025)"
                                value={newAlbumTitle}
                                onChange={(e) => setNewAlbumTitle(e.target.value)}
                                required
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-gold)', background: 'rgba(0,0,0,0.4)', color: 'var(--color-gold)' }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setMode('list')} style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--color-gold)', border: 'none', color: '#333', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Create</button>
                            </div>
                        </form>
                    )}

                </div>
            )}
        </div>
    );
};

export default Cover;
