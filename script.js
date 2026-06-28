const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const year = document.querySelector("#year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const navLinks = [...document.querySelectorAll(".nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const activeObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-20% 0px -68% 0px", threshold: [0.16, 0.38, 0.62] }
);

sections.forEach((section) => activeObserver.observe(section));

const revealItems = [...document.querySelectorAll(".reveal")];
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
  revealObserver.observe(item);
});

const roleType = document.querySelector("#roleType");
const roles = [
  "Forward Deployed Engineer",
  "GenAI Solution Architect",
  "Multi-Agent Systems Builder",
  "Network-to-Cloud Architect"
];

if (roleType && !prefersReducedMotion) {
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;

  const typeRole = () => {
    const role = roles[roleIndex];
    roleType.textContent = role.slice(0, charIndex);

    if (!deleting && charIndex < role.length) {
      charIndex += 1;
      window.setTimeout(typeRole, 42);
      return;
    }

    if (!deleting && charIndex === role.length) {
      deleting = true;
      window.setTimeout(typeRole, 1400);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(typeRole, 24);
      return;
    }

    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    window.setTimeout(typeRole, 260);
  };

  window.setTimeout(typeRole, 1100);
}

const terminalOutput = document.querySelector("#terminalOutput");
const terminalFrames = [
  { type: "cmd", text: "$ whoami" },
  { type: "out", text: "> Natarajan Muthu - 15+ yrs | Network -> Cloud -> Full-Stack -> GenAI" },
  { type: "cmd", text: "$ cat achievements.log | grep \"Grand Prize\"" },
  { type: "out award", text: "> Global GCP Agentic AI Hackathon 2025 - Rank #1 / 3000+" },
  { type: "out award", text: "> AWS x Wipro Hackathon 2026 - Rank #2 / 500+ (AetherTest)" },
  { type: "cmd", text: "$ ./deploy_rag_app.sh --client=VirginMediaO2" },
  { type: "out", text: "> Audit time reduced: 20-50 days -> <3 minutes | GBP 2M/yr saved" },
  { type: "cmd", text: "$ ./ship --mode=forward-deployed --customer-context=messy" },
  { type: "out", text: "> Prototype in days. Harden into production. Measure adoption." }
];

const renderStaticTerminal = () => {
  if (!terminalOutput) return;
  terminalOutput.innerHTML = terminalFrames
    .map((line) => `<p class="${line.type}"><span class="prompt">${line.text.slice(0, 1)}</span>${line.text.slice(1)}</p>`)
    .join("");
};

if (terminalOutput) {
  if (prefersReducedMotion) {
    renderStaticTerminal();
  } else {
    let frameIndex = 0;
    let characterIndex = 0;
    terminalOutput.innerHTML = "";

    const loopTerminal = () => {
      if (frameIndex >= terminalFrames.length) {
        window.setTimeout(() => {
          terminalOutput.innerHTML = "";
          frameIndex = 0;
          characterIndex = 0;
          loopTerminal();
        }, 1700);
        return;
      }

      const frame = terminalFrames[frameIndex];
      let line = terminalOutput.querySelector(`[data-line="${frameIndex}"]`);
      if (!line) {
        line = document.createElement("p");
        line.className = frame.type;
        line.dataset.line = String(frameIndex);
        terminalOutput.append(line);
      }

      const text = frame.text.slice(0, characterIndex);
      line.innerHTML = `${text}<span class="terminal-cursor"></span>`;

      if (characterIndex < frame.text.length) {
        characterIndex += 1;
        window.setTimeout(loopTerminal, frame.type === "cmd" ? 24 : 14);
        return;
      }

      line.textContent = frame.text;
      frameIndex += 1;
      characterIndex = 0;
      window.setTimeout(loopTerminal, frame.type === "cmd" ? 310 : 180);
    };

    loopTerminal();
  }
}

const counters = [...document.querySelectorAll("[data-counter]")];
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = Number(entry.target.getAttribute("data-counter"));
      const prefix = entry.target.getAttribute("data-prefix") || "";
      const suffix = entry.target.getAttribute("data-suffix") || "";
      const duration = prefersReducedMotion ? 1 : 1100;
      const started = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        entry.target.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.42 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const pipelineCard = document.querySelector("#pipelineCard");
const pipelineButtons = [...document.querySelectorAll(".pipeline-map button")];
pipelineButtons.forEach((button) => {
  const update = () => {
    pipelineButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    if (pipelineCard) pipelineCard.textContent = button.dataset.example || "";
  };
  button.addEventListener("mouseenter", update);
  button.addEventListener("focus", update);
  button.addEventListener("click", update);
});

const skillTabs = [...document.querySelectorAll("[data-skill-tab]")];
const skillPanels = [...document.querySelectorAll("[data-skill-panel]")];
skillTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.skillTab;
    skillTabs.forEach((item) => item.classList.toggle("active", item === tab));
    skillPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.skillPanel === target));
  });
});
