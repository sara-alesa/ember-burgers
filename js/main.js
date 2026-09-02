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

const storyCanvas = document.getElementById("storyCanvas");
const storyCards = [...document.querySelectorAll("[data-story]")];
const storyLayers = [...document.querySelectorAll("[data-layer]")];
const storyMeter = document.getElementById("storyMeterFill");
const storyStepNum = document.getElementById("storyStepNum");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FRAME_COUNT = 48;

const loadFrames = () =>
  Promise.all(
    Array.from({ length: FRAME_COUNT }, (_, index) => {
      const image = new Image();
      image.src = `assets/frames/frame-${String(index).padStart(2, "0")}.jpg`;
      return new Promise((resolve) => {
        image.onload = () => resolve(image);
        image.onerror = () => resolve(image);
      });
    })
  );

const drawFrame = (image) => {
  if (!storyCanvas || !image || !image.width) return;
  const ctx = storyCanvas.getContext("2d", { alpha: false });
  ctx.drawImage(image, 0, 0, storyCanvas.width, storyCanvas.height);
};

let storyReady = false;
const setupStory = (frames) => {
  if (storyReady || !storyCanvas || !frames.length) return;
  storyReady = true;

  drawFrame(frames[0]);

  const playhead = { frame: 0, scale: 1.08 };
  let activeStep = 0;
  let lastFrame = -1;

  const setStep = (step) => {
    if (step === activeStep && storyCards[step]?.classList.contains("is-active")) return;
    activeStep = step;
    storyCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === step);
    });
    storyLayers.forEach((layer, index) => {
      layer.classList.toggle("is-on", index === step);
    });
    if (storyStepNum) storyStepNum.textContent = String(step + 1).padStart(2, "0");
  };

  const storyTween = gsap.to(playhead, {
    frame: FRAME_COUNT - 1,
    scale: 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      id: "storyPin",
      trigger: ".story-pin",
      start: "top top",
      end: "+=240%",
      pin: true,
      pinSpacing: true,
      scrub: reduceMotion ? 0 : 1.15,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const step = Math.min(3, Math.floor(self.progress * 4));
        setStep(step);
        if (storyMeter) storyMeter.style.width = `${self.progress * 100}%`;
      },
    },
    onUpdate: () => {
      const index = Math.round(playhead.frame);
      if (index !== lastFrame) {
        lastFrame = index;
        drawFrame(frames[index]);
      }
      storyCanvas.style.transform = `scale(${playhead.scale})`;
    },
  });

  gsap.fromTo(
    storyCards,
    { x: 36, opacity: 0.25 },
    {
      x: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#story",
        start: "top 78%",
        toggleActions: "play none none none",
      },
      onComplete: () => {
        gsap.set(storyCards, { clearProps: "opacity,transform" });
        setStep(0);
      },
    }
  );

  setStep(0);

  const seekToStep = (step) => {
    const trigger = storyTween.scrollTrigger;
    if (!trigger) return;
    const progress = gsap.utils.clamp(0.04, 0.9, (step + 0.28) / 4);
    window.scrollTo({
      top: trigger.start + progress * (trigger.end - trigger.start),
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

loadFrames().then(setupStory);

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
