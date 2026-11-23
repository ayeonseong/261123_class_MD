// ===== 예식 날짜 설정 (여기만 바꾸면 달력/카운트다운이 함께 바뀝니다) =====
const WEDDING_DATE = new Date(2027, 4, 15, 13, 0, 0); // 월은 0부터 시작 (4 = 5월)

// ===== 토스트 메시지 =====
const toast = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

// ===== 달력 그리기 =====
function renderCalendar() {
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const day = WEDDING_DATE.getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const dows = ["일", "월", "화", "수", "목", "금", "토"];
  let html = `<p class="calendar-month">${year}년 ${month + 1}월</p><div class="calendar-grid">`;

  dows.forEach((d, i) => {
    const cls = i === 0 ? "sun" : i === 6 ? "sat" : "";
    html += `<span class="dow ${cls}">${d}</span>`;
  });

  for (let i = 0; i < firstDow; i++) html += "<span></span>";

  for (let d = 1; d <= lastDate; d++) {
    const dow = (firstDow + d - 1) % 7;
    const classes = [];
    if (dow === 0) classes.push("sun");
    if (dow === 6) classes.push("sat");
    if (d === day) classes.push("wedding-day");
    html += `<span class="${classes.join(" ")}">${d}</span>`;
  }

  html += "</div>";
  document.getElementById("calendar").innerHTML = html;
}

// ===== 카운트다운 =====
function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  const units = document.querySelectorAll("#countdown [data-unit]");
  const ddayText = document.getElementById("ddayText");

  if (diff <= 0) {
    units.forEach((el) => (el.textContent = "0"));
    ddayText.innerHTML = "민준 ♥ 서연, <b>결혼했습니다!</b>";
    return;
  }

  const values = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
  units.forEach((el) => (el.textContent = values[el.dataset.unit]));
  ddayText.innerHTML = `민준 ♥ 서연의 결혼식이 <b>${values.days + 1}일</b> 남았습니다`;
}

// ===== 스크롤 시 서서히 나타나기 =====
function setupFadeIn() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}

// ===== 갤러리 라이트박스 =====
function setupGallery() {
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    img.className = `lightbox-img lb-${current}`;
  }
  function open(index) {
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  items.forEach((item) => item.addEventListener("click", () => open(Number(item.dataset.index))));
  document.getElementById("lightboxClose").addEventListener("click", close);
  document.getElementById("lightboxPrev").addEventListener("click", () => show(current - 1));
  document.getElementById("lightboxNext").addEventListener("click", () => show(current + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

// ===== 복사 버튼 (주소, 계좌번호) =====
function setupCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // 클립보드 API를 쓸 수 없는 환경(file:// 등)을 위한 대체 방법
        const temp = document.createElement("textarea");
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
      showToast("복사되었습니다");
    });
  });
}

// ===== 방명록 (브라우저에 저장) =====
const STORAGE_KEY = "wedding-guestbook";

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveMessages(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* 저장 불가 환경에서는 무시 */
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderMessages() {
  const list = loadMessages();
  const ul = document.getElementById("guestList");
  if (list.length === 0) {
    ul.innerHTML = '<li class="guest-empty">첫 번째 축하 메시지를 남겨주세요 💌</li>';
    return;
  }
  ul.innerHTML = list
    .map(
      (m, i) => `
      <li>
        <p class="g-name">${escapeHtml(m.name)}<span class="g-date">${m.date}</span></p>
        <p>${escapeHtml(m.msg)}</p>
        <button class="g-del" data-del="${i}" aria-label="삭제">×</button>
      </li>`
    )
    .join("");
}

function setupGuestbook() {
  const form = document.getElementById("guestForm");
  const nameInput = document.getElementById("guestName");
  const msgInput = document.getElementById("guestMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const msg = msgInput.value.trim();
    if (!name || !msg) return;

    const now = new Date();
    const date = `${now.getMonth() + 1}.${now.getDate()}`;
    const list = loadMessages();
    list.unshift({ name, msg, date });
    saveMessages(list);
    renderMessages();
    form.reset();
    showToast("축하 메시지가 등록되었습니다");
  });

  document.getElementById("guestList").addEventListener("click", (e) => {
    const idx = e.target.dataset.del;
    if (idx === undefined) return;
    if (!confirm("메시지를 삭제할까요?")) return;
    const list = loadMessages();
    list.splice(Number(idx), 1);
    saveMessages(list);
    renderMessages();
  });

  renderMessages();
}

// ===== 시작 =====
renderCalendar();
updateCountdown();
setInterval(updateCountdown, 1000);
setupFadeIn();
setupGallery();
setupCopyButtons();
setupGuestbook();
