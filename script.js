const year = document.querySelector("#year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const copyButton = document.querySelector("[data-copy]");
if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const value = copyButton.getAttribute("data-copy");
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      const oldText = copyButton.textContent;
      copyButton.textContent = "Email copied";
      window.setTimeout(() => {
        copyButton.textContent = oldText;
      }, 1600);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  });
}

const navLinks = [...document.querySelectorAll(".nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-20% 0px -65% 0px",
    threshold: [0.12, 0.35, 0.65]
  }
);

sections.forEach((section) => observer.observe(section));

const revealItems = [...document.querySelectorAll(".section-heading, .signal-grid > *, .award-grid > *, .project-card, .timeline article, .skills-grid > *, .credential-list > *, .hero-copy, .profile-panel")];
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.transitionDelay = `${Math.min(index * 28, 260)}ms`;
  revealObserver.observe(item);
});

const typingText = document.querySelector("#typingText");
const typingPhrases = [
  "ship_agentic_ai(platform='enterprise')",
  "connect_customer_context(to='production_ai')",
  "build_rag_pipeline(docs='messy', answers='trusted')",
  "deploy_forward_engineer(mode='Kore.ai')"
];

if (typingText) {
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const phrase = typingPhrases[phraseIndex];
    typingText.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      window.setTimeout(tick, 42);
      return;
    }

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      window.setTimeout(tick, 1300);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(tick, 22);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % typingPhrases.length;
    window.setTimeout(tick, 260);
  };

  tick();
}

const counters = [...document.querySelectorAll("[data-counter]")];
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = Number(entry.target.getAttribute("data-counter"));
      const originalText = entry.target.textContent || "";
      const duration = 1100;
      const started = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        entry.target.textContent = originalText.includes("GBP") ? `GBP ${value}M` : `${value}+`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.45 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const canvas = document.querySelector("#neuralCanvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !prefersReducedMotion) {
  const context = canvas.getContext("2d");
  const particles = [];
  const colors = ["#38d5ff", "#38f2b3", "#ffbe5c", "#ff6b8a"];
  let width = 0;
  let height = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles.length = 0;
    const count = Math.min(Math.floor((width * height) / 18000), 70);
    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1.2 + Math.random() * 2.4,
        color: colors[index % colors.length]
      });
    }
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      for (let next = index + 1; next < particles.length; next += 1) {
        const other = particles[next];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 145) {
          context.strokeStyle = `rgba(56, 213, 255, ${0.15 * (1 - distance / 145)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }

      context.fillStyle = particle.color;
      context.globalAlpha = 0.72;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
    });

    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
}
