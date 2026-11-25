// =========================================
// MELLOW BEAN 스크립트
// 1) 첫 화면 사진 크로스페이드 슬라이드
// 2) 스크롤하면 메뉴가 아래에서 위로 올라오기
// 3) "#"으로 시작하는 링크를 누르면 그 Section으로 부드럽게 이동
// =========================================

// 기기에서 '움직임 줄이기'를 켰는지 확인
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// ---------- 1) 첫 화면 슬라이드 ----------

const SLIDE_TIME = 6000; // 한 장을 보여 주는 시간 (6초)

const hero = document.querySelector(".hero");
const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".hero-dot");

let current = 0;     // 지금 보이는 사진 번호 (0부터 시작)
let timer = null;    // 자동 넘김 타이머

// n번 사진을 보여 주기
function showSlide(n) {
  slides[current].classList.remove("is-active");
  dots[current].classList.remove("is-active");

  current = n;

  slides[current].classList.add("is-active");
  dots[current].classList.add("is-active");
}

// 다음 사진으로 (마지막 다음은 처음으로)
function nextSlide() {
  showSlide((current + 1) % slides.length);
}

function startSlides() {
  if (reduceMotion) return;   // 움직임 줄이기를 켠 사람은 첫 장만
  stopSlides();
  timer = setInterval(nextSlide, SLIDE_TIME);
}

function stopSlides() {
  clearInterval(timer);
}

// 점을 누르면 그 사진으로
dots.forEach(function (dot, index) {
  dot.addEventListener("click", function () {
    showSlide(index);
  });
});

// 마우스를 올리거나 키보드로 들어가면 멈추고, 벗어나면 다시 시작
hero.addEventListener("mouseenter", stopSlides);
hero.addEventListener("mouseleave", startSlides);
hero.addEventListener("focusin", stopSlides);
hero.addEventListener("focusout", startSlides);

startSlides();


// ---------- 2) 스크롤하면 아래에서 위로 올라오기 ----------
// class="reveal"이 붙은 요소가 화면에 들어오면 is-visible을 붙여요.
// 한 번 올라온 요소는 다시 숨기지 않아요.

if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-ready");

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });   // 요소가 15% 보이면 시작

  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });
}


// ---------- 3) 부드럽게 이동 ----------

const header = document.querySelector(".header");
const links = document.querySelectorAll('a[href^="#"]');

links.forEach(function (link) {
  link.addEventListener("click", function (event) {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();

    // 따라오는 Header에 가려지지 않게 Header 높이만큼 덜 내려가기
    const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight;

    // 움직임 줄이기를 켠 사람에게는 바로 이동
    window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });

    // 주소창에도 위치 표시 (#menu 등)
    history.pushState(null, "", link.getAttribute("href"));
  });
});
