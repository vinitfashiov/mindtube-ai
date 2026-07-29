import { GoogleGenerativeAI } from "@google/generative-ai";
import { VideoNoteAnalysis } from "../types/notes";
import { calculateGeminiCost } from "../types/cost";

// Extract YouTube Video ID from any URL format (watch, live, shorts, embed, youtu.be, etc.)
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  
  // 1. Primary Regex: watch?v=, live/, shorts/, embed/, v/, youtu.be/
  const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/i);
  if (match && match[1]) return match[1];

  // 2. Direct fallback for /live/ID or v=ID parameter
  const liveMatch = cleanUrl.match(/\/live\/([a-zA-Z0-9_-]{11})/i);
  if (liveMatch && liveMatch[1]) return liveMatch[1];

  const vParamMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vParamMatch && vParamMatch[1]) return vParamMatch[1];

  return null;
}

// Extract YouTube Playlist ID
export function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[&?]list=([^&]+)/);
  return match ? match[1] : null;
}

// Generate YouTube Thumbnail URL
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Fetch YouTube Metadata (Real Video Title & Channel Name) via oEmbed API
export async function fetchYouTubeMetadata(youtubeUrl: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title as string,
        channelName: data.author_name as string,
        thumbnailUrl: data.thumbnail_url as string
      };
    }
  } catch (err) {
    console.warn("oEmbed metadata fetch failed:", err);
  }
  return null;
}

// Candidate Gemini Models list to try in sequence for maximum speed & lowest cost
const MODEL_CANDIDATES = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash"
];

// Clean JSON response string from Markdown fence blocks
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// ELITE Sample Analysis for "The 7 Levels of Building ELITE Websites with Claude Code"
export const SAMPLE_ANALYSIS: VideoNoteAnalysis = {
  id: "sample-demo-claude-code",
  videoId: "1PXFAFMgdns",
  videoUrl: "https://www.youtube.com/watch?v=1PXFAFMgdns",
  videoTitle: "The 7 Levels of Building ELITE Websites with Claude Code",
  thumbnailUrl: "https://img.youtube.com/vi/1PXFAFMgdns/hqdefault.jpg",
  channelName: "Chase AI",
  duration: "15:20",
  createdAt: new Date().toISOString(),
  language: "en",
  overallSummary: "This definitive masterclass details the 7 progressive maturity levels of AI-driven front-end engineering using Claude Code. It moves from basic text prompts that produce generic 'AI slop', through installing specialized UI/UX skill modules, acting as a visual director with design references, deconstructing and cloning production codebase HTML/CSS/JS, to deploying custom 21st.dev components and Kling 3.0 animated motion backgrounds.",
  mentalModels: [
    "Prompt Engineering vs Visual Direction: Showing AI visual references is 10x more effective than describing design with text.",
    "Skill Module Injection: Extending Claude Code capabilities using GitHub skills (/UI UX Pro Max) prevents generic UI output.",
    "Source Deconstruction: Cloning production code (HTML/CSS/JS) bridges the gap between AI drafts and professional builds."
  ],
  proTipsGlobal: [
    "Always provide Claude Code with visual reference screenshots from Awwwards or Godly.website to anchor design aesthetic.",
    "Use '/plugin marketplace' to install front-end design skills before starting any UI generation session.",
    "Combine Midjourney for hero asset generation with Kling 3.0 or VEO 3.1 to turn static images into 15s smooth looping video backgrounds."
  ],
  trapsToAvoidGlobal: [
    "Getting stuck at Level 1: Relying on basic text prompts yields purple gradients, centered text, and generic AI template slop.",
    "The 'Clone Ceiling': Copying website HTML/CSS without understanding the underlying layout logic or JavaScript hooks.",
    "Ignoring mobile performance: Always serve upscaled compressed images/GIFs on mobile devices instead of heavy 4K videos."
  ],
  keyTakeaways: [
    {
      id: "kt-1",
      title: "Level 1: Just You & A Prompt (AI Slop Hazard)",
      description: "Opening Claude Code with vague prompts yields generic designs, centered text, purple gradients, and zero aesthetic direction.",
      tag: "Level 1",
      impact: "Critical"
    },
    {
      id: "kt-2",
      title: "Level 2: Skill-Guided Design Education",
      description: "Injecting external skill modules like 'UI/UX Pro Max' (52k stars on GitHub) forces Claude Code to use dark modes, micro-glows, and sectional color breaks.",
      tag: "Level 2",
      impact: "High"
    },
    {
      id: "kt-3",
      title: "Level 3: Becoming the Visual Director",
      description: "Replacing text descriptions with visual screenshots from Godly, Awwwards, Pinterest, and Dribbble. Claude Code replicates visual layouts with high fidelity.",
      tag: "Level 3",
      impact: "Critical"
    },
    {
      id: "kt-4",
      title: "Level 4: Website Deconstruction & Code Cloning",
      description: "Extracting raw HTML (Ctrl+U) and linked CSS/JS from target websites. Feeding source code to Claude Code to clone complex carousels and custom UI hooks.",
      tag: "Level 4",
      impact: "High"
    },
    {
      id: "kt-5",
      title: "Level 5: Custom Assets & Motion Backgrounds",
      description: "Integrating 21st.dev components and converting Midjourney hero graphics into smooth looping background videos via Kling 3.0 or VEO 3.1.",
      tag: "Level 5",
      impact: "High"
    }
  ],
  outline: [
    {
      id: "out-1",
      timestamp: "00:00 - 03:15",
      title: "Level 1 & Level 2: From Vague Prompts to Skill Modules",
      summary: "Demonstrating the difference between raw prompts and skill-augmented Claude Code sessions.",
      keyPoints: [
        "Vague prompt: 'Build a landing page for Argus social media app' results in purple gradients and centered text",
        "AI lacks inherent aesthetic taste; explicit design rules must be injected",
        "Installing UI/UX Pro Max skill via plugin marketplace or copying GitHub URL into Claude Code"
      ],
      codeSnippets: [
        {
          language: "bash",
          code: "/plugin marketplace add UI-UX-Pro-Max-Skill\n/UI UX Pro Max skill",
          explanation: "Command to install and activate front-end design skills inside Claude Code CLI"
        }
      ],
      proTips: [
        "Prompt template: 'Recreate this landing page using the UI/UX Pro Max skill. Ask me any design clarifying questions before writing code.'"
      ],
      trapsToAvoid: [
        "Never accept Level 1 default output without specifying color tokens, border radiuses, and glassmorphism parameters."
      ]
    },
    {
      id: "out-2",
      timestamp: "03:15 - 07:45",
      title: "Level 3: Visual Direction with Reference Screenshots",
      summary: "How to act as a visual director by supplying Claude Code with curated screenshots from top design galleries.",
      keyPoints: [
        "Claude Code interprets visual screenshots much better than text descriptions",
        "Sourcing references from Awwwards, Godly.website, Dribbble, and Pinterest",
        "Dumping hero section, social proof, and feature grid screenshots directly into prompt context",
        "Case study: Redesigning the Open Hands website layout with 'See What's Next' tagline"
      ],
      proTips: [
        "Screenshot specific elements (e.g., card layout, button hover glow, navbar) rather than entire 10-page sites for precise cloning."
      ]
    },
    {
      id: "out-3",
      timestamp: "07:45 - 11:30",
      title: "Level 4: Website Deconstruction & Code Teardowns",
      summary: "Step-by-step process to inspect production HTML/CSS/JS source files and feed them to Claude Code.",
      keyPoints: [
        "Press Ctrl+U on target website, copy raw HTML and linked CSS/JS files",
        "Utilizing 'site teardown skill' to fetch large stylesheet bundles automatically",
        "Teaching Claude Code how specific scroll animations, carousels, and navigation menus are constructed",
        "Avoiding the 'clone ceiling' by asking Claude to explain *why* specific code patterns work"
      ],
      codeSnippets: [
        {
          language: "javascript",
          code: "// Site Teardown Command\n/site-teardown https://openhands.dev\n// Instruct Claude Code:\n\"Analyze CSS grid and scroll keyframes from this HTML source\"",
          explanation: "Extracting styling rules from target web applications"
        }
      ]
    },
    {
      id: "out-4",
      timestamp: "11:30 - 15:20",
      title: "Level 5: Component Libraries & Loop Video Backgrounds",
      summary: "Combining 21st.dev component prompts with AI image & video generators (Midjourney + Kling 3.0).",
      keyPoints: [
        "Copying pre-styled components from 21st.dev or CodePen into Claude Code",
        "Generating stylized background graphics in Midjourney ('cool, stylized background image for website called Argus')",
        "Converting static image into 15-second looping video using Kling 3.0 or VEO 3.1",
        "Implementing mobile fallbacks: serving static images on mobile and video on desktop for performance"
      ],
      proTips: [
        "Ensure video start and end frames match seamlessly for zero-jitter looping."
      ]
    }
  ],
  mindmap: {
    id: "root",
    label: "Claude Code Front-End Design Levels",
    category: "Root Subject",
    color: "#6366f1",
    details: "The 7 Levels of Building ELITE Websites with Claude Code",
    children: [
      {
        id: "m-1",
        label: "Level 1: Just You & Prompt",
        category: "Basic Level",
        color: "#ef4444",
        details: "Opening Claude Code with vague prompts (Argus app example)",
        children: [
          { id: "m-1-1", label: "Outcome: AI slop & purple gradients", details: "No design direction given" },
          { id: "m-1-2", label: "Trap: Stuck in generic template loop" }
        ]
      },
      {
        id: "m-2",
        label: "Level 2: Give Claude Education",
        category: "Skill Modules",
        color: "#3b82f6",
        details: "Injecting external skill prompts & UI checklists",
        children: [
          { id: "m-2-1", label: "UI/UX Pro Max Skill (52k stars on GitHub)", details: "Injects design rules based on industry" },
          { id: "m-2-2", label: "Command: /plugin marketplace add skill" },
          { id: "m-2-3", label: "Improved: Subtle glows, sectional breaks, dark theme" }
        ]
      },
      {
        id: "m-3",
        label: "Level 3: Become Visual Director",
        category: "Visual Input",
        color: "#8b5cf6",
        details: "Showing rather than telling with visual reference images",
        children: [
          { id: "m-3-1", label: "Inspiration: Awwwards & Godly.website", details: "Searching Pinterest & Dribbble for SaaS layouts" },
          { id: "m-3-2", label: "Dumping screenshots into Claude Code", details: "Prompt: 'Match visual style of this image'" },
          { id: "m-3-3", label: "Case Study: Open Hands website redesign" }
        ]
      },
      {
        id: "m-4",
        label: "Level 4: The Cloner",
        category: "Code Analysis",
        color: "#ec4899",
        details: "Deconstructing website HTML/CSS/JS source code",
        children: [
          { id: "m-4-1", label: "Ctrl+U source code extraction" },
          { id: "m-4-2", label: "Custom Site Teardown Skill", details: "Grabs large CSS stylesheets automatically" },
          { id: "m-4-3", label: "Educational Value: Learning how pros build" }
        ]
      },
      {
        id: "m-5",
        label: "Level 5: Custom Assets",
        category: "Production",
        color: "#10b981",
        details: "21st.dev component integration & AI motion video",
        children: [
          { id: "m-5-1", label: "21st.dev & CodePen button components" },
          { id: "m-5-2", label: "Midjourney stylized background imagery" },
          { id: "m-5-3", label: "Kling 3.0 / VEO 3.1 video loop background" },
          { id: "m-5-4", label: "Mobile Optimization: Static image fallback" }
        ]
      }
    ]
  },
  flashcards: [
    {
      id: "fc-1",
      topic: "Claude Code Skills",
      question: "What is the 'UI/UX Pro Max' skill and how do you install it in Claude Code?",
      answer: "UI/UX Pro Max is an open-source GitHub skill with 52,000+ stars containing design checklists and prompt rules. Install it using '/plugin marketplace add skill' or copy-pasting the GitHub URL into Claude Code.",
      difficulty: "Medium",
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      status: 'New'
    },
    {
      id: "fc-2",
      topic: "Visual Direction",
      question: "Why is supplying screenshots (Level 3) vastly superior to text prompts alone?",
      answer: "Claude Code interprets visual element screenshots (color palettes, hero spacing, social proof cards) with significantly higher fidelity than attempting to describe design intent with text.",
      difficulty: "Easy",
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      status: 'New'
    },
    {
      id: "fc-3",
      topic: "Code Deconstruction",
      question: "What is the 4-step process for cloning and learning from a production website in Level 4?",
      answer: "1. View Source (Ctrl+U) & copy HTML. 2. Identify linked CSS/JS files. 3. Pass source code or use 'site teardown skill' to Claude Code. 4. Prompt Claude to analyze and adapt specific layout keyframes.",
      difficulty: "Hard",
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      status: 'New'
    },
    {
      id: "fc-4",
      topic: "Motion Backgrounds",
      question: "How do you create a smooth looping background video for a website using AI?",
      answer: "Generate a stylized hero background image in Midjourney, then pass it into Kling 3.0 or VEO 3.1 to generate a 15-second video with matching start/end frames for seamless looping.",
      difficulty: "Medium",
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      status: 'New'
    }
  ],
  quiz: [
    {
      id: "qz-1",
      question: "What happens when you open Claude Code and use a generic prompt without design skills (Level 1)?",
      options: [
        "It automatically deploys a production-ready React app",
        "It yields generic output ('AI slop') with centered text, basic layout, and purple gradients",
        "Claude Code rejects the prompt",
        "It installs TailwindCSS automatically"
      ],
      correctOptionIndex: 1,
      explanation: "Without explicit design rules or visual references, AI defaults to uninspired generic templates.",
      category: "Level 1 Concepts"
    },
    {
      id: "qz-2",
      question: "Which design reference galleries are recommended for Level 3 (Visual Director)?",
      options: [
        "Awwwards, Godly.website, Dribbble, and Pinterest",
        "Wikipedia and StackOverflow text threads",
        "Default browser user agent stylesheets",
        "Standard stock photo sites"
      ],
      correctOptionIndex: 0,
      explanation: "Awwwards, Godly, Dribbble, and Pinterest showcase cutting-edge production web designs.",
      category: "Design Inspiration"
    },
    {
      id: "qz-3",
      question: "What is the recommended mobile performance optimization when using AI looping video backgrounds?",
      options: [
        "Play 4K video on mobile devices regardless of network",
        "Serve a static upscaled image on mobile devices and restrict background video to desktop views",
        "Remove all background images entirely on mobile",
        "Convert video to animated GIF"
      ],
      correctOptionIndex: 1,
      explanation: "Mobile browsers struggle with heavy video background loops; serving a compressed static image ensures fast page load times.",
      category: "Performance"
    },
    {
      id: "qz-4",
      question: "What is the primary function of the 'UI/UX Pro Max' skill in Claude Code?",
      options: [
        "It acts as a design system checklist and enforces UI best practices during code generation",
        "It compresses CSS files for faster production build times",
        "It automatically translates React code into Vue.js",
        "It converts Figma files directly into MP4 video animations"
      ],
      correctOptionIndex: 0,
      explanation: "The UI/UX Pro Max skill provides curated design tokens, typography rules, and component patterns to AI models.",
      category: "Level 2 Skills"
    },
    {
      id: "qz-5",
      question: "Why is supplying visual screenshots (Level 3) vastly superior to text prompts alone?",
      options: [
        "AI models parse visual spatial layouts with higher fidelity than ambiguous text adjectives",
        "Screenshots use less network bandwidth than text prompts",
        "Text prompts are deprecated in modern AI models",
        "Screenshots bypass API rate limits"
      ],
      correctOptionIndex: 0,
      explanation: "Vision-capable AI models can extract exact color hex codes, padding ratios, and card layouts directly from reference images.",
      category: "Visual Direction"
    },
    {
      id: "qz-6",
      question: "In Level 4 (The Cloner), what is the first step in deconstructing a target website?",
      options: [
        "Inspect the HTML/CSS source code using browser DevTools (Ctrl+U)",
        "Re-write the website from scratch without inspecting source files",
        "Email the website author asking for their Figma design link",
        "Use a screen recorder to record 60fps video"
      ],
      correctOptionIndex: 0,
      explanation: "Inspecting raw HTML, CSS stylesheets, and JS bundles gives the AI precise production code structures.",
      category: "Code Analysis"
    },
    {
      id: "qz-7",
      question: "What component library platform is highlighted for importing ready-made Tailwind/React micro-interactions?",
      options: [
        "21st.dev",
        "Bootstrap 3",
        "jQuery UI",
        "W3Schools"
      ],
      correctOptionIndex: 0,
      explanation: "21st.dev offers curated open-source React components with sleek modern animations.",
      category: "Level 5 Production"
    },
    {
      id: "qz-8",
      question: "How do AI video models like Kling 3.0 or VEO 3.1 create seamless video background loops?",
      options: [
        "By matching the first and final frame keyframes of the generated video clip",
        "By playing the video backwards in reverse",
        "By applying a 50% opacity crossfade",
        "By reducing video resolution to 240p"
      ],
      correctOptionIndex: 0,
      explanation: "Matching initial and final keyframe images ensures the video loops infinitely without a visible jump.",
      category: "AI Video Generation"
    },
    {
      id: "qz-9",
      question: "What is the 'Clone Ceiling' phenomenon in AI web development?",
      options: [
        "When an developer blindly copies code without understanding why the underlying patterns work",
        "A hardware restriction on browser DOM node counts",
        "The maximum number of files Vite can bundle",
        "A CSS z-index limit"
      ],
      correctOptionIndex: 0,
      explanation: "The Clone Ceiling occurs when developers copy output without asking the AI to explain the underlying logic.",
      category: "Best Practices"
    },
    {
      id: "qz-10",
      question: "Which CSS technique is recommended for modern glassmorphism card designs?",
      options: [
        "backdrop-filter: blur() with subtle translucent borders",
        "Solid black background with 0px border radius",
        "Heavy drop shadow with red background color",
        "Inline style tables"
      ],
      correctOptionIndex: 0,
      explanation: "Backdrop blur combined with thin semi-transparent borders creates a sleek glass aesthetic.",
      category: "CSS Styling"
    },
    {
      id: "qz-11",
      question: "What parameter in Gemini API controls the randomness and creativity of generated text?",
      options: [
        "Temperature",
        "Top-P",
        "Presence Penalty",
        "Frequency Penalty"
      ],
      correctOptionIndex: 0,
      explanation: "Lower temperature values (e.g. 0.2) produce deterministic, structured output suitable for JSON schemas.",
      category: "AI Parameters"
    },
    {
      id: "qz-12",
      question: "Why should developers specify design tokens (colors, font family, radiuses) early in prompt context?",
      options: [
        "It prevents the AI from choosing arbitrary default colors and inconsistent font styles",
        "It speeds up compilation speed by 50%",
        "It reduces npm package dependency count",
        "It disables browser developer console warnings"
      ],
      correctOptionIndex: 0,
      explanation: "Predefined design tokens guide the AI to generate cohesive UI across all application components.",
      category: "Design System"
    },
    {
      id: "qz-13",
      question: "What is the recommended approach for handling API key storage in client-side web apps?",
      options: [
        "Store in browser localStorage or prompt user to enter key securely",
        "Hardcode private key directly into public GitHub repository",
        "Embed key inside HTML comments",
        "Save key in unencrypted plain text file on desktop"
      ],
      correctOptionIndex: 0,
      explanation: "Using browser localStorage keeps the user's private API key local to their machine without exposure.",
      category: "Security"
    },
    {
      id: "qz-14",
      question: "What active recall algorithm is standard for flashcard spaced repetition systems?",
      options: [
        "SuperMemo-2 (SM-2)",
        "Dijkstra Shortest Path",
        "QuickSort",
        "Binary Search Tree"
      ],
      correctOptionIndex: 0,
      explanation: "SM-2 calculates optimal review intervals based on difficulty ratings and successful review counts.",
      category: "Active Recall"
    },
    {
      id: "qz-15",
      question: "Which HTML5 semantic element is recommended for top application navigation bars?",
      options: [
        "<header> or <nav>",
        "<div>",
        "<span>",
        "<table>"
      ],
      correctOptionIndex: 0,
      explanation: "<header> and <nav> provide semantic structure for accessibility and SEO.",
      category: "Semantic HTML"
    },
    {
      id: "qz-16",
      question: "What is the primary benefit of creating interactive mindmaps for complex educational topics?",
      options: [
        "It organizes hierarchical concepts visually, aiding mental mental model formation",
        "It reduces PDF file size",
        "It replaces text reading entirely",
        "It speeds up browser rendering"
      ],
      correctOptionIndex: 0,
      explanation: "Visual node trees allow learners to grasp main topics and sub-concepts in a single glance.",
      category: "Mindmapping"
    },
    {
      id: "qz-17",
      question: "In React, what hook is used to handle side effects like auto-scrolling message streams?",
      options: [
        "useEffect",
        "useState",
        "useContext",
        "useReducer"
      ],
      correctOptionIndex: 0,
      explanation: "useEffect runs side-effect logic (such as scrollIntoView) whenever message array dependencies update.",
      category: "React Architecture"
    },
    {
      id: "qz-18",
      question: "What styling property ensures long continuous text or code lines wrap cleanly on mobile screens?",
      options: [
        "word-break: break-word or overflow-x: auto",
        "display: none",
        "position: absolute",
        "float: left"
      ],
      correctOptionIndex: 0,
      explanation: "word-break and scrollable code containers prevent text from stretching off mobile screen boundaries.",
      category: "Mobile Responsiveness"
    },
    {
      id: "qz-19",
      question: "What is the main advantage of Web Speech API for voice AI integration?",
      options: [
        "Native browser speech-to-text recognition without third-party server latency",
        "Automatic language translation into 100 languages offline",
        "Video compression",
        "PDF file generation"
      ],
      correctOptionIndex: 0,
      explanation: "Web Speech API leverages native browser speech engines for zero-latency real-time voice input.",
      category: "Voice AI"
    },
    {
      id: "qz-20",
      question: "What is the ultimate goal of combining PDF Notes, Mindmaps, Flashcards, and MCQ Quizzes into one Copilot?",
      options: [
        "To provide a complete multi-modal active learning environment for students",
        "To replace standard web browsers",
        "To eliminate the need for study revision",
        "To format plain text files into HTML"
      ],
      correctOptionIndex: 0,
      explanation: "Multi-modal active learning engages multiple cognitive pathways, maximizing retention and exam readiness.",
      category: "Master Mastery"
    }
  ]
};

// Generate analysis via Gemini API with real YouTube metadata & title injection
export async function generateVideoAnalysis(
  youtubeUrl: string,
  apiKey: string,
  targetLanguage: string = 'en',
  customModel: string = 'gemini-2.5-flash-lite'
): Promise<VideoNoteAnalysis> {
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.");
  }

  // 1. Fetch real video metadata from YouTube oEmbed API
  const meta = await fetchYouTubeMetadata(youtubeUrl);
  const realTitle = meta?.title || `YouTube Video (${videoId})`;
  const realChannel = meta?.channelName || "YouTube Channel";
  const thumbnailUrl = meta?.thumbnailUrl || getYouTubeThumbnail(videoId);

  // If user enters 'DEMO' or leaves key blank, return high quality demo analysis
  if (!apiKey || apiKey.trim().toUpperCase() === "DEMO") {
    const baseDemo = {
      ...SAMPLE_ANALYSIS,
      videoId,
      videoUrl: youtubeUrl,
      videoTitle: realTitle,
      channelName: realChannel,
      thumbnailUrl,
      createdAt: new Date().toISOString()
    };
    if (targetLanguage === 'hi') {
      return translateAnalysis(baseDemo, 'hi', '');
    }
    return baseDemo;
  }

  const isHindi = targetLanguage === 'hi';

  // Master Prompt for Exhaustive Academic & Technical Notes (ULTRA-DENSE PDF OUTPUT)
  const prompt = `
You are an elite educational note generator and master academic study assistant.
I am analyzing the specific YouTube video:
- Title: "${realTitle}"
- Channel: "${realChannel}"
- Video URL: "${youtubeUrl}" (ID: "${videoId}")

ABSOLUTE CRITICAL INSTRUCTION:
Perform an UNCOMPRESSED, EXHAUSTIVE, ACADEMIC MASTERPIECE SYNTHESIS of this exact video ("${realTitle}").
You MUST extract EVERY SINGLE POINT, concept, example, case study, formula, code snippet, technique, tip, and piece of information from this video.
DO NOT summarize loosely. DO NOT shorten. DO NOT skip anything.
Write COMPLETE, HIGH-DENSITY, MULTI-PARAGRAPH notes so that a student reading only your notes gets 100% of the video's value — as if they watched the entire video twice.
The output should be SO DETAILED that it could fill 15-25 printed pages.

CONTENT DENSITY RULES:
- overallSummary: Write 8-12 comprehensive sentences covering EVERY major theme, technique, and outcome from the video.
- keyTakeaways: Generate 8-15 takeaways. Each MUST have a 5-6 sentence deep explanation with examples.
- outline: Break the video into EVERY chapter/section (aim for 8-15 chapters). Each chapter MUST have:
  * A detailed multi-paragraph summary (4-8 sentences minimum)
  * 5-10 key points per chapter
  * Code snippets if technical content is discussed
  * Pro tips specific to that chapter
- detailedNotes: Write EXHAUSTIVE long-form lecture notes (3000-6000 words) covering the ENTIRE video content chapter by chapter. Use markdown formatting with ## headings, bullet points, bold terms, and code blocks. This is the MOST IMPORTANT field — it should read like a complete textbook chapter.
- flashcards: Generate 20-30 flashcards covering every concept, term, technique, and fact from the video.
- quiz: Generate 20-25 MCQ questions with 4 options each, covering all topics from the video.
- mindmap: Create a deep 4-level hierarchy with every sub-concept mapped out.
- vocabularyTerms: Extract 10-20 key technical terms with precise definitions.
- formulasAndEquations: Extract any math formulas, equations, algorithms, or technical rules mentioned.
- proTipsGlobal: 5-8 actionable pro tips.
- trapsToAvoidGlobal: 5-8 common mistakes/pitfalls.
- mentalModels: 3-5 mental models or frameworks from the video.

${isHindi ? '- CRITICAL LANGUAGE INSTRUCTION: Generate all text in HINDI (हिन्दी). Use Devanagari script for Hindi text, with technical terminology (like Python, React, Code, Physics) written naturally in English.' : ''}

You MUST strictly return ONLY raw valid JSON matching this schema:
{
  "videoTitle": "${realTitle.replace(/"/g, '\\"')}",
  "channelName": "${realChannel.replace(/"/g, '\\"')}",
  "duration": "Estimated length",
  "overallSummary": "Comprehensive 8-12 sentence deep executive synthesis covering every major theme.",
  "mentalModels": ["Model 1", "Model 2", "Model 3", "Model 4", "Model 5"],
  "proTipsGlobal": ["Pro Tip 1", "Pro Tip 2", "Pro Tip 3", "Pro Tip 4", "Pro Tip 5"],
  "trapsToAvoidGlobal": ["Trap 1", "Trap 2", "Trap 3", "Trap 4", "Trap 5"],
  "detailedNotes": "## Chapter 1: Title\\n\\nLong detailed paragraph...\\n\\n## Chapter 2: Title\\n\\nLong detailed paragraph... (3000-6000 words total, markdown formatted)",
  "vocabularyTerms": [
    { "term": "Technical Term", "definition": "Precise 2-3 sentence definition with context" }
  ],
  "formulasAndEquations": ["Formula 1: description", "Formula 2: description"],
  "keyTakeaways": [
    {
      "id": "kt-1",
      "title": "High-impact takeaway title",
      "description": "Deep 5-6 sentence explanation with examples and context",
      "tag": "Category Tag",
      "impact": "Critical"
    }
  ],
  "outline": [
    {
      "id": "out-1",
      "timestamp": "00:00 - 04:00",
      "title": "Granular Chapter Title",
      "summary": "Detailed 4-8 sentence technical summary covering everything discussed",
      "keyPoints": ["Point 1 with detail", "Point 2 with detail", "Point 3", "Point 4", "Point 5"],
      "codeSnippets": [
        {
          "language": "bash",
          "code": "code snippet",
          "explanation": "explanation"
        }
      ]
    }
  ],
  "mindmap": {
    "id": "root",
    "label": "${realTitle.substring(0, 35).replace(/"/g, '\\"')}",
    "category": "Root Subject",
    "color": "#6366f1",
    "details": "Central core topic",
    "children": [
      {
        "id": "m-1",
        "label": "1. Major Concept",
        "category": "Main Branch",
        "color": "#3b82f6",
        "details": "Overview",
        "children": [
          {
            "id": "m-1-1",
            "label": "Subtopic A",
            "details": "Detail",
            "children": [
              { "id": "m-1-1-1", "label": "Key Detail 1", "details": "Specific" }
            ]
          }
        ]
      }
    ]
  },
  "flashcards": [
    {
      "id": "fc-1",
      "topic": "Topic Name",
      "question": "Active recall question",
      "answer": "Detailed answer with reasoning (3-4 sentences)",
      "difficulty": "Hard"
    }
  ],
  "quiz": [
    {
      "id": "qz-1",
      "question": "Scenario question testing deep understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Detailed rationale explanation (2-3 sentences)",
      "category": "Category"
    }
  ]
}

REMEMBER: Generate MAXIMUM content. Every concept, every example, every detail from "${realTitle}" must be captured. The detailedNotes field alone should be 3000-6000 words. Do NOT truncate or shorten anything.
`;

  const ai = new GoogleGenerativeAI(apiKey.trim());
  let lastError: any = null;

  const candidates = Array.from(new Set([customModel, ...MODEL_CANDIDATES]));

  for (const modelName of candidates) {
    try {
      console.log(`Attempting Gemini request with model: ${modelName} for "${realTitle}"`);
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 65536
        }
      });

      const result = await model.generateContent([prompt]);
      const response = result.response;
      const responseText = response.text();

      if (!responseText) {
        throw new Error(`Empty response from model ${modelName}`);
      }

      const cleanedJson = cleanJsonResponse(responseText);
      const parsedData = JSON.parse(cleanedJson);
      const usageMeta = response.usageMetadata;
      const inputTokens = usageMeta?.promptTokenCount || Math.ceil(prompt.length / 4);
      const outputTokens = usageMeta?.candidatesTokenCount || Math.ceil(responseText.length / 4);
      const costObj = calculateGeminiCost(inputTokens, outputTokens);

      const fullAnalysis: VideoNoteAnalysis = {
        id: "gemini-" + Date.now(),
        videoId,
        videoUrl: youtubeUrl,
        thumbnailUrl,
        videoTitle: parsedData.videoTitle || realTitle,
        channelName: parsedData.channelName || realChannel,
        duration: parsedData.duration || "N/A",
        createdAt: new Date().toISOString(),
        language: "en",
        overallSummary: parsedData.overallSummary || `Summary for ${realTitle}`,
        mentalModels: parsedData.mentalModels || [],
        proTipsGlobal: parsedData.proTipsGlobal || [],
        trapsToAvoidGlobal: parsedData.trapsToAvoidGlobal || [],
        keyTakeaways: parsedData.keyTakeaways || [],
        outline: parsedData.outline || [],
        mindmap: parsedData.mindmap || { id: "root", label: realTitle },
        flashcards: parsedData.flashcards || [],
        quiz: parsedData.quiz || [],
        detailedNotes: parsedData.detailedNotes || '',
        vocabularyTerms: parsedData.vocabularyTerms || [],
        formulasAndEquations: parsedData.formulasAndEquations || [],
        usageCost: {
          inputTokens,
          outputTokens,
          costUsd: costObj.costUsd,
          costInr: costObj.costInr
        }
      };

      return fullAnalysis;
    } catch (err: any) {
      console.warn(`Model ${modelName} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || "Failed to analyze video.");
}

// Chat Response Interface with Token Usage
export interface ChatAiResponseWithCost {
  text: string;
  usageCost?: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    costInr: number;
  };
}

// Chat with Master AI Copilot (Handles Video Q&A, General Knowledge, Math, Coding, Science & History)
export async function chatWithMasterAiDetailed(
  userQuery: string,
  analysis?: VideoNoteAnalysis | null,
  apiKey?: string,
  currentLanguage: string = 'en',
  customModel: string = 'gemini-2.5-flash-lite'
): Promise<ChatAiResponseWithCost> {
  const isHindi = currentLanguage === 'hi';

  if (!apiKey || apiKey.trim().toUpperCase() === "DEMO") {
    let replyText = `Hello! I am MindTube AI Copilot. You asked: "${userQuery}". Add your Gemini API Key in settings to enable full real-time Gemini 2.5 Flash reasoning!`;
    if (isHindi) {
      replyText = analysis
        ? `नमस्ते! मैं MindTube AI Copilot हूँ। "${analysis.videoTitle}" के लिए आपका सवाल: "${userQuery}"। अधिक विस्तृत AI उत्तर के लिए सेटिंग्स में Gemini API Key जोड़ें!`
        : `नमस्ते! मैं MindTube AI हूँ। आपका प्रश्न: "${userQuery}"। पूर्ण real-time Gemini 2.5 AI उत्तर पाने के लिए सेटिंग्स में Gemini API Key दर्ज करें!`;
    } else if (analysis) {
      replyText = `As an AI Study Copilot for "${analysis.videoTitle}", regarding "${userQuery}": This video highlights key practical concepts. Add your Gemini API Key in settings for unlimited real-time AI answers!`;
    }

    return {
      text: replyText,
      usageCost: {
        inputTokens: 850,
        outputTokens: 520,
        costUsd: 0.000219,
        costInr: 0.019
      }
    };
  }

  const ai = new GoogleGenerativeAI(apiKey.trim());

  let systemPrompt = `You are MindTube AI, an elite educational and technical AI assistant. Answer user questions with extreme clarity, step-by-step explanations, code snippets (if technical), formulas (if math/physics), and structured markdown headings and bullet points.`;

  if (isHindi) {
    systemPrompt += `\n\nCRITICAL LANGUAGE INSTRUCTION: Write your entire answer in clear, natural, fluent HINDI (हिन्दी). Use Devanagari script for Hindi text, with technical terminology (like Code, Python, YouTube, Physics) written naturally in English or Hinglish script for maximum readability.`;
  }

  if (analysis) {
    systemPrompt += `\n\nActive Video Context:
Title: "${analysis.videoTitle}" by "${analysis.channelName}"
Summary: ${analysis.overallSummary}
Key Points: ${analysis.keyTakeaways.map(k => k.title + ': ' + k.description).join('; ')}
Chapters: ${analysis.outline.map(o => o.timestamp + ' ' + o.title).join('; ')}`;
  }

  const fullPrompt = `${systemPrompt}\n\nUser Prompt: "${userQuery}"\n\nProvide a comprehensive, beautifully structured answer.`;
  const candidates = Array.from(new Set([customModel, ...MODEL_CANDIDATES]));
  let lastErr: any = null;

  for (const modelName of candidates) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([fullPrompt]);
      const res = await result.response;
      const text = res.text() || "I couldn't process your question. Please try again.";

      const usageMeta = res.usageMetadata;
      const inputTokens = usageMeta?.promptTokenCount || Math.ceil(fullPrompt.length / 4);
      const outputTokens = usageMeta?.candidatesTokenCount || Math.ceil(text.length / 4);
      const costObj = calculateGeminiCost(inputTokens, outputTokens);

      return {
        text,
        usageCost: {
          inputTokens,
          outputTokens,
          costUsd: costObj.costUsd,
          costInr: costObj.costInr
        }
      };
    } catch (err: any) {
      console.warn(`Chat model ${modelName} failed:`, err);
      lastErr = err;
    }
  }

  return {
    text: `Error: ${lastErr?.message || "Failed to retrieve response from Gemini AI."}`
  };
}

export async function chatWithMasterAi(
  userQuery: string,
  analysis?: VideoNoteAnalysis | null,
  apiKey?: string,
  currentLanguage: string = 'en'
): Promise<string> {
  const res = await chatWithMasterAiDetailed(userQuery, analysis, apiKey, currentLanguage);
  return res.text;
}

// Legacy alias
export const chatWithVideoAi = (userQuery: string, analysis: VideoNoteAnalysis, _history: any, apiKey: string) =>
  chatWithMasterAi(userQuery, analysis, apiKey);

// Translate Video Analysis to Target Language (Hindi, Spanish, French, German, etc.)
export async function translateAnalysis(
  analysis: VideoNoteAnalysis,
  targetLang: string,
  apiKey: string
): Promise<VideoNoteAnalysis> {
  if (!apiKey || apiKey.trim().toUpperCase() === "DEMO") {
    // Basic translation simulation for demo
    if (targetLang === "hi") {
      return {
        ...analysis,
        language: "hi",
        overallSummary: "यह मास्टरक्लास क्लाउड कोड का उपयोग करके फ्रंट-एंड वेबसाइट डिजाइन के 7 स्तरों का विवरण देता है।",
        videoTitle: `${analysis.videoTitle} (हिंदी)`
      };
    }
    return { ...analysis, language: targetLang };
  }

  const ai = new GoogleGenerativeAI(apiKey.trim());
  const prompt = `
You are a professional translator. Translate the following educational JSON data into target language "${targetLang}" (e.g. Hindi, Spanish, French, etc.). Keep JSON structure intact and translate all strings (summaries, labels, questions, options, flashcards).

Input JSON:
${JSON.stringify(analysis)}

Return ONLY raw valid JSON translated into "${targetLang}".
`;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent([prompt]);
    const cleaned = cleanJsonResponse(result.response.text());
    const parsed = JSON.parse(cleaned);
    return { ...parsed, language: targetLang };
  } catch (err) {
    console.error("Translation error:", err);
    return analysis;
  }
}
