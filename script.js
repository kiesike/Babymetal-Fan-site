const searchInput = document.querySelector("#siteSearch");
const typeFilter = document.querySelector("#typeFilter");
const filterItems = [...document.querySelectorAll(".filter-item")];
const aura = document.querySelector(".cursor-aura");
const revealItems = [...document.querySelectorAll(".reveal")];
const countItems = [...document.querySelectorAll("[data-count]")];
const particleCanvas = document.querySelector("#metalParticles");
const particleContext = particleCanvas?.getContext("2d");

function updateArchiveFilter() {
  if (!searchInput || !typeFilter) {
    return;
  }

  const query = searchInput.value.trim().toLowerCase();
  const selectedType = typeFilter.value;

  filterItems.forEach((item) => {
    const matchesType = selectedType === "all" || item.dataset.type === selectedType;
    const matchesSearch = !query || item.dataset.search.includes(query) || item.textContent.toLowerCase().includes(query);
    item.hidden = !(matchesType && matchesSearch);
  });
}

searchInput?.addEventListener("input", updateArchiveFilter);
typeFilter?.addEventListener("change", updateArchiveFilter);

document.addEventListener("pointermove", (event) => {
  if (!aura) {
    return;
  }

  aura.style.left = `${event.clientX}px`;
  aura.style.top = `${event.clientY}px`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => revealObserver.observe(item));

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const target = entry.target;
    const endValue = Number(target.dataset.count);
    const original = target.textContent;
    const prefix = original.includes("No.") ? "No. " : "";
    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      target.textContent = `${prefix}${Math.round(endValue * eased)}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        target.textContent = original;
      }
    }

    requestAnimationFrame(tick);
    countObserver.unobserve(target);
  });
}, { threshold: 0.7 });

countItems.forEach((item) => countObserver.observe(item));

if (particleCanvas && particleContext) {
  const particles = [];
  const particleTotal = 72;
  const colors = ["#d71920", "#f2c35b", "#58d6ff", "#ffffff"];

  function resizeParticles() {
    const ratio = window.devicePixelRatio || 1;
    particleCanvas.width = Math.floor(window.innerWidth * ratio);
    particleCanvas.height = Math.floor(window.innerHeight * ratio);
    particleCanvas.style.width = `${window.innerWidth}px`;
    particleCanvas.style.height = `${window.innerHeight}px`;
    particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 2.4 + 0.7,
      speedX: (Math.random() - 0.5) * 0.38,
      speedY: Math.random() * -0.55 - 0.16,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.55 + 0.18
    };
  }

  function drawParticles() {
    particleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.y < -20 || particle.x < -20 || particle.x > window.innerWidth + 20) {
        particles[index] = createParticle();
        particles[index].y = window.innerHeight + 20;
      }

      particleContext.globalAlpha = particle.alpha;
      particleContext.fillStyle = particle.color;
      particleContext.shadowColor = particle.color;
      particleContext.shadowBlur = 14;
      particleContext.beginPath();
      particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      particleContext.fill();
    });

    particleContext.globalAlpha = 1;
    particleContext.shadowBlur = 0;
    requestAnimationFrame(drawParticles);
  }

  resizeParticles();
  for (let index = 0; index < particleTotal; index += 1) {
    particles.push(createParticle());
  }
  drawParticles();
  window.addEventListener("resize", resizeParticles);
}
