import React from 'react';
import PortalModal from '../common/PortalModal';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarModal = ({ isOpen, onClose, months, onSelect }) => {
    // Basic Month Grid Implementation based on available "months" strings
    // In a real app, we'd parse this properly. 
    // Assuming months is array of strings e.g. "Dec 25, 2025"

    // Let's just list the available months found in photos for now.

    return (
        <PortalModal isOpen={isOpen} onClose={onClose}>
            <div
                style={{
                    background: 'var(--bg-paper)',
                    padding: '2rem',
                    borderRadius: '8px',
                    width: '300px',
                    maxWidth: '90vw',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Jump to Date</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {months.length > 0 ? months.map((m, i) => (
                        <button
                            key={i}
                            onClick={() => { onSelect(m); onClose(); }}
                            style={{
                                padding: '10px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'white'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.5)'}
                        >
                            {m.split(' ')[0]} {/* Show just Month name if format is "Dec 25, 2025" */}
                        </button>
                    )) : (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.6 }}>No dates found.</p>
                    )}
                </div>
            </div>
        </PortalModal>
    );
};

export default CalendarModal;
