import React, { useState } from 'react';
import PortalModal from '../common/PortalModal';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarWidget = ({ isOpen, onClose, onSelect }) => {
    // Current viewed month state (mocked current date as start)
    const [viewDate, setViewDate] = useState(new Date(2025, 11, 1)); // Dec 2025

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        // Empty slots for start of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-start-${i}`} style={{ height: '35px' }} />); // Fixed height placeholder
        }
        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(
                <button
                    key={d}
                    onClick={() => {
                        const shortMonth = monthNames[month].substring(0, 3);
                        onSelect(`${shortMonth} ${d}, ${year}`);
                        onClose();
                    }}
                    style={{
                        padding: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        color: 'white',
                        fontFamily: 'var(--font-serif)',
                        transition: 'all 0.2s',
                        height: '35px', // Fixed height
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = 'var(--color-ribbon)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'white';
                    }}
                >
                    {d}
                </button>
            );
        }

        // Fill remaining slots to reach 42 (6 rows x 7 cols)
        const totalCells = days.length;
        const totalSlots = 42; // 6 rows * 7

        for (let i = totalCells; i < totalSlots; i++) {
            days.push(<div key={`empty-end-${i}`} style={{ height: '35px' }} />);
        }

        return days;
    };

    const changeMonth = (delta) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
    };

    return (
        <PortalModal isOpen={isOpen} onClose={onClose}>
            <div style={{
                background: `
                    repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                    var(--color-ribbon)
                `,
                padding: '2rem',
                borderRadius: '8px',
                width: '350px',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                fontFamily: 'var(--font-serif)'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}><ChevronLeft /></button>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'white' }}>
                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </h3>
                    <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}><ChevronRight /></button>
                    <button onClick={onClose} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8, color: 'white' }}><X size={18} /></button>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                    {renderCalendarGrid()}
                </div>
            </div>
        </PortalModal>
    );
};

export default CalendarWidget;
