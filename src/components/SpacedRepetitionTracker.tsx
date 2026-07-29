import React, { useState, useEffect } from 'react';
import { RotateCw, Zap } from 'lucide-react';
import { Flashcard } from '../types/notes';

interface SpacedRepetitionTrackerProps {
  flashcards: Flashcard[];
}

export const SpacedRepetitionTracker: React.FC<SpacedRepetitionTrackerProps> = ({ flashcards }) => {
  const [cardsState, setCardsState] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('mindtube_spaced_repetition');
      if (saved) {
        const parsed: Flashcard[] = JSON.parse(saved);
        // Merge with current video flashcards
        return flashcards.map((fc) => {
          const existing = parsed.find((p) => p.id === fc.id || p.question === fc.question);
          return existing || {
            ...fc,
            easeFactor: 2.5,
            interval: 1,
            repetitions: 0,
            status: 'New'
          };
        });
      }
    } catch (e) {
      console.warn(e);
    }

    return flashcards.map((fc) => ({
      ...fc,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      status: 'New'
    }));
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    localStorage.setItem('mindtube_spaced_repetition', JSON.stringify(cardsState));
  }, [cardsState]);

  if (!cardsState || cardsState.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
        <p>No flashcards available for spaced repetition.</p>
      </div>
    );
  }

  const currentCard = cardsState[currentIndex];

  // SuperMemo-2 (SM-2) Spaced Repetition Algorithm (100% Local & Free!)
  const processSm2Review = (quality: number) => {
    // Quality ratings: 0 = Again (fail), 3 = Hard, 4 = Good, 5 = Easy
    let { easeFactor = 2.5, interval = 1, repetitions = 0 } = currentCard;

    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Ease Factor calculation formula
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    let newStatus: 'New' | 'Learning' | 'Mastered' = 'Learning';
    if (repetitions >= 3 && interval >= 7) {
      newStatus = 'Mastered';
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    const updatedCard: Flashcard = {
      ...currentCard,
      easeFactor,
      interval,
      repetitions,
      nextReviewDate: nextDate.toISOString(),
      status: newStatus
    };

    setCardsState((prev) =>
      prev.map((c, idx) => (idx === currentIndex ? updatedCard : c))
    );

    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cardsState.length);
    }, 200);
  };

  const masteredCount = cardsState.filter((c) => c.status === 'Mastered').length;
  const learningCount = cardsState.filter((c) => c.status === 'Learning').length;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <Zap style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Spaced Repetition Mastery Tracker</h3>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>SuperMemo-2 (SM-2) Local Memory Algorithm • 100% Free & Local</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
            🏆 {masteredCount} Mastered
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
            📚 {learningCount} Learning
          </span>
        </div>
      </div>

      {/* Flashcard 3D Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="perspective-1000"
        style={{ width: '100%', height: 300, cursor: 'pointer', userSelect: 'none' }}
      >
        <div className={`transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Front */}
          <div className="flashcard-front">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 12, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                {currentCard.topic || 'Card'}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <RotateCw style={{ width: 12, height: 12 }} />
                <span>Tap to Reveal Answer</span>
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <h4 style={{ fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.4 }}>
                {currentCard.question}
              </h4>
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: '#64748b' }}>
              Interval: {currentCard.interval || 1}d • Ease: {(currentCard.easeFactor || 2.5).toFixed(1)}
            </div>
          </div>

          {/* Back */}
          <div className="flashcard-back">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                ANSWER
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Select recall difficulty below</span>
            </div>

            <div style={{ overflowY: 'auto', padding: '6px 0' }}>
              <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6, textAlign: 'center', fontWeight: 500 }}>
                {currentCard.answer}
              </p>
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: '#64748b' }}>
              SM-2 Algorithm Evaluation
            </div>
          </div>
        </div>
      </div>

      {/* Rating Buttons (Shown when card is flipped) */}
      {isFlipped ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <button
            onClick={() => processSm2Review(0)}
            style={{ padding: 12, borderRadius: 10, background: 'rgba(244,63,94,0.15)', border: '1px solid #f43f5e', color: '#fecdd3', fontSize: 12, fontWeight: 700 }}
          >
            Again (1d)
          </button>
          <button
            onClick={() => processSm2Review(3)}
            style={{ padding: 12, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid #f59e0b', color: '#fef3c7', fontSize: 12, fontWeight: 700 }}
          >
            Hard ({Math.max(1, Math.round((currentCard.interval || 1) * 1.2))}d)
          </button>
          <button
            onClick={() => processSm2Review(4)}
            style={{ padding: 12, borderRadius: 10, background: 'rgba(99,102,241,0.15)', border: '1px solid #6366f1', color: '#c7d2fe', fontSize: 12, fontWeight: 700 }}
          >
            Good ({Math.round((currentCard.interval || 1) * (currentCard.easeFactor || 2.5))}d)
          </button>
          <button
            onClick={() => processSm2Review(5)}
            style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#a7f3d0', fontSize: 12, fontWeight: 700 }}
          >
            Easy ({Math.round((currentCard.interval || 1) * (currentCard.easeFactor || 2.5) * 1.3)}d)
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
          Tap card to view answer and record memory recall score.
        </div>
      )}
    </div>
  );
};
