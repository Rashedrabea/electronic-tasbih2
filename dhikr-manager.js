document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // تحديث أنواع الأذكار المخزنة
  const dhikrTypes = {
    morning: "أذكار الصباح",
    evening: "أذكار المساء",
    hadith: "الأحاديث النبوية",
  };

  // تهيئة المخزن المحلي إذا كان فارغاً
  for (const type in dhikrTypes) {
    if (!localStorage.getItem(`${type}Items`)) {
      localStorage.setItem(`${type}Items`, JSON.stringify([]));
    }
  }

  // تبديل التبويبات
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab;

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(`${tabName}-content`).classList.add("active");
      loadItems(tabName);
    });
  });

  // معالجة النماذج
  document.querySelectorAll(".add-form").forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const type = this.closest(".tab-content").id.split("-")[0];
      const data = new FormData(this);
      const item = Object.fromEntries(data.entries());

      saveItem(type, item);
      this.reset();
      loadItems(type);
    });
  });

  function saveItem(type, data) {
    const items = JSON.parse(localStorage.getItem(`${type}Items`) || "[]");
    items.push({
      ...data,
      id: Date.now(),
      type: type,
    });
    localStorage.setItem(`${type}Items`, JSON.stringify(items));
  }

  function loadItems(type) {
    const items = JSON.parse(localStorage.getItem(`${type}Items`) || "[]");
    const container = document.getElementById(`${type}-list`);

    if (!container) return;

    if (items.length === 0) {
      container.innerHTML =
        '<div class="empty-message">لا توجد عناصر في هذا القسم</div>';
      return;
    }

    container.innerHTML = items
      .map((item) => createItemCard(type, item))
      .join("");
  }

  function createItemCard(type, item) {
    if (type === "hadith") {
      return `
                <div class="item-card" data-id="${item.id}">
                    <div class="text">${item.text}</div>
                    <div class="info">
                        <span>الراوي: ${item.narrator}</span>
                        <span>المصدر: ${item.source}</span>
                    </div>
                    <div class="actions">
                        <button onclick="editItem('${type}', ${item.id})">تعديل</button>
                        <button onclick="deleteItem('${type}', ${item.id})">حذف</button>
                    </div>
                </div>
            `;
    }

    return `
            <div class="item-card" data-id="${item.id}">
                <div class="text">${item.text}</div>
                <div class="count">عدد التكرار: ${item.count || 1}</div>
                <div class="actions">
                    <button onclick="editItem('${type}', ${item.id})">تعديل</button>
                    <button onclick="deleteItem('${type}', ${item.id})">حذف</button>
                </div>
            </div>
        `;
  }

  window.editItem = function (type, id) {
    const items = JSON.parse(localStorage.getItem(`${type}Items`) || "[]");
    const item = items.find((item) => item.id === id);

    if (!item) return;

    const newText = prompt("تعديل النص:", item.text);
    if (newText && newText.trim()) {
      item.text = newText.trim();
      localStorage.setItem(`${type}Items`, JSON.stringify(items));
      loadItems(type);
    }
  };

  window.deleteItem = function (type, id) {
    if (confirm("هل أنت متأكد من حذف هذا العنصر؟")) {
      const items = JSON.parse(localStorage.getItem(`${type}Items`) || "[]");
      const newItems = items.filter((item) => item.id !== id);
      localStorage.setItem(`${type}Items`, JSON.stringify(newItems));
      loadItems(type);
    }
  };

  // تحميل البيانات الأولية
  loadItems("morning");
});
