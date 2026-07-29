export interface MindMapNode {
  id: string;
  label: string;
  details?: string;
  category?: string;
  color?: string;
  icon?: string;
  children?: MindMapNode[];
}

export interface KeyTakeaway {
  id: string;
  title: string;
  description: string;
  tag?: string;
  impact?: 'High' | 'Medium' | 'Critical';
}

export interface OutlineChapter {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  keyPoints: string[];
  codeSnippets?: { language?: string; code: string; explanation?: string }[];
  proTips?: string[];
  trapsToAvoid?: string[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  // Spaced Repetition (SM-2 Algorithm) Fields
  easeFactor?: number;      // Default 2.5
  interval?: number;        // Days until next review
  repetitions?: number;     // Number of successful reviews
  nextReviewDate?: string;  // ISO string
  status?: 'New' | 'Learning' | 'Mastered';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  category?: string;
}

export interface VideoNoteAnalysis {
  id: string;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  thumbnailUrl: string;
  channelName?: string;
  duration?: string;
  createdAt: string;
  
  overallSummary: string;
  mentalModels?: string[];
  keyTakeaways: KeyTakeaway[];
  outline: OutlineChapter[];
  mindmap: MindMapNode;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  proTipsGlobal?: string[];
  trapsToAvoidGlobal?: string[];
  
  // Exhaustive PDF Content Fields
  detailedNotes?: string;  // Long-form chapter-by-chapter detailed lecture notes
  formulasAndEquations?: string[];  // Math/science formulas extracted from video
  vocabularyTerms?: { term: string; definition: string }[];  // Key terms glossary
  
  language?: string; // Current language (e.g. 'en', 'hi', 'es')
  usageCost?: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    costInr: number;
  };
}

export interface MasterChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  analysisCard?: VideoNoteAnalysis | null;
  activeWidget?: 'summary' | 'flashcards' | 'quiz' | 'mindmap' | null;
  quizQuantity?: number;
  quizState?: {
    userAnswers: Record<number, number>;
    isSubmitted?: boolean;
    score?: number;
  };
  flashcardIndex?: number;
  isFlipped?: boolean;
  isProcessing?: boolean;
  usageCost?: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    costInr: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: MasterChatMessage[];
  analysis?: VideoNoteAnalysis | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  videoTimestamp?: string;
}

export interface PlaylistItem {
  videoId: string;
  videoUrl: string;
  title: string;
  thumbnailUrl: string;
}

export interface HistoryItem {
  id: string;
  videoTitle: string;
  videoId: string;
  thumbnailUrl: string;
  createdAt: string;
  summarySnippet: string;
}
