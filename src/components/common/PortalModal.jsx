import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const PortalModal = ({ children, isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !isOpen) return null;

    return ReactDOM.createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999, // Ensure it's on top of everything
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'auto' // Re-enable pointer events if parent disabled them
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {children}
        </div>,
        document.body
    );
};

export default PortalModal;
