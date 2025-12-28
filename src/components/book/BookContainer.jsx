import React, { useState, useMemo, useEffect } from 'react';
import '../../styles/book.css';
import Cover from './Cover';
import PageContent from './PageContent';
import TurnablePage from './TurnablePage';
import Ribbon from './Ribbon';
import CalendarWidget from './CalendarWidget';
import ManagePeopleModal from './ManagePeopleModal';
import { photoService } from '../../services/photoService';
import { albumService } from '../../services/albumService';
import { useAuth } from '../../context/AuthContext';

const BookContainer = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeAlbumId, setActiveAlbumId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
    const [layout, setLayout] = useState(6);
    const [currentSpread, setCurrentSpread] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [anchorPhotoId, setAnchorPhotoId] = useState(null);
    const [isLayoutChanging, setIsLayoutChanging] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleOpenBook = async (albumId) => {
        setActiveAlbumId(albumId);
        setIsOpen(true);

        try {
            // Robust Ownership Check
            try {
                const album = await albumService.getAlbum(albumId);
                if (album && album.owner_id === user?.id) {
                    setIsOwner(true);
                } else {
                    // Check members as fallback
                    const members = await albumService.getMembers(albumId);
                    const myMembership = members.find(m => m.user_id === user?.id);
                    setIsOwner(myMembership?.role === 'owner');
                }
            } catch (e) {
                console.warn("Ownership check failed", e);
                setIsOwner(false);
            }

            // Load Photos
            const data = await photoService.getPhotos(albumId);
            const mapped = data.map(p => ({
                id: p.id,
                url: p.url,
                date: new Date(p.taken_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                description: p.description,
                storage_path: p.storage_path
            }));
            setPhotos(mapped);

        } catch (error) {
            console.error("Failed to load album data:", error);
        }
    };

    const handleLogout = () => {
        setIsOpen(false);
        setActiveAlbumId(null);
        setPhotos([]);
        setCurrentSpread(0);
        setIsOwner(false);
    };

    // --- Pagination & Grouping Logic ---
    const pages = useMemo(() => {
        const groups = {};
        const getMonthYear = (dateStr) => {
            const parts = dateStr.split(' ');
            if (parts.length >= 3) return `${parts[0]} ${parts[2]}`;
            return 'Unknown';
        };

        photos.forEach(p => {
            const key = getMonthYear(p.date);
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });

        const allPages = [];
        Object.keys(groups).forEach(key => {
            const groupPhotos = groups[key];
            for (let i = 0; i < groupPhotos.length; i += layout) {
                allPages.push(groupPhotos.slice(i, i + layout));
            }
        });

        return allPages;
    }, [photos, layout]);

    const leafCount = isMobile
        ? pages.length
        : Math.max(0, Math.ceil((pages.length - 1) / 2));

    const leaves = useMemo(() => {
        const l = [];
        for (let i = 0; i < leafCount; i++) {
            if (isMobile) {
                const idx = i;
                l.push({
                    index: i,
                    front: pages[idx] || [],
                    back: [],
                    frontPageNum: idx + 1,
                    backPageNum: null
                });
            } else {
                const frontIdx = i * 2 + 1;
                const backIdx = i * 2 + 2;

                l.push({
                    index: i,
                    front: pages[frontIdx] || [],
                    back: pages[backIdx] || [],
                    frontPageNum: frontIdx + 1,
                    backPageNum: backIdx + 1
                });
            }
        }
        return l;
    }, [pages, leafCount, isMobile]);

    // --- Navigation Handlers ---
    const nextSpread = () => {
        if (currentSpread < leafCount) setCurrentSpread(currentSpread + 1);
    };

    const prevSpread = () => {
        if (currentSpread > 0) setCurrentSpread(currentSpread - 1);
    };

    const handleMonthSelect = (selectedDateStr) => {
        let targetPageIndex = -1;
        targetPageIndex = pages.findIndex(page => page.some(p => p.date === selectedDateStr));

        if (targetPageIndex === -1) {
            const targetParts = selectedDateStr.split(' ');
            if (targetParts.length >= 3) {
                const targetMonthYear = `${targetParts[0]} ${targetParts[2]}`;
                targetPageIndex = pages.findIndex(page => {
                    if (!page.length) return false;
                    const pParts = page[0].date.split(' ');
                    if (pParts.length < 3) return false;
                    const pMonthYear = `${pParts[0]} ${pParts[2]}`;
                    return pMonthYear === targetMonthYear;
                });
            }
        }

        if (targetPageIndex !== -1) {
            const spread = Math.floor(targetPageIndex / 2);
            setCurrentSpread(spread);
        } else {
            console.warn(`No photos found for ${selectedDateStr}`);
        }
    };

    const handleLayoutChange = () => {
        setIsLayoutChanging(true);
        const leftPageIndex = currentSpread * 2;
        const rightPageIndex = currentSpread * 2 + 1;

        let anchorPhoto = null;
        if (pages[leftPageIndex] && pages[leftPageIndex].length > 0) {
            anchorPhoto = pages[leftPageIndex][0];
        } else if (pages[rightPageIndex] && pages[rightPageIndex].length > 0) {
            anchorPhoto = pages[rightPageIndex][0];
        }

        if (anchorPhoto) {
            setAnchorPhotoId(anchorPhoto.id);
        } else {
            setTimeout(() => setIsLayoutChanging(false), 300);
        }

        setLayout(prev => {
            if (prev === 1) return 6;
            if (prev === 6) return 9;
            return 1;
        });
    };

    useEffect(() => {
        if (anchorPhotoId !== null) {
            let targetPageIndex = -1;
            for (let i = 0; i < pages.length; i++) {
                if (pages[i].some(p => p.id === anchorPhotoId)) {
                    targetPageIndex = i;
                    break;
                }
            }

            if (targetPageIndex !== -1) {
                const newSpread = Math.floor(targetPageIndex / 2);
                setCurrentSpread(newSpread);
            }
            setAnchorPhotoId(null);
            setTimeout(() => setIsLayoutChanging(false), 100);
        }
    }, [pages, anchorPhotoId]);

    const handleAddPhotos = async (files) => {
        if (!files || files.length === 0 || !activeAlbumId || !user) return;

        try {
            const newPhotoRows = await photoService.uploadPhotos(activeAlbumId, user.id, files);

            if (newPhotoRows && newPhotoRows.length > 0) {
                const newPhotos = newPhotoRows.map(p => ({
                    id: p.id,
                    url: p.url,
                    date: new Date(p.taken_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    description: p.description,
                    storage_path: p.storage_path
                }));

                setPhotos(prev => {
                    const combined = [...prev, ...newPhotos];
                    return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
                });
            }
        } catch (err) {
            console.error("Failed to upload photos", err);
            alert("Failed to upload photos: " + err.message);
        }
    };

    // --- Handlers for PageContent ---
    const handleDeletePhoto = async (photoId, storagePath) => {
        try {
            await photoService.deletePhoto(photoId, storagePath);
            setPhotos(prev => prev.filter(p => p.id !== photoId));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete photo. Do you have permission?");
        }
    };

    return (
        <div className={`book ${isOpen ? 'open' : ''} ${isMobile ? 'mobile-notebook' : ''}`}>
            {/* Spiral Binding (Mobile Only) */}
            {isMobile && (
                <div className="spiral-binding">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="spiral-ring" style={{ left: `${5 + i * 4.5}%` }}></div>
                    ))}
                </div>
            )}

            {/* Front Cover */}
            <div className="cover" style={{ zIndex: isOpen ? 0 : 100 }}>
                <div className="cover-front">
                    <Cover onOpenBook={handleOpenBook} />
                </div>
                <div className="cover-back">
                    <div style={{ width: '100%', height: '100%' }}>
                        {!isMobile && (
                            <PageContent
                                photos={pages[0] || []}
                                layout={layout}
                                side="left"
                                pageNumber={1}
                                onNext={nextSpread}
                                onPrev={null}
                                isFirst={true}
                                onOpenCalendar={() => setIsCalendarOpen(true)}
                                onDeletePhoto={handleDeletePhoto}
                                isOwner={isOwner}
                                allowBothNav={isMobile}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="back-cover"></div>

            {/* Dynamic Pages */}
            {leaves.map((leaf, i) => {
                const isFlipped = currentSpread > i;
                const z = isFlipped ? (i + 1) : (leaves.length - i + 1);

                return (
                    <TurnablePage
                        key={i}
                        index={i}
                        zIndex={z}
                        isFlipped={isFlipped}
                        disableAnimation={isLayoutChanging}
                        orientation={isMobile ? 'vertical' : 'horizontal'}
                        frontContent={
                            <PageContent
                                photos={leaf.front}
                                layout={layout}
                                side="right"
                                pageNumber={leaf.frontPageNum}
                                onNext={nextSpread}
                                onPrev={prevSpread}
                                isFirst={i === 0}
                                isLast={i === leaves.length - 1 && leaf.back.length === 0}
                                onOpenCalendar={() => setIsCalendarOpen(true)}
                                onDeletePhoto={handleDeletePhoto}
                                isOwner={isOwner}
                                allowBothNav={isMobile}
                            />
                        }
                        backContent={
                            <PageContent
                                photos={leaf.back}
                                layout={layout}
                                side="left"
                                pageNumber={leaf.backPageNum}
                                onNext={nextSpread}
                                onPrev={prevSpread}
                                isFirst={false}
                                onOpenCalendar={() => setIsCalendarOpen(true)}
                                onDeletePhoto={handleDeletePhoto}
                                isOwner={isOwner}
                                allowBothNav={isMobile}
                            />
                        }
                    />
                );
            })}

            <Ribbon
                isOpen={isOpen}
                onLayoutChange={handleLayoutChange}
                onAddPhotos={handleAddPhotos}
                onLogout={handleLogout}
                onManagePeople={() => setIsPeopleModalOpen(true)}
                isMobile={isMobile}
            />

            <CalendarWidget
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                onSelect={handleMonthSelect}
            />

            <ManagePeopleModal
                isOpen={isPeopleModalOpen}
                onClose={() => setIsPeopleModalOpen(false)}
                albumId={activeAlbumId}
            />
        </div>
    );
};

export default BookContainer;
