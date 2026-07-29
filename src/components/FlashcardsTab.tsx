import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, Layers, CheckCircle2 } from 'lucide-react';
import { Flashcard } from '../types/notes';

interface FlashcardsTabProps {
  flashcards: Flashcard[];
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <Layers style={{ width: 40, height: 40, color: '#818cf8', margin: '0 auto 12px auto' }} />
        <p style={{ fontSize: 14 }}>No flashcards generated for this video.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  return (
    <div className="flashcard-wrapper">
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers style={{ width: 20, height: 20, color: '#818cf8' }} />
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Active Recall Flashcards</h3>
        </div>
        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          Card {currentIndex + 1} of {flashcards.length}
        </span>
      </div>

      {/* 3D Flip Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ width: '100%', height: 320, cursor: 'pointer', userSelect: 'none' }}
        className="perspective-1000"
      >
        <div
          className={`transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ position: 'relative', width: '100%', height: '100%' }}
        >
          {/* Front Side (Question) */}
          <div className="flashcard-front">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                {currentCard.topic || 'Question'}
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCw style={{ width: 14, height: 14, color: '#818cf8' }} />
                <span>Click to Flip Answer</span>
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#818cf8', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                QUESTION
              </span>
              <h4 style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.4 }}>
                {currentCard.question}
              </h4>
            </div>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
              Tap anywhere on the card to reveal answer
            </div>
          </div>

          {/* Back Side (Answer) */}
          <div className="flashcard-back">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 style={{ width: 14, height: 14 }} />
                <span>Answer</span>
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Click to flip back</span>
            </div>

            <div style={{ overflowY: 'auto', padding: '8px 0' }}>
              <p style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.6, textAlign: 'center', fontWeight: 500 }}>
                {currentCard.answer}
              </p>
            </div>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
              Active Recall Practice
            </div>
          </div>
        </div>
      </div>

      {/* Nav Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
        <button onClick={handlePrev} className="btn-secondary" style={{ fontSize: 12, padding: '10px 18px' }}>
          <ChevronLeft style={{ width: 16, height: 16 }} />
          <span>Previous Card</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RotateCw style={{ width: 14, height: 14 }} />
          <span>Flip Card</span>
        </button>

        <button onClick={handleNext} className="btn-secondary" style={{ fontSize: 12, padding: '10px 18px' }}>
          <span>Next Card</span>
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};
