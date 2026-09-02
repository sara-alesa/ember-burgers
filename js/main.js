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
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
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
  if (window.matchMedia("(hover: none)").matches) return;
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
const storyWrap = document.getElementById("storyStageWrap");
const storySpot = document.getElementById("storySpot");
const storyCards = [...document.querySelectorAll("[data-story]")];
const storyLayers = [...document.querySelectorAll("[data-layer]")];
const storyHotspots = [...document.querySelectorAll(".hotspot")];
const storyMeter = document.getElementById("storyMeterFill");
const storyMeterTrack = document.getElementById("storyMeter");
const storyStepNum = document.getElementById("storyStepNum");
const storyToggle = document.getElementById("storyToggle");
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
    if (step === activeStep && storyCards[step]?.classList.contains("is-active")) {
      return;
    }
    activeStep = step;
    storyCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === step);
    });
    storyLayers.forEach((layer, index) => {
      layer.classList.toggle("is-on", index === step);
    });
    storyHotspots.forEach((spot, index) => {
      spot.classList.toggle("is-on", index === step);
    });
    if (storyStepNum) storyStepNum.textContent = String(step + 1).padStart(2, "0");
    if (storyToggle) storyToggle.textContent = step >= 3 ? "Explode" : "Assemble";
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
      end: () =>
        window.matchMedia("(max-width: 720px)").matches ? "+=140%" : "+=240%",
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

  const seekToProgress = (progress, smooth = true) => {
    const trigger = storyTween.scrollTrigger;
    if (!trigger) return;
    const next = gsap.utils.clamp(0, 1, progress);
    window.scrollTo({
      top: trigger.start + next * (trigger.end - trigger.start),
      behavior: smooth && !reduceMotion ? "smooth" : "auto",
    });
  };

  const seekToStep = (step) => {
    seekToProgress((step + 0.28) / 4);
  };

  const bindStep = (el) => {
    if (!el) return;
    el.addEventListener("click", () => seekToStep(Number(el.dataset.step)));
    el.addEventListener("mouseenter", () => {
      const step = Number(el.dataset.step);
      storyCards.forEach((card, index) => {
        card.classList.toggle("is-hot", index === step);
      });
      storyLayers.forEach((layer, index) => {
        layer.classList.toggle("is-on", index === step);
      });
      storyHotspots.forEach((spot, index) => {
        spot.classList.toggle("is-on", index === step);
      });
    });
    el.addEventListener("mouseleave", () => {
      storyCards.forEach((card) => card.classList.remove("is-hot"));
      storyLayers.forEach((layer, index) => {
        layer.classList.toggle("is-on", index === activeStep);
      });
      storyHotspots.forEach((spot, index) => {
        spot.classList.toggle("is-on", index === activeStep);
      });
    });
  };

  storyCards.forEach(bindStep);
  storyHotspots.forEach(bindStep);

  document.getElementById("storyPrev")?.addEventListener("click", () => {
    seekToStep(Math.max(0, activeStep - 1));
  });
  document.getElementById("storyNext")?.addEventListener("click", () => {
    seekToStep(Math.min(3, activeStep + 1));
  });
  storyToggle?.addEventListener("click", () => {
    seekToProgress(activeStep >= 3 ? 0.04 : 0.92);
  });

  storyMeterTrack?.addEventListener("click", (event) => {
    const rect = storyMeterTrack.getBoundingClientRect();
    seekToProgress((event.clientX - rect.left) / rect.width);
  });

  let dragging = false;
  let startY = 0;
  let startProgress = 0;

  storyWrap?.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".hotspot, .story-card, .story-copy")) return;
    dragging = true;
    storyWrap.classList.add("is-dragging");
    storyWrap.setPointerCapture(event.pointerId);
    startY = event.clientY;
    startProgress = storyTween.scrollTrigger?.progress || 0;
  });

  storyWrap?.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      if (!dragging) return;
      const delta = (startY - event.clientY) / 280;
      seekToProgress(startProgress + delta, false);
      return;
    }
    const rect = storyWrap.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (storySpot) {
      storySpot.style.left = `${x}px`;
      storySpot.style.top = `${y}px`;
    }
    if (!reduceMotion) {
      const px = (x / rect.width - 0.5) * 18;
      const py = (y / rect.height - 0.5) * 12;
      storyWrap.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }
    if (!dragging) return;
    const delta = (startY - event.clientY) / 380;
    seekToProgress(startProgress + delta, false);
  });

  const endDrag = () => {
    dragging = false;
    storyWrap?.classList.remove("is-dragging");
  };
  storyWrap?.addEventListener("pointerup", endDrag);
  storyWrap?.addEventListener("pointercancel", endDrag);
  storyWrap?.addEventListener("pointerleave", () => {
    if (!dragging && !reduceMotion) {
      storyWrap.style.transform = "translate3d(0,0,0)";
    }
  });

  window.addEventListener("keydown", (event) => {
    const trigger = storyTween.scrollTrigger;
    if (!trigger) return;
    const inView = window.scrollY >= trigger.start - 40 && window.scrollY <= trigger.end + 40;
    if (!inView) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      seekToStep(Math.min(3, activeStep + 1));
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      seekToStep(Math.max(0, activeStep - 1));
    }
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
