// تعريف البيانات كمتغيرات عالمية
window.quranData = {
  azkar: [
    {
      text: "﴿وَاذْكُر رَّبَّكَ فِي نَفْسِكَ تَضَرُّعًا وَخِيفَةً وَدُونَ الْجَهْرِ مِنَ الْقَوْلِ بِالْغُدُوِّ وَالْآصَالِ﴾",
      reference: "الأعراف: 205",
      tafsir: "يأمر الله تعالى بذكره في النفس تضرعاً وخوفاً",
    },
    {
      text: "﴿وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ الْغُرُوبِ﴾",
      reference: "ق: 39",
      tafsir: "أي: صلِّ لله وسبحه في هذين الوقتين",
    },
    {
      text: "﴿فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ﴾",
      reference: "البقرة: 152",
      tafsir: "وعد من الله بذكر من يذكره",
    },
  ],
  morning: [
    {
      text: "﴿فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ﴾",
      reference: "الروم: 17",
      time: "الصباح",
      tafsir: "نزهوا الله تعالى في هذين الوقتين",
    },
    {
      text: "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ﴾",
      reference: "آية الكرسي - البقرة: 255",
      time: "الصباح",
      tafsir: "أعظم آية في القرآن",
    },
  ],
  evening: [
    {
      text: "﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾",
      reference: "الإخلاص: 1",
      time: "المساء",
      tafsir: "سورة تعدل ثلث القرآن",
    },
    {
      text: "﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ﴾",
      reference: "الفلق: 1",
      time: "المساء",
      tafsir: "من المعوذات لطلب الحماية",
    },
  ],
};

window.hadithData = {
  azkar: [
    {
      text: "من قال سبحان الله وبحمده في يوم مائة مرة حطت خطاياه وإن كانت مثل زبد البحر",
      narrator: "أبو هريرة",
      source: "صحيح البخاري",
      book: "كتاب الدعوات",
      number: "6405",
      grade: "صحيح",
    },
    {
      text: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم",
      narrator: "أبو هريرة",
      source: "صحيح البخاري",
      book: "كتاب التوحيد",
      number: "7563",
      grade: "صحيح",
    },
  ],
  morning: [
    {
      text: "من قال حين يصبح: اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور",
      narrator: "أبو هريرة",
      source: "سنن الترمذي",
      time: "الصباح",
      book: "أبواب الدعوات",
      number: "3391",
      grade: "حسن",
    },
    {
      text: "اللهم إني أصبحت أشهدك، وأشهد حملة عرشك، وملائكتك، وجميع خلقك، أنك أنت الله لا إله إلا أنت وحدك لا شريك لك، وأن محمداً عبدك ورسولك",
      narrator: "أبو داود",
      source: "سنن أبي داود",
      time: "الصباح",
      book: "كتاب الأدب",
      number: "5069",
      grade: "صحيح",
    },
  ],
  evening: [
    {
      text: "من قال حين يمسي: أعوذ بكلمات الله التامات من شر ما خلق، لم يضره شيء",
      narrator: "أبو هريرة",
      source: "صحيح مسلم",
      time: "المساء",
      book: "كتاب الذكر والدعاء",
      number: "2709",
      grade: "صحيح",
    },
    {
      text: "اللهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير",
      narrator: "أبو هريرة",
      source: "سنن الترمذي",
      time: "المساء",
      book: "أبواب الدعوات",
      number: "3390",
      grade: "حسن",
    },
  ],
};

window.dhikrTimes = {
  morning: {
    start: "بعد صلاة الفجر",
    end: "قبل شروق الشمس",
    duration: "ربع ساعة تقريباً",
    preferred: "قبل طلوع الشمس مباشرة",
  },
  evening: {
    start: "بعد صلاة العصر",
    end: "قبل غروب الشمس",
    duration: "ربع ساعة تقريباً",
    preferred: "قبل غروب الشمس مباشرة",
  },
};

// دوال إدارة البيانات
window.saveQuranVerse = function (verseData) {
  const verses = JSON.parse(localStorage.getItem("quranVerses") || "{}");
  if (!verses[verseData.category]) {
    verses[verseData.category] = [];
  }
  verses[verseData.category].push({
    ...verseData,
    id: Date.now(),
  });
  localStorage.setItem("quranVerses", JSON.stringify(verses));
  window.quranData = verses;
};

window.saveHadith = function (hadithData) {
  const hadiths = JSON.parse(localStorage.getItem("hadiths") || "{}");
  if (!hadiths[hadithData.category]) {
    hadiths[hadithData.category] = [];
  }
  hadiths[hadithData.category].push({
    ...hadithData,
    id: Date.now(),
  });
  localStorage.setItem("hadiths", JSON.stringify(hadiths));
  window.hadithData = hadiths;
};
