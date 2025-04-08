document.addEventListener("DOMContentLoaded", function () {
  // تهيئة البيانات
  const stats = JSON.parse(localStorage.getItem("dhikrStats") || "{}");
  const settings = JSON.parse(localStorage.getItem("settings") || "{}");

  // تحديث الإحصائيات
  updateStats();
  loadSettings();
  initializeCharts();
  initializeUsers();

  // إضافة ذكر جديد
  document
    .getElementById("addDhikrForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const text = document.getElementById("dhikrText").value;
      const type = document.getElementById("dhikrType").value;
      addNewDhikr(text, type);
    });

  function updateStats() {
    document.getElementById("totalDhikr").textContent = Object.values(
      stats
    ).reduce((a, b) => a + b, 0);

    document.getElementById("activeDays").textContent =
      localStorage.getItem("activeDays") || "0";

    updateTopDhikrs();
  }

  function updateTopDhikrs() {
    const topDhikrs = Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const container = document.getElementById("topDhikrs");
    container.innerHTML = topDhikrs
      .map(
        ([dhikr, count]) =>
          `<div class="top-dhikr">
                    <span>${dhikr}</span>
                    <span>${count}</span>
                </div>`
      )
      .join("");
  }

  function loadSettings() {
    // إعدادات التطبيق
    document.getElementById("soundToggleSetting").checked =
      localStorage.getItem("soundEnabled") !== "false";
    document.getElementById("autoDarkMode").checked =
      localStorage.getItem("autoDarkMode") === "true";
    document.getElementById("alertCount").value =
      localStorage.getItem("alertCount") || 33;

    // تطبيق الوضع الليلي التلقائي
    if (localStorage.getItem("autoDarkMode") === "true") {
      const hours = new Date().getHours();
      if (hours >= 18 || hours < 6) {
        document.body.classList.add("dark-mode");
      }
    }
  }

  // تحديث الإعدادات
  document
    .getElementById("soundToggleSetting")
    .addEventListener("change", function () {
      localStorage.setItem("soundEnabled", this.checked);
    });

  document
    .getElementById("autoDarkMode")
    .addEventListener("change", function () {
      localStorage.setItem("autoDarkMode", this.checked);
      if (this.checked) {
        const hours = new Date().getHours();
        if (hours >= 18 || hours < 6) {
          document.body.classList.add("dark-mode");
        }
      }
    });

  document.getElementById("alertCount").addEventListener("change", function () {
    localStorage.setItem("alertCount", this.value);
  });

  // تغيير كلمة المرور
  document
    .getElementById("passwordForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (currentPassword === "Rashed@2024") {
        // تحقق من كلمة المرور الحالية
        if (newPassword === confirmPassword) {
          localStorage.setItem("password", newPassword);
          alert("تم تغيير كلمة المرور بنجاح");
          this.reset();
        } else {
          alert("كلمة المرور الجديدة وتأكيدها غير متطابقين");
        }
      } else {
        alert("كلمة المرور الحالية غير صحيحة");
      }
    });

  function initializeCharts() {
    const ctx = document.getElementById("reportChart").getContext("2d");
    window.reportChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "التسبيحات",
            data: [],
            borderColor: getComputedStyle(
              document.documentElement
            ).getPropertyValue("--dashboard-primary"),
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          title: {
            display: true,
            text: "تقرير التسبيحات",
            font: {
              size: 16,
            },
          },
        },
      },
    });
  }

  window.generateReport = function () {
    const type = document.getElementById("reportType").value;

    // تجميع البيانات
    const totalDhikr = parseInt(localStorage.getItem("totalCount")) || 0;
    const dailyAvg = Math.round(
      totalDhikr / (parseInt(localStorage.getItem("activeDays")) || 1)
    );
    const activeDays = parseInt(localStorage.getItem("activeDays")) || 0;

    // تحديث الملخص
    document.getElementById("reportTotal").textContent = totalDhikr;
    document.getElementById("reportAverage").textContent = dailyAvg;
    document.getElementById("reportDays").textContent = activeDays;

    // تحديث الرسم البياني
    updateChart(type);
  };

  window.exportReport = function () {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // إضافة العنوان
      doc.setFontSize(20);
      doc.text("تقرير المسبحة الإلكترونية", 105, 20, { align: "center" });

      // إضافة التاريخ
      doc.setFontSize(12);
      doc.text(`التاريخ: ${new Date().toLocaleDateString("ar")}`, 105, 30, {
        align: "center",
      });

      // إضافة الإحصائيات
      const data = [
        [
          "إجمالي التسبيحات",
          document.getElementById("reportTotal").textContent,
        ],
        ["المعدل اليومي", document.getElementById("reportAverage").textContent],
        ["أيام النشاط", document.getElementById("reportDays").textContent],
      ];

      doc.autoTable({
        head: [["البيان", "القيمة"]],
        body: data,
        startY: 40,
        theme: "grid",
      });

      // إضافة الرسم البياني
      const canvas = document.getElementById("reportChart");
      const chartImg = canvas.toDataURL("image/png");
      doc.addImage(chartImg, "PNG", 15, 120, 180, 100);

      // حفظ الملف
      doc.save(`تقرير-المسبحة-${new Date().toLocaleDateString("ar")}.pdf`);
    } catch (error) {
      console.error("خطأ في تصدير التقرير:", error);
      alert("حدث خطأ أثناء تصدير التقرير");
    }
  };

  function updateChart(type) {
    const ctx = document.getElementById("reportChart").getContext("2d");
    const stats = JSON.parse(localStorage.getItem("dhikrStats") || "{}");

    // تجهيز البيانات
    let data = [];
    let labels = [];

    switch (type) {
      case "daily":
        labels = ["صباحاً", "ظهراً", "عصراً", "مساءً"];
        data = [0, 0, 0, 0]; // سيتم تحديثها من الإحصائيات الفعلية
        break;
      case "weekly":
        labels = [
          "السبت",
          "الأحد",
          "الإثنين",
          "الثلاثاء",
          "الأربعاء",
          "الخميس",
          "الجمعة",
        ];
        data = new Array(7).fill(0);
        break;
      case "monthly":
        labels = Array.from({ length: 30 }, (_, i) => i + 1);
        data = new Array(30).fill(0);
        break;
    }

    // إنشاء الرسم البياني
    if (window.myChart) {
      window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "عدد التسبيحات",
            data: data,
            borderColor: "#4a90e2",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `تقرير ${
              type === "daily" ? "يومي" : type === "weekly" ? "أسبوعي" : "شهري"
            }`,
            font: { size: 16 },
          },
        },
      },
    });
  }

  function generateReport(type) {
    // توليد التقرير حسب النوع المحدد
    return {
      type,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  function downloadReport(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasbih-report-${new Date().toLocaleDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // تسجيل الخروج
  window.logout = function () {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  };
});

function updateDashboardStats() {
  const stats = JSON.parse(localStorage.getItem("dhikrStats") || "{}");
  const totalCount = Object.values(stats).reduce((a, b) => a + b, 0);
  const activeDays = parseInt(localStorage.getItem("activeDays")) || 1;
  const lastUpdate = localStorage.getItem("lastUpdate");

  // تحديث الإحصائيات
  document.getElementById("reportTotal").textContent = totalCount;
  document.getElementById("reportAverage").textContent = Math.round(
    totalCount / activeDays
  );
  document.getElementById("lastDhikrDate").textContent = lastUpdate
    ? new Date(lastUpdate).toLocaleDateString("ar")
    : "-";

  // تحديث الرسم البياني
  updateDhikrChart(stats);
}

function updateDhikrChart(stats) {
  const ctx = document.getElementById("dhikrChart").getContext("2d");
  const topDhikrs = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: topDhikrs.map(([name]) => name),
      datasets: [
        {
          label: "عدد التسبيحات",
          data: topDhikrs.map(([_, count]) => count),
          backgroundColor: "#4a90e2",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "أكثر الأذكار تكراراً",
          font: { size: 16 },
        },
        legend: {
          display: false,
        },
      },
    },
  });
}

// إضافة دالة تهيئة المستخدمين
function initializeUsers() {
  // تهيئة قائمة المستخدمين إذا لم تكن موجودة
  if (!localStorage.getItem("users")) {
    const defaultUsers = [
      {
        username: "rashedrabee",
        password: "Rashed@2024",
        isAdmin: true,
      },
    ];
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }
  updateUsersList();
}

// إضافة مستخدم جديد
document.getElementById("newUserForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("newUsername").value;
  const password = document.getElementById("newUserPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;

  if (password !== confirmPassword) {
    alert("كلمات المرور غير متطابقة");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // التحقق من عدم تكرار اسم المستخدم
  if (users.some((user) => user.username === username)) {
    alert("اسم المستخدم موجود بالفعل");
    return;
  }

  // إضافة المستخدم الجديد
  users.push({
    username: username,
    password: password,
    isAdmin: false,
  });

  localStorage.setItem("users", JSON.stringify(users));
  alert("تمت إضافة المستخدم بنجاح");
  this.reset();
  updateUsersList();
});

// تحديث قائمة المستخدمين
function updateUsersList() {
  const usersList = document.getElementById("usersList");
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  usersList.innerHTML = users
    .map(
      (user) => `
        <div class="user-item">
            <span>${user.username}</span>
            ${
              !user.isAdmin
                ? `
                <button onclick="deleteUser('${user.username}')" class="delete-btn">
                    حذف
                </button>
            `
                : ""
            }
        </div>
    `
    )
    .join("");
}

// حذف مستخدم
window.deleteUser = function (username) {
  if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    users = users.filter((user) => user.username !== username);
    localStorage.setItem("users", JSON.stringify(users));
    updateUsersList();
  }
};

// إضافة حماية إضافية
function validateSession() {
  const lastActivity = localStorage.getItem("lastActivity");
  const currentTime = new Date().getTime();

  // تسجيل خروج تلقائي بعد 30 دقيقة من عدم النشاط
  if (lastActivity && currentTime - lastActivity > 1800000) {
    logout();
    return false;
  }

  localStorage.setItem("lastActivity", currentTime);
  return true;
}

// إضافة مراقبة النشاط
document.addEventListener("mousemove", () => {
  localStorage.setItem("lastActivity", new Date().getTime());
});

// تحديث الإحصائيات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", updateDashboardStats);

// تحديث معالجة التبويبات
document.addEventListener("DOMContentLoaded", function() {
    // معالجة التبويبات الرئيسية
    const tabs = document.querySelectorAll('.tab-buttons .tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-tab');
            const parent = this.closest('.dhikr-manager, .scripture-manager');
            
            // إزالة التفعيل من جميع الأزرار في نفس المجموعة
            parent.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // تفعيل الزر والمحتوى المحدد
            this.classList.add('active');
            parent.querySelector(`#${target}-content`).classList.add('active');
        });
    });

    // معالجة نماذج الإضافة
    document.querySelectorAll('.add-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const type = this.closest('.tab-content').id.split('-')[0];
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (type === 'quran') {
                saveQuranVerse(data);
                loadQuranList(data.category);
            } else if (type === 'hadith') {
                saveHadith(data);
                loadHadithList(data.category);
            } else {
                saveDhikr(type, data);
                loadDhikrList(type);
            }

            this.reset();
        });
    });

    // تحميل البيانات الأولية
    loadDhikrList('morning');
    loadQuranList('azkar');
    loadHadithList('azkar');
});

function saveQuranVerse(data) {
    const verses = JSON.parse(localStorage.getItem('quranVerses') || '{}');
    if (!verses[data.category]) verses[data.category] = [];
    verses[data.category].push({ ...data, id: Date.now() });
    localStorage.setItem('quranVerses', JSON.stringify(verses));
}

function saveHadith(data) {
    const hadiths = JSON.parse(localStorage.getItem('hadiths') || '{}');
    if (!hadiths[data.category]) hadiths[data.category] = [];
    hadiths[data.category].push({ ...data, id: Date.now() });
    localStorage.setItem('hadiths', JSON.stringify(hadiths));
}

function saveDhikr(type, data) {
    const items = JSON.parse(localStorage.getItem(`${type}Items`) || '[]');
    items.push({ ...data, id: Date.now() });
    localStorage.setItem(`${type}Items`, JSON.stringify(items));
}

function loadQuranList(category) {
    const verses = JSON.parse(localStorage.getItem('quranVerses') || '{}');
    const list = verses[category] || [];
    const container = document.getElementById('quranList');
    
    container.innerHTML = list.length ? list.map(verse => `
        <div class="item-card">
            <div class="text">${verse.text}</div>
            <div class="info">${verse.reference}</div>
            <div class="actions">
                <button onclick="deleteQuranVerse('${category}', ${verse.id})">حذف</button>
            </div>
        </div>
    `).join('') : '<div class="empty-message">لا توجد آيات في هذا القسم</div>';
}

function loadHadithList(category) {
    const hadiths = JSON.parse(localStorage.getItem('hadiths') || '{}');
    const list = hadiths[category] || [];
    const container = document.getElementById('hadithList');
    
    container.innerHTML = list.length ? list.map(hadith => `
        <div class="item-card">
            <div class="text">${hadith.text}</div>
            <div class="info">
                <span>الراوي: ${hadith.narrator}</span>
                <span>المصدر: ${hadith.source}</span>
            </div>
            <div class="actions">
                <button onclick="deleteHadith('${category}', ${hadith.id})">حذف</button>
            </div>
        </div>
    `).join('') : '<div class="empty-message">لا توجد أحاديث في هذا القسم</div>';
}

// إضافة دوال الحذف
window.deleteQuranVerse = function(category, id) {
    if (!confirm('هل أنت متأكد من حذف هذه الآية؟')) return;
    
    const verses = JSON.parse(localStorage.getItem('quranVerses') || '{}');
    if (verses[category]) {
        verses[category] = verses[category].filter(v => v.id !== id);
        localStorage.setItem('quranVerses', JSON.stringify(verses));
        loadQuranList(category);
    }
};

window.deleteHadith = function(category, id) {
    if (!confirm('هل أنت متأكد من حذف هذا الحديث؟')) return;
    
    const hadiths = JSON.parse(localStorage.getItem('hadiths') || '{}');
    if (hadiths[category]) {
        hadiths[category] = hadiths[category].filter(h => h.id !== id);
        localStorage.setItem('hadiths', JSON.stringify(hadiths));
        loadHadithList(category);
    }
};
