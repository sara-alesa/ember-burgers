gsap.registerPlugin(ScrollTrigger);

const loader = document.getElementById("loader");
const hideLoader = () => {
  if (!loader || !loader.isConnected) return;
  gsap.to(loader, {
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => loader.remove(),
  });
};
window.addEventListener("load", hideLoader);
setTimeout(hideLoader, 1800);

document.querySelector(".hero-video")?.play().catch(() => {});

const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

gsap.from(".hero-anim", {
  y: 46,
  opacity: 0,
  duration: 1,
  stagger: 0.14,
  ease: "power3.out",
  delay: 0.35,
});

gsap.from(".float-chip", {
  opacity: 0,
  scale: 0.8,
  duration: 0.8,
  stagger: 0.1,
  delay: 0.9,
  ease: "back.out(1.6)",
});

gsap.from(".burger-card", {
  scrollTrigger: {
    trigger: "#menuGrid",
    start: "top 80%",
  },
  y: 70,
  opacity: 0,
  duration: 0.8,
  stagger: 0.1,
  ease: "power3.out",
});

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 16;
    const rotateX = (0.5 - y) * 16;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.transition = "transform 0.45s ease";
    setTimeout(() => {
      card.style.transition = "";
    }, 450);
  });
});

const storyVideo = document.getElementById("storyVideo");

const setupStory = () => {
  const duration = storyVideo.duration || 1;

  gsap.from("[data-story]", {
    scrollTrigger: {
      trigger: "#story",
      start: "top 70%",
    },
    x: 50,
    opacity: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: "power2.out",
  });

  ScrollTrigger.create({
    trigger: ".story-pin",
    start: "top top",
    end: "+=180%",
    pin: true,
    scrub: 0.6,
    onUpdate: (self) => {
      if (!Number.isFinite(duration)) return;
      storyVideo.currentTime = self.progress * duration * 0.98;
    },
  });
};

if (storyVideo.readyState >= 1) {
  setupStory();
} else {
  storyVideo.addEventListener("loadedmetadata", setupStory, { once: true });
}

const toast = (el) => {
  el.hidden = false;
  gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 });
};

document.getElementById("orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  toast(document.getElementById("orderNote"));
  event.currentTarget.reset();
});

document.getElementById("newsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  toast(document.getElementById("newsNote"));
  event.currentTarget.reset();
});
