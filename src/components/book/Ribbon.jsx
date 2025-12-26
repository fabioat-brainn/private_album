import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Plus, LogOut, Grid, Users, Calendar } from 'lucide-react';

const Ribbon = ({ isOpen, onLayoutChange, onAddPhotos, onLogout, onManagePeople, isMobile = false }) => {
    const [expanded, setExpanded] = useState(false);
    const fileInputRef = useRef(null);
    const ribbonRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ribbonRef.current && !ribbonRef.current.contains(event.target)) {
                setExpanded(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onAddPhotos(files);
            setExpanded(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={ribbonRef}
            className="ribbon"
            style={{
                position: 'absolute',
                right: isMobile ? '20px' : '40px',
                top: isMobile ? 'auto' : '-10px',
                bottom: isMobile ? '30px' : 'auto',
                width: '60px',
                height: isMobile
                    ? (expanded ? '350px' : '60px')
                    : (expanded ? 'calc(100% + 10px)' : '80px'),

                // Fabric Texture (Weave Pattern)
                background: `
                    repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                    var(--color-ribbon)
                `,
                transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s',
                zIndex: 100,
                boxShadow: 'var(--shadow-elevation-medium)',

                display: 'flex',
                flexDirection: isMobile ? 'column-reverse' : 'column', // Expand UP on mobile
                alignItems: 'center',
                justifyContent: isMobile ? 'flex-start' : 'flex-start', // With reverse, flex-start puts items at bottom

                paddingTop: isMobile ? '10px' : '20px',
                paddingBottom: isMobile ? '10px' : '30px',

                color: 'white',
                overflow: 'hidden',
                // Swallowtail Ribbon Cut (Desktop) vs Round Pill (Mobile)
                clipPath: isMobile
                    ? 'none'
                    : 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 20px), 0 100%)',
                borderRadius: isMobile ? '30px' : '0 0 5px 5px',
                border: isMobile ? '2px solid white' : 'none',
            }}
        >
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*.heic, image/*"
                multiple
                onChange={handleFileChange}
            />

            <button
                onClick={() => setExpanded(!expanded)}
                title={expanded ? "Close Menu" : "Open Menu"}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    // On mobile with column-reverse, margin needs to be handled differently or just rely on gap
                    marginBottom: (!isMobile && expanded) ? '2rem' : '0',
                    marginTop: (isMobile && expanded) ? '1rem' : '0',
                    flexShrink: 0,
                    width: '40px',
                    height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                {expanded ? <X size={isMobile ? 28 : 24} /> : <Menu size={isMobile ? 28 : 24} />}
            </button>

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column-reverse' : 'column',
                gap: '1rem',
                width: '100%',
                alignItems: 'center',
                opacity: expanded ? 1 : 0,
                transition: 'opacity 0.2s ease 0.1s',
                pointerEvents: expanded ? 'auto' : 'none',
                paddingBottom: isMobile ? '10px' : '0'
            }}>
                <ActionButton
                    icon={<Plus size={20} />}
                    title="Add Photo"
                    onClick={() => fileInputRef.current.click()}
                />
                <ActionButton
                    icon={<Grid size={20} />}
                    title="Change Layout"
                    onClick={onLayoutChange}
                />
                <ActionButton
                    icon={<Users size={20} />}
                    title="Manage People"
                    onClick={onManagePeople}
                />
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.3)', width: '60%' }} />
                <ActionButton
                    icon={<LogOut size={20} />}
                    title="Logout"
                    onClick={onLogout}
                />
            </div>
        </div>
    );
};

const ActionButton = ({ icon, title, onClick }) => (
    <button style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        transition: 'background 0.2s'
    }}
        onClick={onClick}
        title={title}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
    >
        {icon}
    </button>
)

export default Ribbon;
