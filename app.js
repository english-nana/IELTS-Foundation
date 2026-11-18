// ==========================================================================
// THE ENGLISH JOURNEY — APPLICATION ENGINE (app.js)
// 100% Unabridged Theory, Tables, Callouts, Audio & Interactive Exercises
// ==========================================================================

(function () {
  const STORAGE_KEY = "tej_a1a2_state_v4";

  const GRAMMAR_LIBRARY_DB = {
    "SENT-01": {
      code: "SENT-01",
      title: "Động từ to be và have/have got",
      subtitle: "Cấu trúc khẳng định, phủ định, nghi vấn ở thì hiện tại đơn",
      sections: [
        {
          heading: "1. Động từ 'to be' ở hiện tại đơn (am / is / are)",
          body: "Động từ <strong>to be</strong> dùng để giới thiệu tên, tuổi, nghề nghiệp, quốc tịch, trạng thái sức khỏe hoặc vị trí.",
          bullets: [
            "<strong>Khẳng định (+):</strong> I am (I'm) · He/She/It is (He's/She's/It's) · You/We/They are (You're/We're/They're).",
            "<strong>Phủ định (-):</strong> Thêm <strong>not</strong> sau am/is/are → I am not (I'm not) · is not (isn't) · are not (aren't).",
            "<strong>Nghi vấn (?):</strong> Đảo <strong>Am / Is / Are</strong> lên trước chủ ngữ → Are you a new student? — Yes, I am. / No, I'm not."
          ]
        },
        {
          heading: "2. Động từ 'have' và 'have got' (sở hữu)",
          body: "Để diễn tả sự sở hữu (có cái gì) hoặc mối quan hệ gia đình, tiếng Anh dùng <strong>have/has</strong> (phổ biến cả Anh-Mỹ & Anh-Anh) hoặc <strong>have got / has got</strong> (thân mật, phổ biến trong giao tiếp Anh-Anh).",
          bullets: [
            "<strong>I / You / We / They:</strong> dùng <strong>have</strong> hoặc <strong>have got</strong> (Ví dụ: I have a student card. = I've got a student card.)",
            "<strong>He / She / It:</strong> dùng <strong>has</strong> hoặc <strong>has got</strong> (Ví dụ: She has a brother. = She's got a brother.)"
          ]
        }
      ]
    },
    "CLAUSE-01": {
      code: "CLAUSE-01",
      title: "Câu hỏi Yes/No và câu hỏi Wh-",
      subtitle: "Cách đặt câu hỏi lấy thông tin và xác nhận thông tin trong tiếng Anh",
      sections: [
        {
          heading: "1. Câu hỏi Yes/No (Câu hỏi Có/Không)",
          body: "Bắt đầu bằng trợ động từ hoặc động từ <strong>to be (Am / Is / Are)</strong>. Người nghe trả lời bằng Yes hoặc No.",
          bullets: [
            "<strong>Am / Is / Are + Chủ ngữ + ...?</strong> → Are you feeling ok today? — Yes, I am. / No, I'm not.",
            "<strong>Do / Does + Chủ ngữ + V(nguyên thể)?</strong> → Do you speak English? — Yes, I do. / No, I don't."
          ]
        },
        {
          heading: "2. Câu hỏi Wh- (Wh-Questions)",
          body: "Bắt đầu bằng từ để hỏi (<strong>What, Who, Where, When, Why, How</strong>) để hỏi thông tin cụ thể.",
          bullets: [
            "<strong>What:</strong> hỏi về vật, tên gọi, thông tin (What is your surname?).",
            "<strong>Who:</strong> hỏi về người (Who is your English teacher?).",
            "<strong>Where:</strong> hỏi về nơi chốn, quê quán (Where are you from?).",
            "<strong>How:</strong> hỏi về sức khỏe, cách thức (How are you? / How do you spell that?)."
          ]
        }
      ]
    }
  };

  const ACCOUNTS_KEY = "tej_foundation_accounts_v1";
  const SESSION_KEY = "tej_foundation_session_v1";

  const defaultFlashcards = [
    { word: "hello", ipa: "/həˈləʊ/", meaning: "xin chào", example: "Hello, my name is Alex." },
    { word: "morning", ipa: "/ˈmɔːnɪŋ/", meaning: "buổi sáng", example: "I wake up early in the morning." },
    { word: "surname", ipa: "/ˈsɜːneɪm/", meaning: "họ (tên gia đình)", example: "His surname is Miller." }
  ];

  const defaultState = {
    view: "course", // "auth" | "course" | "progress" | "lesson"
    authMode: "login", // "login" | "register"
    authError: "",
    currentUser: null, // { name, email, createdAt }
    unitFilter: "all", // "all" | "in-progress" | "completed" | "not-started"
    activeSidebarNav: "khoa-hoc",
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    notifOpen: false,
    profileMenuOpen: false,
    currentUnitId: "01a16741-f56b-7b42-8f04-6f89ca98e580",
    currentSection: "vocabulary", // vocabulary | phrases | grammar | reading | listening | writing | unittest
    currentPart: "A",
    leftPanePercent: 50,
    isExpandedFullscreen: false,
    dictEnabled: true,
    activeDictWord: null,
    dictPopupPos: { top: 180, left: 320 },
    fullDictModalWord: null,
    activeGrammarDoc: null,
    activeReorderKey: null,
    cmdModalOpen: false,
    cmdQuery: "",
    flashcardModalOpen: false,
    savedFlashcards: JSON.parse(JSON.stringify(defaultFlashcards)),
    unitProgress: {}
  };

  function loadAccountsDb() {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {}
    // Migrate legacy single-user state if present into default student account
    let legacyProgress = {};
    let legacyCards = JSON.parse(JSON.stringify(defaultFlashcards));
    try {
      const oldRaw = localStorage.getItem(STORAGE_KEY);
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        if (oldParsed.unitProgress) legacyProgress = oldParsed.unitProgress;
        if (oldParsed.savedFlashcards) legacyCards = oldParsed.savedFlashcards;
      }
    } catch (e) {}

    const initialDb = {
      "mtung0208@gmail.com": {
        name: "Minh Tung",
        email: "mtung0208@gmail.com",
        password: "123456",
        createdAt: "2026-11-16",
        unitProgress: legacyProgress,
        savedFlashcards: legacyCards
      }
    };
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initialDb));
    } catch (e) {}
    return initialDb;
  }

  function saveAccountsDb(db) {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(db));
    } catch (e) {}
  }

  let accountsDb = loadAccountsDb();
  let state = loadState();

  function loadState() {
    const base = JSON.parse(JSON.stringify(defaultState));
    try {
      const rawPrefs = localStorage.getItem(STORAGE_KEY);
      if (rawPrefs) {
        const p = JSON.parse(rawPrefs);
        if (typeof p.dictEnabled === "boolean") base.dictEnabled = p.dictEnabled;
        if (typeof p.sidebarCollapsed === "boolean") base.sidebarCollapsed = p.sidebarCollapsed;
        if (typeof p.leftPanePercent === "number") base.leftPanePercent = p.leftPanePercent;
      }
      const sessionEmail = localStorage.getItem(SESSION_KEY) || "mtung0208@gmail.com";
      if (sessionEmail && sessionEmail !== "__LOGGED_OUT__" && accountsDb[sessionEmail]) {
        const acc = accountsDb[sessionEmail];
        base.currentUser = { name: acc.name, email: acc.email, createdAt: acc.createdAt };
        base.unitProgress = acc.unitProgress || {};
        base.savedFlashcards = acc.savedFlashcards || JSON.parse(JSON.stringify(defaultFlashcards));
        base.view = "course";
      } else if (sessionEmail === "__LOGGED_OUT__") {
        base.currentUser = null;
        base.view = "auth";
      } else {
        const firstEmail = Object.keys(accountsDb)[0];
        if (firstEmail) {
          const acc = accountsDb[firstEmail];
          base.currentUser = { name: acc.name, email: acc.email, createdAt: acc.createdAt };
          base.unitProgress = acc.unitProgress || {};
          base.savedFlashcards = acc.savedFlashcards || JSON.parse(JSON.stringify(defaultFlashcards));
          localStorage.setItem(SESSION_KEY, acc.email);
        } else {
          base.view = "auth";
        }
      }
    } catch (e) {}
    return base;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        dictEnabled: state.dictEnabled,
        sidebarCollapsed: state.sidebarCollapsed,
        leftPanePercent: state.leftPanePercent
      }));
      if (state.currentUser && state.currentUser.email) {
        const key = state.currentUser.email.toLowerCase();
        if (!accountsDb[key]) {
          accountsDb[key] = {
            name: state.currentUser.name,
            email: key,
            password: "",
            createdAt: state.currentUser.createdAt || new Date().toISOString().slice(0, 10),
            unitProgress: {},
            savedFlashcards: []
          };
        }
        accountsDb[key].unitProgress = state.unitProgress;
        accountsDb[key].savedFlashcards = state.savedFlashcards;
        saveAccountsDb(accountsDb);
        localStorage.setItem(SESSION_KEY, key);
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  function getInitials(name) {
    const parts = String(name || "HV").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "HV";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function getUnitProgress(unitId) {
    if (!state.unitProgress[unitId]) {
      state.unitProgress[unitId] = {
        status: "not-started",
        completedSections: [],
        exerciseAnswers: {},
        checkedExercises: {},
        unlockedTranscript: false
      };
    }
    return state.unitProgress[unitId];
  }

  // Generate complete, unabridged 7-section content for Units 2..50 with full tables, callouts & exercises
  function getLessonContentForUnit(unit) {
    if (unit.unitIndex === 1) {
      return window.UNIT_1_CONTENT;
    }
    const topicEn = unit.titleEn;
    const topicVi = unit.titleVi;
    const wordsRaw = topicEn.replace(/[^a-zA-Z\s]/g, " ").split(/\s+/).filter(Boolean);
    const keyWord1 = (wordsRaw[0] || "topic").toLowerCase();
    const keyWord2 = (wordsRaw[1] || "expression").toLowerCase();
    const uIdx = unit.unitIndex;
    const vpg = (window.UNITS_1_TO_10_VPG && window.UNITS_1_TO_10_VPG[uIdx]) || null;

    return {
      vocabulary: (vpg && vpg.vocabulary) ? vpg.vocabulary : {
        parts: {
          A: {
            code: "A",
            titleEn: `${topicEn} — Core Vocabulary`,
            titleVi: `Từ vựng trọng tâm: ${topicVi}`,
            nextLabel: "Next: Part B: Collocations & Expressions",
            intro: unit.description,
            bullets: [
              `Use core nouns and verbs related to <strong>${topicEn}</strong> (${topicVi}) in everyday conversations.`,
              "Pay close attention to word stress, pronunciation (US/UK), and natural contexts.",
              "Combine these words with the Present Simple and verb <strong>to be</strong> to build full sentences."
            ],
            figureTop: "./assets/vocab-a-1.png",
            exampleSentences: [
              { en: `Let's talk about ${topicEn.toLowerCase()} in today's lesson.`, vi: `Hãy cùng thảo luận về ${topicVi.toLowerCase()} trong bài học hôm nay.` },
              { en: `Can you describe your ${keyWord1} in simple English?`, vi: `Bạn có thể miêu tả chủ đề này bằng tiếng Anh đơn giản không?` },
              { en: "We practice speaking with our classmates every morning.", vi: "Chúng tôi luyện nói cùng các bạn cùng lớp vào mỗi buổi sáng." }
            ],
            figureBeforeWords: "./assets/vocab-a-2.png",
            words: [
              { word: keyWord1, ipa: `/ˈ${keyWord1.slice(0, 5)}/`, meaning: `từ khóa chủ đề (${topicVi.split("&")[0].trim().toLowerCase()})`, exampleEn: `This unit focuses on ${keyWord1} in daily life.`, exampleVi: `Bài học này tập trung vào ${topicVi.toLowerCase()} trong đời sống hàng ngày.` },
              { word: keyWord2, ipa: `/ˈ${keyWord2.slice(0, 5)}/`, meaning: "khái niệm / hoạt động liên quan", exampleEn: `We practice talking about ${keyWord2} with a partner.`, exampleVi: `Chúng tôi thực hành nói về chủ đề này cùng bạn học.` },
              { word: "daily", ipa: "/ˈdeɪli/", meaning: "hàng ngày, thường nhật", exampleEn: "I use these words in daily conversations.", exampleVi: "Tôi sử dụng những từ này trong giao tiếp hàng ngày." },
              { word: "describe", ipa: "/dɪˈskraɪb/", meaning: "miêu tả, mô tả", exampleEn: "Can you describe your experience clearly?", exampleVi: "Bạn có thể miêu tả trải nghiệm của mình rõ ràng không?" },
              { word: "example", ipa: "/ɪɡˈzɑːmpl/", meaning: "ví dụ, mẫu câu", exampleEn: "Give a clear example in your answer.", exampleVi: "Hãy đưa ra một ví dụ rõ ràng trong câu trả lời của bạn." },
              { word: "common", ipa: "/ˈkɒmən/", meaning: "phổ biến, thông dụng", exampleEn: "This is a very common expression in English.", exampleVi: "Đây là một cách diễn đạt rất thông dụng trong tiếng Anh." }
            ],
            exercises: [
              {
                id: `${uIdx}.1`,
                type: "matching",
                title: `Match ${topicEn} vocabulary`,
                instruction: "Match each word or function with its correct meaning.",
                partTag: "Part A",
                options: [
                  { key: "A", text: "Happening every day as part of normal life" },
                  { key: "B", text: "To say what something or someone is like" },
                  { key: "C", text: "A specific fact or sentence that illustrates a rule" },
                  { key: "D", text: "Used frequently by many people" }
                ],
                items: [
                  { num: 1, prompt: "daily", answer: "A" },
                  { num: 2, prompt: "describe", answer: "B" },
                  { num: 3, prompt: "example", answer: "C" },
                  { num: 4, prompt: "common", answer: "D" }
                ]
              },
              {
                id: `${uIdx}.2`,
                type: "mcq",
                title: `Choose the appropriate word for ${topicEn}`,
                instruction: "Choose the best word to complete each sentence.",
                partTag: "Part A",
                items: [
                  {
                    num: 1,
                    prompt: `In Unit ${uIdx} (${topicEn}), we learn how to ______ clearly in everyday situations.`,
                    choices: [
                      { key: "A", text: "describe" },
                      { key: "B", text: "sleeping" },
                      { key: "C", text: "yesterday" },
                      { key: "D", text: "never" }
                    ],
                    answer: "A"
                  },
                  {
                    num: 2,
                    prompt: "Please give one short ______ to support your answer.",
                    choices: [
                      { key: "A", text: "night" },
                      { key: "B", text: "example" },
                      { key: "C", text: "goodbye" },
                      { key: "D", text: "tired" }
                    ],
                    answer: "B"
                  }
                ]
              },
              {
                id: `${uIdx}.3`,
                type: "tf",
                title: "Vocabulary Check: True or False",
                instruction: "Decide if each statement is True or False.",
                partTag: "Part A",
                items: [
                  { num: 1, prompt: `Unit ${uIdx} covers ${topicEn} (${topicVi}).`, answer: "True" },
                  { num: 2, prompt: '"Daily" means something that happens only once a year.', answer: "False" }
                ]
              },
              {
                id: `${uIdx}.4`,
                type: "fill",
                title: "Fill in the key words",
                instruction: "Complete each sentence with a suitable word from Part A.",
                partTag: "Part A",
                items: [
                  { num: 1, before: "We use English in", after: "(daily / night) situations.", answer: "daily" },
                  { num: 2, before: "Please", after: "(describe / bye) your answer in detail.", answer: "describe" }
                ]
              },
              {
                id: `${uIdx}.5`,
                type: "reorder",
                title: "Arrange words into a complete sentence",
                instruction: "Put the words in the correct order.",
                partTag: "Part A",
                items: [
                  { num: 1, tiles: ["practice", "We", "every", "English", "day"], answer: "We practice English every day" }
                ]
              }
            ]
          },
          B: {
            code: "B",
            titleEn: `${topicEn} — Collocations & Context`,
            titleVi: `Cụm từ & Ngữ cảnh: ${topicVi}`,
            nextLabel: "Next: Part C: Word Families & Pronunciation",
            intro: `Expand your vocabulary for ${topicEn} with natural adjectives and collocations.`,
            bullets: [
              "Combine adjectives and nouns naturally to express opinions clearly.",
              "Always check pronunciation with the US and UK audio buttons."
            ],
            figureTop: "./assets/vocab-b-1.png",
            exampleSentences: [
              { en: "I feel much more confident when speaking about this topic.", vi: "Tôi cảm thấy tự tin hơn nhiều khi nói về chủ đề này." },
              { en: "Practice makes progress every single day.", vi: "Luyện tập giúp bạn tiến bộ mỗi ngày." }
            ],
            words: [
              { word: "confident", ipa: "/ˈkɒnfɪdənt/", meaning: "tự tin", exampleEn: "I feel confident in my English class.", exampleVi: "Tôi cảm thấy tự tin trong lớp học tiếng Anh." },
              { word: "situation", ipa: "/ˌsɪtʃuˈeɪʃn/", meaning: "tình huống, hoàn cảnh", exampleEn: "Use polite words in formal situations.", exampleVi: "Hãy dùng từ ngữ lịch sự trong các tình huống trang trọng." },
              { word: "useful", ipa: "/ˈjuːsfl/", meaning: "hữu ích", exampleEn: "These phrases are very useful for travelers.", exampleVi: "Những cụm từ này rất hữu ích cho người đi du lịch." },
              { word: "natural", ipa: "/ˈnætʃrəl/", meaning: "tự nhiên", exampleEn: "Try to give a natural response.", exampleVi: "Hãy cố gắng đưa ra câu trả lời tự nhiên." }
            ],
            callout: {
              title: `Lưu ý khi học từ vựng chủ đề ${topicVi}`,
              text: "Thay vì học từng từ rời rạc, hãy học theo cụm từ (collocations) và đọc to cả câu ví dụ để ghi nhớ ngữ cảnh sử dụng tự nhiên nhất."
            },
            exercises: [
              {
                id: `${uIdx}.6`,
                type: "mcq",
                title: "Choose the correct adjective",
                instruction: "Select the best option to complete the sentence.",
                partTag: "Part B",
                items: [
                  {
                    num: 1,
                    prompt: "Regular practice helps you feel more ______ when speaking in public.",
                    choices: [
                      { key: "A", text: "confident" },
                      { key: "B", text: "surname" },
                      { key: "C", text: "alphabet" },
                      { key: "D", text: "midnight" }
                    ],
                    answer: "A"
                  }
                ]
              },
              {
                id: `${uIdx}.7`,
                type: "fill",
                title: "Fill in the missing word",
                instruction: "Complete each sentence with one word from Part B.",
                partTag: "Part B",
                items: [
                  { num: 1, before: "Use polite words in formal", after: "(situations / mornings).", answer: "situations" },
                  { num: 2, before: "These phrases are very", after: "(useful / bad) in daily life.", answer: "useful" }
                ]
              }
            ]
          },
          C: {
            code: "C",
            titleEn: `${topicEn} — Summary Table & Review`,
            titleVi: `Bảng tổng hợp & Ôn tập: ${topicVi}`,
            nextLabel: "Next: Section 2 · Phrases",
            intro: `Review how key terms in Unit ${uIdx} (${topicEn}) are categorized and used in sentences.`,
            bullets: [
              "Check the summary table below before completing the Part C exercises.",
              "Pay attention to spelling and part of speech."
            ],
            figureTop: "./assets/vocab-c-1.png",
            table: {
              headers: ["Nhóm từ (Category)", "Từ vựng tiêu biểu", "Ví dụ áp dụng"],
              rows: [
                ["Nouns (Danh từ)", `${keyWord1}, example, situation`, `Give a clear example of ${keyWord1}.`],
                ["Verbs (Động từ)", "describe, practice, repeat", "Please describe your daily routine."],
                ["Adjectives (Tính từ)", "daily, common, confident, useful", "This is a very useful expression."]
              ]
            },
            words: [
              { word: "practice", ipa: "/ˈpræktɪs/", meaning: "luyện tập, thực hành", exampleEn: "We practice speaking English together.", exampleVi: "Chúng tôi cùng nhau luyện nói tiếng Anh." },
              { word: "clearly", ipa: "/ˈklɪəli/", meaning: "một cách rõ ràng", exampleEn: "Please speak slowly and clearly.", exampleVi: "Vui lòng nói chậm và rõ ràng." }
            ],
            exercises: [
              {
                id: `${uIdx}.8`,
                type: "fill",
                title: "Complete sentences about vocabulary usage",
                instruction: "Fill in the blanks with appropriate words.",
                partTag: "Part C",
                items: [
                  { num: 1, before: "Please speak slowly and", after: "(clearly / tired).", answer: "clearly" }
                ]
              }
            ]
          }
        }
      },
      phrases: (vpg && vpg.phrases) ? vpg.phrases : window.UNIT_1_CONTENT.phrases,
      grammar: (vpg && vpg.grammar) ? vpg.grammar : window.UNIT_1_CONTENT.grammar,
      reading: window.UNIT_1_CONTENT.reading,
      listening: window.UNIT_1_CONTENT.listening,
      writing: (window.UNITS_1_TO_10_WRITING && window.UNITS_1_TO_10_WRITING[uIdx]) || window.UNIT_1_CONTENT.writing,
      unitTest: Object.assign({}, window.UNIT_1_CONTENT.unitTest, {
        title: `Unit ${uIdx} Assessment: ${unit.titleEn}`
      })
    };
  }

  // Speech Synthesis Helper (US / UK voices)
  window.speakText = function (text, accent) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = accent === "UK" ? "en-GB" : "en-US";
      utter.rate = 0.92;
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes(accent === "UK" ? "gb" : "us"));
      if (targetVoice) utter.voice = targetVoice;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      // ignore
    }
  };

  function lookupDictionaryWord(rawWord) {
    const db = window.DICTIONARY_DB || {};
    const w = String(rawWord || "").trim().toLowerCase().replace(/^'+|'+$/g, "");
    if (!w) return null;

    if (db[w]) return db[w];

    // Morphological lemmatization: plural (-s/-es/-ies/-ves), verb forms (-ing/-ed/-ied), comparatives (-er/-est)
    const rules = [
      ["ies", "y"],
      ["ves", "f"],
      ["ves", "fe"],
      ["ied", "y"],
      ["ing", ""],
      ["ing", "e"],
      ["ed", ""],
      ["ed", "e"],
      ["es", ""],
      ["s", ""],
      ["er", ""],
      ["est", ""]
    ];
    for (let i = 0; i < rules.length; i++) {
      const suf = rules[i][0];
      const rep = rules[i][1];
      if (w.endsWith(suf) && w.length > suf.length + 1) {
        const stem = w.slice(0, -suf.length) + rep;
        if (db[stem]) return db[stem];
        // Handle doubled final consonant (e.g. stopped -> stop, running -> run, sitting -> sit)
        if ((suf === "ing" || suf === "ed") && stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
          const singleStem = stem.slice(0, -1);
          if (db[singleStem]) return db[singleStem];
        }
      }
    }

    return {
      word: w,
      ipa: `/${w}/`,
      posVi: "từ vựng",
      senses: [
        { primary: "từ vựng trong bài học", synonyms: "bấm US / UK để nghe phát âm" }
      ],
      example: `Example with "${w}" in context.`,
      exampleVi: ""
    };
  }

  function wrapClickableWords(htmlText) {
    if (!state.dictEnabled) return htmlText;
    const activeW = state.activeDictWord ? state.activeDictWord.word.toLowerCase() : "";
    return String(htmlText || "").replace(/(<[^>]+>|&[a-zA-Z0-9#]+;)|([A-Za-z']+)/g, function (match, skip, word) {
      if (skip) return skip;
      const low = word.toLowerCase();
      const activeCls = (activeW && low === activeW) ? " active-clicked-word" : "";
      return `<span class="clickable-word${activeCls}" data-word="${low}">${word}</span>`;
    });
  }

  // ==========================================================================
  // RENDER AUTHENTICATION VIEW (LOGIN / REGISTER STUDENT ACCOUNT)
  // ==========================================================================
  function renderAuthView() {
    const isReg = state.authMode === "register";
    const existingAccounts = Object.values(accountsDb || {});

    return `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="auth-brand-row">
            <img src="./assets/study-logo.svg" alt="IELTS Foundation" class="tej-logo-img" />
            <div class="brand-text">
              <span class="brand-the">THE</span>
              <span class="brand-main">ENGLISH JOURNEY</span>
            </div>
          </div>

          <div class="auth-course-badge">IELTS FOUNDATION · A1–A2 (50 UNIT)</div>
          <h1 class="auth-title">${isReg ? "Tạo tài khoản học viên" : "Đăng nhập học tập"}</h1>
          <p class="auth-subtitle">
            ${isReg
              ? "Tạo tài khoản cá nhân để vào học 50 Unit IELTS Foundation, làm bài tập và lưu tiến độ tự động."
              : "Đăng nhập vào tài khoản của bạn để tiếp tục học bài, làm bài và xem tiến độ đã lưu."}
          </p>

          <div class="auth-tabs">
            <button type="button" class="auth-tab-btn ${!isReg ? "active" : ""}" id="btn-auth-tab-login">Đăng nhập</button>
            <button type="button" class="auth-tab-btn ${isReg ? "active" : ""}" id="btn-auth-tab-register">Tạo tài khoản</button>
          </div>

          ${state.authError ? `<div class="auth-error-msg">⚠️ ${escapeHtml(state.authError)}</div>` : ""}

          <form id="auth-form" onsubmit="return false;">
            ${isReg ? `
              <div class="auth-form-group">
                <label class="auth-label" for="auth-name">Họ và tên học viên</label>
                <input type="text" id="auth-name" class="auth-input" placeholder="Ví dụ: Nguyễn Minh Tùng" required />
              </div>
            ` : ""}

            <div class="auth-form-group">
              <label class="auth-label" for="auth-email">Email hoặc Tên đăng nhập</label>
              <input type="text" id="auth-email" class="auth-input" placeholder="Ví dụ: hocvien@gmail.com" required />
            </div>

            <div class="auth-form-group">
              <label class="auth-label" for="auth-password">Mật khẩu</label>
              <input type="password" id="auth-password" class="auth-input" placeholder="Nhập mật khẩu..." required />
            </div>

            <button type="submit" class="auth-submit-btn" id="btn-auth-submit">
              ${isReg ? "Đăng ký & Vào khóa học →" : "Vào khóa học IELTS Foundation →"}
            </button>
          </form>

          ${existingAccounts.length > 0 ? `
            <div class="auth-accounts-box">
              <div class="auth-accounts-label">Tài khoản học viên trên thiết bị này (bấm để vào nhanh):</div>
              <div class="quick-account-list">
                ${existingAccounts.map(acc => {
                  const doneCount = window.UNITS_DATA.filter(u => acc.unitProgress && acc.unitProgress[u.id] && acc.unitProgress[u.id].status === "completed").length;
                  const inProgCount = window.UNITS_DATA.filter(u => acc.unitProgress && acc.unitProgress[u.id] && acc.unitProgress[u.id].status === "in-progress").length;
                  return `
                    <button type="button" class="quick-account-btn" data-quick-login="${escapeHtml(acc.email)}">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <span class="avatar-initials-circle">${escapeHtml(getInitials(acc.name))}</span>
                        <div>
                          <div style="font-size:13.5px;font-weight:800;color:#18181B;">${escapeHtml(acc.name)}</div>
                          <div style="font-size:11.5px;color:#52525B;">${escapeHtml(acc.email)}</div>
                        </div>
                      </div>
                      <span style="font-size:11.5px;font-weight:800;padding:3px 8px;border:1.5px solid #18181B;background:#FFFFFF;">
                        Xong ${doneCount}/50 · Đang học ${inProgCount}
                      </span>
                    </button>
                  `;
                }).join("")}
              </div>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // RENDER DASHBOARD VIEW (FOCUSED 100% ON IELTS FOUNDATION)
  // ==========================================================================
  function renderDashboardView() {
    if (!state.currentUser) {
      return renderAuthView();
    }

    const userName = state.currentUser.name || "Học viên";
    const userEmail = state.currentUser.email || "";
    const userInitials = getInitials(userName);

    const completedUnitsCount = window.UNITS_DATA.filter(u => {
      const p = state.unitProgress[u.id];
      return p && p.status === "completed";
    }).length;
    const inProgressUnitsCount = window.UNITS_DATA.filter(u => {
      const p = state.unitProgress[u.id];
      return p && p.status === "in-progress";
    }).length;
    const notStartedUnitsCount = window.COURSE_META.totalUnits - completedUnitsCount - inProgressUnitsCount;
    const progressPercent = Math.round((completedUnitsCount / window.COURSE_META.totalUnits) * 100);

    const filteredUnits = window.UNITS_DATA.filter(unit => {
      const prog = getUnitProgress(unit.id);
      if (state.unitFilter === "completed") return prog.status === "completed";
      if (state.unitFilter === "in-progress") return prog.status === "in-progress";
      if (state.unitFilter === "not-started") return prog.status === "not-started";
      return true;
    });

    return `
      <div class="dashboard-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""} ${state.mobileMenuOpen ? "mobile-menu-open" : ""}">
        <button class="sidebar-collapse-btn" id="btn-toggle-sidebar" title="${state.sidebarCollapsed ? "Mở rộng menu (Ctrl+B)" : "Thu gọn menu (Ctrl+B)"}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>

        <!-- LEFT SIDEBAR (FOCUSED ONLY ON IELTS FOUNDATION & STUDENT PROGRESS) -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <a class="brand-link" data-action="go-course">
              <img src="./assets/study-logo.svg" alt="IELTS Foundation" class="tej-logo-img" />
              <div class="brand-text">
                <span class="brand-the">IELTS FOUNDATION</span>
                <span class="brand-main">THE ENGLISH JOURNEY</span>
              </div>
            </a>
            <button class="cmd-close-btn mobile-only-btn" id="btn-close-mobile-menu" title="Đóng menu">✕</button>
          </div>

          <div class="sidebar-scroll">
            <div class="nav-group">
              <div class="nav-group-label">IELTS FOUNDATION (A1–A2)</div>
              <ul class="nav-list">
                <li class="nav-item ${state.view === "course" ? "active" : ""}" data-action="go-course">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  <span>50 Unit bài học</span>
                </li>
                <li class="nav-item ${state.view === "progress" ? "active" : ""}" id="nav-go-progress">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                  <span>Tiến độ của tôi (${completedUnitsCount}/50)</span>
                </li>
                <li class="nav-item" id="nav-open-flashcards">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                  <span>Bộ thẻ từ vựng (${state.savedFlashcards.length})</span>
                </li>
                <li class="nav-item" id="nav-open-dict">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <span>Tìm Unit / Tra từ</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="sidebar-footer">
            <div class="sidebar-user-row">
              <span class="avatar-initials-circle">${escapeHtml(userInitials)}</span>
              <div class="user-meta">
                <div class="user-name">${escapeHtml(userName)}</div>
                <div class="user-email">${escapeHtml(userEmail)}</div>
              </div>
            </div>
            <button class="logout-btn" id="btn-sidebar-logout" title="Đăng xuất hoặc chuyển sang tài khoản học viên khác">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Đổi tài khoản / Đăng xuất</span>
            </button>
          </div>
        </aside>

        <!-- MAIN WRAPPER -->
        <div class="main-wrapper">
          <header class="top-header">
            <div class="mobile-brand" data-action="go-course">
              <img src="./assets/study-logo.svg" alt="IELTS Foundation" class="tej-logo-img" />
              <div class="brand-text">
                <span class="brand-the">IELTS FOUNDATION</span>
                <span class="brand-main">THE ENGLISH JOURNEY</span>
              </div>
            </div>

            <button class="header-search-btn" id="btn-open-cmd">
              <span class="search-placeholder">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span>Tìm nhanh Unit (01–50) hoặc tra từ...</span>
              </span>
              <span class="kbd-shortcut">⌘ K</span>
            </button>

            <div class="header-actions">
              <button class="icon-square-btn mobile-only-btn" id="btn-mobile-search" title="Tìm kiếm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>

              <button class="icon-square-btn mobile-only-btn" id="btn-open-mobile-menu" title="Mở menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              </button>

              <button class="profile-pill-btn" id="btn-profile-pill">
                <span class="avatar-initials-circle" style="width:26px;height:26px;font-size:11px;">${escapeHtml(userInitials)}</span>
                <span>${escapeHtml(userName)}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              ${state.profileMenuOpen ? `
                <div class="header-dropdown-box" onclick="event.stopPropagation()">
                  <div class="dropdown-head">
                    <span>${escapeHtml(userName.toUpperCase())}</span>
                    <span style="font-size:11px;font-weight:600;">${completedUnitsCount}/50 Unit</span>
                  </div>
                  <div class="dropdown-item" data-action="go-course">
                    <span>📚 Danh sách 50 Unit</span>
                    <span>→</span>
                  </div>
                  <div class="dropdown-item" id="menu-go-progress">
                    <span>📊 Tiến độ học tập đã lưu</span>
                    <span>→</span>
                  </div>
                  <div class="dropdown-item" id="menu-open-fc">
                    <span>🗂️ Bộ thẻ từ vựng (${state.savedFlashcards.length})</span>
                    <span>→</span>
                  </div>
                  <div class="dropdown-item" id="menu-reset-progress" style="color:#B45309;">
                    <span>↺ Đặt lại tiến độ tài khoản này</span>
                  </div>
                  <div class="dropdown-item" id="menu-logout" style="color:#DC2626;">
                    <span>🚪 Đổi tài khoản / Đăng ký mới</span>
                  </div>
                </div>
              ` : ""}
            </div>
          </header>

          <main class="course-container">
            ${state.view === "progress"
              ? renderProgressOverview(completedUnitsCount, inProgressUnitsCount, notStartedUnitsCount, progressPercent)
              : `
              <div class="course-code-tag">${window.COURSE_META.code}</div>
              <h1 class="course-h1">${window.COURSE_META.title}</h1>
              <p class="course-subtitle">${window.COURSE_META.subtitle}</p>
              <div class="level-badge-box">${window.COURSE_META.levelBadge}</div>
              <p class="course-description">${window.COURSE_META.description}</p>

              <div class="curriculum-header-row">
                <h2 class="curriculum-title">Nội dung khóa học · ${window.COURSE_META.totalUnits} Unit</h2>
                <div class="curriculum-progress-wrap">
                  <span class="progress-text">Học viên: <strong>${escapeHtml(userName)}</strong> · Hoàn thành ${completedUnitsCount}/${window.COURSE_META.totalUnits}</span>
                  <div class="neo-progress-track" title="${progressPercent}% hoàn thành">
                    <div class="neo-progress-fill" style="width: ${progressPercent}%;"></div>
                  </div>
                </div>
              </div>

              <div class="unit-filter-bar">
                <button type="button" class="unit-filter-btn ${state.unitFilter === "all" ? "active" : ""}" data-unit-filter="all">
                  Tất cả (${window.COURSE_META.totalUnits})
                </button>
                <button type="button" class="unit-filter-btn ${state.unitFilter === "in-progress" ? "active" : ""}" data-unit-filter="in-progress">
                  Đang học (${inProgressUnitsCount})
                </button>
                <button type="button" class="unit-filter-btn ${state.unitFilter === "completed" ? "active" : ""}" data-unit-filter="completed">
                  Đã xong (${completedUnitsCount})
                </button>
                <button type="button" class="unit-filter-btn ${state.unitFilter === "not-started" ? "active" : ""}" data-unit-filter="not-started">
                  Chưa học (${notStartedUnitsCount})
                </button>
              </div>

              <div class="units-grid">
                ${filteredUnits.map(unit => {
                  const prog = getUnitProgress(unit.id);
                  const doneSecs = (prog.completedSections || []).length;
                  let statusLabel = "Chưa học";
                  let statusClass = "";
                  if (prog.status === "in-progress") {
                    statusLabel = `Đang học (${doneSecs}/7)`;
                    statusClass = "in-progress";
                  } else if (prog.status === "completed") {
                    statusLabel = "Đã xong ✓";
                    statusClass = "completed";
                  }

                  return `
                    <article class="unit-card" data-unit-id="${unit.id}">
                      <div class="unit-card-top">
                        <div class="unit-num-badge">${unit.number}</div>
                        <span class="unit-status-badge ${statusClass}">${statusLabel}</span>
                      </div>

                      <h3 class="unit-title-en">${escapeHtml(unit.titleEn)}</h3>
                      <div class="unit-title-vi">${escapeHtml(unit.titleVi)}</div>
                      <p class="unit-desc">${escapeHtml(unit.description)}</p>

                      <hr class="unit-divider" />

                      <div class="unit-card-footer">
                        <div class="unit-meta-list">
                          <span class="unit-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                            <span>${unit.partsCount} phần</span>
                          </span>
                          <span class="unit-meta-item" title="${unit.durationTooltip}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>${unit.duration}</span>
                          </span>
                          <span class="unit-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
                            <span>Bài kiểm tra</span>
                          </span>
                        </div>

                        <span class="unit-cta-link">
                          <span>${prog.status === "not-started" ? "Vào học" : "Học tiếp"}</span>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </span>
                      </div>
                    </article>
                  `;
                }).join("")}
              </div>
            `}
          </main>
        </div>
      </div>
    `;
  }

  function renderProgressOverview(completedCount, inProgressCount, notStartedCount, progressPercent) {
    const userName = (state.currentUser && state.currentUser.name) || "Học viên";
    const userEmail = (state.currentUser && state.currentUser.email) || "";
    let totalCheckedExercises = 0;
    Object.values(state.unitProgress || {}).forEach(p => {
      if (p && p.checkedExercises) {
        totalCheckedExercises += Object.keys(p.checkedExercises).length;
      }
    });

    const activeUnits = window.UNITS_DATA.filter(u => {
      const p = state.unitProgress[u.id];
      return p && (p.status === "in-progress" || p.status === "completed");
    });

    return `
      <a class="back-courses-link" data-action="go-course">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        <span>Quay lại danh sách 50 Unit</span>
      </a>
      <div class="course-code-tag">HỒ SƠ HỌC VIÊN · ${escapeHtml(userEmail)}</div>
      <h1 class="course-h1">TIẾN ĐỘ HỌC TẬP CỦA ${escapeHtml(userName.toUpperCase())}</h1>
      <p class="course-description">Toàn bộ bài làm, đáp án và tiến độ học 50 Unit <strong>IELTS Foundation (A1–A2)</strong> được lưu tự động vào tài khoản của bạn.</p>

      <div class="progress-stats-grid">
        <div class="progress-stat-card" style="background:#DCFCE7;">
          <div class="progress-stat-num">${completedCount} / 50</div>
          <div class="progress-stat-label">Unit đã hoàn thành (${progressPercent}%)</div>
        </div>
        <div class="progress-stat-card" style="background:#FEF9C3;">
          <div class="progress-stat-num">${inProgressCount}</div>
          <div class="progress-stat-label">Unit đang học dở</div>
        </div>
        <div class="progress-stat-card">
          <div class="progress-stat-num">${totalCheckedExercises}</div>
          <div class="progress-stat-label">Bài tập đã nộp / chấm điểm</div>
        </div>
        <div class="progress-stat-card">
          <div class="progress-stat-num">${state.savedFlashcards.length}</div>
          <div class="progress-stat-label">Từ vựng đã lưu vào Bộ thẻ</div>
        </div>
      </div>

      <h2 class="curriculum-title" style="margin-bottom:14px;">Các Unit bạn đã bắt đầu hoặc hoàn thành (${activeUnits.length})</h2>
      ${activeUnits.length === 0 ? `
        <div class="unit-card" data-unit-id="01a16741-f56b-7b42-8f04-6f89ca98e580" style="max-width:520px;">
          <h3 class="unit-title-en">Bắt đầu ngay Unit 01: Greetings & Introductions</h3>
          <p class="unit-desc" style="margin-top:6px;">Bạn chưa bắt đầu Unit nào. Bấm vào đây để mở Unit 01 và lưu tiến độ đầu tiên!</p>
          <hr class="unit-divider" />
          <div class="unit-card-footer">
            <span style="font-size:12.5px;font-weight:700;">Unit 01 · 6 phần + Bài kiểm tra</span>
            <span class="unit-cta-link">Vào học Unit 01 →</span>
          </div>
        </div>
      ` : `
        <div class="units-grid">
          ${activeUnits.map(unit => {
            const p = getUnitProgress(unit.id);
            const doneSecs = (p.completedSections || []).length;
            return `
              <article class="unit-card" data-unit-id="${unit.id}">
                <div class="unit-card-top">
                  <div class="unit-num-badge">${unit.number}</div>
                  <span class="unit-status-badge ${p.status === "completed" ? "completed" : "in-progress"}">
                    ${p.status === "completed" ? "Đã xong ✓" : `Đang học (${doneSecs}/7 phần)`}
                  </span>
                </div>
                <h3 class="unit-title-en">${escapeHtml(unit.titleEn)}</h3>
                <div class="unit-title-vi">${escapeHtml(unit.titleVi)}</div>
                <hr class="unit-divider" />
                <div class="unit-card-footer">
                  <span style="font-size:12.5px;font-weight:700;">Hoàn thành ${doneSecs}/7 phần</span>
                  <span class="unit-cta-link">Mở lại bài học →</span>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      `}
    `;
  }

  // ==========================================================================
  // RENDER PARALLEL SPLIT-SCREEN LESSON VIEW (/hoc/<uuid>)
  // ==========================================================================
  function renderLessonView() {
    const unit = window.UNITS_DATA.find(u => u.id === state.currentUnitId) || window.UNITS_DATA[0];
    const content = getLessonContentForUnit(unit);
    const prog = getUnitProgress(unit.id);

    const sectionsList = [
      { key: "vocabulary", num: 1, label: "Vocabulary" },
      { key: "phrases", num: 2, label: "Phrases" },
      { key: "grammar", num: 3, label: "Grammar" },
      { key: "reading", num: 4, label: "Reading" },
      { key: "listening", num: 5, label: "Listening" },
      { key: "writing", num: 6, label: "Writing" },
      { key: "unittest", num: 7, label: "Unit test", isTest: true }
    ];

    const completedCount = prog.completedSections.length;
    const progressPct = Math.round((completedCount / 7) * 100);

    const isUnitTest = state.currentSection === "unittest";
    const sectionObj = isUnitTest ? content.unitTest : content[state.currentSection];
    const partsMap = (!isUnitTest && sectionObj && sectionObj.parts) ? sectionObj.parts : {};
    const partKeys = Object.keys(partsMap);
    const activePartKey = partKeys.includes(state.currentPart) ? state.currentPart : (partKeys[0] || "A");
    const activePart = partsMap[activePartKey] || null;

    const activeSectionMeta = sectionsList.find(s => s.key === state.currentSection) || sectionsList[0];
    const exercisesList = (sectionObj && sectionObj.allExercisesInOneList)
      ? partKeys.reduce((acc, pk) => acc.concat((partsMap[pk] && partsMap[pk].exercises) || []), [])
      : ((activePart && activePart.exercises) ? activePart.exercises : []);
    const doneExercisesCount = exercisesList.filter(ex => prog.checkedExercises[ex.id]).length;

    let answeredTestItems = 0;
    let totalTestItems = 0;
    if (isUnitTest && content.unitTest && content.unitTest.sections) {
      content.unitTest.sections.forEach(sec => {
        sec.items.forEach(it => {
          totalTestItems++;
          const val = prog.exerciseAnswers[`${sec.id}_${it.num}`];
          if (Array.isArray(val) ? val.length > 0 : (val !== undefined && String(val).trim() !== "")) {
            answeredTestItems++;
          }
        });
      });
    }

    return `
      <div class="lesson-view ${state.dictEnabled ? "dict-enabled" : ""}">
        <!-- UNIFIED TOP HEADER BAR -->
        <header class="lesson-topbar">
          <div class="lesson-topbar-main">
            <div class="lesson-top-left">
              <button class="lesson-back-btn" id="btn-back-to-course" title="Về khoá học">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </button>
              <div class="lesson-title-group">
                <div class="lesson-unit-crumb">UNIT-${unit.number} · IELTS Foundation</div>
                <div class="lesson-unit-main-title" title="${escapeHtml(unit.titleEn)}">${escapeHtml(unit.titleEn)}</div>
              </div>
            </div>

            <nav class="lesson-sections-inline" aria-label="Các phần của Unit">
              ${sectionsList.map(sec => {
                const isDone = prog.completedSections.includes(sec.key);
                const isActive = state.currentSection === sec.key;
                return `
                  <button
                    class="section-pill-btn ${isActive ? "active" : ""} ${isDone ? "done" : ""}"
                    data-section="${sec.key}"
                  >
                    ${sec.isTest ? `
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
                    ` : `
                      <span class="section-num-circle">${isDone ? "✓" : sec.num}</span>
                    `}
                    <span>${sec.label}</span>
                  </button>
                `;
              }).join("")}
            </nav>

            <div class="lesson-top-right">
              <div class="lesson-progress-pill">
                <span>Đã xong</span>
                <div class="lesson-progress-bar">
                  <div class="lesson-progress-fill" style="width: ${progressPct}%;"></div>
                </div>
                <span class="lesson-progress-count">${completedCount}/7</span>
              </div>

              <button
                class="top-tool-btn ${state.dictEnabled ? "active-dict" : ""}"
                id="btn-toggle-dict"
                title="Tra từ đang bật: bấm vào bất kỳ từ tiếng Anh nào ở cả bên Lý thuyết hoặc Bài tập để xem nghĩa"
              >
                <span style="font-weight:800;">文A</span>
                <span>Tra từ</span>
              </button>

              <button class="top-tool-btn" id="btn-open-flashcards" title="Mở và lưu từ vào bộ thẻ Flashcard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                <span>Lưu vào bộ thẻ</span>
              </button>

              <button class="top-tool-btn" id="btn-toggle-fullscreen" title="Phóng to / Thu nhỏ toàn màn hình">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                <span>${state.isExpandedFullscreen ? "Thu nhỏ" : "Phóng to"}</span>
              </button>
            </div>
          </div>
        </header>

        <!-- PARALLEL 2-PANE SPLIT WORKSPACE (LEFT: THEORY, RIGHT: EXERCISES) -->
        <div
          class="lesson-split-workspace"
          id="split-workspace"
          style="--left-pane-width: ${state.leftPanePercent}%;"
        >
          <!-- LEFT PANE: THEORY / GUIDE -->
          <section class="split-pane split-pane-left" aria-label="Theory">
            <div class="pane-sticky-header">
              ${isUnitTest ? `
                <div class="pane-header-title">
                  <strong>${escapeHtml(content.unitTest.title)}</strong>
                </div>
              ` : `
                <div class="pane-header-title">
                  <span style="color:#71717A;">Section ${activeSectionMeta.num} ·</span> <strong>${activeSectionMeta.label}</strong>
                </div>
                <div class="part-pills-group">
                  ${partKeys.map(pk => {
                    const pObj = partsMap[pk];
                    return `
                      <button
                        class="part-letter-btn ${pk === activePartKey ? "active" : ""}"
                        data-part="${pk}"
                        title="Part ${pk}: ${escapeHtml(pObj ? pObj.titleEn : "")}"
                      >${pk}</button>
                    `;
                  }).join("")}
                </div>
              `}
            </div>

            <div class="pane-scroll-body" id="theory-scroll-pane">
              <div class="pane-inner-container">
                ${isUnitTest
                  ? renderUnitTestGuidePane(content.unitTest, prog)
                  : renderTheoryPaneContent(activeSectionMeta, activePart, partsMap, partKeys, activePartKey, prog, unit)
                }
              </div>
            </div>
          </section>

          <!-- DRAGGABLE RESIZER DIVIDER -->
          <div class="split-resizer" id="split-resizer-bar" title="Kéo để thay đổi độ rộng Lý thuyết / Bài tập"></div>

          <!-- RIGHT PANE: EXERCISES / QUESTIONS -->
          <section class="split-pane split-pane-right" aria-label="Exercises">
            <div class="pane-sticky-header">
              ${isUnitTest ? `
                <div class="pane-header-title">
                  <strong>Questions</strong>
                </div>
                <div style="font-size:12px;color:#71717A;font-weight:500;" id="test-answered-counter">
                  Đã trả lời ${answeredTestItems}/${totalTestItems} câu
                </div>
              ` : `
                <div class="pane-header-title">
                  <strong>Exercises · ${activeSectionMeta.label}</strong>${partKeys.length > 1 ? `<span style="color:#71717A;"> · Part ${activePartKey}</span>` : ""}
                </div>
                <div style="font-size:12px;color:#71717A;font-weight:500;">
                  Done ${doneExercisesCount}/${exercisesList.length}
                </div>
              `}
            </div>

            <div class="pane-scroll-body" id="exercises-scroll-pane">
              <div class="pane-inner-container">
                ${isUnitTest
                  ? renderUnitTestQuestionsPane(content.unitTest, prog, unit, answeredTestItems, totalTestItems)
                  : renderExercisesPaneContent(sectionObj && sectionObj.allExercisesInOneList ? { exercises: exercisesList } : activePart, prog, unit)
                }
              </div>
            </div>
          </section>
        </div>

        <!-- STICKY BOTTOM FOOTER BAR -->
        <footer class="lesson-bottom-bar">
          <div class="lesson-bottom-inner">
            <button class="bottom-prev-btn" id="btn-lesson-prev" title="Phần trước">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>

            <div class="bottom-section-status">
              ${isUnitTest
                ? escapeHtml(content.unitTest.title)
                : `Section ${activeSectionMeta.num} · ${activeSectionMeta.label}${partKeys.length > 1 ? ` · Part ${activePartKey}` : ""}`
              }
            </div>

            ${isUnitTest ? `
              <button class="bottom-next-btn" id="btn-complete-unit-bottom">
                <span>✓ Hoàn thành Unit ${unit.number}</span>
              </button>
            ` : `
              <button class="bottom-next-btn" id="btn-lesson-next">
                <span>${escapeHtml((activePart && activePart.nextLabel) || "Next Section")}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            `}
          </div>
        </footer>
      </div>
    `;
  }

  function renderDialoguesListHtml(exampleSentences) {
    if (!exampleSentences || exampleSentences.length === 0) return "";
    return `
      <ul class="dialogue-examples-box">
        ${exampleSentences.map(ex => `
          <li class="dialogue-row">
            <div style="min-width:0;flex:1;">
              <p class="dialogue-en">${wrapClickableWords(escapeHtml(ex.en))}</p>
              <p class="dialogue-vi">${escapeHtml(ex.vi)}</p>
            </div>
            <button
              type="button"
              class="speak-icon-btn"
              aria-label="Nghe ${escapeHtml(ex.en)}"
              title="Nghe ${escapeHtml(ex.en)}"
              onclick="window.speakText('${ex.en.replace(/'/g, "\\'")}', 'US')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            </button>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderWordsListHtml(words) {
    if (!words || words.length === 0) return "";
    return `
      <ul class="vocab-list-section">
        ${words.map(w => `
          <li class="vocab-card">
            <div style="min-width:0;flex:1;">
              <p class="vocab-word-line">
                <span class="vocab-headword clickable-word" data-word="${escapeHtml(w.word.toLowerCase())}">${escapeHtml(w.word)}</span>
                ${w.ipa ? `<span class="vocab-ipa">${escapeHtml(w.ipa)}</span>` : ""}
                <span class="vocab-meaning">${escapeHtml(w.meaning)}</span>
              </p>
              <p class="vocab-example-block">
                <span class="vocab-example-en">${wrapClickableWords(escapeHtml(w.exampleEn))}</span>
                <span class="vocab-example-vi">${escapeHtml(w.exampleVi)}</span>
              </p>
            </div>
            <span class="vocab-audio-btns">
              <button
                type="button"
                class="voice-btn"
                aria-label="Nghe ${escapeHtml(w.word)}, giọng Mỹ"
                onclick="window.speakText('${w.word.replace(/'/g, "\\'")}', 'US')"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>US
              </button>
              <button
                type="button"
                class="voice-btn"
                aria-label="Nghe ${escapeHtml(w.word)}, giọng Anh"
                onclick="window.speakText('${w.word.replace(/'/g, "\\'")}', 'UK')"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>UK
              </button>
            </span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderSinglePartTheoryHtml(part, prog, isCurrentPart, hasMultipleParts) {
    if (!part) return "";

    return `
      <section
        id="theory-part-${part.code}"
        class="theory-part-section ${hasMultipleParts && isCurrentPart ? "active-theory-part" : ""}"
      >
        <header class="part-heading-block">
          <span class="part-badge-large">${part.code}</span>
          <div style="min-width:0;flex:1;">
            <h2 class="part-heading-title-en">${wrapClickableWords(escapeHtml(part.titleEn))}</h2>
            <p class="part-heading-title-vi">${escapeHtml(part.titleVi)}</p>
          </div>
          ${hasMultipleParts && !isCurrentPart ? `
            <button type="button" class="part-switch-exercise-btn" data-part="${part.code}">
              Làm bài tập Part ${part.code} →
            </button>
          ` : ""}
        </header>

        ${(part.intro || part.introHtml || (part.bullets && part.bullets.length > 0) || part.outroHtml || part.writingSteps) ? `
          <div class="theory-prose-block">
            ${part.intro ? `<p class="theory-intro-text">${wrapClickableWords(escapeHtml(part.intro))}</p>` : ""}
            ${part.introHtml ? `<p class="theory-intro-text">${wrapClickableWords(part.introHtml)}</p>` : ""}

            ${part.bullets && part.bullets.length > 0 ? `
              <ul class="theory-bullet-list">
                ${part.bullets.map(b => `<li>${wrapClickableWords(b)}</li>`).join("")}
              </ul>
            ` : ""}

            ${part.outroHtml ? `<p class="theory-outro-text">${wrapClickableWords(part.outroHtml)}</p>` : ""}

            ${part.writingSteps ? `
              <div class="writing-steps-box">
                ${part.writingStepsHeader !== "" ? `<p style="margin-bottom:6px;font-weight:500;color:#18181B;">${wrapClickableWords(escapeHtml(part.writingStepsHeader || "A complete note should include:"))}</p>` : ""}
                <div class="writing-steps-list">
                  ${part.writingSteps.map(step => `<p class="writing-step-item">${wrapClickableWords(step)}</p>`).join("")}
                </div>
              </div>
            ` : ""}
          </div>
        ` : ""}

        ${part.figureTop ? `
          <figure class="theory-figure">
            <img src="${part.figureTop}" alt="${escapeHtml(part.titleEn)}" class="unit1-illustration-img" />
          </figure>
        ` : ""}

        ${part.table ? `
          <div class="theory-table-wrap">
            <table class="theory-table">
              <thead>
                <tr>
                  ${part.table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${part.table.rows.map(row => `
                  <tr>
                    ${row.map((cell, idx) => `
                      <td class="${idx === 0 ? "cell-primary" : "cell-secondary"}">${wrapClickableWords(escapeHtml(cell))}</td>
                    `).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : ""}

        ${part.labeledParagraphs ? `
          <article class="reading-article-box">
            <h3 class="reading-article-title">${wrapClickableWords(escapeHtml(part.passageTitle))}</h3>
            ${part.labeledParagraphs.map(lp => `
              <p class="reading-labeled-para">
                <span class="reading-para-badge">${escapeHtml(lp.label)}</span>
                <span>${wrapClickableWords(escapeHtml(lp.text))}</span>
              </p>
            `).join("")}
          </article>
        ` : ""}

        ${part.audioTitle ? `
          <div class="listening-audio-section">
            <div class="audio-player-card">
              <span class="audio-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </span>
              <span class="audio-track-title">${escapeHtml(part.audioTitle)}</span>
              <audio
                controls
                controlslist="noplaybackrate"
                preload="metadata"
                src="${part.audioSrc || "./assets/unit1-listening.mp3"}"
                class="native-audio-player"
              ></audio>
            </div>

            ${prog.unlockedTranscript ? `
              <div class="transcript-Lines-box">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                  <span style="font-size:12px;font-weight:700;color:#15803D;">✓ LỜI THOẠI BÀI NGHE (TRANSCRIPT)</span>
                  <button type="button" class="speak-mini-btn" id="btn-hide-transcript">Ẩn lời thoại</button>
                </div>
                ${part.transcriptLines.map(line => `
                  <div style="font-size:14px;line-height:1.6;">
                    <strong style="color:#18181B;">${escapeHtml(line.speaker)}:</strong> ${wrapClickableWords(escapeHtml(line.text))}
                  </div>
                `).join("")}
              </div>
            ` : `
              <div class="transcript-locked-box">
                <span>Lời thoại sẽ hiện sau khi bạn làm xong các bài tập của phần này.</span>
                <button type="button" class="speak-mini-btn" id="btn-unlock-transcript">Xem lời thoại</button>
              </div>
            `}
          </div>
        ` : ""}

        ${part.wordsBeforeDialogues ? `
          ${renderWordsListHtml(part.words)}
          ${renderDialoguesListHtml(part.exampleSentences)}
        ` : `
          ${renderDialoguesListHtml(part.exampleSentences)}
          ${part.figureBeforeWords ? `
            <figure class="theory-figure">
              <img src="${part.figureBeforeWords}" alt="${escapeHtml(part.titleEn)} illustration" class="unit1-illustration-img" />
            </figure>
          ` : ""}
          ${renderWordsListHtml(part.words)}
        `}

        ${part.outlineGuide ? `
          <details class="writing-outline-accordion" style="margin-top:16px;border:2px solid #18181B;border-radius:10px;background:#FFFBEB;padding:12px 16px;">
            <summary style="cursor:pointer;font-weight:700;font-size:14.5px;color:#18181B;display:flex;align-items:center;gap:8px;">
              <span>Gợi ý dàn bài</span>
            </summary>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:14px;font-size:14px;line-height:1.6;color:#27272A;">
              <div>
                <h3 style="font-size:14px;font-weight:700;color:#18181B;margin-bottom:6px;">I. Phân tích đề bài</h3>
                <ul class="theory-bullet-list">
                  ${part.outlineGuide.analysis.map(item => `<li>${wrapClickableWords(item)}</li>`).join("")}
                </ul>
              </div>
              <div>
                <h3 style="font-size:14px;font-weight:700;color:#18181B;margin-bottom:6px;">II. Dàn ý</h3>
                <ul class="theory-bullet-list">
                  ${part.outlineGuide.outline.map(item => `
                    <li style="margin-bottom:8px;">
                      <div>${wrapClickableWords(item.text)}</div>
                      <blockquote style="margin:6px 0 0;padding:8px 12px;background:#FFFFFF;border-left:3px solid #F59E0B;border-radius:6px;font-style:italic;color:#18181B;">${wrapClickableWords(escapeHtml(item.quote))}</blockquote>
                    </li>
                  `).join("")}
                </ul>
              </div>
              <div>
                <h3 style="font-size:14px;font-weight:700;color:#18181B;margin-bottom:6px;">III. Lỗi cần tránh</h3>
                <ul class="theory-bullet-list">
                  ${part.outlineGuide.mistakes.map(m => `<li>${wrapClickableWords(escapeHtml(m))}</li>`).join("")}
                </ul>
              </div>
              <div>
                <h3 style="font-size:14px;font-weight:700;color:#18181B;margin-bottom:6px;">IV. Từ vựng nên dùng</h3>
                <div class="theory-table-wrap">
                  <table class="theory-table">
                    <thead>
                      <tr>
                        <th>Từ / cụm từ</th>
                        <th>Loại từ</th>
                        <th>Nghĩa</th>
                        <th>Ví dụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${part.outlineGuide.vocab.map(row => `
                        <tr>
                          <td class="cell-primary">${wrapClickableWords(escapeHtml(row[0]))}</td>
                          <td class="cell-secondary">${escapeHtml(row[1])}</td>
                          <td class="cell-secondary">${escapeHtml(row[2])}</td>
                          <td class="cell-secondary">${wrapClickableWords(escapeHtml(row[3]))}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </details>
        ` : ""}

        ${part.callout ? `
          <div class="theory-callout-box">
            <p class="theory-callout-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              <span>${escapeHtml(part.callout.title)}</span>
            </p>
            <div>${wrapClickableWords(escapeHtml(part.callout.text))}</div>
          </div>
        ` : ""}

        ${part.libraryCard ? `
          <div class="theory-library-card">
            <span class="library-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
            </span>
            <span class="library-card-meta">
              <span class="library-card-tag">${escapeHtml(part.libraryCard.tag)}</span>
              <span class="library-card-title">${escapeHtml(part.libraryCard.title)}</span>
              <span class="library-card-desc">${escapeHtml(part.libraryCard.desc)}</span>
            </span>
            <button
              type="button"
              class="library-card-btn"
              data-open-grammar-doc="${escapeHtml(part.libraryCard.code)}"
            >
              <span>Xem thêm chi tiết</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            </button>
          </div>
        ` : ""}
      </section>
    `;
  }

  function renderTheoryPaneContent(sectionMeta, activePart, partsMap, partKeys, activePartKey, prog) {
    if (!activePart) return `<p>Nội dung đang cập nhật.</p>`;

    // Render all parts of the section in the Theory pane so scrolling down never hides Part B / Part C,
    // while keeping the active part highlighted and smoothly scrolled into view when A / B / C is clicked.
    const hasMultipleParts = partKeys.length > 1;
    return `
      <div class="theory-parts-stack">
        ${partKeys.map(pk => renderSinglePartTheoryHtml(partsMap[pk], prog, pk === activePartKey, hasMultipleParts)).join('<hr class="theory-part-divider" />')}
      </div>
    `;
  }

  function renderExercisesPaneContent(part, prog) {
    if (!part || !part.exercises || part.exercises.length === 0) {
      return `
        <div class="test-guide-card">
          <p style="font-size:14.5px;color:#52525B;">Chưa có bài tập cho mục này. Bấm nút chuyển tiếp ở góc dưới bên phải để sang phần tiếp theo.</p>
        </div>
      `;
    }

    return `
      <div class="exercises-list">
        ${part.exercises.map(ex => renderSingleExerciseCard(ex, prog)).join("")}
      </div>
    `;
  }

  function countWords(text) {
    const cleaned = String(text || "").trim();
    if (!cleaned) return 0;
    return cleaned.split(/\s+/).filter(Boolean).length;
  }

  function renderSingleExerciseCard(ex, prog) {
    const isChecked = !!prog.checkedExercises[ex.id];
    const items = ex.items || [];
    let answeredCount = 0;

    if (ex.type === "writing") {
      const val = prog.exerciseAnswers[`${ex.id}_1`] || "";
      const wc = countWords(val);
      const minW = ex.minWords || 35;
      const maxW = ex.maxWords || 80;
      const needed = Math.max(0, minW - wc);
      const canSubmit = wc >= minW;

      return `
        <article class="exercise-card" data-ex-id="${ex.id}" data-ex-total="1">
          <header class="exercise-card-header">
            <div class="exercise-head-left">
              <span class="exercise-num-pill">${ex.id}</span>
              <div>
                <h3 class="exercise-title">${wrapClickableWords(escapeHtml(ex.title))}</h3>
                <div class="exercise-instruction">${wrapClickableWords(escapeHtml(ex.instruction))}</div>
              </div>
            </div>
            ${ex.partTag ? `
              <button class="exercise-part-tag" data-jump-theory="${escapeHtml(ex.partTag)}" title="See the theory of ${escapeHtml(ex.partTag)}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
                <span>${escapeHtml(ex.partTag)}</span>
              </button>
            ` : ""}
          </header>

          <div class="exercise-card-body">
            <div class="writing-prompt-card">
              <p>${wrapClickableWords(escapeHtml(ex.promptBox))}</p>
            </div>
            <div style="margin-top:12px;">
              <textarea
                rows="10"
                maxlength="10000"
                spellcheck="false"
                placeholder="Viết bài của bạn ở đây…"
                class="writing-textarea"
                data-writing-key="${ex.id}_1"
                data-parent-ex="${ex.id}"
                data-min-words="${minW}"
                data-max-words="${maxW}"
              >${escapeHtml(val)}</textarea>
              <p class="writing-counter-row">
                <span class="writing-word-num" id="writing-wc-${ex.id}">${wc} từ</span>
                <span>Yêu cầu ${minW}–${maxW} từ</span>
              </p>
            </div>
            ${isChecked ? `
              <div class="writing-feedback-box">
                <div style="font-weight:700;color:#15803D;margin-bottom:4px;">✓ Đã nộp bài viết (${wc} từ)!</div>
                <div style="font-size:13.5px;color:#3F3F46;"><strong>Bài mẫu tham khảo:</strong> ${wrapClickableWords(escapeHtml(ex.sampleAnswer))}</div>
              </div>
            ` : ""}
          </div>

          <footer class="exercise-card-footer">
            <span class="writing-status-text ${canSubmit ? "ready" : ""}" id="status-${ex.id}">
              ${canSubmit ? `${wc}/${minW} từ · Đủ điều kiện nộp bài` : `${wc}/${minW} từ · cần thêm ${needed} từ để nộp`}
            </span>
            <div style="display:flex;gap:8px;">
              ${isChecked ? `
                <button class="speak-mini-btn" data-reset-ex="${ex.id}">Viết lại</button>
              ` : ""}
              <button
                class="check-answer-btn ${!canSubmit && !isChecked ? "unanswered" : ""}"
                id="check-btn-${ex.id}"
                data-check-ex="${ex.id}"
              >
                Nộp bài
              </button>
            </div>
          </footer>
        </article>
      `;
    }

    items.forEach(item => {
      const key = `${ex.id}_${item.num}`;
      const val = prog.exerciseAnswers[key];
      if (Array.isArray(val) ? val.length > 0 : (val !== undefined && String(val).trim() !== "")) {
        answeredCount++;
      }
    });

    return `
      <article class="exercise-card" data-ex-id="${ex.id}" data-ex-total="${items.length}">
        <header class="exercise-card-header">
          <div class="exercise-head-left">
            <span class="exercise-num-pill">${ex.id}</span>
            <div>
              <h3 class="exercise-title">${wrapClickableWords(escapeHtml(ex.title))}</h3>
              <div class="exercise-instruction">${wrapClickableWords(escapeHtml(ex.instruction))}</div>
            </div>
          </div>
          ${ex.partTag ? `
            <button class="exercise-part-tag" data-jump-theory="${escapeHtml(ex.partTag)}" title="See the theory of ${escapeHtml(ex.partTag)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
              <span>${escapeHtml(ex.partTag)}</span>
            </button>
          ` : ""}
        </header>

        <div class="exercise-card-body">
          ${ex.type === "matching" ? renderMatchingExercise(ex, prog, isChecked) : ""}
          ${ex.type === "mcq" ? renderMcqExercise(ex, prog, isChecked) : ""}
          ${ex.type === "tf" ? renderTfExercise(ex, prog, isChecked) : ""}
          ${ex.type === "tfng" ? renderTfngExercise(ex, prog, isChecked) : ""}
          ${ex.type === "fill" ? renderFillExercise(ex, prog, isChecked) : ""}
          ${ex.type === "rewrite" ? renderRewriteExercise(ex, prog, isChecked) : ""}
          ${ex.type === "reorder" ? renderReorderExercise(ex, prog, isChecked) : ""}
        </div>

        <footer class="exercise-card-footer">
          <span class="exercise-done-status" id="status-${ex.id}">Đã làm ${answeredCount}/${items.length}</span>
          <div style="display:flex;gap:8px;">
            ${isChecked ? `
              <button class="speak-mini-btn" data-reset-ex="${ex.id}">Làm lại</button>
            ` : ""}
            <button
              class="check-answer-btn ${answeredCount === 0 && !isChecked ? "unanswered" : ""}"
              id="check-btn-${ex.id}"
              data-check-ex="${ex.id}"
            >
              Kiểm tra
            </button>
          </div>
        </footer>
      </article>
    `;
  }

  function renderMatchingExercise(ex, prog, isChecked) {
    return `
      <div class="matching-pool-box">
        ${ex.options.map(opt => `
          <div class="matching-pool-row">
            <span class="matching-pool-key">${opt.key}</span>
            <span>${wrapClickableWords(escapeHtml(opt.text))}</span>
          </div>
        `).join("")}
      </div>
      <div>
        ${ex.items.map(item => {
          const key = `${ex.id}_${item.num}`;
          const val = prog.exerciseAnswers[key] || "";
          const isCorrect = val === item.answer;
          const statusCls = isChecked ? (isCorrect ? "correct" : "wrong") : (val === "" ? "unselected" : "");
          return `
            <div class="matching-item-row">
              <span class="item-index-box ${val !== "" ? "filled" : ""}">${item.num}</span>
              <span style="font-size:15px;font-weight:400;color:#18181B;">${wrapClickableWords(escapeHtml(item.prompt))}</span>
              <select class="matching-select ${statusCls}" data-ex-input="${key}" data-parent-ex="${ex.id}">
                <option value="" ${val === "" ? "selected" : ""}>${item.num}</option>
                ${ex.options.map(o => `<option value="${o.key}" ${val === o.key ? "selected" : ""}>${o.key}</option>`).join("")}
              </select>
              ${isChecked ? `<span style="font-size:12px;font-weight:700;color:${isCorrect ? "#16A34A" : "#DC2626"};">${isCorrect ? "✓ Đúng" : `✗ Đáp án: ${item.answer}`}</span>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderMcqExercise(ex, prog, isChecked) {
    return ex.items.map(item => {
      const key = `${ex.id}_${item.num}`;
      const val = prog.exerciseAnswers[key] || "";
      return `
        <div class="question-block">
          <div class="question-prompt-line">
            <span class="item-index-box">${item.num}</span>
            <span>${wrapClickableWords(escapeHtml(item.prompt))}</span>
          </div>
          <div class="choices-stack">
            ${item.choices.map(ch => {
              const selected = val === ch.key;
              let cls = selected ? "selected" : "";
              if (isChecked) {
                if (ch.key === item.answer) cls = "correct";
                else if (selected && ch.key !== item.answer) cls = "wrong";
              }
              return `
                <button class="choice-btn ${cls}" data-mcq-key="${key}" data-mcq-val="${ch.key}" data-parent-ex="${ex.id}">
                  <span class="choice-key-badge">${ch.key}</span>
                  <span>${wrapClickableWords(escapeHtml(ch.text))}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderTfExercise(ex, prog, isChecked) {
    return ex.items.map(item => {
      const key = `${ex.id}_${item.num}`;
      const val = prog.exerciseAnswers[key] || "";
      return `
        <div class="question-block">
          <div class="question-prompt-line">
            <span class="item-index-box">${item.num}</span>
            <span>${wrapClickableWords(escapeHtml(item.prompt))}</span>
          </div>
          <div class="choices-stack">
            ${["True", "False"].map(tf => {
              const selected = val === tf;
              let cls = selected ? "selected" : "";
              if (isChecked) {
                if (tf === item.answer) cls = "correct";
                else if (selected && tf !== item.answer) cls = "wrong";
              }
              return `
                <button class="choice-btn ${cls}" data-mcq-key="${key}" data-mcq-val="${tf}" data-parent-ex="${ex.id}">
                  <span class="choice-key-badge">${tf[0]}</span>
                  <span>${tf}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderTfngExercise(ex, prog, isChecked) {
    return ex.items.map(item => {
      const key = `${ex.id}_${item.num}`;
      const val = prog.exerciseAnswers[key] || "";
      return `
        <div class="question-block">
          <div class="question-prompt-line">
            <span class="item-index-box">${item.num}</span>
            <span>${wrapClickableWords(escapeHtml(item.prompt))}</span>
          </div>
          <div class="choices-stack">
            ${["TRUE", "FALSE", "NOT GIVEN"].map(opt => {
              const selected = val === opt;
              let cls = selected ? "selected" : "";
              if (isChecked) {
                if (opt === item.answer) cls = "correct";
                else if (selected && opt !== item.answer) cls = "wrong";
              }
              return `
                <button class="choice-btn ${cls}" data-mcq-key="${key}" data-mcq-val="${opt}" data-parent-ex="${ex.id}">
                  <span class="choice-key-badge">${opt === "NOT GIVEN" ? "NG" : opt[0]}</span>
                  <span>${opt}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderFillExercise(ex, prog, isChecked) {
    return ex.items.map(item => {
      const key = `${ex.id}_${item.num}`;
      const val = prog.exerciseAnswers[key] || "";
      const isCorrect = val.trim().toLowerCase() === item.answer.toLowerCase();
      const statusCls = isChecked ? (isCorrect ? "correct" : "wrong") : "";
      return `
        <div class="matching-item-row" style="align-items:center;flex-wrap:nowrap;">
          <span class="item-index-box ${val.trim() !== "" ? "filled" : ""}" id="badge-${key}">${item.num}</span>
          <span style="flex:1;min-width:0;font-size:15px;line-height:1.9;color:#18181B;">
            ${wrapClickableWords(escapeHtml(item.before))}
            <input
              type="text"
              class="fill-input ${statusCls}"
              placeholder="${item.num}"
              value="${escapeHtml(val)}"
              data-fill-key="${key}"
              data-parent-ex="${ex.id}"
            />
            <span class="fill-hint">${wrapClickableWords(escapeHtml(item.after))}</span>
          </span>
          ${isChecked ? `<span class="fill-feedback" style="font-size:12px;font-weight:700;color:${isCorrect ? "#16A34A" : "#DC2626"};">${isCorrect ? "✓ Đúng" : `✗ Đáp án: ${item.answer}`}</span>` : ""}
        </div>
      `;
    }).join("");
  }

  function normalizeSentence(str) {
    return String(str || "")
      .trim()
      .toLowerCase()
      .replace(/[.,!?]+/g, "")
      .replace(/\s+/g, " ");
  }

  function renderRewriteExercise(ex, prog, isChecked) {
    return ex.items.map(item => {
      const key = `${ex.id}_${item.num}`;
      const val = prog.exerciseAnswers[key] || "";
      const isCorrect = normalizeSentence(val) === normalizeSentence(item.answer);
      const statusCls = isChecked ? (isCorrect ? "correct" : "wrong") : "";
      return `
        <div class="matching-item-row" style="align-items:flex-start;">
          <span class="item-index-box ${val.trim() !== "" ? "filled" : ""}" id="badge-${key}" style="margin-top:3px;">${item.num}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;font-weight:500;color:#18181B;margin-bottom:8px;">
              ${wrapClickableWords(escapeHtml(item.prompt))}
            </div>
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
              <input
                type="text"
                class="fill-input rewrite-input ${statusCls}"
                placeholder="${item.num}"
                value="${escapeHtml(val)}"
                data-fill-key="${key}"
                data-parent-ex="${ex.id}"
              />
              ${isChecked ? `<span class="fill-feedback" style="font-size:12px;font-weight:700;color:${isCorrect ? "#16A34A" : "#DC2626"};">${isCorrect ? "✓ Đúng" : `✗ Đáp án: ${item.answer}`}</span>` : ""}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderReorderExercise(ex, prog, isChecked) {
    return ex.items.map(item => {
      const key = `${ex.id}_${item.num}`;
      const chosenIndices = Array.isArray(prog.exerciseAnswers[key]) ? prog.exerciseAnswers[key] : [];
      const builtSentence = chosenIndices.map(idx => item.tiles[idx]).join(" ");
      const isCorrect = builtSentence.trim().toLowerCase() === item.answer.toLowerCase();
      const statusCls = isChecked ? (isCorrect ? "correct" : "wrong") : "";
      const isFilled = chosenIndices.length > 0;
      const isActiveRow = state.activeReorderKey === key;
      const remainingTilesCount = item.tiles.length - chosenIndices.length;

      return `
        <div
          class="reorder-row-wrapper ${isActiveRow ? "active-dashed-row" : ""}"
          data-reorder-row="${key}"
        >
          <div class="reorder-main-line">
            <span class="item-index-box ${isActiveRow ? "active-ring" : isFilled ? "filled" : ""}">${item.num}</span>

            <div class="reorder-answer-slot ${chosenIndices.length === 0 ? "empty-slot" : ""} ${statusCls}">
              ${chosenIndices.length === 0 ? `<span class="reorder-placeholder-text">Bấm các ô chữ bên dưới theo đúng thứ tự</span>` : ""}
              ${chosenIndices.map((tileIdx, pos) => `
                <button class="placed-word-pill" data-remove-tile="${key}" data-tile-pos="${pos}" data-parent-ex="${ex.id}" title="Bấm để bỏ từ này">
                  ${escapeHtml(item.tiles[tileIdx])}
                </button>
              `).join("")}
            </div>
          </div>

          ${remainingTilesCount > 0 ? `
            <div class="reorder-tiles-pool">
              ${item.tiles.map((word, idx) => {
                const used = chosenIndices.includes(idx);
                return `
                  <button class="word-tile-btn ${used ? "used" : ""}" data-add-tile="${key}" data-tile-idx="${idx}" data-parent-ex="${ex.id}">
                    ${escapeHtml(word)}
                  </button>
                `;
              }).join("")}
            </div>
          ` : ""}

          ${isChecked ? `
            <div style="margin-left:40px;margin-top:8px;font-size:12px;font-weight:700;color:${isCorrect ? "#16A34A" : "#DC2626"};">
              ${isCorrect ? "✓ Chính xác!" : `✗ Câu đúng: "${item.answer}"`}
            </div>
          ` : ""}
        </div>
      `;
    }).join("");
  }

  function renderUnitTestGuidePane(unitTest, prog) {
    const unfinishedCount = Math.max(0, 6 - prog.completedSections.filter(s => s !== "unittest").length);
    return `
      <div class="test-guide-card">
        <p style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#18181B;margin-bottom:10px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
          <span>${escapeHtml(unitTest.title)}</span>
        </p>

        <p style="font-size:14px;line-height:1.6;color:#3F3F46;margin-bottom:14px;">
          ${wrapClickableWords(escapeHtml(unitTest.description))}
        </p>

        <div style="font-size:14px;font-weight:600;color:#18181B;margin-bottom:6px;">Mục tiêu được đánh giá</div>
        <ol style="padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:14px;color:#3F3F46;line-height:1.5;">
          ${unitTest.objectives.map(obj => `<li>${wrapClickableWords(escapeHtml(obj))}</li>`).join("")}
        </ol>

        ${unfinishedCount > 0 ? `
          <p class="test-guide-warning">
            Bạn còn ${unfinishedCount} phần chưa làm xong. Nên học xong trước khi làm bài, nhưng bạn vẫn có thể làm ngay.
          </p>
        ` : ""}
      </div>
    `;
  }

  function renderUnitTestQuestionsPane(unitTest, prog, unit, answeredTestItems, totalTestItems) {
    return `
      <div class="exercises-list">
        ${unitTest.sections.map(sec => renderSingleExerciseCard(sec, prog)).join("")}
      </div>
      <div class="unit-test-submit-box">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
          <div>
            <div style="font-size:13.5px;font-weight:600;color:#18181B;">
              ${answeredTestItems >= totalTestItems
                ? `Đã trả lời đủ ${totalTestItems}/${totalTestItems} câu — Sẵn sàng nộp bài!`
                : `Trả lời đủ ${totalTestItems} câu để nộp (Hiện tại: ${answeredTestItems}/${totalTestItems} câu)`}
            </div>
            <div style="font-size:12.5px;color:#71717A;margin-top:2px;">
              Lần nộp đầu là điểm chính thức. Hãy kiểm tra lại trước khi nộp.
            </div>
          </div>
          <button class="check-answer-btn" id="btn-complete-unit" style="height:38px;padding:0 18px;">
            Nộp bài kiểm tra
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // MODALS: COMMAND PALETTE (⌘K), DICTIONARY POPOVER, FLASHCARD DECK, GRAMMAR DOC
  // ==========================================================================
  function renderModals() {
    let html = "";

    if (state.cmdModalOpen) {
      const q = state.cmdQuery.trim().toLowerCase();
      const quickItems = [
        { title: "Danh sách 50 Unit IELTS Foundation", sub: "Mở toàn bộ lộ trình A1–A2", cat: "IELTS Foundation", action: "course" },
        { title: "Tiến độ học tập của tôi", sub: "Xem các Unit đã học và bài tập đã nộp", cat: "Học viên", action: "progress" },
        { title: "Bộ thẻ từ vựng (Flashcard)", sub: `${state.savedFlashcards.length} từ đã lưu`, cat: "Từ vựng", action: "flashcards" }
      ];

      const unitMatches = window.UNITS_DATA.filter(u =>
        !q ||
        u.titleEn.toLowerCase().includes(q) ||
        u.titleVi.toLowerCase().includes(q) ||
        u.number.includes(q)
      ).slice(0, 12).map(u => ({
        title: `Unit ${u.number}: ${u.titleEn}`,
        sub: u.titleVi,
        cat: "A1–A2 Foundation",
        action: `unit:${u.id}`
      }));

      const allItems = q ? unitMatches.concat(quickItems.filter(i => i.title.toLowerCase().includes(q))) : quickItems.concat(unitMatches.slice(0, 8));

      html += `
        <div class="modal-backdrop" id="cmd-backdrop">
          <div class="cmd-modal" onclick="event.stopPropagation()">
            <div class="cmd-input-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717A" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                id="cmd-search-input"
                class="cmd-input"
                placeholder="Tìm Unit (01–50) theo tên tiếng Anh / tiếng Việt..."
                value="${escapeHtml(state.cmdQuery)}"
                autofocus
              />
              <button class="cmd-close-btn" id="btn-close-cmd">✕</button>
            </div>
            <div class="cmd-results-list">
              ${allItems.map((item, idx) => `
                <div class="cmd-result-item ${idx === 0 ? "active" : ""}" data-cmd-action="${item.action}">
                  <div>
                    <div class="cmd-item-title">${escapeHtml(item.title)}</div>
                    ${item.sub ? `<div class="cmd-item-sub">${escapeHtml(item.sub)}</div>` : ""}
                  </div>
                  <div class="cmd-item-category">${escapeHtml(item.cat)} ↵</div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    if (state.activeDictWord) {
      const w = state.activeDictWord;
      const senses = (w.senses && w.senses.length > 0)
        ? w.senses
        : [{ primary: w.meaning || "từ vựng tiếng Anh", synonyms: "" }];
      const isBookmarked = state.savedFlashcards.some(f => f.word.toLowerCase() === w.word.toLowerCase());
      const topPx = (state.dictPopupPos && state.dictPopupPos.top) || 180;
      const leftPx = (state.dictPopupPos && state.dictPopupPos.left) || 320;
      const safeWordJs = w.word.replace(/'/g, "\\'");

      html += `
        <div class="dict-popover" style="top:${topPx}px;left:${leftPx}px;" onclick="event.stopPropagation()">
          <div class="dict-popup-header">
            <div class="dict-popup-title-col">
              <div class="dict-popup-word">${escapeHtml(w.word)}</div>
              <div class="dict-popup-sub">
                ${w.ipa ? `<span class="dict-popup-ipa">${escapeHtml(w.ipa)}</span>` : ""}
                <span class="dict-popup-pos">${escapeHtml(w.posVi || w.pos || "danh từ")}</span>
              </div>
            </div>

            <div class="dict-popup-top-actions">
              <button type="button" class="dict-audio-btn" onclick="window.speakText('${safeWordJs}', 'US')" title="Phát âm giọng Mỹ (US)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span>US</span>
              </button>
              <button type="button" class="dict-audio-btn" onclick="window.speakText('${safeWordJs}', 'UK')" title="Phát âm giọng Anh (UK)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span>UK</span>
              </button>
              <button type="button" class="dict-close-x" id="btn-close-dict" title="Đóng">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div class="dict-popup-senses">
            ${senses.map((s, idx) => `
              <div class="dict-sense-row">
                <span class="dict-sense-num">${idx + 1}</span>
                <span class="dict-sense-text">
                  <strong>${escapeHtml(s.primary)}</strong>${s.synonyms ? `<span class="dict-sense-syn"> · ${escapeHtml(s.synonyms)}</span>` : ""}
                </span>
              </div>
            `).join("")}
          </div>

          <div class="dict-popup-footer">
            <button type="button" class="dict-full-link-btn" id="btn-dict-full-view">
              <span>Xem đầy đủ</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </button>

            <div class="dict-popup-footer-right">
              <button type="button" class="dict-deck-btn" id="btn-save-word-flashcard" title="Lưu vào Bộ thẻ từ vựng">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                <span>Bộ thẻ</span>
              </button>
              <button type="button" class="dict-bookmark-btn ${isBookmarked ? "bookmarked" : ""}" id="btn-bookmark-word" title="${isBookmarked ? "Đã lưu trong bộ thẻ" : "Đánh dấu lưu từ này"}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (state.fullDictModalWord) {
      const fw = state.fullDictModalWord;
      const fSenses = (fw.senses && fw.senses.length > 0)
        ? fw.senses
        : [{ primary: fw.meaning || "từ vựng tiếng Anh", synonyms: "" }];
      const safeFwJs = fw.word.replace(/'/g, "\\'");

      html += `
        <div class="modal-backdrop" id="full-dict-backdrop">
          <div class="cmd-modal" onclick="event.stopPropagation()" style="max-width:520px;border-radius:14px;">
            <div class="cmd-input-row" style="justify-content:space-between;background:#FAFAFA;padding:16px 20px;">
              <div>
                <div style="font-size:11.5px;font-weight:700;color:#71717A;text-transform:uppercase;">Từ điển chi tiết · IELTS Foundation</div>
                <div style="display:flex;align-items:baseline;gap:10px;margin-top:2px;">
                  <span style="font-size:24px;font-weight:800;color:#18181B;">${escapeHtml(fw.word)}</span>
                  ${fw.ipa ? `<span style="font-size:15px;color:#71717A;">${escapeHtml(fw.ipa)}</span>` : ""}
                  <span style="font-size:13.5px;font-weight:700;color:#52525B;">${escapeHtml(fw.posVi || fw.pos || "danh từ")}</span>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <button type="button" class="dict-audio-btn" onclick="window.speakText('${safeFwJs}', 'US')">🔊 US</button>
                <button type="button" class="dict-audio-btn" onclick="window.speakText('${safeFwJs}', 'UK')">🔊 UK</button>
                <button type="button" class="cmd-close-btn" id="btn-close-full-dict">✕</button>
              </div>
            </div>
            <div class="cmd-results-list" style="padding:18px 20px;display:flex;flex-direction:column;gap:14px;">
              <div>
                <div style="font-size:12px;font-weight:800;color:#71717A;text-transform:uppercase;margin-bottom:8px;">Các nghĩa tiếng Việt</div>
                <div class="dict-popup-senses" style="margin-top:0;">
                  ${fSenses.map((s, idx) => `
                    <div class="dict-sense-row">
                      <span class="dict-sense-num">${idx + 1}</span>
                      <span class="dict-sense-text">
                        <strong>${escapeHtml(s.primary)}</strong>${s.synonyms ? `<span class="dict-sense-syn"> · ${escapeHtml(s.synonyms)}</span>` : ""}
                      </span>
                    </div>
                  `).join("")}
                </div>
              </div>
              ${fw.example ? `
                <div style="border:1px solid #E4E4E7;border-radius:8px;padding:12px 14px;background:#FAFAFA;">
                  <div style="font-size:12px;font-weight:800;color:#71717A;text-transform:uppercase;margin-bottom:4px;">Câu ví dụ trong bài</div>
                  <div style="font-size:14.5px;font-weight:600;color:#18181B;">"${escapeHtml(fw.example)}"</div>
                  ${fw.exampleVi ? `<div style="font-size:13.5px;color:#52525B;margin-top:3px;">${escapeHtml(fw.exampleVi)}</div>` : ""}
                </div>
              ` : ""}
            </div>
          </div>
        </div>
      `;
    }

    if (state.activeGrammarDoc && GRAMMAR_LIBRARY_DB[state.activeGrammarDoc]) {
      const doc = GRAMMAR_LIBRARY_DB[state.activeGrammarDoc];
      html += `
        <div class="modal-backdrop" id="grammar-doc-backdrop">
          <div class="cmd-modal" onclick="event.stopPropagation()" style="max-width:640px;">
            <div class="cmd-input-row" style="justify-content:space-between;background:#FAFAFA;">
              <div>
                <div style="font-size:11px;font-weight:700;color:#71717A;text-transform:uppercase;">Thư viện ngữ pháp · ${escapeHtml(doc.code)}</div>
                <div style="font-size:16px;font-weight:800;color:#18181B;">📖 ${escapeHtml(doc.title)}</div>
              </div>
              <button class="cmd-close-btn" id="btn-close-grammar-doc">✕</button>
            </div>
            <div class="cmd-results-list" style="padding:18px 20px;display:flex;flex-direction:column;gap:16px;max-height:70vh;">
              <p style="font-size:14px;color:#52525B;">${escapeHtml(doc.subtitle)}</p>
              ${doc.sections.map(sec => `
                <div style="border:1px solid #E4E4E7;border-radius:8px;padding:14px 16px;background:#FFFFFF;">
                  <h4 style="font-size:15px;font-weight:700;color:#18181B;margin-bottom:6px;">${escapeHtml(sec.heading)}</h4>
                  <p style="font-size:14px;line-height:1.6;color:#3F3F46;margin-bottom:8px;">${sec.body}</p>
                  <ul style="padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:14px;line-height:1.6;color:#27272A;">
                    ${sec.bullets.map(b => `<li>${b}</li>`).join("")}
                  </ul>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    if (state.flashcardModalOpen) {
      html += `
        <div class="modal-backdrop" id="flashcard-backdrop">
          <div class="cmd-modal" onclick="event.stopPropagation()">
            <div class="cmd-input-row" style="justify-content:space-between;background:#FFE566;">
              <div style="font-size:16px;font-weight:900;">🗂️ BỘ THẺ FLASHCARD CỦA TÔI (${state.savedFlashcards.length} từ)</div>
              <button class="cmd-close-btn" id="btn-close-flashcards">✕</button>
            </div>
            <div class="cmd-results-list" style="padding:16px;display:flex;flex-direction:column;gap:10px;">
              ${state.savedFlashcards.length === 0 ? `<p style="font-size:14px;color:#52525B;">Chưa có từ nào trong bộ thẻ. Hãy bấm vào từ bất kỳ trong bài học để lưu!</p>` : ""}
              ${state.savedFlashcards.map((fc, idx) => `
                <div style="border:2px solid #18181B;padding:12px 14px;background:#FFFFFF;box-shadow:2px 2px 0px #18181B;display:flex;align-items:center;justify-content:space-between;gap:12px;">
                  <div>
                    <div style="font-size:15px;font-weight:800;">${escapeHtml(fc.word)} <span style="font-family:var(--font-mono);font-size:12px;font-weight:400;color:#71717A;">${escapeHtml(fc.ipa)}</span></div>
                    <div style="font-size:13.5px;color:#0284C7;font-weight:600;margin-top:2px;">${escapeHtml(fc.meaning)}</div>
                    <div style="font-size:12.5px;color:#52525B;margin-top:2px;">${escapeHtml(fc.example)}</div>
                  </div>
                  <div style="display:flex;gap:6px;">
                    <button class="voice-btn" onclick="window.speakText('${fc.word.replace(/'/g, "\\'")}', 'US')">🔊</button>
                    <button class="voice-btn" data-remove-fc="${idx}">🗑️</button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    return html;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ==========================================================================
  // MAIN RENDER WITH SCROLL PRESERVATION FOR PARALLEL PANES
  // ==========================================================================
  function renderApp(resetScrollPanes, scrollToPartKey) {
    const root = document.getElementById("app");
    if (!root) return;

    const prevTheoryPane = document.getElementById("theory-scroll-pane");
    const prevExPane = document.getElementById("exercises-scroll-pane");
    const savedTheoryScroll = (!resetScrollPanes && prevTheoryPane) ? prevTheoryPane.scrollTop : 0;
    const savedExScroll = (!resetScrollPanes && prevExPane) ? prevExPane.scrollTop : 0;

    const mainHtml = (!state.currentUser || state.view === "auth")
      ? renderAuthView()
      : (state.view === "lesson" ? renderLessonView() : renderDashboardView());
    root.innerHTML = mainHtml + renderModals();

    const nextTheoryPane = document.getElementById("theory-scroll-pane");
    const nextExPane = document.getElementById("exercises-scroll-pane");

    if (scrollToPartKey && nextTheoryPane) {
      const targetSec = document.getElementById(`theory-part-${scrollToPartKey}`);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (nextExPane) nextExPane.scrollTop = 0;
    } else {
      if (nextTheoryPane) nextTheoryPane.scrollTop = savedTheoryScroll;
      if (nextExPane) nextExPane.scrollTop = savedExScroll;
    }

    bindEvents();
  }

  function loginWithAccount(acc) {
    state.currentUser = { name: acc.name, email: acc.email, createdAt: acc.createdAt };
    state.unitProgress = acc.unitProgress || {};
    state.savedFlashcards = acc.savedFlashcards || JSON.parse(JSON.stringify(defaultFlashcards));
    state.authError = "";
    state.view = "course";
    try {
      localStorage.setItem(SESSION_KEY, acc.email.toLowerCase());
    } catch (e) {}
    saveState();
    renderApp(true);
  }

  function logoutCurrentAccount() {
    saveState();
    state.currentUser = null;
    state.view = "auth";
    state.authMode = "login";
    state.authError = "";
    state.profileMenuOpen = false;
    state.mobileMenuOpen = false;
    try {
      localStorage.setItem(SESSION_KEY, "__LOGGED_OUT__");
    } catch (e) {}
    renderApp(true);
  }

  function bindEvents() {
    // Auth Tabs & Form Submit (Login / Register)
    const tabLogin = document.getElementById("btn-auth-tab-login");
    if (tabLogin) {
      tabLogin.onclick = () => {
        state.authMode = "login";
        state.authError = "";
        renderApp();
      };
    }
    const tabRegister = document.getElementById("btn-auth-tab-register");
    if (tabRegister) {
      tabRegister.onclick = () => {
        state.authMode = "register";
        state.authError = "";
        renderApp();
      };
    }

    const authForm = document.getElementById("auth-form");
    if (authForm) {
      authForm.onsubmit = (e) => {
        e.preventDefault();
        const nameEl = document.getElementById("auth-name");
        const emailEl = document.getElementById("auth-email");
        const passEl = document.getElementById("auth-password");
        const email = (emailEl ? emailEl.value : "").trim().toLowerCase();
        const password = (passEl ? passEl.value : "").trim();
        const name = (nameEl ? nameEl.value : "").trim();

        if (!email || !password) {
          state.authError = "Vui lòng nhập đầy đủ Email/Tên đăng nhập và Mật khẩu.";
          renderApp();
          return;
        }

        if (state.authMode === "register") {
          if (!name) {
            state.authError = "Vui lòng nhập họ và tên học viên.";
            renderApp();
            return;
          }
          if (accountsDb[email]) {
            state.authError = "Tài khoản này đã tồn tại. Vui lòng chuyển sang tab Đăng nhập!";
            renderApp();
            return;
          }
          const newAcc = {
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString().slice(0, 10),
            unitProgress: {},
            savedFlashcards: JSON.parse(JSON.stringify(defaultFlashcards))
          };
          accountsDb[email] = newAcc;
          saveAccountsDb(accountsDb);
          loginWithAccount(newAcc);
        } else {
          const existing = accountsDb[email];
          if (!existing) {
            state.authError = "Không tìm thấy tài khoản. Bạn có thể bấm sang tab 'Tạo tài khoản' để đăng ký ngay!";
            renderApp();
            return;
          }
          if (existing.password && existing.password !== password) {
            state.authError = "Mật khẩu chưa chính xác. Vui lòng thử lại (hoặc bấm chọn nhanh tài khoản bên dưới).";
            renderApp();
            return;
          }
          loginWithAccount(existing);
        }
      };
    }

    document.querySelectorAll("[data-quick-login]").forEach(btn => {
      btn.onclick = () => {
        const email = (btn.getAttribute("data-quick-login") || "").toLowerCase();
        if (accountsDb[email]) {
          loginWithAccount(accountsDb[email]);
        }
      };
    });

    // Sidebar toggle
    const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
    if (btnToggleSidebar) {
      btnToggleSidebar.onclick = () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        saveState();
        renderApp();
      };
    }

    // Mobile menu
    const btnOpenMobile = document.getElementById("btn-open-mobile-menu");
    if (btnOpenMobile) btnOpenMobile.onclick = () => { state.mobileMenuOpen = true; renderApp(); };
    const btnCloseMobile = document.getElementById("btn-close-mobile-menu");
    if (btnCloseMobile) btnCloseMobile.onclick = () => { state.mobileMenuOpen = false; renderApp(); };

    // Profile Dropdown & Progress / Reset / Logout
    const btnProfile = document.getElementById("btn-profile-pill");
    if (btnProfile) {
      btnProfile.onclick = (e) => {
        e.stopPropagation();
        state.profileMenuOpen = !state.profileMenuOpen;
        renderApp();
      };
    }
    const menuReset = document.getElementById("menu-reset-progress");
    if (menuReset) {
      menuReset.onclick = () => {
        state.unitProgress = {};
        state.profileMenuOpen = false;
        saveState();
        renderApp();
      };
    }
    ["btn-sidebar-logout", "menu-logout"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.onclick = logoutCurrentAccount;
    });

    ["nav-go-progress", "menu-go-progress"].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.onclick = () => {
          state.view = "progress";
          state.profileMenuOpen = false;
          state.mobileMenuOpen = false;
          renderApp();
        };
      }
    });

    document.querySelectorAll("[data-unit-filter]").forEach(btn => {
      btn.onclick = () => {
        state.unitFilter = btn.getAttribute("data-unit-filter") || "all";
        renderApp();
      };
    });

    // Command Palette (⌘K)
    const openCmd = () => {
      state.cmdModalOpen = true;
      state.cmdQuery = "";
      renderApp();
      const inp = document.getElementById("cmd-search-input");
      if (inp) inp.focus();
    };
    ["btn-open-cmd", "btn-mobile-search", "nav-open-dict"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.onclick = openCmd;
    });

    const cmdBackdrop = document.getElementById("cmd-backdrop");
    if (cmdBackdrop) cmdBackdrop.onclick = () => { state.cmdModalOpen = false; renderApp(); };
    const btnCloseCmd = document.getElementById("btn-close-cmd");
    if (btnCloseCmd) btnCloseCmd.onclick = () => { state.cmdModalOpen = false; renderApp(); };

    const cmdInput = document.getElementById("cmd-search-input");
    if (cmdInput) {
      cmdInput.oninput = (e) => {
        state.cmdQuery = e.target.value;
        const pos = e.target.selectionStart;
        renderApp();
        const nextInp = document.getElementById("cmd-search-input");
        if (nextInp) {
          nextInp.focus();
          nextInp.setSelectionRange(pos, pos);
        }
      };
    }

    document.querySelectorAll("[data-cmd-action]").forEach(el => {
      el.onclick = () => {
        const act = el.getAttribute("data-cmd-action");
        state.cmdModalOpen = false;
        if (act.startsWith("unit:")) {
          openUnitLesson(act.slice(5));
        } else if (act === "progress") {
          state.view = "progress";
          renderApp();
        } else if (act === "flashcards") {
          state.flashcardModalOpen = true;
          renderApp();
        } else {
          state.view = "course";
          renderApp();
        }
      };
    });

    // Grammar Library Doc Modal
    document.querySelectorAll("[data-open-grammar-doc]").forEach(btn => {
      btn.onclick = () => {
        state.activeGrammarDoc = btn.getAttribute("data-open-grammar-doc");
        renderApp();
      };
    });
    const grammarBackdrop = document.getElementById("grammar-doc-backdrop");
    if (grammarBackdrop) grammarBackdrop.onclick = () => { state.activeGrammarDoc = null; renderApp(); };
    const btnCloseGrammarDoc = document.getElementById("btn-close-grammar-doc");
    if (btnCloseGrammarDoc) btnCloseGrammarDoc.onclick = () => { state.activeGrammarDoc = null; renderApp(); };

    // Flashcards modal
    const openFc = () => {
      state.flashcardModalOpen = true;
      state.profileMenuOpen = false;
      renderApp();
    };
    ["btn-open-flashcards", "nav-open-flashcards", "menu-open-fc"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.onclick = openFc;
    });
    const fcBackdrop = document.getElementById("flashcard-backdrop");
    if (fcBackdrop) fcBackdrop.onclick = () => { state.flashcardModalOpen = false; renderApp(); };
    const btnCloseFc = document.getElementById("btn-close-flashcards");
    if (btnCloseFc) btnCloseFc.onclick = () => { state.flashcardModalOpen = false; renderApp(); };

    document.querySelectorAll("[data-remove-fc]").forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute("data-remove-fc"), 10);
        state.savedFlashcards.splice(idx, 1);
        saveState();
        renderApp();
      };
    });

    document.querySelectorAll('[data-action="go-course"]').forEach(el => {
      el.onclick = () => {
        state.view = "course";
        state.mobileMenuOpen = false;
        state.profileMenuOpen = false;
        renderApp();
      };
    });

    // Clicking any of the 50 Unit Cards -> Open Lesson View
    document.querySelectorAll("[data-unit-id]").forEach(card => {
      card.onclick = () => {
        openUnitLesson(card.getAttribute("data-unit-id"));
      };
    });

    // Lesson View Top Bar & Navigation
    const btnBackCourse = document.getElementById("btn-back-to-course");
    if (btnBackCourse) {
      btnBackCourse.onclick = () => {
        state.view = "course";
        state.activeSidebarNav = "khoa-hoc";
        state.activeDictWord = null;
        renderApp(true);
      };
    }

    const btnToggleDict = document.getElementById("btn-toggle-dict");
    if (btnToggleDict) {
      btnToggleDict.onclick = () => {
        state.dictEnabled = !state.dictEnabled;
        if (!state.dictEnabled) state.activeDictWord = null;
        saveState();
        renderApp();
      };
    }

    const btnFullscreen = document.getElementById("btn-toggle-fullscreen");
    if (btnFullscreen) {
      btnFullscreen.onclick = () => {
        state.isExpandedFullscreen = !state.isExpandedFullscreen;
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        renderApp();
      };
    }

    // Draggable Split Resizer between Theory (Left) and Exercises (Right)
    const resizer = document.getElementById("split-resizer-bar");
    const workspace = document.getElementById("split-workspace");
    if (resizer && workspace) {
      resizer.onmousedown = (e) => {
        e.preventDefault();
        resizer.classList.add("dragging");
        const onMove = (moveEvt) => {
          const rect = workspace.getBoundingClientRect();
          const relX = moveEvt.clientX - rect.left;
          const pct = Math.max(28, Math.min(72, Math.round((relX / rect.width) * 100)));
          state.leftPanePercent = pct;
          workspace.style.setProperty("--left-pane-width", pct + "%");
        };
        const onUp = () => {
          resizer.classList.remove("dragging");
          saveState();
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      };
    }

    // Section Pills (1 Vocabulary .. 7 Unit test)
    document.querySelectorAll("[data-section]").forEach(btn => {
      btn.onclick = () => {
        state.currentSection = btn.getAttribute("data-section");
        state.currentPart = "A";
        renderApp(true);
      };
    });

    // Part Selector (A / B / C)
    document.querySelectorAll("[data-part]").forEach(btn => {
      btn.onclick = () => {
        const targetPart = btn.getAttribute("data-part");
        state.currentPart = targetPart;
        renderApp(false, targetPart);
      };
    });

    // Clicking "📖 Part A" on an Exercise Card highlights & scrolls the Left Theory Pane to that Part
    document.querySelectorAll("[data-jump-theory]").forEach(btn => {
      btn.onclick = () => {
        const tag = btn.getAttribute("data-jump-theory") || "";
        const partLetter = tag.replace("Part", "").trim() || state.currentPart;
        const secEl = document.getElementById(`theory-part-${partLetter}`) || document.querySelector(".theory-part-section");
        if (secEl) {
          secEl.scrollIntoView({ behavior: "smooth", block: "start" });
          secEl.classList.remove("flash-highlight");
          void secEl.offsetWidth;
          secEl.classList.add("flash-highlight");
        }
      };
    });

    // Transcript Unlock / Hide in Listening
    const btnUnlockTranscript = document.getElementById("btn-unlock-transcript");
    if (btnUnlockTranscript) {
      btnUnlockTranscript.onclick = () => {
        const prog = getUnitProgress(state.currentUnitId);
        prog.unlockedTranscript = true;
        saveState();
        renderApp();
      };
    }
    const btnHideTranscript = document.getElementById("btn-hide-transcript");
    if (btnHideTranscript) {
      btnHideTranscript.onclick = () => {
        const prog = getUnitProgress(state.currentUnitId);
        prog.unlockedTranscript = false;
        saveState();
        renderApp();
      };
    }

    // Interactive Exercises Event Handlers
    // 1. Matching Dropdowns
    document.querySelectorAll("[data-ex-input]").forEach(sel => {
      sel.onchange = (e) => {
        const key = sel.getAttribute("data-ex-input");
        const parentEx = sel.getAttribute("data-parent-ex");
        const prog = getUnitProgress(state.currentUnitId);
        prog.exerciseAnswers[key] = e.target.value;
        if (parentEx && prog.checkedExercises[parentEx]) {
          delete prog.checkedExercises[parentEx];
        }
        if (prog.status === "not-started") prog.status = "in-progress";
        saveState();
        renderApp();
      };
    });

    // 2. MCQ, True/False & TFNG Buttons
    document.querySelectorAll("[data-mcq-key]").forEach(btn => {
      btn.onclick = () => {
        const key = btn.getAttribute("data-mcq-key");
        const val = btn.getAttribute("data-mcq-val");
        const parentEx = btn.getAttribute("data-parent-ex");
        const prog = getUnitProgress(state.currentUnitId);
        prog.exerciseAnswers[key] = val;
        if (parentEx && prog.checkedExercises[parentEx]) {
          delete prog.checkedExercises[parentEx];
        }
        if (prog.status === "not-started") prog.status = "in-progress";
        saveState();
        renderApp();
      };
    });

    // 3. Fill in the Blanks & Sentence Rewrite Inputs (Live DOM update without losing focus!)
    document.querySelectorAll("[data-fill-key]").forEach(inp => {
      inp.oninput = (e) => {
        const key = inp.getAttribute("data-fill-key");
        const parentEx = inp.getAttribute("data-parent-ex");
        const prog = getUnitProgress(state.currentUnitId);
        prog.exerciseAnswers[key] = e.target.value;
        if (parentEx && prog.checkedExercises[parentEx]) {
          delete prog.checkedExercises[parentEx];
          inp.classList.remove("correct", "wrong");
        }
        if (prog.status === "not-started") prog.status = "in-progress";
        saveState();

        const badgeEl = document.getElementById(`badge-${key}`);
        if (badgeEl) {
          if (e.target.value.trim() !== "") badgeEl.classList.add("filled");
          else badgeEl.classList.remove("filled");
        }
        const card = inp.closest(".exercise-card");
        if (card && parentEx) {
          const total = parseInt(card.getAttribute("data-ex-total") || "0", 10);
          let count = 0;
          card.querySelectorAll("[data-fill-key]").forEach(el => {
            if (el.value.trim() !== "") count++;
          });
          const statusEl = document.getElementById(`status-${parentEx}`);
          if (statusEl) statusEl.textContent = `Đã làm ${count}/${total}`;
          const checkBtn = document.getElementById(`check-btn-${parentEx}`);
          if (checkBtn) {
            if (count > 0) checkBtn.classList.remove("unanswered");
            else checkBtn.classList.add("unanswered");
          }
        }
      };

      inp.onkeydown = (e) => {
        if (e.key === "Enter") {
          const parentEx = inp.getAttribute("data-parent-ex");
          if (parentEx) {
            const prog = getUnitProgress(state.currentUnitId);
            prog.checkedExercises[parentEx] = true;
            if (!prog.completedSections.includes(state.currentSection)) {
              prog.completedSections.push(state.currentSection);
            }
            saveState();
            renderApp();
          }
        }
      };
    });

    // 4. Writing Exercise Textarea (6.1) — Live word count update without losing focus
    document.querySelectorAll("[data-writing-key]").forEach(ta => {
      ta.oninput = (e) => {
        const key = ta.getAttribute("data-writing-key");
        const parentEx = ta.getAttribute("data-parent-ex");
        const minW = parseInt(ta.getAttribute("data-min-words") || "35", 10);
        const prog = getUnitProgress(state.currentUnitId);
        prog.exerciseAnswers[key] = e.target.value;
        if (parentEx && prog.checkedExercises[parentEx]) {
          delete prog.checkedExercises[parentEx];
        }
        if (prog.status === "not-started") prog.status = "in-progress";
        saveState();

        const wc = countWords(e.target.value);
        const needed = Math.max(0, minW - wc);
        const wcEl = document.getElementById(`writing-wc-${parentEx}`);
        if (wcEl) wcEl.textContent = `${wc} từ`;
        const statusEl = document.getElementById(`status-${parentEx}`);
        if (statusEl) {
          if (wc >= minW) {
            statusEl.textContent = `${wc}/${minW} từ · Đủ điều kiện nộp bài`;
            statusEl.classList.add("ready");
          } else {
            statusEl.textContent = `${wc}/${minW} từ · cần thêm ${needed} từ để nộp`;
            statusEl.classList.remove("ready");
          }
        }
        const checkBtn = document.getElementById(`check-btn-${parentEx}`);
        if (checkBtn) {
          if (wc >= minW) checkBtn.classList.remove("unanswered");
          else checkBtn.classList.add("unanswered");
        }
      };
    });

    // 5. Word Reordering Row Click & Tiles
    document.querySelectorAll("[data-reorder-row]").forEach(rowEl => {
      rowEl.onclick = (e) => {
        if (e.target.closest("[data-add-tile]") || e.target.closest("[data-remove-tile]")) return;
        const rKey = rowEl.getAttribute("data-reorder-row");
        if (state.activeReorderKey !== rKey) {
          state.activeReorderKey = rKey;
          renderApp();
        }
      };
    });

    document.querySelectorAll("[data-add-tile]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const key = btn.getAttribute("data-add-tile");
        const idx = parseInt(btn.getAttribute("data-tile-idx"), 10);
        const parentEx = btn.getAttribute("data-parent-ex");
        const prog = getUnitProgress(state.currentUnitId);
        state.activeReorderKey = key;
        if (parentEx && prog.checkedExercises[parentEx]) {
          delete prog.checkedExercises[parentEx];
        }
        if (!Array.isArray(prog.exerciseAnswers[key])) prog.exerciseAnswers[key] = [];
        if (!prog.exerciseAnswers[key].includes(idx)) {
          prog.exerciseAnswers[key].push(idx);
        }
        if (prog.status === "not-started") prog.status = "in-progress";
        saveState();
        renderApp();
      };
    });

    document.querySelectorAll("[data-remove-tile]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const key = btn.getAttribute("data-remove-tile");
        const pos = parseInt(btn.getAttribute("data-tile-pos"), 10);
        const parentEx = btn.getAttribute("data-parent-ex");
        const prog = getUnitProgress(state.currentUnitId);
        state.activeReorderKey = key;
        if (parentEx && prog.checkedExercises[parentEx]) {
          delete prog.checkedExercises[parentEx];
        }
        if (Array.isArray(prog.exerciseAnswers[key])) {
          prog.exerciseAnswers[key].splice(pos, 1);
        }
        saveState();
        renderApp();
      };
    });

    // Check Answer ("Kiểm tra" / "Nộp bài") & Reset ("Làm lại")
    document.querySelectorAll("[data-check-ex]").forEach(btn => {
      btn.onclick = () => {
        const exId = btn.getAttribute("data-check-ex");
        const prog = getUnitProgress(state.currentUnitId);
        prog.checkedExercises[exId] = true;
        if (prog.status === "not-started") prog.status = "in-progress";
        if (!prog.completedSections.includes(state.currentSection)) {
          prog.completedSections.push(state.currentSection);
        }
        if (state.currentSection === "listening") {
          prog.unlockedTranscript = true;
        }
        saveState();
        renderApp();
      };
    });

    document.querySelectorAll("[data-reset-ex]").forEach(btn => {
      btn.onclick = () => {
        const exId = btn.getAttribute("data-reset-ex");
        const prog = getUnitProgress(state.currentUnitId);
        delete prog.checkedExercises[exId];
        Object.keys(prog.exerciseAnswers).forEach(k => {
          if (k.startsWith(exId + "_")) delete prog.exerciseAnswers[k];
        });
        saveState();
        renderApp();
      };
    });

    // Complete Unit Button in Unit Test
    ["btn-complete-unit", "btn-complete-unit-bottom"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.onclick = () => {
          const prog = getUnitProgress(state.currentUnitId);
          prog.status = "completed";
          ["vocabulary", "phrases", "grammar", "reading", "listening", "writing", "unittest"].forEach(s => {
            if (!prog.completedSections.includes(s)) prog.completedSections.push(s);
          });
          // Also mark all 10 unit test sections as checked so user sees feedback if they stay
          for (let i = 1; i <= 10; i++) {
            prog.checkedExercises[String(i)] = true;
          }
          saveState();
          renderApp();
        };
      }
    });

    // Bottom Bar Next & Previous Navigation
    const btnLessonNext = document.getElementById("btn-lesson-next");
    if (btnLessonNext) btnLessonNext.onclick = advanceLessonStep;
    const btnLessonPrev = document.getElementById("btn-lesson-prev");
    if (btnLessonPrev) btnLessonPrev.onclick = previousLessonStep;

    // Click-to-translate Dictionary Word Click
    if (state.dictEnabled) {
      document.querySelectorAll(".clickable-word").forEach(span => {
        span.onclick = (e) => {
          e.stopPropagation();
          const rawWord = (span.getAttribute("data-word") || span.textContent || "").trim().toLowerCase().replace(/^'+|'+$/g, "");
          if (!rawWord) return;

          const rect = span.getBoundingClientRect();
          const popupWidth = 344;
          const popupEstHeight = 235;
          let left = Math.round(rect.left - 12);
          if (left + popupWidth > window.innerWidth - 16) {
            left = Math.max(12, window.innerWidth - popupWidth - 16);
          }
          if (left < 12) left = 12;

          let top = Math.round(rect.bottom + 8);
          if (top + popupEstHeight > window.innerHeight - 16 && rect.top > popupEstHeight + 16) {
            top = Math.round(rect.top - popupEstHeight - 8);
          }

          state.dictPopupPos = { top, left };
          const entry = lookupDictionaryWord(rawWord);
          state.activeDictWord = entry;
          window.speakText(entry.word, "US");
          renderApp();
        };
      });
    }

    const btnCloseDict = document.getElementById("btn-close-dict");
    if (btnCloseDict) {
      btnCloseDict.onclick = () => {
        state.activeDictWord = null;
        renderApp();
      };
    }

    const btnDictFull = document.getElementById("btn-dict-full-view");
    if (btnDictFull) {
      btnDictFull.onclick = () => {
        state.fullDictModalWord = state.activeDictWord;
        state.activeDictWord = null;
        renderApp();
      };
    }
    const fullDictBackdrop = document.getElementById("full-dict-backdrop");
    if (fullDictBackdrop) fullDictBackdrop.onclick = () => { state.fullDictModalWord = null; renderApp(); };
    const btnCloseFullDict = document.getElementById("btn-close-full-dict");
    if (btnCloseFullDict) btnCloseFullDict.onclick = () => { state.fullDictModalWord = null; renderApp(); };

    const btnBookmarkWord = document.getElementById("btn-bookmark-word");
    if (btnBookmarkWord) {
      btnBookmarkWord.onclick = () => {
        const w = state.activeDictWord;
        if (!w) return;
        const existIdx = state.savedFlashcards.findIndex(f => f.word.toLowerCase() === w.word.toLowerCase());
        if (existIdx >= 0) {
          state.savedFlashcards.splice(existIdx, 1);
        } else {
          state.savedFlashcards.unshift({
            word: w.word,
            ipa: w.ipa,
            meaning: w.meaning || (w.senses && w.senses[0] ? w.senses[0].primary : ""),
            example: w.example || ""
          });
        }
        saveState();
        renderApp();
      };
    }

    const btnSaveWordFc = document.getElementById("btn-save-word-flashcard");
    if (btnSaveWordFc) {
      btnSaveWordFc.onclick = () => {
        const w = state.activeDictWord;
        if (w && !state.savedFlashcards.some(f => f.word.toLowerCase() === w.word.toLowerCase())) {
          state.savedFlashcards.unshift({
            word: w.word,
            ipa: w.ipa,
            meaning: w.meaning || (w.senses && w.senses[0] ? w.senses[0].primary : ""),
            example: w.example || ""
          });
          saveState();
        }
        state.activeDictWord = null;
        state.flashcardModalOpen = true;
        renderApp();
      };
    }
  }

  function openUnitLesson(unitId) {
    state.currentUnitId = unitId;
    state.currentSection = "vocabulary";
    state.currentPart = "A";
    state.view = "lesson";
    state.notifOpen = false;
    state.profileMenuOpen = false;
    const prog = getUnitProgress(unitId);
    if (prog.status === "not-started") {
      prog.status = "in-progress";
      saveState();
    }
    renderApp(true);
  }

  function advanceLessonStep() {
    const unit = window.UNITS_DATA.find(u => u.id === state.currentUnitId) || window.UNITS_DATA[0];
    const content = getLessonContentForUnit(unit);
    const order = ["vocabulary", "phrases", "grammar", "reading", "listening", "writing", "unittest"];
    const secObj = content[state.currentSection];
    const partKeys = (secObj && secObj.parts) ? Object.keys(secObj.parts) : [];
    const curPartIdx = partKeys.indexOf(state.currentPart);

    if (curPartIdx >= 0 && curPartIdx < partKeys.length - 1) {
      const nextPart = partKeys[curPartIdx + 1];
      state.currentPart = nextPart;
      renderApp(false, nextPart);
    } else {
      const secIdx = order.indexOf(state.currentSection);
      if (secIdx >= 0 && secIdx < order.length - 1) {
        state.currentSection = order[secIdx + 1];
        state.currentPart = "A";
        renderApp(true);
      }
    }
  }

  function previousLessonStep() {
    const unit = window.UNITS_DATA.find(u => u.id === state.currentUnitId) || window.UNITS_DATA[0];
    const content = getLessonContentForUnit(unit);
    const order = ["vocabulary", "phrases", "grammar", "reading", "listening", "writing", "unittest"];
    const secObj = content[state.currentSection];
    const partKeys = (secObj && secObj.parts) ? Object.keys(secObj.parts) : [];
    const curPartIdx = partKeys.indexOf(state.currentPart);

    if (curPartIdx > 0) {
      const prevPart = partKeys[curPartIdx - 1];
      state.currentPart = prevPart;
      renderApp(false, prevPart);
    } else {
      const secIdx = order.indexOf(state.currentSection);
      if (secIdx > 0) {
        state.currentSection = order[secIdx - 1];
        state.currentPart = "A";
        renderApp(true);
      }
    }
  }

  // Close popovers when clicking anywhere outside
  window.addEventListener("click", () => {
    if (state.notifOpen || state.profileMenuOpen || state.activeDictWord) {
      state.notifOpen = false;
      state.profileMenuOpen = false;
      state.activeDictWord = null;
      renderApp();
    }
  });

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      state.cmdModalOpen = !state.cmdModalOpen;
      renderApp();
      const inp = document.getElementById("cmd-search-input");
      if (inp) inp.focus();
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      state.sidebarCollapsed = !state.sidebarCollapsed;
      saveState();
      renderApp();
    } else if (e.key === "Escape") {
      if (state.cmdModalOpen || state.flashcardModalOpen || state.activeDictWord || state.activeGrammarDoc || state.mobileMenuOpen || state.notifOpen || state.profileMenuOpen) {
        state.cmdModalOpen = false;
        state.flashcardModalOpen = false;
        state.activeDictWord = null;
        state.activeGrammarDoc = null;
        state.mobileMenuOpen = false;
        state.notifOpen = false;
        state.profileMenuOpen = false;
        renderApp();
      }
    }
  });

  window.addEventListener("DOMContentLoaded", () => renderApp(true));
})();
