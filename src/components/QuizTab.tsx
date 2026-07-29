import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';
import { QuizQuestion } from '../types/notes';

interface QuizTabProps {
  quiz: QuizQuestion[];
}

export const QuizTab: React.FC<QuizTabProps> = ({ quiz }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  if (!quiz || quiz.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <HelpCircle style={{ width: 40, height: 40, color: '#818cf8', margin: '0 auto 12px auto' }} />
        <p style={{ fontSize: 14 }}>No quiz questions generated for this video.</p>
      </div>
    );
  }

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (selectedAnswers[questionIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleReset = () => {
    setSelectedAnswers({});
  };

  const totalAnswered = Object.keys(selectedAnswers).length;
  const isFinished = totalAnswered === quiz.length;
  const score = calculateScore();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Quiz Top Header */}
      <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
            <HelpCircle style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Interactive Practice Quiz</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Test your comprehension of the video content</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#1e293b', color: '#cbd5e1' }}>
            Answered: {totalAnswered} / {quiz.length}
          </span>
          {totalAnswered > 0 && (
            <button
              onClick={handleReset}
              style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RotateCcw style={{ width: 14, height: 14 }} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Score Summary Box */}
      {isFinished && (
        <div className="glass-card" style={{ padding: 28, textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(6, 78, 59, 0.25)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Award style={{ width: 48, height: 48, color: '#34d399', margin: '0 auto' }} />
          <h4 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
            Quiz Completed! Score: <span style={{ color: '#34d399' }}>{score} / {quiz.length}</span>
          </h4>
          <p style={{ fontSize: 13, color: '#cbd5e1' }}>
            {score === quiz.length
              ? '🎉 Perfect Score! You mastered the key concepts in this video.'
              : 'Great effort! Review the detailed explanations below to reinforce learning.'}
          </p>
        </div>
      )}

      {/* Question List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {quiz.map((q, qIdx) => {
          const selectedOpt = selectedAnswers[qIdx];
          const isAnswered = selectedOpt !== undefined;

          return (
            <div key={q.id || qIdx} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  Q{qIdx + 1}
                </span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', flex: 1 }}>
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedOpt === oIdx;
                  const isCorrect = oIdx === q.correctOptionIndex;

                  let optionClass = "quiz-option";
                  if (isAnswered) {
                    if (isCorrect) optionClass += " correct";
                    else if (isSelected && !isCorrect) optionClass += " incorrect";
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(qIdx, oIdx)}
                      disabled={isAnswered}
                      className={optionClass}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 style={{ width: 18, height: 18, color: '#34d399', flexShrink: 0 }} />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle style={{ width: 18, height: 18, color: '#f43f5e', flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswered && (
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: '#818cf8', display: 'block', marginBottom: 4 }}>Explanation:</span>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
