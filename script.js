window.onload = function () {
  // تحميل الصورة المحفوظة
  const savedLogo = localStorage.getItem("siteLogo");
  const bannerImg = document.querySelector(".banner-emoji");
  if (savedLogo) {
    const imgContainer = document.createElement("div");
    imgContainer.style.width = "60px";
    imgContainer.style.height = "60px";
    imgContainer.style.borderRadius = "50%";
    imgContainer.style.backgroundImage = `url(${savedLogo})`;
    imgContainer.style.backgroundSize = "cover";
    imgContainer.style.backgroundPosition = "center";
    bannerImg.innerHTML = "";
    bannerImg.appendChild(imgContainer);
  }

  // تحميل البيانات المخزنة
  const storedVerses = localStorage.getItem("quranVerses");
  const storedHadiths = localStorage.getItem("hadiths");
  const storedDhikrs = localStorage.getItem("customDhikrs");

  if (storedVerses) {
    window.quranData = { ...window.quranData, ...JSON.parse(storedVerses) };
  }
  if (storedHadiths) {
    window.hadithData = { ...window.hadithData, ...JSON.parse(storedHadiths) };
  }
  if (storedDhikrs) {
    window.customDhikrs = JSON.parse(storedDhikrs);
  }

  // تحميل البيانات في واجهة المستخدم
  loadQuranVerses("azkar");
  loadHadith("azkar");
  updateDhikrsList();
};

document.addEventListener("DOMContentLoaded", function () {
  let count = 0;
  let currentDhikr = "";
  const counter = document.getElementById("counter");
  const modeToggle = document.querySelector(".mode-toggle");
  const dhikrContent = document.getElementById("dhikrContent");
  const customDhikr = document.getElementById("customDhikr");
  const saveCustomBtn = document.getElementById("saveCustomBtn");
  const dhikrButtons = document.querySelectorAll(".tasbeeh-btn");
  let activeButton = null;
  let isSoundEnabled = localStorage.getItem("soundEnabled") !== "false";

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  function createBeepSound(frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
    }, duration);
  }

  function playSound(type) {
    if (!isSoundEnabled) return;

    switch (type) {
      case "click":
        createBeepSound(1000, 50); // صوت نقرة خفيف
        break;
      case "milestone":
        createBeepSound(1500, 100); // صوت متوسط للـ 33 و 66
        break;
      case "complete":
        createBeepSound(2000, 200); // صوت طويل للـ 99
        break;
      case "reset":
        createBeepSound(800, 100); // صوت منخفض لإعادة التعيين
        break;
    }
  }

  document.addEventListener(
    "click",
    function initAudio() {
      audioContext.resume();
      document.removeEventListener("click", initAudio);
    },
    { once: true }
  );

  const dhikrs = {
    morning: [
      "سبحان الله وبحمده (100 مرة)",
      "أستغفر الله (100 مرة)",
      "لا إله إلا الله وحده لا شريك له (100 مرة)",
    ],
    evening: [
      "الحمد لله (100 مرة)",
      "الله أكبر (100 مرة)",
      "سبحان الله العظيم وبحمده (100 مرة)",
    ],
  };

  function updateCounter() {
    counter.textContent = count;
  }

  let dailyCount = parseInt(localStorage.getItem("dailyCount") || "0");
  const lastDate = localStorage.getItem("lastDate");
  const today = new Date().toDateString();

  // إعادة تعيين العداد اليومي إذا كان يوم جديد
  if (lastDate !== today) {
    dailyCount = 0;
    localStorage.setItem("lastDate", today);
  }

  // إضافة متغيرات الإحصائيات الجديدة
  let dhikrStats = JSON.parse(localStorage.getItem("dhikrStats") || "{}");
  let totalCount = parseInt(localStorage.getItem("totalCount") || "0");

  function updateStats() {
    // تحديث العدادات
    document.getElementById("dailyCount").textContent = dailyCount;
    document.getElementById("lastDhikr").textContent = currentDhikr || "-";
    document.getElementById("totalCount").textContent = totalCount;

    // تحديث أكثر ذكر تكراراً
    const mostUsed = Object.entries(dhikrStats).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("mostUsedDhikr").textContent = mostUsed
      ? `${mostUsed[0]} (${mostUsed[1]} مرة)`
      : "-";

    // تحديث وقت آخر تسبيحة
    const now = new Date();
    document.getElementById(
      "lastUpdate"
    ).textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(
      2,
      "0"
    )}`;

    // حفظ البيانات
    localStorage.setItem("dailyCount", dailyCount);
    localStorage.setItem("lastDhikr", currentDhikr);
    localStorage.setItem("dhikrStats", JSON.stringify(dhikrStats));
    localStorage.setItem("totalCount", totalCount);
    localStorage.setItem("lastUpdate", now.toISOString());
  }

  window.increment = function () {
    count++;
    dailyCount++;
    totalCount++;

    // تحديث إحصائيات الذكر
    if (currentDhikr) {
      dhikrStats[currentDhikr] = (dhikrStats[currentDhikr] || 0) + 1;
    }
    updateCounter();
    updateStats();
    playSound("click");

    // تغيير لون العداد والزر عند الوصول للأعداد المحددة
    if (count === 33 || count === 66) {
      playSound("milestone");
      counter.style.color = "#e84393";
      if (activeButton) {
        const originalColor = getComputedStyle(activeButton).backgroundColor;
        activeButton.style.backgroundColor = "#e84393";
        setTimeout(() => {
          counter.style.color = "";
          activeButton.style.backgroundColor = originalColor;
        }, 1000);
      }
    } else if (count === 99) {
      playSound("complete");
      counter.style.color = "#e84393";
      if (activeButton) {
        const originalColor = getComputedStyle(activeButton).backgroundColor;
        activeButton.style.backgroundColor = "#e84393";
        setTimeout(() => {
          counter.style.color = "";
          activeButton.style.backgroundColor = originalColor;

          // إذا وصل العدد إلى 99، إعادة تعيين العداد
          setTimeout(() => {
            count = 0;
            updateCounter();
            activeButton.style.backgroundColor = "";
            activeButton = null;
          }, 1000);
        }, 1000);
      }
    }
  };

  window.reset = function () {
    playSound("reset"); // إضافة صوت عند الضغط على زر إعادة
    count = 0;
    updateCounter();
    if (activeButton) {
      activeButton.style.backgroundColor = "";
      activeButton = null;
    }
  };

  // إضافة دالة لإعادة تعيين الإحصائيات
  window.resetStats = function () {
    if (confirm("هل تريد إعادة تعيين جميع الإحصائيات؟")) {
      dailyCount = 0;
      totalCount = 0;
      dhikrStats = {};
      updateStats();
    }
  };

  window.setDhikr = function (dhikr) {
    // إزالة التأثير من الزر السابق
    if (activeButton) {
      activeButton.style.backgroundColor = "";
    }
    // تحديد الزر الجديد
    activeButton = Array.from(dhikrButtons).find(
      (btn) => btn.textContent === dhikr
    );
    if (activeButton) {
      activeButton.style.backgroundColor = "#e84393";
    }
    currentDhikr = dhikr;
    count = 0;
    updateCounter();
    updateStats();
  };

  window.changeDhikrCategory = function () {
    const category = document.getElementById("dhikrCategory").value;
    dhikrContent.style.display = category === "custom" ? "none" : "block";
    customDhikr.style.display = category === "custom" ? "block" : "none";
    saveCustomBtn.style.display = category === "custom" ? "block" : "none";
    if (category !== "custom") displayDhikrs(category);
  };

  function displayDhikrs(category) {
    dhikrContent.innerHTML = dhikrs[category]
      .map((dhikr) => `<h3>${dhikr}</h3>`)
      .join("");
  }

  window.saveCustomDhikr = function () {
    const customText = customDhikr.value.trim();
    if (customText) setDhikr(customText);
  };

  window.toggleDarkMode = function () {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    modeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("darkMode", isDark);
  };

  // تحديث وظيفة toggleSound
  window.toggleSound = function () {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem("soundEnabled", isSoundEnabled);
    const soundBtn = document.getElementById("soundToggle");
    soundBtn.textContent = isSoundEnabled ? "🔊" : "🔇";
    if (quranRadio) {
      if (!isSoundEnabled) {
        localStorage.setItem("previousVolume", volumeSlider.value);
        quranRadio.volume = 0;
        volumeSlider.value = 0;
      } else {
        const prevVolume = localStorage.getItem("previousVolume") || 50;
        volumeSlider.value = prevVolume;
        quranRadio.volume = prevVolume / 100;
      }
    }
  };

  // إعداد الراديو
  const quranRadio = document.getElementById("quranRadio");
  const volumeSlider = document.getElementById("volumeSlider");
  const radioIcon = document.getElementById("radioIcon");
  let isPlaying = false;

  // تحميل حالة الراديو
  const lastStation = localStorage.getItem("lastStation");
  if (lastStation) {
    document.getElementById("radioStation").value = lastStation;
    quranRadio.src = lastStation;
  }

  const lastVolume = localStorage.getItem("radioVolume") || 50;
  volumeSlider.value = lastVolume;
  quranRadio.volume = isSoundEnabled ? lastVolume / 100 : 0;

  // وظائف الراديو
  window.toggleRadio = function () {
    try {
      if (isPlaying) {
        quranRadio.pause();
        radioIcon.textContent = "▶️";
      } else {
        const playPromise = quranRadio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              radioIcon.textContent = "⏸️";
            })
            .catch(() => {
              alert("يرجى النقر على الصفحة أولاً لتشغيل الراديو");
            });
        }
      }
      isPlaying = !isPlaying;
    } catch (error) {
      console.error("Error toggling radio:", error);
    }
  };

  window.changeStation = function () {
    const station = document.getElementById("radioStation").value;
    quranRadio.src = station;
    localStorage.setItem("lastStation", station);
    if (isPlaying) {
      quranRadio
        .play()
        .then(() => (radioIcon.textContent = "⏸️"))
        .catch(() => {
          isPlaying = false;
          radioIcon.textContent = "▶️";
        });
    }
  };

  // مستمعو الأحداث للراديو
  volumeSlider.addEventListener("input", function () {
    if (isSoundEnabled) {
      quranRadio.volume = this.value / 100;
      localStorage.setItem("radioVolume", this.value);
    }
  });

  quranRadio.addEventListener("error", function () {
    alert("عذراً، حدث خطأ في تشغيل المحطة. يرجى المحاولة مرة أخرى");
    radioIcon.textContent = "▶️";
    isPlaying = false;
  });

  // إضافة مستمعي الأحداث للتغيير في القوائم المنسدلة
  document
    .getElementById("quranCategory")
    .addEventListener("change", function () {
      loadQuranVerses(this.value);
    });

  document
    .getElementById("hadithCategory")
    .addEventListener("change", function () {
      loadHadith(this.value);
    });

  function loadQuranVerses(category) {
    console.log("Loading Quran verses for category:", category);
    console.log("Available data:", window.quranData);

    const verses = window.quranData[category] || [];
    const container = document.getElementById("quranVerses");

    if (!verses || verses.length === 0) {
      container.innerHTML =
        '<div class="empty-message">لا توجد آيات متوفرة في هذا القسم</div>';
      return;
    }

    container.innerHTML = verses
      .map(
        (verse) => `
        <div class="verse-card">
            <div class="verse-text">${verse.text}</div>
            <div class="verse-info">
                <span class="verse-reference">${verse.reference}</span>
                ${
                  verse.time
                    ? `<span class="verse-time">${verse.time}</span>`
                    : ""
                }
            </div>
            <div class="verse-tafsir">${verse.tafsir}</div>
        </div>
    `
      )
      .join("");
  }

  function loadHadith(category) {
    console.log("Loading Hadiths for category:", category);
    console.log("Available data:", window.hadithData);

    const hadiths = window.hadithData[category] || [];
    const container = document.getElementById("hadithList");

    if (!hadiths || hadiths.length === 0) {
      container.innerHTML =
        '<div class="empty-message">لا توجد أحاديث متوفرة في هذا القسم</div>';
      return;
    }

    container.innerHTML = hadiths
      .map(
        (hadith) => `
        <div class="hadith-card">
            <div class="hadith-text">${hadith.text}</div>
            <div class="hadith-info">
                <span class="narrator">الراوي: ${hadith.narrator}</span>
                <span class="source">المصدر: ${hadith.source}</span>
                <span class="grade">الدرجة: ${hadith.grade}</span>
            </div>
        </div>
    `
      )
      .join("");
  }

  window.shareVerse = function (text, reference) {
    shareContent(`${text}\n[${reference}]`);
  };

  window.shareHadith = function (text, narrator) {
    shareContent(`${text}\n[${narrator}]`);
  };

  function shareContent(text) {
    if (navigator.share) {
      navigator
        .share({
          text: text,
        })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => alert("تم النسخ إلى الحافظة"))
        .catch(() => alert("حدث خطأ في النسخ"));
    }
  }

  // إضافة زر العودة للأعلى
  window.onscroll = function () {
    const scrollBtn = document.querySelector(".scroll-top");
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      scrollBtn.classList.add("visible");
    } else {
      scrollBtn.classList.remove("visible");
    }
  };

  window.scrollToTop = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // وظائف الذكر السريع
  window.showQuickDhikr = function () {
    const modal = document.getElementById("quickDhikrModal");
    if (modal) {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  };

  window.closeQuickDhikr = function () {
    const modal = document.getElementById("quickDhikrModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  };

  window.quickDhikr = function (target) {
    let progress = 0;
    count = 0;
    updateCounter();

    const progressBar = document.querySelector(".progress-bar");
    progressBar.style.width = "0%";

    const interval = setInterval(() => {
      if (count < target) {
        increment();
        progress = (count / target) * 100;
        progressBar.style.width = progress + "%";
      } else {
        clearInterval(interval);
        playSound("complete");
        progressBar.style.width = "100%";

        // إظهار رسالة الإكمال
        setTimeout(() => {
          alert("تم إكمال الذكر بنجاح");
          closeQuickDhikr();
          progressBar.style.width = "0%";
        }, 1000);
      }
    }, 1000);
  };

  // إضافة مستمع لإغلاق النافذة عند النقر خارجها
  document
    .querySelector(".quick-dhikr-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeQuickDhikr();
      }
    });

  // تهيئة الحالة الأولية
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark-mode");
    modeToggle.textContent = "☀️";
  }
  displayDhikrs("morning");

  // تحميل وقت آخر تحديث عند بدء التطبيق
  const lastUpdateTime = localStorage.getItem("lastUpdate");
  if (lastUpdateTime) {
    const lastUpdate = new Date(lastUpdateTime);
    document.getElementById(
      "lastUpdate"
    ).textContent = `${lastUpdate.getHours()}:${String(
      lastUpdate.getMinutes()
    ).padStart(2, "0")}`;
  }

  // تهيئة زر الصوت
  document.getElementById("soundToggle").textContent = isSoundEnabled
    ? "🔊"
    : "🔇";

  // تحميل الحالة المحفوظة
  currentDhikr = localStorage.getItem("lastDhikr") || "";
  updateStats();

  // تأكيد أن البيانات الدينية موجودة
  if (typeof window.quranData === "undefined") {
    window.quranData = { azkar: [], morning: [], evening: [] };
  }
  if (typeof window.hadithData === "undefined") {
    window.hadithData = { azkar: [], morning: [], evening: [] };
  }

  // تحديث دالة initializeScriptureTabs
  document.addEventListener("DOMContentLoaded", function () {
    // تهيئة التبويبات
    const tabButtons = document.querySelectorAll(".scripture-tabs .tab-btn");
    tabButtons.forEach((button) => {
      button.onclick = function () {
        const tabName = this.getAttribute("data-tab");

        // إزالة التفعيل من جميع الأزرار والمحتويات
        document
          .querySelectorAll(".tab-btn")
          .forEach((btn) => btn.classList.remove("active"));
        document
          .querySelectorAll(".tab-content")
          .forEach((content) => content.classList.remove("active"));

        // تفعيل الزر والمحتوى المحدد
        this.classList.add("active");
        document.getElementById(`${tabName}-content`).classList.add("active");

        // تحديث المحتوى
        if (tabName === "quran") {
          loadQuranVerses(document.getElementById("quranCategory").value);
        } else if (tabName === "hadith") {
          loadHadith(document.getElementById("hadithCategory").value);
        }
      };
    });

    // تحميل البيانات الأولية
    loadQuranVerses("azkar");
    loadHadith("azkar");
  });

  function initializeTabs() {
    const tabButtons = document.querySelectorAll(".scripture-tabs .tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.onclick = function () {
        // إزالة الفئة النشطة من جميع الأزرار والمحتويات
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));

        // إضافة الفئة النشطة للعنصر المحدد
        this.classList.add("active");
        const targetId = this.getAttribute("data-tab") + "-content";
        document.getElementById(targetId).classList.add("active");

        // تحميل المحتوى المناسب
        if (this.getAttribute("data-tab") === "quran") {
          loadQuranVerses(document.getElementById("quranCategory").value);
        } else if (this.getAttribute("data-tab") === "hadith") {
          loadHadith(document.getElementById("hadithCategory").value);
        }
      };
    });
  }

  initializeTabs();

  // إضافة وظائف المشاركة
  window.shareApp = function (platform) {
    const appUrl = window.location.href;
    const text = `المسبحة الإلكترونية - تطبيق للتسبيح والأذكار\n${appUrl}`;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            appUrl
          )}&text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            appUrl
          )}`,
          "_blank"
        );
        break;
    }
  };

  // دالة لنسخ الرابط
  window.copyLink = function () {
    const appUrl = window.location.href;
    navigator.clipboard
      .writeText(appUrl)
      .then(() => {
        alert("تم نسخ الرابط بنجاح");
      })
      .catch(() => {
        alert("حدث خطأ في نسخ الرابط");
      });
  };
});
