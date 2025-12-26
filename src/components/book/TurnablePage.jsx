import React from 'react';

const TurnablePage = ({ index, zIndex, isFlipped, frontContent, backContent, disableAnimation, orientation = 'horizontal' }) => {
    const isVertical = orientation === 'vertical';

    return (
        <div
            className={`turnable-page ${isFlipped ? 'flipped' : ''}`}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transformOrigin: isVertical ? 'top' : 'left',
                transformStyle: 'preserve-3d',
                transform: isVertical
                    ? `rotateX(${isFlipped ? 180 : 0}deg)`
                    : `rotateY(${isFlipped ? -180 : 0}deg)`,
                transition: disableAnimation ? 'none' : 'transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
                zIndex: zIndex,
                pointerEvents: 'none'
            }}
        >
            {/* Front Face (Right Side Page) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    zIndex: 2,
                    pointerEvents: isFlipped ? 'none' : 'auto'
                }}
            >
                {/* Background Texture handled by CSS class or inner div? 
                    Reuse .back-cover::before style logic via class? 
                    Let's use a wrapper div with the class.
                */}
                <div className="page-face front" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    {/* Allow slight bleed for texture */}
                    <div className="texture-layer" />
                    {frontContent}
                </div>
            </div>

            {/* Back Face (Left Side Page) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: isVertical ? 'rotateX(180deg)' : 'rotateY(180deg)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    zIndex: 1,
                    pointerEvents: isFlipped ? 'auto' : 'none'
                }}
            >
                <div className="page-face back" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <div className="texture-layer" />
                    {backContent}
                </div>
            </div>
        </div>
    );
};

export default TurnablePage;
