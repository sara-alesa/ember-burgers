gsap.registerPlugin(ScrollTrigger);

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
if (!window.location.hash) {
  window.scrollTo(0, 0);
}

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

gsap.fromTo(
  ".hero-anim",
  { y: 46, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.14,
    ease: "power3.out",
    delay: 0.35,
  }
);

gsap.fromTo(
  ".float-chip",
  { opacity: 0, scale: 0.8 },
  {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    stagger: 0.1,
    delay: 0.9,
    ease: "back.out(1.6)",
  }
);

gsap.fromTo(
  ".burger-card",
  { y: 70, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: "#menuGrid",
      start: "top 90%",
      toggleActions: "play none none none",
    },
  }
);

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
const storyCards = [...document.querySelectorAll("[data-story]")];
const storyLayers = [...document.querySelectorAll("[data-layer]")];
const storyMeter = document.getElementById("storyMeterFill");
const storyStepNum = document.getElementById("storyStepNum");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let storyReady = false;
const setupStory = () => {
  if (storyReady || !storyVideo) return;
  storyReady = true;
  const duration = storyVideo.duration || 1;
  storyVideo.pause();

  const media = { time: 0, scale: 1.12 };
  let activeStep = 0;

  const setStep = (step) => {
    if (step === activeStep && storyCards[step].classList.contains("is-active")) return;
    activeStep = step;
    storyCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === step);
    });
    storyLayers.forEach((layer, index) => {
      layer.classList.toggle("is-on", index === step);
    });
    if (storyStepNum) storyStepNum.textContent = String(step + 1).padStart(2, "0");
  };

  const storyTween = gsap.to(media, {
    time: duration * 0.98,
    scale: 1.02,
    ease: "none",
    scrollTrigger: {
      id: "storyPin",
      trigger: ".story-pin",
      start: "top top",
      end: "+=180%",
      pin: true,
      pinSpacing: true,
      scrub: reduceMotion ? 0 : 1.35,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const step = Math.min(3, Math.floor(progress * 4));
        setStep(step);
        if (storyMeter) storyMeter.style.width = `${progress * 100}%`;
      },
    },
    onUpdate: () => {
      if (storyVideo.readyState < 1) return;
      if (!storyVideo.seeking && Math.abs(storyVideo.currentTime - media.time) > 0.03) {
        storyVideo.currentTime = media.time;
      }
      storyVideo.style.transform = `scale(${media.scale})`;
    },
  });

  setStep(0);

  const seekToStep = (step) => {
    const trigger = storyTween.scrollTrigger;
    if (!trigger) return;
    ScrollTrigger.refresh();
    const progress = gsap.utils.clamp(0.02, 0.92, (step + 0.22) / 4);
    const top = trigger.start + progress * (trigger.end - trigger.start);
    window.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  storyCards.forEach((card) => {
    card.addEventListener("click", () => seekToStep(Number(card.dataset.step)));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        seekToStep(Number(card.dataset.step));
      }
    });
  });
};

if (storyVideo.readyState >= 1) {
  setupStory();
} else {
  storyVideo.addEventListener("loadedmetadata", setupStory, { once: true });
  window.addEventListener("load", setupStory, { once: true });
}

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});

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
