"use strict";

const letterDialog = document.querySelector("#letter-dialog");
const closeButton = document.querySelector("[data-close-letter]");
const saveButton = document.querySelector("#save-letter");
const toast = document.querySelector("#toast");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let letterOpener = null;
let toastTimer;

document.querySelectorAll("[data-open-letter]").forEach((button) => {
  button.addEventListener("click", () => {
    if (letterDialog.open) return;
    letterOpener = button;
    letterDialog.showModal();
    letterDialog.scrollTop = 0;
    document.documentElement.classList.add("letter-is-open");
  });
});

closeButton.addEventListener("click", () => letterDialog.close());

letterDialog.addEventListener("click", (event) => {
  if (event.target !== letterDialog) return;
  const bounds = letterDialog.getBoundingClientRect();
  const clickedOutside = event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (clickedOutside) letterDialog.close();
});

letterDialog.addEventListener("close", () => {
  document.documentElement.classList.remove("letter-is-open");
  letterOpener?.focus({ preventScroll: true });
});

function notify(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4500);
}

saveButton.addEventListener("click", () => {
  const paragraphs = [...document.querySelector("#letter-content").children]
    .map((element) => element.innerText.trim());
  const letter = new Blob(["\uFEFF", paragraphs.join("\r\n\r\n")], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(letter);
  const download = document.createElement("a");
  download.href = url;
  download.download = "Письмо для Ви — от Тёмы.txt";
  document.body.append(download);
  download.click();
  download.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify("Скачивание началось. Это письмо можно оставить себе ♡");
});

// Content stays visible when JavaScript or IntersectionObserver is unavailable.
if ("IntersectionObserver" in window && !motionPreference.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    const cardIndex = element.classList.contains("promise-card")
      ? [...element.parentElement.children].indexOf(element) : 0;
    element.style.setProperty("--reveal-delay", `${cardIndex * 75}ms`);
    element.classList.add("reveal-ready");
    observer.observe(element);
  });
}

// A tiny paper-collage movement, only on devices with a precise pointer.
const artwork = document.querySelector(".hero-art");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let animationFrame = 0;
  artwork.addEventListener("pointermove", (event) => {
    if (motionPreference.matches) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(() => {
      const bounds = artwork.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
      artwork.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
      artwork.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
    });
  });
  artwork.addEventListener("pointerleave", () => {
    window.cancelAnimationFrame(animationFrame);
    artwork.style.setProperty("--pointer-x", "0px");
    artwork.style.setProperty("--pointer-y", "0px");
  });
}
