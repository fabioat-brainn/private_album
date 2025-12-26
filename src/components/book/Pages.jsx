import React, { useState } from 'react';
import { Download, X, Maximize2 } from 'lucide-react';
import PortalModal from '../common/PortalModal';

const Pages = ({ isOpen, layout, photos }) => {
    // const [layout, setLayout] = useState(4); // LIFTED
    const [expandedPhoto, setExpandedPhoto] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate Pagination
    const photosPerPage = layout;
    const totalPages = Math.ceil(photos.length / photosPerPage);

    // Ensure current page is valid if layout changes
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    const indexOfLastPhoto = currentPage * photosPerPage;
    const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
    const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const getGridStyle = () => {
        switch (layout) {
            case 1: return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
            case 4: return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
            case 16: return { gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' };
            default: return { gridTemplateColumns: 'repeat(2, 1fr)' };
        }
    };

    return (
        <div style={{
            padding: '2rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 1s ease 0.5s',
            pointerEvents: isOpen ? 'auto' : 'none',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-text)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>December 2025</h2>
                {/* Layout controls moved to Ribbon, but could keep as indicator or remove. Removing for cleaner UI as requested. */}
            </div>

            <div style={{
                display: 'grid',
                ...getGridStyle(),
                gap: '0.5rem',
                flex: 1,
                overflowY: 'auto',
                alignContent: 'start',
                paddingRight: '5px' // Space for scrollbar
            }}>
                {currentPhotos.map((photo) => (
                    <div
                        key={photo.id}
                        onClick={() => setExpandedPhoto(photo)}
                        style={{
                            aspectRatio: '1',
                            backgroundImage: `url(${photo.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '4px solid white',
                            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                    </div>
                ))}
            </div>

            {/* Page Controls */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', opacity: 0.7 }}>
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    style={{ background: 'none', border: 'none', cursor: currentPage === 1 ? 'default' : 'pointer', fontFamily: 'inherit', opacity: currentPage === 1 ? 0.3 : 1 }}
                >
                    &larr; Prev Page
                </button>
                <span>Page {currentPage} of {totalPages || 1}</span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    style={{ background: 'none', border: 'none', cursor: currentPage === totalPages ? 'default' : 'pointer', fontFamily: 'inherit', opacity: currentPage === totalPages ? 0.3 : 1 }}
                >
                    Next Page &rarr;
                </button>
            </div>

            {/* Expanded Modal via Portal */}
            <PortalModal isOpen={!!expandedPhoto} onClose={() => setExpandedPhoto(null)}>
                <div
                    style={{
                        position: 'relative', // Context for inner layout
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.8)', // Dark overlay background
                        padding: '2rem',
                        borderRadius: '8px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {expandedPhoto && (
                        <>
                            <img
                                src={expandedPhoto.url}
                                alt="Expanded"
                                style={{
                                    maxHeight: '80vh',
                                    maxWidth: '90vw',
                                    border: '10px solid white',
                                    boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                                }}
                            />
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    style={{
                                        padding: '10px 20px',
                                        background: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 'bold',
                                        borderRadius: '4px'
                                    }}
                                    onClick={() => window.open(expandedPhoto.url, '_blank')}
                                >
                                    <Download size={20} /> Download
                                </button>
                                <button
                                    style={{
                                        padding: '10px 20px',
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '1px solid white',
                                        color: 'white',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}
                                    onClick={() => setExpandedPhoto(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </PortalModal>
        </div>
    );
};

// export default Pages; // Removed duplicate
export default Pages;
