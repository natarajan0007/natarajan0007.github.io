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
