const API_BASE_URL = "https://snipurl-p2zj.onrender.com";

/* -------------------------------------------------------
   Toast notification system
   ------------------------------------------------------- */

const toastContainer = document.getElementById("toast-container");

const TOAST_ICONS = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const TOAST_DEFAULTS = {
  duration: 4000,
};

/**
 * Show a toast notification.
 * @param {"success"|"error"|"warning"|"info"} type
 * @param {string} title
 * @param {string} [message]
 * @param {{ duration?: number }} [options]
 */
function showToast(type, title, message = "", options = {}) {
  const duration = options.duration ?? TOAST_DEFAULTS.duration;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "alert");

  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type]}</span>
    <div class="toast-body">
      <p class="toast-title">${title}</p>
      ${message ? `<p class="toast-message">${message}</p>` : ""}
    </div>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
    <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
  `;

  // Close button
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => dismissToast(toast));

  toastContainer.appendChild(toast);

  // Auto-dismiss
  const timer = setTimeout(() => dismissToast(toast), duration);
  toast._timer = timer;
}

function dismissToast(toast) {
  if (toast._dismissed) return;
  toast._dismissed = true;
  clearTimeout(toast._timer);
  toast.classList.add("toast-exit");
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
}

/* -------------------------------------------------------
   Shorten page elements (may be null on stats.html)
   ------------------------------------------------------- */
const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const shortenBtn = document.getElementById("shorten-btn");
const btnText = document.getElementById("btn-text");
const btnSpinner = document.getElementById("btn-spinner");
const resultSection = document.getElementById("result-section");
const shortUrlDisplay = document.getElementById("short-url-display");
const copyBtn = document.getElementById("copy-btn");
const errorSection = document.getElementById("error-section");
const errorMessage = document.getElementById("error-message");

/* Custom code elements */
const customCodeToggle = document.getElementById("custom-code-toggle");
const customCodeRow = document.getElementById("custom-code-row");
const customCodeInput = document.getElementById("custom-code-input");
const customCodeCounter = document.getElementById("custom-code-counter");
const toggleIcon = document.getElementById("toggle-icon");
const toggleText = document.getElementById("toggle-text");

/* -------------------------------------------------------
   Stats page elements (may be null on index.html)
   ------------------------------------------------------- */
const statsForm = document.getElementById("stats-form");
const statsInput = document.getElementById("stats-input");
const statsBtn = document.getElementById("stats-btn");
const statsBtnText = document.getElementById("stats-btn-text");
const statsBtnSpinner = document.getElementById("stats-btn-spinner");
const statsResultSection = document.getElementById("stats-result-section");
const statsOriginalUrl = document.getElementById("stats-original-url");
const statsShortCode = document.getElementById("stats-short-code");
const statsClicks = document.getElementById("stats-clicks");
const statsCreated = document.getElementById("stats-created");
const statsErrorSection = document.getElementById("stats-error-section");
const statsErrorMessage = document.getElementById("stats-error-message");

/* -------------------------------------------------------
   Helpers
   ------------------------------------------------------- */

function showElement(el) {
  if (el) el.classList.remove("hidden");
}

function hideElement(el) {
  if (el) el.classList.add("hidden");
}

function setLoading(isLoading) {
  if (!shortenBtn) return;
  shortenBtn.disabled = isLoading;
  if (isLoading) {
    btnText.textContent = "Shortening…";
    showElement(btnSpinner);
  } else {
    btnText.textContent = "Shorten";
    hideElement(btnSpinner);
  }
}

function showError(message) {
  hideElement(resultSection);
  if (errorMessage) errorMessage.textContent = message;
  showElement(errorSection);
}

function showResult(shortUrl) {
  hideElement(errorSection);
  if (shortUrlDisplay) shortUrlDisplay.textContent = shortUrl;
  showElement(resultSection);
  if (copyBtn) copyBtn.textContent = "Copy";
}

function isValidUrl(value) {
  if (!value || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/* -------------------------------------------------------
   Custom code — toggle, validation, character counter
   ------------------------------------------------------- */

const CUSTOM_CODE_REGEX = /^[a-zA-Z0-9_-]+$/;
const CUSTOM_CODE_MIN = 6;
const CUSTOM_CODE_MAX = 30;
let customCodeOpen = false;

function toggleCustomCode() {
  customCodeOpen = !customCodeOpen;

  if (customCodeOpen) {
    showElement(customCodeRow);
    toggleIcon.classList.add("open");
    toggleText.textContent = "Remove custom code";
    customCodeInput.focus();
  } else {
    hideElement(customCodeRow);
    toggleIcon.classList.remove("open");
    toggleText.textContent = "Use a custom short code";
    customCodeInput.value = "";
    customCodeInput.classList.remove("invalid");
    updateCharCounter();
  }
}

function updateCharCounter() {
  if (!customCodeInput || !customCodeCounter) return;
  const len = customCodeInput.value.length;
  customCodeCounter.textContent = `${len} / ${CUSTOM_CODE_MAX}`;

  customCodeCounter.classList.remove("warn", "over");
  if (len > CUSTOM_CODE_MAX) {
    customCodeCounter.classList.add("over");
  } else if (len >= CUSTOM_CODE_MAX - 5) {
    customCodeCounter.classList.add("warn");
  }
}

/**
 * Validate the custom code value.
 * Returns null if valid (or empty), or an error message string.
 */
function validateCustomCode(value) {
  if (!value) return null; // empty is fine — means "no custom code"

  if (value.length < CUSTOM_CODE_MIN) {
    return `Custom code must be at least ${CUSTOM_CODE_MIN} characters.`;
  }
  if (value.length > CUSTOM_CODE_MAX) {
    return `Custom code must be at most ${CUSTOM_CODE_MAX} characters.`;
  }
  if (!CUSTOM_CODE_REGEX.test(value)) {
    return "Custom code can only contain letters, numbers, hyphens, and underscores.";
  }
  return null;
}

/* -------------------------------------------------------
   Rate-limit cooldown
   ------------------------------------------------------- */

let cooldownTimer = null;

/**
 * Put the shorten button into a cooldown state with a
 * live countdown. The button shows "Wait Xs…" and has a
 * shrinking progress bar at the bottom.
 */
function startCooldown(seconds) {
  if (!shortenBtn || !btnText) return;

  // Clear any existing cooldown
  if (cooldownTimer) clearInterval(cooldownTimer);

  let remaining = seconds;

  shortenBtn.disabled = true;
  shortenBtn.classList.add("cooldown");
  shortenBtn.style.setProperty("--cooldown-duration", `${seconds}s`);

  // Dynamic ::after animation duration
  shortenBtn.style.animationDuration = `${seconds}s`;
  // Force re-trigger by removing and re-adding the class
  shortenBtn.classList.remove("cooldown");
  void shortenBtn.offsetWidth; // reflow
  shortenBtn.classList.add("cooldown");

  hideElement(btnSpinner);
  btnText.textContent = `Wait ${remaining}s…`;

  cooldownTimer = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      shortenBtn.disabled = false;
      shortenBtn.classList.remove("cooldown");
      btnText.textContent = "Shorten";
    } else {
      btnText.textContent = `Wait ${remaining}s…`;
    }
  }, 1000);
}

/* -------------------------------------------------------
   Custom error classes
   ------------------------------------------------------- */

class RateLimitError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
  }
}

class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

/* -------------------------------------------------------
   API — Shorten (with custom code + rate-limit awareness)
   ------------------------------------------------------- */

async function shortenUrl(originalUrl, customCode = null) {
  const payload = { url: originalUrl };
  if (customCode) {
    payload.custom_code = customCode;
  }

  const response = await fetch(`${API_BASE_URL}/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get("Retry-After"), 10) || 60;
    let detail = "Too many requests. Please slow down.";
    try {
      const body = await response.json();
      if (body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore parse errors
    }
    throw new RateLimitError(detail, retryAfter);
  }

  if (response.status === 409) {
    let detail = "This custom code is already taken.";
    try {
      const body = await response.json();
      if (body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore
    }
    throw new ConflictError(detail);
  }

  if (response.status === 400) {
    let detail = "Invalid request.";
    try {
      const body = await response.json();
      if (body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore
    }
    throw new BadRequestError(detail);
  }

  if (response.status === 422) {
    let detail = "Validation error.";
    let details = [];
    try {
      const body = await response.json();
      if (body.detail && Array.isArray(body.detail)) {
        details = body.detail;
        detail = body.detail.map((d) => d.msg || d).join("; ");
      } else if (body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore
    }
    throw new ValidationError(detail, details);
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  const data = await response.json();
  return data.data.short_url;
}

/* -------------------------------------------------------
   API — Stats
   ------------------------------------------------------- */

async function fetchStats(shortCode) {
  const response = await fetch(`${API_BASE_URL}/stats/${encodeURIComponent(shortCode)}`);

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get("Retry-After"), 10) || 60;
    let detail = "Too many requests. Please slow down.";
    try {
      const body = await response.json();
      if (body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore
    }
    throw new RateLimitError(detail, retryAfter);
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  const data = await response.json();
  return data.data;
}

/* -------------------------------------------------------
   Handlers — Shorten
   ------------------------------------------------------- */

async function handleSubmit(event) {
  event.preventDefault();

  // Block if in cooldown
  if (shortenBtn && shortenBtn.classList.contains("cooldown")) return;

  const rawValue = urlInput.value.trim();

  if (!rawValue) {
    showToast("warning", "Missing URL", "Please enter a URL to shorten.");
    urlInput.focus();
    return;
  }

  if (!isValidUrl(rawValue)) {
    showToast("warning", "Invalid URL", "Please enter a valid URL starting with http:// or https://.");
    urlInput.focus();
    return;
  }

  // Validate custom code (if the section is open and has a value)
  let customCode = null;
  if (customCodeOpen && customCodeInput) {
    const codeValue = customCodeInput.value.trim();
    if (codeValue) {
      const codeError = validateCustomCode(codeValue);
      if (codeError) {
        showToast("warning", "Invalid custom code", codeError);
        customCodeInput.classList.add("invalid");
        customCodeInput.focus();
        return;
      }
      customCodeInput.classList.remove("invalid");
      customCode = codeValue;
    }
  }

  hideElement(resultSection);
  hideElement(errorSection);
  setLoading(true);

  try {
    const shortUrl = await shortenUrl(rawValue, customCode);
    showResult(shortUrl);

    if (customCode) {
      showToast("success", "Custom URL created!", `Your branded link with code "${customCode}" is ready.`);
    } else {
      showToast("success", "URL shortened!", "Your short link is ready to copy and share.");
    }

    urlInput.value = "";
    // Reset custom code section
    if (customCodeOpen) {
      toggleCustomCode();
    }
  } catch (err) {
    if (err instanceof RateLimitError) {
      showToast(
        "error",
        "Rate limit reached",
        "You've hit the request limit. Please wait before trying again.",
        { duration: 6000 }
      );
      startCooldown(err.retryAfter);
    } else if (err instanceof ConflictError) {
      showToast(
        "warning",
        "Code already taken",
        "This custom code is already in use. Please choose a different one.",
        { duration: 5000 }
      );
      if (customCodeInput) {
        customCodeInput.classList.add("invalid");
        customCodeInput.focus();
        customCodeInput.select();
      }
    } else if (err instanceof BadRequestError) {
      showToast(
        "warning",
        "Reserved code",
        err.message || "This custom code is reserved and cannot be used.",
        { duration: 5000 }
      );
      if (customCodeInput) {
        customCodeInput.classList.add("invalid");
        customCodeInput.focus();
      }
    } else if (err instanceof ValidationError) {
      showToast("warning", "Validation error", err.message, { duration: 5000 });
    } else if (err instanceof TypeError && err.message === "Failed to fetch") {
      showToast("error", "Connection failed", "Unable to reach the server. Please check your connection.");
      showError("Unable to reach the server. Please check your connection and try again.");
    } else {
      showToast("error", "Error", err.message || "Something went wrong.");
      showError(err.message || "Something went wrong. Please try again.");
    }
  } finally {
    // Only reset loading state if not in cooldown
    if (!shortenBtn || !shortenBtn.classList.contains("cooldown")) {
      setLoading(false);
    }
  }
}

async function handleCopy() {
  const url = shortUrlDisplay.textContent;
  if (!url) return;

  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = "Copied!";
    showToast("success", "Copied!", "Short URL copied to clipboard.");
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 2000);
  } catch {
    showToast("error", "Copy failed", "Please select the URL and copy it manually.");
  }
}

/* -------------------------------------------------------
   Handlers — Stats
   ------------------------------------------------------- */

function setStatsLoading(isLoading) {
  if (!statsBtn) return;
  statsBtn.disabled = isLoading;
  if (isLoading) {
    statsBtnText.textContent = "Loading…";
    showElement(statsBtnSpinner);
  } else {
    statsBtnText.textContent = "Look up";
    hideElement(statsBtnSpinner);
  }
}

function showStatsError(message) {
  hideElement(statsResultSection);
  if (statsErrorMessage) statsErrorMessage.textContent = message;
  showElement(statsErrorSection);
}

function showStatsResult(stats) {
  hideElement(statsErrorSection);

  statsOriginalUrl.textContent = stats.original_url;
  statsOriginalUrl.href = stats.original_url;
  statsShortCode.textContent = stats.short_code;
  statsClicks.textContent = stats.clicks;

  const date = new Date(stats.created_at);
  statsCreated.textContent = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  showElement(statsResultSection);
}

async function handleStatsSubmit(event) {
  event.preventDefault();

  const rawValue = statsInput.value.trim();

  if (!rawValue) {
    showToast("warning", "Missing short code", "Please enter a short code to look up.");
    statsInput.focus();
    return;
  }

  hideElement(statsResultSection);
  hideElement(statsErrorSection);
  setStatsLoading(true);

  try {
    const stats = await fetchStats(rawValue);
    showStatsResult(stats);
    showToast("success", "Stats loaded", `Found stats for code "${rawValue}".`);
    statsInput.value = "";
  } catch (err) {
    if (err instanceof RateLimitError) {
      showToast(
        "error",
        "Rate limit reached",
        "You've hit the request limit. Please wait before trying again.",
        { duration: 6000 }
      );
      showStatsError("Too many requests. Please wait a moment before trying again.");
    } else if (err instanceof TypeError && err.message === "Failed to fetch") {
      showToast("error", "Connection failed", "Unable to reach the server.");
      showStatsError("Unable to reach the server. Please check your connection and try again.");
    } else {
      showToast("error", "Not found", err.message || "Something went wrong.");
      showStatsError(err.message || "Something went wrong. Please try again.");
    }
  } finally {
    setStatsLoading(false);
  }
}

/* -------------------------------------------------------
   Init — bind only what exists on the current page
   ------------------------------------------------------- */

if (form) form.addEventListener("submit", handleSubmit);
if (copyBtn) copyBtn.addEventListener("click", handleCopy);
if (statsForm) statsForm.addEventListener("submit", handleStatsSubmit);

// Custom code toggle + character counter
if (customCodeToggle) {
  customCodeToggle.addEventListener("click", toggleCustomCode);
}
if (customCodeInput) {
  customCodeInput.addEventListener("input", () => {
    updateCharCounter();
    // Clear invalid state on typing
    customCodeInput.classList.remove("invalid");
  });
}
