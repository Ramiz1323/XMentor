import { useState, useEffect, useRef, useCallback } from "react";

// ── Themes ─────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#0a0c14", bgCard: "#0f1220", bgMid: "#141828",
    border: "#1e2540", borderBright: "#2d3a6e",
    accent: "#4f6ef7", accentGlow: "#4f6ef766",
    cyan: "#22d3ee", amber: "#f59e0b", rose: "#f43f5e",
    green: "#10b981", purple: "#a855f7",
    textPrimary: "#e8eaf6", textSecondary: "#8892b0", textMuted: "#4a5278",
  },
  light: {
    bg: "#f0f2ff", bgCard: "#ffffff", bgMid: "#e8ebf8",
    border: "#d0d6f0", borderBright: "#b0baee",
    accent: "#3a5bd9", accentGlow: "#3a5bd933",
    cyan: "#0891b2", amber: "#d97706", rose: "#e11d48",
    green: "#059669", purple: "#7c3aed",
    textPrimary: "#0f172a", textSecondary: "#475569", textMuted: "#94a3b8",
  }
};
let C = THEMES.dark;

// ── Sample data ────────────────────────────────────────────────────
const QUESTIONS = [
  { id: 1, topic: "Mathematics", difficulty: 2, question: "If f(x) = x² + 3x − 4, find f(−2).", options: ["−6","−2","0","2"], answer: 0, xp: 40, explanation: "f(−2) = (−2)² + 3(−2) − 4 = 4 − 6 − 4 = −6." },
  { id: 2, topic: "Physics", difficulty: 1, question: "What is the SI unit of electric current?", options: ["Volt","Ampere","Ohm","Watt"], answer: 1, xp: 20, explanation: "Electric current is measured in Amperes (A), named after André-Marie Ampère." },
  { id: 3, topic: "Chemistry", difficulty: 2, question: "What is the atomic number of Carbon?", options: ["4","6","8","12"], answer: 1, xp: 30, explanation: "Carbon has 6 protons, so its atomic number is 6." },
  { id: 4, topic: "Mathematics", difficulty: 3, question: "Solve: ∫ 2x dx = ?", options: ["x² + C","2x² + C","x + C","2 + C"], answer: 0, xp: 60, explanation: "∫ 2x dx = x² + C by the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C." },
  { id: 5, topic: "Biology", difficulty: 1, question: "Which organelle is called the powerhouse of the cell?", options: ["Nucleus","Ribosome","Mitochondria","Golgi body"], answer: 2, xp: 20, explanation: "Mitochondria produce ATP via cellular respiration — hence 'powerhouse'." },
  { id: 6, topic: "Physics", difficulty: 2, question: "What is the speed of light in a vacuum?", options: ["3×10⁸ m/s","3×10⁶ m/s","3×10¹⁰ m/s","3×10⁵ m/s"], answer: 0, xp: 30, explanation: "Light travels at approximately 3×10⁸ m/s (299,792,458 m/s exactly) in a vacuum." },
  { id: 7, topic: "Chemistry", difficulty: 3, question: "What is the pH of a neutral solution at 25°C?", options: ["0","7","14","5"], answer: 1, xp: 40, explanation: "At 25°C pure water has [H⁺] = [OH⁻] = 10⁻⁷ M, giving pH = 7." },
  { id: 8, topic: "Biology", difficulty: 2, question: "DNA replication is described as:", options: ["Conservative","Semi-conservative","Dispersive","Selective"], answer: 1, xp: 40, explanation: "Each new DNA double helix contains one original strand and one new strand — semi-conservative." },
];

const BADGES = [
  { id: "first_blood", icon: "⚡", name: "First Strike", desc: "Answer your first question", unlocked: true },
  { id: "streak_5", icon: "🔥", name: "On Fire", desc: "5-day streak", unlocked: true },
  { id: "perfect_round", icon: "💎", name: "Diamond Run", desc: "Perfect score in a round", unlocked: false },
  { id: "speed_demon", icon: "⚡", name: "Speed Demon", desc: "Answer in under 3s", unlocked: false },
  { id: "scholar", icon: "🎓", name: "Scholar", desc: "Complete 50 questions", unlocked: false },
  { id: "mentor_star", icon: "⭐", name: "Mentor Star", desc: "Rated 5 stars by mentor", unlocked: false },
];

const LEADERBOARD = [
  { rank: 1, name: "Arjun Sharma", xp: 9840, streak: 21, avatar: "AS", badge: "🏆" },
  { rank: 2, name: "Priya Nair", xp: 8720, streak: 14, avatar: "PN", badge: "🥈" },
  { rank: 3, name: "Rohan Das", xp: 7560, streak: 9, avatar: "RD", badge: "🥉" },
  { rank: 4, name: "Sneha Patel", xp: 6340, streak: 7, avatar: "SP", badge: "" },
  { rank: 5, name: "You", xp: 4200, streak: 5, avatar: "YO", badge: "" },
];

const SKILL_TREE = [
  { id: "algebra", label: "Algebra", x: 120, y: 60, unlocked: true, mastered: true, topic: "Mathematics" },
  { id: "calc", label: "Calculus", x: 260, y: 60, unlocked: true, mastered: false, topic: "Mathematics" },
  { id: "stats", label: "Statistics", x: 400, y: 60, unlocked: false, mastered: false, topic: "Mathematics" },
  { id: "mechanics", label: "Mechanics", x: 120, y: 180, unlocked: true, mastered: true, topic: "Physics" },
  { id: "electro", label: "Electromagnetism", x: 260, y: 180, unlocked: true, mastered: false, topic: "Physics" },
  { id: "waves", label: "Waves & Optics", x: 400, y: 180, unlocked: false, mastered: false, topic: "Physics" },
  { id: "organic", label: "Organic Chem", x: 120, y: 300, unlocked: true, mastered: false, topic: "Chemistry" },
  { id: "inorganic", label: "Inorganic Chem", x: 260, y: 300, unlocked: false, mastered: false, topic: "Chemistry" },
  { id: "cell", label: "Cell Biology", x: 400, y: 300, unlocked: true, mastered: false, topic: "Biology" },
];

const EDGES = [
  ["algebra","calc"],["calc","stats"],
  ["mechanics","electro"],["electro","waves"],
  ["organic","inorganic"],
];

const MISSIONS = [
  { id: 1, label: "Answer 5 questions today", progress: 3, total: 5, xp: 100, icon: "📋" },
  { id: 2, label: "Get 3 correct in a row", progress: 2, total: 3, xp: 75, icon: "🎯" },
  { id: 3, label: "Study a new topic", progress: 0, total: 1, xp: 50, icon: "📚" },
];

const STUDY_GROUPS = [
  { id: 1, name: "Physics Legends", members: 8, active: true, topic: "Electromagnetism", avatar: "⚡" },
  { id: 2, name: "Math Wizards", members: 12, active: false, topic: "Calculus", avatar: "∫" },
  { id: 3, name: "Bio Squad", members: 5, active: true, topic: "Cell Biology", avatar: "🧬" },
];

// ── Multilingual strings ───────────────────────────────────────────
const LANG = {
  en: {
    hub: "Hub", quiz: "Quiz", battle: "Battle", skills: "Skills",
    mentor: "Mentor", squad: "Squad", stats: "Stats", profile: "Profile",
    settings: "Settings",
    welcomeBack: "Welcome back, Commander 👋",
    streakMsg: (n) => `You're on a ${n}-day streak. Don't break it!`,
    startQuiz: "Start Quiz ▶", joinBattle: "Join Battle ⚔️",
    dailyMissions: "🎯 Daily Missions", spacedRep: "🔄 Spaced Repetition",
    leaderboard: "🏆 Global Leaderboard", reviewDue: "Review Due Topics →",
    nextQ: "Next Question →", aiHint: "🤖 AI Hint (−5 XP)",
    explanation: "💡 Explanation", roundComplete: "Round Complete!",
    playAgain: "Play Again ▶", correct: "correct",
    totalXP: "Total XP", streak: "Streak", rank: "Rank",
    accuracy: "Accuracy", topics: "Topics",
    language: "Language", theme: "Theme", notifications: "Notifications",
    accessibility: "Accessibility", appSettings: "⚙️ Settings",
    darkMode: "Dark Mode", lightMode: "Light Mode",
    levelUp: "LEVEL UP!", newLevel: (n) => `You reached Level ${n}!`,
    multiplier: (x) => `${x}x Streak Multiplier Active!`,
  },
  bn: {
    hub: "হাব", quiz: "কুইজ", battle: "যুদ্ধ", skills: "দক্ষতা",
    mentor: "মেন্টর", squad: "দল", stats: "পরিসংখ্যান", profile: "প্রোফাইল",
    settings: "সেটিংস",
    welcomeBack: "স্বাগতম, কমান্ডার 👋",
    streakMsg: (n) => `আপনি ${n} দিনের ধারায় আছেন। থামবেন না!`,
    startQuiz: "কুইজ শুরু করুন ▶", joinBattle: "যুদ্ধে যোগ দিন ⚔️",
    dailyMissions: "🎯 দৈনিক মিশন", spacedRep: "🔄 স্পেসড রিপিটিশন",
    leaderboard: "🏆 গ্লোবাল লিডারবোর্ড", reviewDue: "বকেয়া বিষয় পর্যালোচনা →",
    nextQ: "পরের প্রশ্ন →", aiHint: "🤖 AI ইঙ্গিত (−5 XP)",
    explanation: "💡 ব্যাখ্যা", roundComplete: "রাউন্ড সম্পূর্ণ!",
    playAgain: "আবার খেলুন ▶", correct: "সঠিক",
    totalXP: "মোট XP", streak: "ধারা", rank: "র‍্যাংক",
    accuracy: "নির্ভুলতা", topics: "বিষয়",
    language: "ভাষা", theme: "থিম", notifications: "বিজ্ঞপ্তি",
    accessibility: "অ্যাক্সেসিবিলিটি", appSettings: "⚙️ সেটিংস",
    darkMode: "ডার্ক মোড", lightMode: "লাইট মোড",
    levelUp: "লেভেল আপ!", newLevel: (n) => `আপনি লেভেল ${n}-এ পৌঁছেছেন!`,
    multiplier: (x) => `${x}x স্ট্রিক মাল্টিপ্লায়ার সক্রিয়!`,
  },
  hi: {
    hub: "हब", quiz: "प्रश्नोत्तरी", battle: "युद्ध", skills: "कौशल",
    mentor: "मेंटर", squad: "दल", stats: "आँकड़े", profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    welcomeBack: "वापस आपका स्वागत है, कमांडर 👋",
    streakMsg: (n) => `आप ${n}-दिन की लकीर पर हैं। इसे मत तोड़ो!`,
    startQuiz: "प्रश्नोत्तरी शुरू करें ▶", joinBattle: "युद्ध में शामिल हों ⚔️",
    dailyMissions: "🎯 दैनिक मिशन", spacedRep: "🔄 स्पेस्ड रिपीटिशन",
    leaderboard: "🏆 वैश्विक लीडरबोर्ड", reviewDue: "बकाया विषय देखें →",
    nextQ: "अगला प्रश्न →", aiHint: "🤖 AI संकेत (−5 XP)",
    explanation: "💡 व्याख्या", roundComplete: "राउंड पूरा!",
    playAgain: "फिर खेलें ▶", correct: "सही",
    totalXP: "कुल XP", streak: "लकीर", rank: "रैंक",
    accuracy: "सटीकता", topics: "विषय",
    language: "भाषा", theme: "थीम", notifications: "सूचनाएँ",
    accessibility: "पहुँच", appSettings: "⚙️ सेटिंग्स",
    darkMode: "डार्क मोड", lightMode: "लाइट मोड",
    levelUp: "लेवल अप!", newLevel: (n) => `आप लेवल ${n} पर पहुँच गए!`,
    multiplier: (x) => `${x}x स्ट्रीक मल्टीप्लायर सक्रिय!`,
  }
};

// ── Localised question sets ────────────────────────────────────────
const QUESTIONS_BN = [
  { id: 101, topic: "গণিত", difficulty: 2, question: "যদি f(x) = x² + 3x − 4 হয়, তাহলে f(−2) = ?", options: ["−6","−2","0","2"], answer: 0, xp: 40, explanation: "f(−2) = 4 − 6 − 4 = −6।" },
  { id: 102, topic: "পদার্থবিজ্ঞান", difficulty: 1, question: "বৈদ্যুতিক প্রবাহের SI একক কী?", options: ["ভোল্ট","অ্যাম্পিয়ার","ওহম","ওয়াট"], answer: 1, xp: 20, explanation: "বৈদ্যুতিক প্রবাহ অ্যাম্পিয়ারে পরিমাপ করা হয়।" },
  { id: 103, topic: "রসায়ন", difficulty: 2, question: "কার্বনের পরমাণু সংখ্যা কত?", options: ["4","6","8","12"], answer: 1, xp: 30, explanation: "কার্বনে ৬টি প্রোটন আছে।" },
];

const QUESTIONS_HI = [
  { id: 201, topic: "गणित", difficulty: 2, question: "यदि f(x) = x² + 3x − 4 हो, तो f(−2) = ?", options: ["−6","−2","0","2"], answer: 0, xp: 40, explanation: "f(−2) = 4 − 6 − 4 = −6।" },
  { id: 202, topic: "भौतिकी", difficulty: 1, question: "विद्युत धारा की SI इकाई क्या है?", options: ["वोल्ट","एम्पियर","ओम","वाट"], answer: 1, xp: 20, explanation: "विद्युत धारा एम्पियर में मापी जाती है।" },
  { id: 203, topic: "रसायन", difficulty: 2, question: "कार्बन का परमाणु क्रमांक क्या है?", options: ["4","6","8","12"], answer: 1, xp: 30, explanation: "कार्बन में 6 प्रोटॉन होते हैं।" },
];

// ── Discussion threads data ────────────────────────────────────────
const INIT_THREADS = {
  Mathematics: [
    { id: 1, user: "Arjun S.", avatar: "AS", text: "Can anyone explain why integration gives area under the curve?", time: "2h ago", replies: 3, likes: 7 },
    { id: 2, user: "Priya N.", avatar: "PN", text: "The chain rule tripped me up at first — think of it as layers of functions unwrapping from outside in.", time: "5h ago", replies: 1, likes: 12 },
  ],
  Physics: [
    { id: 3, user: "Rohan D.", avatar: "RD", text: "Lenz's law makes so much more sense when you think about energy conservation.", time: "1h ago", replies: 2, likes: 5 },
  ],
  Chemistry: [
    { id: 4, user: "Sneha P.", avatar: "SP", text: "Remembering oxidation states: OIL RIG — Oxidation Is Loss, Reduction Is Gain.", time: "3h ago", replies: 4, likes: 18 },
  ],
  Biology: [
    { id: 5, user: "Arjun S.", avatar: "AS", text: "Semi-conservative replication is easiest to visualise with the Meselson-Stahl experiment.", time: "6h ago", replies: 0, likes: 9 },
  ],
};

// ── Toast notification system ──────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 70, right: 16, zIndex: 999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "xp" ? `${C.amber}ee` : t.type === "levelup" ? `${C.purple}ee` : t.type === "badge" ? `${C.green}ee` : `${C.accent}ee`,
          color: "#fff", borderRadius: 12, padding: "10px 16px",
          fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px #00000055",
          animation: "slideIn .3s ease", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <span style={{ fontSize: 16 }}>{t.icon}</span>{t.msg}
        </div>
      ))}
      <style>{`@keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Level-up modal ─────────────────────────────────────────────────
function LevelUpModal({ level, onClose, T }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000099",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500
    }} onClick={onClose}>
      <div style={{
        background: C.bgCard, border: `2px solid ${C.purple}`,
        borderRadius: 24, padding: "40px 48px", textAlign: "center",
        boxShadow: `0 0 60px ${C.purple}55`, maxWidth: 340
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: "spin 1s ease" }}>⭐</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.purple, marginBottom: 8 }}>{T.levelUp}</div>
        <div style={{ fontSize: 16, color: C.textSecondary, marginBottom: 24 }}>{T.newLevel(level)}</div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 24 }}>
          {["New Questions Unlocked","Harder Challenges","Bonus XP +20%"].map((r,i) => (
            <div key={i} style={{ fontSize: 11, color: C.purple, background: `${C.purple}15`, border: `1px solid ${C.purple}33`, borderRadius: 8, padding: "6px 10px", textAlign: "center", maxWidth: 80 }}>{r}</div>
          ))}
        </div>
        <button onClick={onClose} style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>Awesome! 🚀</button>
        <style>{`@keyframes spin { 0% { transform: scale(0) rotate(-180deg); } 100% { transform: scale(1) rotate(0deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Onboarding flow ────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en");

  const topics = ["Mathematics","Physics","Chemistry","Biology","History","Geography","Computer Science","English"];
  const langs = [{ code: "en", label: "English" }, { code: "bn", label: "বাংলা" }, { code: "hi", label: "हिंदी" }];

  const toggleTopic = (t) => setSelectedTopics(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);

  const steps = [
    // Step 0: Welcome
    <div key={0} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>⚔️</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: C.textPrimary, marginBottom: 8 }}>Welcome to XMentor</div>
      <div style={{ fontSize: 15, color: C.textSecondary, marginBottom: 32, lineHeight: 1.6 }}>Your gamified intelligence & tactical learning hub. Let's set up your profile in 3 quick steps.</div>
      <button onClick={() => setStep(1)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "14px 36px", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>Let's Go →</button>
    </div>,

    // Step 1: Name + language
    <div key={1}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, marginBottom: 4 }}>What should we call you?</div>
      <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20 }}>Choose your name and preferred language.</div>
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="Enter your name..."
        style={{ width: "100%", background: C.bgMid, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", color: C.textPrimary, fontSize: 15, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
      <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 10 }}>Choose language / ভাষা / भाषा</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {langs.map(l => (
          <button key={l.code} onClick={() => setSelectedLang(l.code)} style={{
            flex: 1, background: selectedLang === l.code ? `${C.accent}22` : C.bgMid,
            color: selectedLang === l.code ? C.accent : C.textSecondary,
            border: `1.5px solid ${selectedLang === l.code ? C.accent : C.border}`,
            borderRadius: 10, padding: "10px 8px", cursor: "pointer", fontWeight: 600, fontSize: 14
          }}>{l.label}</button>
        ))}
      </div>
      <button onClick={() => name.trim() && setStep(2)} style={{ width: "100%", background: name.trim() ? C.accent : C.bgMid, color: name.trim() ? "#fff" : C.textMuted, border: "none", borderRadius: 12, padding: "13px", cursor: name.trim() ? "pointer" : "default", fontWeight: 700, fontSize: 15 }}>Continue →</button>
    </div>,

    // Step 2: Topic selection
    <div key={2}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, marginBottom: 4 }}>Pick your subjects</div>
      <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20 }}>We'll personalise your learning path around these.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {topics.map(t => (
          <button key={t} onClick={() => toggleTopic(t)} style={{
            background: selectedTopics.includes(t) ? `${C.accent}22` : C.bgMid,
            color: selectedTopics.includes(t) ? C.accent : C.textSecondary,
            border: `1.5px solid ${selectedTopics.includes(t) ? C.accent : C.border}`,
            borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13,
            textAlign: "left", display: "flex", alignItems: "center", gap: 8
          }}>
            {selectedTopics.includes(t) ? "✓" : "○"} {t}
          </button>
        ))}
      </div>
      <button onClick={() => selectedTopics.length > 0 && onComplete({ name, lang: selectedLang, topics: selectedTopics })}
        style={{ width: "100%", background: selectedTopics.length > 0 ? C.green : C.bgMid, color: selectedTopics.length > 0 ? "#fff" : C.textMuted, border: "none", borderRadius: 12, padding: "13px", cursor: selectedTopics.length > 0 ? "pointer" : "default", fontWeight: 700, fontSize: 15 }}>
        Start Learning 🚀
      </button>
    </div>
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 20, padding: "36px 32px", maxWidth: 420, width: "100%" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 99, background: i <= step ? C.accent : C.border, transition: "all .3s" }} />
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  );
}

// ── Discussion Threads ─────────────────────────────────────────────
function DiscussionThreads({ lang }) {
  const T = LANG[lang] || LANG.en;
  const [threads, setThreads] = useState(INIT_THREADS);
  const [activeTopic, setActiveTopic] = useState("Mathematics");
  const [newText, setNewText] = useState("");
  const [openThread, setOpenThread] = useState(null);
  const [replyText, setReplyText] = useState("");

  const post = () => {
    if (!newText.trim()) return;
    const newThread = { id: Date.now(), user: "You", avatar: "YO", text: newText, time: "just now", replies: 0, likes: 0 };
    setThreads(t => ({ ...t, [activeTopic]: [newThread, ...t[activeTopic]] }));
    setNewText("");
  };

  const like = (id) => {
    setThreads(t => ({
      ...t,
      [activeTopic]: t[activeTopic].map(th => th.id === id ? { ...th, likes: th.likes + 1 } : th)
    }));
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: C.textPrimary, marginBottom: 20 }}>💬 Discussion Threads</div>

      {/* Topic tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {Object.keys(threads).map(topic => (
          <button key={topic} onClick={() => setActiveTopic(topic)} style={{
            background: activeTopic === topic ? `${C.accent}22` : C.bgCard,
            color: activeTopic === topic ? C.accent : C.textSecondary,
            border: `1px solid ${activeTopic === topic ? C.accent + "55" : C.border}`,
            borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap"
          }}>{topic}</button>
        ))}
      </div>

      {/* New post */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <textarea value={newText} onChange={e => setNewText(e.target.value)}
          placeholder={`Start a discussion in ${activeTopic}...`}
          style={{ width: "100%", background: C.bgMid, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", color: C.textPrimary, fontSize: 13, outline: "none", resize: "vertical", minHeight: 60, boxSizing: "border-box", fontFamily: "inherit" }} />
        <button onClick={post} style={{ marginTop: 10, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Post</button>
      </div>

      {/* Thread list */}
      {(threads[activeTopic] || []).map(th => (
        <div key={th.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Avatar initials={th.avatar} size={34} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{th.user}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{th.time}</span>
              </div>
              <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6, marginBottom: 10 }}>{th.text}</div>
              <div style={{ display: "flex", gap: 14 }}>
                <button onClick={() => like(th.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 12, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  👍 {th.likes}
                </button>
                <button onClick={() => setOpenThread(openThread === th.id ? null : th.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>
                  💬 {th.replies} replies
                </button>
              </div>
              {openThread === th.id && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <input value={replyText} onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    style={{ flex: 1, background: C.bgMid, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", color: C.textPrimary, fontSize: 12, outline: "none" }} />
                  <button onClick={() => { if (replyText.trim()) { setThreads(t => ({ ...t, [activeTopic]: t[activeTopic].map(x => x.id === th.id ? { ...x, replies: x.replies + 1 } : x) })); setReplyText(""); setOpenThread(null); } }}
                    style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Reply</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Settings page ──────────────────────────────────────────────────
function SettingsPage({ lang, setLang, theme, setTheme, notifs, setNotifs, T }) {
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);

  const Toggle = ({ value, onChange, label, sublabel }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: 600 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 99, cursor: "pointer", transition: "background .2s",
        background: value ? C.accent : C.border, position: "relative"
      }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 23 : 3, transition: "left .2s" }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: C.textPrimary, marginBottom: 24 }}>{T.appSettings}</div>

      {/* Language */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "4px 20px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textMuted, padding: "14px 0 10px", fontWeight: 700, letterSpacing: "0.08em" }}>LANGUAGE / ভাষা / भाषा</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ code: "en", label: "🇬🇧 English" }, { code: "bn", label: "🇧🇩 বাংলা" }, { code: "hi", label: "🇮🇳 हिंदी" }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={{
              flex: 1, background: lang === l.code ? `${C.accent}22` : C.bgMid,
              color: lang === l.code ? C.accent : C.textSecondary,
              border: `1.5px solid ${lang === l.code ? C.accent : C.border}`,
              borderRadius: 10, padding: "10px 8px", cursor: "pointer", fontWeight: 600, fontSize: 13
            }}>{l.label}</button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "4px 20px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textMuted, padding: "14px 0 10px", fontWeight: 700, letterSpacing: "0.08em" }}>THEME</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { id: "dark", label: "🌙 " + T.darkMode },
            { id: "light", label: "☀️ " + T.lightMode },
          ].map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)} style={{
              flex: 1, background: theme === t.id ? `${C.accent}22` : C.bgMid,
              color: theme === t.id ? C.accent : C.textSecondary,
              border: `1.5px solid ${theme === t.id ? C.accent : C.border}`,
              borderRadius: 10, padding: "10px 8px", cursor: "pointer", fontWeight: 600, fontSize: 13
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "0 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textMuted, padding: "14px 0 0", fontWeight: 700, letterSpacing: "0.08em" }}>NOTIFICATIONS</div>
        <Toggle value={notifs.daily} onChange={v => setNotifs(n => ({ ...n, daily: v }))} label="Daily Mission Reminder" sublabel="Get reminded at 8 AM every day" />
        <Toggle value={notifs.streak} onChange={v => setNotifs(n => ({ ...n, streak: v }))} label="Streak Alert" sublabel="Don't let your streak break" />
        <Toggle value={notifs.battle} onChange={v => setNotifs(n => ({ ...n, battle: v }))} label="Battle Challenges" sublabel="When someone challenges you" />
        <Toggle value={notifs.mentor} onChange={v => setNotifs(n => ({ ...n, mentor: v }))} label="Mentor Messages" sublabel="New feedback from your mentor" />
      </div>

      {/* Accessibility */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "0 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textMuted, padding: "14px 0 0", fontWeight: 700, letterSpacing: "0.08em" }}>ACCESSIBILITY</div>
        <Toggle value={highContrast} onChange={setHighContrast} label="High Contrast Mode" sublabel="Increases text and border contrast" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
          <div>
            <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: 600 }}>Font Size</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Adjust reading comfort</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["small","medium","large"].map(s => (
              <button key={s} onClick={() => setFontSize(s)} style={{
                background: fontSize === s ? `${C.accent}22` : C.bgMid,
                color: fontSize === s ? C.accent : C.textMuted,
                border: `1px solid ${fontSize === s ? C.accent : C.border}`,
                borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                fontSize: s === "small" ? 11 : s === "large" ? 15 : 13, fontWeight: 600
              }}>A</button>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Report */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>📄 Download Performance Report</div>
        <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 14 }}>Get a PDF summary of your progress, weak zones, and improvement roadmap — shareable with parents or teachers.</div>
        <button onClick={() => {
          const content = `XMentor Performance Report\n${"=".repeat(40)}\n\nStudent: Commander\nDate: ${new Date().toLocaleDateString()}\nLevel: 5 | Total XP: 4200 | Streak: 5 days\n\nSubject Performance\n${"-".repeat(40)}\nMathematics:  72% accuracy (34 questions)\nPhysics:      65% accuracy (28 questions)\nChemistry:    58% accuracy (20 questions)\nBiology:      81% accuracy (18 questions)\n\nStrengths: Biology (81%), Mathematics (72%)\nNeeds Work: Chemistry (58%), Physics (65%)\n\nAI Recommendation:\nFocus on Stoichiometry and Electromagnetism\nthis week. Your spaced repetition queue has\n3 topics due for review.\n\nBadges Earned: First Strike, On Fire\n\n${"=".repeat(40)}\nGenerated by XMentor`;
          const blob = new Blob([content], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "XMentor_Report.txt"; a.click();
          URL.revokeObjectURL(url);
        }} style={{
          background: C.green, color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14
        }}>⬇ Download Report</button>
      </div>
    </div>
  );
}
function Avatar({ initials, size = 36, color = C.accent }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${color}22`, border: `1.5px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 600, color, flexShrink: 0,
      fontFamily: "monospace"
    }}>{initials}</div>
  );
}

function XPBar({ value, max, color = C.accent, height = 6 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: C.border, borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%", background: color,
        borderRadius: 99, transition: "width .6s ease",
        boxShadow: `0 0 8px ${color}88`
      }} />
    </div>
  );
}

function Badge({ icon, name, desc, unlocked }) {
  return (
    <div style={{
      background: unlocked ? `${C.accent}11` : C.bgCard,
      border: `1px solid ${unlocked ? C.accent + "44" : C.border}`,
      borderRadius: 12, padding: "14px 12px", textAlign: "center",
      opacity: unlocked ? 1 : 0.45, transition: "all .2s"
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: unlocked ? C.textPrimary : C.textMuted, marginBottom: 3 }}>{name}</div>
      <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>{desc}</div>
      {unlocked && <div style={{ marginTop: 6, fontSize: 10, color: C.accent, fontWeight: 700 }}>UNLOCKED</div>}
    </div>
  );
}

function Pill({ children, color = C.accent }) {
  return (
    <span style={{
      background: `${color}20`, color, border: `1px solid ${color}44`,
      borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600
    }}>{children}</span>
  );
}

// ── NavBar ──────────────────────────────────────────────────────────
function NavBar({ page, setPage, xp, streak, T, streakMultiplier }) {
  const items = [
    { id: "dashboard", icon: "⚡", label: T.hub },
    { id: "quiz", icon: "🎯", label: T.quiz },
    { id: "tournament", icon: "🏆", label: T.battle },
    { id: "skilltree", icon: "🌳", label: T.skills },
    { id: "mentor", icon: "👨‍🏫", label: T.mentor },
    { id: "social", icon: "👥", label: T.squad },
    { id: "threads", icon: "💬", label: "Discuss" },
    { id: "analytics", icon: "📊", label: T.stats },
    { id: "profile", icon: "🎖️", label: T.profile },
    { id: "settings", icon: "⚙️", label: T.settings },
  ];
  return (
    <div>
      {streakMultiplier > 1 && (
        <div style={{ background: `linear-gradient(90deg,${C.rose},${C.amber})`, padding: "5px 16px", fontSize: 12, fontWeight: 700, color: "#fff", textAlign: "center" }}>
          🔥 {T.multiplier(streakMultiplier)}
        </div>
      )}
    <div style={{
      background: C.bgCard,
      borderBottom: `1px solid ${C.border}`,
      padding: "0 16px",
      display: "flex", alignItems: "center", gap: 4,
      position: "sticky", top: 0, zIndex: 100,
      flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 10px 4px", borderRight: `1px solid ${C.border}`, marginRight: 4 }}>
        <div style={{ fontSize: 18 }}>⚔️</div>
        <span style={{ fontWeight: 800, fontSize: 15, color: C.accent, letterSpacing: "0.05em", fontFamily: "monospace" }}>XMENTOR</span>
      </div>
      <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>
        {items.map(i => (
          <button key={i.id} onClick={() => setPage(i.id)} style={{
            background: page === i.id ? `${C.accent}18` : "transparent",
            color: page === i.id ? C.accent : C.textSecondary,
            border: page === i.id ? `1px solid ${C.accent}44` : "1px solid transparent",
            borderRadius: 8, padding: "7px 10px",
            cursor: "pointer", fontSize: 12, fontWeight: page === i.id ? 700 : 500,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0
          }}>
            <span style={{ fontSize: 14 }}>{i.icon}</span>
            <span>{i.label}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "0 4px", flexShrink: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textMuted }}>XP</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{xp.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textMuted }}>{T.streak.toUpperCase()}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.rose }}>🔥{streak}</div>
        </div>
      </div>
    </div>
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────
function Dashboard({ xp, streak, setPage, T }) {
  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.accent}22, ${C.purple}11)`,
        border: `1px solid ${C.accent}33`,
        borderRadius: 16, padding: "24px 28px", marginBottom: 20,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: 0.05 }}>⚔️</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, marginBottom: 4 }}>{T.welcomeBack}</div>
        <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 16 }}>{T.streakMsg(streak)}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => setPage("quiz")} style={{
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 20px", cursor: "pointer",
            fontWeight: 700, fontSize: 14
          }}>{T.startQuiz}</button>
          <button onClick={() => setPage("tournament")} style={{
            background: "transparent", color: C.amber,
            border: `1px solid ${C.amber}55`, borderRadius: 10,
            padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14
          }}>{T.joinBattle}</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: T.totalXP, value: xp.toLocaleString(), color: C.amber, icon: "⚡" },
          { label: T.streak, value: `${streak} days`, color: C.rose, icon: "🔥" },
          { label: T.rank, value: "#5", color: C.cyan, icon: "🏆" },
          { label: T.accuracy, value: "72%", color: C.green, icon: "🎯" },
          { label: T.topics, value: "4 / 9", color: C.purple, icon: "🌳" },
        ].map(s => (
          <div key={s.label} style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "14px 16px"
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Daily Missions */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 14, fontSize: 14 }}>{T.dailyMissions}</div>
          {MISSIONS.map(m => (
            <div key={m.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.textSecondary }}>{m.icon} {m.label}</span>
                <Pill color={C.amber}>+{m.xp} XP</Pill>
              </div>
              <XPBar value={m.progress} max={m.total} color={m.progress === m.total ? C.green : C.accent} />
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{m.progress}/{m.total}</div>
            </div>
          ))}
        </div>

        {/* Spaced repetition */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 14, fontSize: 14 }}>{T.spacedRep}</div>
          {[
            { topic: "Calculus", due: "Today", strength: 45, color: C.rose },
            { topic: "Electromagnetism", due: "Tomorrow", strength: 68, color: C.amber },
            { topic: "Organic Chem", due: "In 3 days", strength: 82, color: C.green },
          ].map(r => (
            <div key={r.topic} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: C.textSecondary }}>{r.topic}</span>
                <span style={{ fontSize: 11, color: r.color }}>{r.due}</span>
              </div>
              <XPBar value={r.strength} max={100} color={r.color} />
            </div>
          ))}
          <button onClick={() => setPage("quiz")} style={{
            marginTop: 8, background: `${C.accent}18`, color: C.accent,
            border: `1px solid ${C.accent}33`, borderRadius: 8,
            padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, width: "100%"
          }}>{T.reviewDue}</button>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 14, fontSize: 14 }}>{T.leaderboard}</div>
        {LEADERBOARD.map(l => (
          <div key={l.rank} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0",
            borderBottom: `1px solid ${C.border}`,
            background: l.name === "You" ? `${C.accent}08` : "transparent",
            borderRadius: 8, paddingInline: l.name === "You" ? 10 : 0
          }}>
            <div style={{ width: 24, fontWeight: 700, color: l.rank <= 3 ? C.amber : C.textMuted, fontSize: 13 }}>{l.badge || l.rank}</div>
            <Avatar initials={l.avatar} size={32} color={l.name === "You" ? C.cyan : C.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: l.name === "You" ? C.cyan : C.textPrimary }}>{l.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>🔥 {l.streak} day streak</div>
            </div>
            <div style={{ fontWeight: 700, color: C.amber, fontSize: 14 }}>{l.xp.toLocaleString()} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quiz ────────────────────────────────────────────────────────────
function Quiz({ onXP, lang, T }) {
  const qBank = lang === "bn" ? QUESTIONS_BN : lang === "hi" ? QUESTIONS_HI : QUESTIONS;
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const [loadingHint, setLoadingHint] = useState(false);
  const timerRef = useRef(null);
  const q = qBank[qIdx];

  useEffect(() => {
    if (revealed || done) return;
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setRevealed(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, revealed, done]);

  const handleSelect = (i) => {
    if (revealed) return;
    clearInterval(timerRef.current);
    setSelected(i);
    setRevealed(true);
    if (i === q.answer) { setScore(s => s + 1); onXP(q.xp + (timeLeft > 20 ? 20 : 0)); }
  };

  const fetchHint = async () => {
    setLoadingHint(true);
    setShowHint(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a smart tutor. Give a short, helpful hint (2-3 sentences) for this question WITHOUT revealing the answer: "${q.question}". Options: ${q.options.join(", ")}`
          }]
        })
      });
      const data = await res.json();
      setAiHint(data.content?.[0]?.text || "Think carefully about the core concept.");
    } catch {
      setAiHint("Consider the fundamental principles of this topic.");
    }
    setLoadingHint(false);
  };

  const next = () => {
    if (qIdx + 1 >= qBank.length) { setDone(true); return; }
    setQIdx(i => i + 1);
    setSelected(null);
    setRevealed(false);
    setShowHint(false);
    setAiHint("");
  };

  const restart = () => { setQIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false); setShowHint(false); setAiHint(""); };

  if (done) return (
    <div style={{ padding: 20, maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 36 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{score >= 6 ? "🏆" : score >= 4 ? "🎯" : "📚"}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.textPrimary, marginBottom: 8 }}>{T.roundComplete}</div>
        <div style={{ fontSize: 16, color: C.textSecondary, marginBottom: 20 }}>{score}/{qBank.length} {T.correct}</div>
        <XPBar value={score} max={qBank.length} color={C.green} height={10} />
        <button onClick={restart} style={{
          marginTop: 24, background: C.accent, color: "#fff",
          border: "none", borderRadius: 12, padding: "12px 32px",
          cursor: "pointer", fontWeight: 700, fontSize: 15
        }}>{T.playAgain}</button>
      </div>
    </div>
  );

  const timerColor = timeLeft > 15 ? C.green : timeLeft > 8 ? C.amber : C.rose;

  return (
    <div style={{ padding: 20, maxWidth: 620, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Pill color={C.cyan}>{q.topic}</Pill>
          <span style={{ marginLeft: 8 }}><Pill color={q.difficulty === 1 ? C.green : q.difficulty === 2 ? C.amber : C.rose}>{q.difficulty === 1 ? "Easy" : q.difficulty === 2 ? "Medium" : "Hard"}</Pill></span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.textMuted }}>Q {qIdx + 1}/{qBank.length}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: timerColor }}>{timeLeft}s</div>
        </div>
      </div>
      <XPBar value={timeLeft} max={30} color={timerColor} height={4} />

      {/* Question */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: "24px 20px", margin: "16px 0"
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, lineHeight: 1.5 }}>{q.question}</div>
        <div style={{ marginTop: 8, fontSize: 12, color: C.amber }}>+{q.xp} XP base {timeLeft > 20 ? "+ ⚡20 speed bonus" : ""}</div>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {q.options.map((opt, i) => {
          let bg = C.bgMid, border = C.border, color = C.textSecondary;
          if (revealed) {
            if (i === q.answer) { bg = `${C.green}22`; border = C.green; color = C.green; }
            else if (i === selected) { bg = `${C.rose}22`; border = C.rose; color = C.rose; }
          } else if (selected === i) { bg = `${C.accent}22`; border = C.accent; color = C.accent; }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              background: bg, border: `1.5px solid ${border}`, color,
              borderRadius: 12, padding: "14px 16px", cursor: revealed ? "default" : "pointer",
              fontWeight: 600, fontSize: 14, textAlign: "left", transition: "all .15s"
            }}>
              <span style={{ marginRight: 8, opacity: 0.5 }}>{["A","B","C","D"][i]}.</span>{opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div style={{
          background: `${C.cyan}11`, border: `1px solid ${C.cyan}33`,
          borderRadius: 12, padding: 16, marginBottom: 12
        }}>
          <div style={{ fontWeight: 700, color: C.cyan, marginBottom: 6, fontSize: 13 }}>{T.explanation}</div>
          <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>{q.explanation}</div>
        </div>
      )}

      {/* AI hint */}
      {showHint && (
        <div style={{
          background: `${C.purple}11`, border: `1px solid ${C.purple}33`,
          borderRadius: 12, padding: 16, marginBottom: 12
        }}>
          <div style={{ fontWeight: 700, color: C.purple, marginBottom: 6, fontSize: 13 }}>🤖 AI Hint</div>
          <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>{loadingHint ? "Thinking..." : aiHint}</div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        {!revealed && !showHint && (
          <button onClick={fetchHint} style={{
            flex: 1, background: `${C.purple}18`, color: C.purple,
            border: `1px solid ${C.purple}44`, borderRadius: 10,
            padding: "10px", cursor: "pointer", fontWeight: 600, fontSize: 13
          }}>{T.aiHint}</button>
        )}
        {revealed && (
          <button onClick={next} style={{
            flex: 1, background: C.accent, color: "#fff",
            border: "none", borderRadius: 10, padding: "12px",
            cursor: "pointer", fontWeight: 700, fontSize: 14
          }}>{T.nextQ}</button>
        )}
      </div>
    </div>
  );
}

// ── Tournament ──────────────────────────────────────────────────────
function Tournament({ onXP }) {
  const [phase, setPhase] = useState("lobby"); // lobby | battle | result
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);
  const q = QUESTIONS[qIdx % QUESTIONS.length];

  useEffect(() => {
    if (phase !== "battle" || revealed) return;
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, phase]);

  const handleTimeout = () => {
    setRevealed(true);
    setBotScore(s => s + (Math.random() > 0.4 ? 1 : 0));
  };

  const handleSelect = (i) => {
    if (revealed) return;
    clearInterval(timerRef.current);
    setSelected(i);
    setRevealed(true);
    if (i === q.answer) { setPlayerScore(s => s + 1); onXP(50); }
    setBotScore(s => s + (Math.random() > 0.45 ? 1 : 0));
  };

  const nextQ = () => {
    if (qIdx + 1 >= 5) { setPhase("result"); return; }
    setQIdx(i => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  if (phase === "lobby") return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 22, color: C.textPrimary, marginBottom: 4 }}>⚔️ Battle Arena</div>
      <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 24 }}>Challenge opponents in real-time MCQ battles</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[
          { mode: "1v1 Quick", desc: "Fast 5-question duel", icon: "⚡", color: C.accent },
          { mode: "Team Battle", desc: "4v4 squad war", icon: "👥", color: C.green },
          { mode: "Ranked", desc: "Competitive ladder", icon: "🏆", color: C.amber },
          { mode: "Blitz", desc: "10 Qs in 60 seconds", icon: "💥", color: C.rose },
        ].map(m => (
          <div key={m.mode} onClick={() => setPhase("battle")} style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: 18, cursor: "pointer", transition: "all .15s"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontWeight: 700, color: m.color, fontSize: 15 }}>{m.mode}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 14, fontSize: 14 }}>🔴 Live Battles</div>
        {[
          { p1: "Arjun S.", p2: "Priya N.", topic: "Calculus", live: true },
          { p1: "Rohan D.", p2: "Sneha P.", topic: "Physics", live: true },
        ].map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, color: C.textPrimary, flex: 1 }}>{b.p1}</span>
            <span style={{ fontSize: 11, background: `${C.rose}22`, color: C.rose, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>VS</span>
            <span style={{ fontSize: 13, color: C.textPrimary, flex: 1, textAlign: "right" }}>{b.p2}</span>
            <Pill color={C.green}>{b.topic}</Pill>
          </div>
        ))}
      </div>
    </div>
  );

  if (phase === "result") return (
    <div style={{ padding: 20, maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 36 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{playerScore > botScore ? "🏆" : playerScore === botScore ? "🤝" : "💪"}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: playerScore > botScore ? C.green : C.rose }}>
          {playerScore > botScore ? "Victory!" : playerScore === botScore ? "Draw!" : "Defeat"}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.textPrimary, margin: "16px 0" }}>{playerScore} — {botScore}</div>
        <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 24 }}>You vs Opponent</div>
        <button onClick={() => { setPhase("lobby"); setQIdx(0); setPlayerScore(0); setBotScore(0); setSelected(null); setRevealed(false); }} style={{
          background: C.accent, color: "#fff", border: "none",
          borderRadius: 12, padding: "12px 28px", cursor: "pointer", fontWeight: 700, fontSize: 14
        }}>Rematch ⚔️</button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 620, margin: "0 auto" }}>
      {/* Scoreboard */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px" }}>
        <div style={{ flex: 1, textAlign: "left" }}>
          <Avatar initials="YO" size={36} color={C.cyan} />
          <div style={{ fontSize: 14, fontWeight: 700, color: C.cyan, marginTop: 4 }}>You</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.textPrimary }}>{playerScore}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textMuted }}>Q {qIdx + 1}/5</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: timeLeft <= 5 ? C.rose : C.amber }}>{timeLeft}s</div>
          <div style={{ fontSize: 11, background: `${C.rose}22`, color: C.rose, padding: "2px 10px", borderRadius: 99, fontWeight: 700 }}>LIVE</div>
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <Avatar initials="AI" size={36} color={C.rose} />
          <div style={{ fontSize: 14, fontWeight: 700, color: C.rose, marginTop: 4 }}>Opponent</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.textPrimary }}>{botScore}</div>
        </div>
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, lineHeight: 1.5 }}>{q.question}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.options.map((opt, i) => {
          let bg = C.bgMid, border = C.border, color = C.textSecondary;
          if (revealed) {
            if (i === q.answer) { bg = `${C.green}22`; border = C.green; color = C.green; }
            else if (i === selected) { bg = `${C.rose}22`; border = C.rose; color = C.rose; }
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              background: bg, border: `1.5px solid ${border}`, color,
              borderRadius: 12, padding: "14px 16px", cursor: revealed ? "default" : "pointer",
              fontWeight: 600, fontSize: 14, textAlign: "left"
            }}>
              <span style={{ marginRight: 8, opacity: 0.5 }}>{["A","B","C","D"][i]}.</span>{opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <button onClick={nextQ} style={{
          width: "100%", marginTop: 14, background: C.accent, color: "#fff",
          border: "none", borderRadius: 10, padding: "12px",
          cursor: "pointer", fontWeight: 700, fontSize: 14
        }}>Next →</button>
      )}
    </div>
  );
}

// ── Skill Tree ──────────────────────────────────────────────────────
function SkillTree() {
  const [hovered, setHovered] = useState(null);

  const colorOf = (topic) => {
    const m = { Mathematics: C.accent, Physics: C.cyan, Chemistry: C.amber, Biology: C.green };
    return m[topic] || C.purple;
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: C.textPrimary, marginBottom: 4 }}>🌳 Skill Tree</div>
      <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20 }}>Unlock topics by mastering prerequisites</div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {["Mathematics","Physics","Chemistry","Biology"].map(t => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: colorOf(t) }} />
            <span style={{ fontSize: 12, color: C.textSecondary }}>{t}</span>
          </div>
        ))}
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, overflowX: "auto" }}>
        <svg width="520" height="360" style={{ display: "block" }}>
          {/* Edges */}
          {EDGES.map(([a, b]) => {
            const na = SKILL_TREE.find(n => n.id === a);
            const nb = SKILL_TREE.find(n => n.id === b);
            return <line key={`${a}-${b}`} x1={na.x + 56} y1={na.y + 20} x2={nb.x} y2={nb.y + 20}
              stroke={C.border} strokeWidth="1.5" strokeDasharray={nb.unlocked ? "0" : "4,4"} />;
          })}
          {/* Nodes */}
          {SKILL_TREE.map(n => {
            const c = colorOf(n.topic);
            const isHov = hovered === n.id;
            return (
              <g key={n.id} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                <rect x={n.x} y={n.y} width={112} height={40} rx={10}
                  fill={n.mastered ? `${c}30` : n.unlocked ? `${c}15` : `${C.bgMid}`}
                  stroke={n.mastered ? c : n.unlocked ? `${c}66` : C.border}
                  strokeWidth={isHov ? 2 : 1} />
                <text x={n.x + 56} y={n.y + 16} textAnchor="middle" fill={n.unlocked ? c : C.textMuted} fontSize={11} fontWeight={700}>{n.label}</text>
                <text x={n.x + 56} y={n.y + 30} textAnchor="middle" fill={n.unlocked ? C.textMuted : C.textMuted} fontSize={9}>
                  {n.mastered ? "✓ Mastered" : n.unlocked ? "In progress" : "🔒 Locked"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hovered && (() => {
        const n = SKILL_TREE.find(x => x.id === hovered);
        return (
          <div style={{ marginTop: 14, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, color: colorOf(n.topic), fontSize: 15 }}>{n.label}</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>{n.topic} · {n.mastered ? "Mastered ✓" : n.unlocked ? "Unlocked — keep going!" : "Complete prerequisites to unlock"}</div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Mentor ──────────────────────────────────────────────────────────
function MentorPage() {
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pollQ, setPollQ] = useState("What concept do you find most challenging in Calculus?");
  const [votes, setVotes] = useState([0, 0, 0]);
  const [voted, setVoted] = useState(false);

  const generateQ = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Generate 3 MCQ questions about "${topic}" for students. Return ONLY valid JSON: [{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]. No markdown, no extra text.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const qs = JSON.parse(clean);
      setGenerated(qs);
    } catch {
      setGenerated([{ question: "Could not generate — please try again.", options: ["A","B","C","D"], answer: 0, explanation: "N/A" }]);
    }
    setLoading(false);
  };

  const vote = (i) => {
    if (voted) return;
    const v = [...votes]; v[i]++; setVotes(v); setVoted(true);
  };

  const total = votes.reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: C.textPrimary, marginBottom: 20 }}>👨‍🏫 Mentor Tools</div>

      {/* AI Question Generator */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 4, fontSize: 15 }}>🤖 AI Question Generator</div>
        <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 14 }}>Type any topic — get instant MCQ questions with explanations.</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Newton's laws of motion, Photosynthesis..."
            style={{
              flex: 1, background: C.bgMid, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "10px 14px", color: C.textPrimary,
              fontSize: 14, outline: "none"
            }} />
          <button onClick={generateQ} disabled={loading} style={{
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 20px", cursor: "pointer",
            fontWeight: 700, fontSize: 14, opacity: loading ? 0.6 : 1
          }}>{loading ? "..." : "Generate"}</button>
        </div>

        {generated.map((q, i) => (
          <div key={i} style={{ background: C.bgMid, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
            <div style={{ fontWeight: 600, color: C.textPrimary, fontSize: 14, marginBottom: 8 }}>{i + 1}. {q.question}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
              {q.options?.map((o, j) => (
                <div key={j} style={{
                  background: j === q.answer ? `${C.green}22` : C.bgCard,
                  border: `1px solid ${j === q.answer ? C.green : C.border}`,
                  borderRadius: 8, padding: "6px 10px", fontSize: 12,
                  color: j === q.answer ? C.green : C.textSecondary
                }}>{["A","B","C","D"][j]}. {o}</div>
              ))}
            </div>
            {q.explanation && <div style={{ fontSize: 12, color: C.cyan, lineHeight: 1.5 }}>💡 {q.explanation}</div>}
          </div>
        ))}
      </div>

      {/* Live Poll */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 4, fontSize: 15 }}>📊 Live Session Poll</div>
        <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 14 }}>{pollQ}</div>
        {["Limits & Continuity", "Derivatives", "Integration"].map((opt, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: C.textPrimary }}>{opt}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>{Math.round((votes[i] / total) * 100)}% ({votes[i]})</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, background: C.border, borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${Math.round((votes[i] / total) * 100)}%`, height: "100%", background: C.accent, borderRadius: 99, transition: "width .4s" }} />
              </div>
              <button onClick={() => vote(i)} disabled={voted} style={{
                background: voted ? C.bgMid : `${C.accent}18`, color: voted ? C.textMuted : C.accent,
                border: `1px solid ${voted ? C.border : C.accent + "44"}`,
                borderRadius: 8, padding: "4px 12px", cursor: voted ? "default" : "pointer",
                fontSize: 12, fontWeight: 600
              }}>Vote</button>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 14, fontSize: 15 }}>📈 Cohort Analytics</div>
        {[
          { label: "Calculus", accuracy: 58, students: 24, color: C.rose },
          { label: "Electromagnetism", accuracy: 71, students: 24, color: C.amber },
          { label: "Organic Chemistry", accuracy: 64, students: 24, color: C.amber },
          { label: "Cell Biology", accuracy: 82, students: 22, color: C.green },
        ].map(t => (
          <div key={t.label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: C.textPrimary }}>{t.label}</span>
              <span style={{ fontSize: 12, color: t.color, fontWeight: 700 }}>{t.accuracy}% accuracy</span>
            </div>
            <XPBar value={t.accuracy} max={100} color={t.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Social ──────────────────────────────────────────────────────────
function Social() {
  const [wall, setWall] = useState([
    { user: "Arjun S.", avatar: "AS", topic: "Integration", text: "Think of integration as accumulation — it adds up infinitely tiny strips of area under a curve.", votes: 14 },
    { user: "Priya N.", avatar: "PN", topic: "Newton's Laws", text: "Newton's 2nd law means heavier objects need more force to accelerate at the same rate.", votes: 9 },
  ]);
  const [newPost, setNewPost] = useState("");

  const addPost = () => {
    if (!newPost.trim()) return;
    setWall(w => [{ user: "You", avatar: "YO", topic: "General", text: newPost, votes: 0 }, ...w]);
    setNewPost("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: C.textPrimary, marginBottom: 20 }}>👥 Study Squad</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {STUDY_GROUPS.map(g => (
          <div key={g.id} style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: 16, cursor: "pointer"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{g.avatar}</div>
            <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: 14 }}>{g.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{g.topic}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: C.textSecondary }}>👥 {g.members} members</span>
              {g.active && <Pill color={C.green}>Active</Pill>}
            </div>
          </div>
        ))}
        <div style={{
          background: C.bgMid, border: `1px dashed ${C.border}`,
          borderRadius: 14, padding: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 8, minHeight: 110
        }}>
          <div style={{ fontSize: 24, color: C.textMuted }}>+</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Create Squad</div>
        </div>
      </div>

      {/* Peer explanation wall */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 14, fontSize: 15 }}>💬 Peer Explanation Wall</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input value={newPost} onChange={e => setNewPost(e.target.value)}
            placeholder="Share your understanding of a concept..."
            style={{
              flex: 1, background: C.bgMid, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "10px 14px", color: C.textPrimary, fontSize: 13, outline: "none"
            }} />
          <button onClick={addPost} style={{
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13
          }}>Post</button>
        </div>
        {wall.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
            <Avatar initials={p.avatar} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{p.user}</span>
                <Pill color={C.cyan}>{p.topic}</Pill>
              </div>
              <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{p.text}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: C.textMuted }}>👍 {p.votes} found helpful</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Analytics ───────────────────────────────────────────────────────
function Analytics() {
  const bars = [
    { label: "Mon", h: 60 }, { label: "Tue", h: 80 }, { label: "Wed", h: 45 },
    { label: "Thu", h: 90 }, { label: "Fri", h: 70 }, { label: "Sat", h: 30 }, { label: "Sun", h: 55 },
  ];
  const topicData = [
    { topic: "Mathematics", accuracy: 72, questions: 34, color: C.accent },
    { topic: "Physics", accuracy: 65, questions: 28, color: C.cyan },
    { topic: "Chemistry", accuracy: 58, questions: 20, color: C.amber },
    { topic: "Biology", accuracy: 81, questions: 18, color: C.green },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: C.textPrimary, marginBottom: 20 }}>📊 Performance Analytics</div>

      {/* Weekly Activity */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 16, fontSize: 14 }}>📅 Weekly Activity</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {bars.map(b => (
            <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: "100%", height: b.h, background: `${C.accent}66`,
                borderRadius: "4px 4px 0 0", transition: "height .4s",
                border: `1px solid ${C.accent}44`
              }} />
              <span style={{ fontSize: 10, color: C.textMuted }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Breakdown */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 14, fontSize: 14 }}>🎯 Topic Breakdown</div>
        {topicData.map(t => (
          <div key={t.topic} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.textPrimary }}>{t.topic}</span>
              <span style={{ fontSize: 12, color: C.textSecondary }}>{t.questions} questions · <span style={{ color: t.color, fontWeight: 700 }}>{t.accuracy}%</span></span>
            </div>
            <XPBar value={t.accuracy} max={100} color={t.color} />
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <div style={{ background: `${C.purple}11`, border: `1px solid ${C.purple}33`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontWeight: 700, color: C.purple, marginBottom: 10, fontSize: 14 }}>🤖 AI Performance Insight</div>
        <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
          Your strongest subject is <span style={{ color: C.green, fontWeight: 600 }}>Biology (81%)</span>. Chemistry needs attention — your accuracy dropped 12% this week, especially in stoichiometry. We recommend spending 15 minutes today on <span style={{ color: C.cyan, fontWeight: 600 }}>Mole Concepts</span> to shore up that gap before your next spaced review.
        </div>
      </div>
    </div>
  );
}

// ── Profile ─────────────────────────────────────────────────────────
function Profile({ xp, streak }) {
  const level = Math.floor(xp / 1000) + 1;
  const levelXP = xp % 1000;

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.accent}22, ${C.purple}11)`,
        border: `1px solid ${C.accent}33`, borderRadius: 16, padding: 24, marginBottom: 20,
        display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap"
      }}>
        <Avatar initials="YO" size={64} color={C.cyan} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary }}>Commander</div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 10 }}>Level {level} Scholar · Joined Jan 2025</div>
          <XPBar value={levelXP} max={1000} color={C.amber} height={8} />
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{levelXP}/1000 XP to Level {level + 1}</div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { v: xp.toLocaleString(), l: "Total XP", c: C.amber },
            { v: `${streak}d`, l: "Streak", c: C.rose },
            { v: "#5", l: "Rank", c: C.cyan },
          ].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 14, fontSize: 15 }}>🎖️ Achievement Badges</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
          {BADGES.map(b => <Badge key={b.id} {...b} />)}
        </div>
      </div>

      {/* Offline mode notice */}
      <div style={{
        background: `${C.green}11`, border: `1px solid ${C.green}33`,
        borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "flex-start"
      }}>
        <div style={{ fontSize: 20 }}>📲</div>
        <div>
          <div style={{ fontWeight: 600, color: C.green, marginBottom: 4, fontSize: 14 }}>Offline Mode Available</div>
          <div style={{ fontSize: 13, color: C.textSecondary }}>XMentor is installed as a PWA. Your last 50 questions are cached — practice even without internet.</div>
        </div>
      </div>
    </div>
  );
}

// ── AI Tutor chatbot ────────────────────────────────────────────────
function AITutor({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI tutor. Ask me anything about your subjects — I'll explain concepts, solve problems, or give study tips." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert academic tutor for students studying Mathematics, Physics, Chemistry, and Biology. Give clear, concise, encouraging explanations. Use simple language. When solving problems, show steps.",
          messages: [...history, { role: "user", content: userMsg }]
        })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", text: data.content?.[0]?.text || "I couldn't process that — please try again." }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Network error. Please check your connection." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", bottom: 80, right: 20, width: 340,
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: 18, boxShadow: `0 8px 40px #00000066`,
      display: "flex", flexDirection: "column", zIndex: 200, maxHeight: 480
    }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: 14 }}>🤖 AI Tutor</div>
          <div style={{ fontSize: 11, color: C.green }}>● Online</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              background: m.role === "user" ? C.accent : C.bgMid,
              color: m.role === "user" ? "#fff" : C.textSecondary,
              border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              padding: "10px 13px", maxWidth: "85%", fontSize: 13, lineHeight: 1.6
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: C.bgMid, border: `1px solid ${C.border}`, borderRadius: 14, padding: "10px 14px", fontSize: 13, color: C.textMuted }}>Thinking...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything..."
          style={{
            flex: 1, background: C.bgMid, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "8px 12px", color: C.textPrimary, fontSize: 13, outline: "none"
          }} />
        <button onClick={send} disabled={loading} style={{
          background: C.accent, color: "#fff", border: "none",
          borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13
        }}>↑</button>
      </div>
    </div>
  );
}

// ── App Root ────────────────────────────────────────────────────────
export default function XMentorApp() {
  const [onboarded, setOnboarded] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [xp, setXP] = useState(4200);
  const [streak] = useState(5);
  const [lang, setLang] = useState("en");
  const [themeId, setThemeId] = useState("dark");
  const [tutorOpen, setTutorOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [levelUpModal, setLevelUpModal] = useState(null);
  const [notifs, setNotifs] = useState({ daily: true, streak: true, battle: false, mentor: true });
  const prevLevelRef = useRef(Math.floor(4200 / 1000) + 1);

  // Apply theme globally
  C = THEMES[themeId];

  const T = LANG[lang] || LANG.en;
  const streakMultiplier = streak >= 14 ? 2 : streak >= 7 ? 1.5 : streak >= 3 ? 1.25 : 1;

  const pushToast = useCallback((msg, icon, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, icon, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const addXP = useCallback((amount) => {
    const boosted = Math.round(amount * streakMultiplier);
    setXP(x => {
      const newXP = x + boosted;
      const newLevel = Math.floor(newXP / 1000) + 1;
      if (newLevel > prevLevelRef.current) {
        prevLevelRef.current = newLevel;
        setTimeout(() => setLevelUpModal(newLevel), 300);
      }
      return newXP;
    });
    pushToast(`+${boosted} XP earned!`, "⚡", "xp");
  }, [streakMultiplier, pushToast]);

  const handleOnboardingComplete = ({ name, lang: l, topics }) => {
    setLang(l);
    setOnboarded(true);
    setTimeout(() => pushToast(`Welcome, ${name}! 🎉`, "🚀", "info"), 500);
  };

  if (!onboarded) return <Onboarding onComplete={handleOnboardingComplete} />;

  const pages = {
    dashboard: <Dashboard xp={xp} streak={streak} setPage={setPage} T={T} />,
    quiz: <Quiz onXP={addXP} lang={lang} T={T} />,
    tournament: <Tournament onXP={addXP} />,
    skilltree: <SkillTree />,
    mentor: <MentorPage />,
    social: <Social />,
    threads: <DiscussionThreads lang={lang} />,
    analytics: <Analytics />,
    profile: <Profile xp={xp} streak={streak} />,
    settings: <SettingsPage lang={lang} setLang={setLang} theme={themeId} setTheme={setThemeId} notifs={notifs} setNotifs={setNotifs} T={T} />,
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.textPrimary, fontFamily: "'Courier New', monospace" }}>
      <Toast toasts={toasts} />
      {levelUpModal && <LevelUpModal level={levelUpModal} onClose={() => setLevelUpModal(null)} T={T} />}

      <NavBar page={page} setPage={setPage} xp={xp} streak={streak} T={T} streakMultiplier={streakMultiplier} />

      <div style={{ paddingBottom: 100 }}>
        {pages[page] || pages.dashboard}
      </div>

      {/* Floating AI Tutor button */}
      {!tutorOpen && (
        <button onClick={() => setTutorOpen(true)} style={{
          position: "fixed", bottom: 24, right: 24,
          background: C.accent, color: "#fff",
          border: "none", borderRadius: "50%",
          width: 52, height: 52, fontSize: 22, cursor: "pointer",
          boxShadow: `0 4px 20px ${C.accentGlow}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 150
        }}>🤖</button>
      )}

      {tutorOpen && <AITutor onClose={() => setTutorOpen(false)} />}
    </div>
  );
}
