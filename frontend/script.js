const API_BASE_URL = "https://snipurl-p2zj.onrender.com";

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
   API — Shorten
   ------------------------------------------------------- */

async function shortenUrl(originalUrl) {
  const response = await fetch(`${API_BASE_URL}/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: originalUrl }),
  });

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

  const rawValue = urlInput.value.trim();

  if (!rawValue) {
    showError("Please enter a URL.");
    urlInput.focus();
    return;
  }

  if (!isValidUrl(rawValue)) {
    showError("Please enter a valid URL starting with http:// or https://.");
    urlInput.focus();
    return;
  }

  hideElement(resultSection);
  hideElement(errorSection);
  setLoading(true);

  try {
    const shortUrl = await shortenUrl(rawValue);
    showResult(shortUrl);
    urlInput.value = "";
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      showError("Unable to reach the server. Please check your connection and try again.");
    } else {
      showError(err.message || "Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}

async function handleCopy() {
  const url = shortUrlDisplay.textContent;
  if (!url) return;

  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 2000);
  } catch {
    showError("Failed to copy. Please select the URL and copy manually.");
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
    showStatsError("Please enter a short code.");
    statsInput.focus();
    return;
  }

  hideElement(statsResultSection);
  hideElement(statsErrorSection);
  setStatsLoading(true);

  try {
    const stats = await fetchStats(rawValue);
    showStatsResult(stats);
    statsInput.value = "";
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      showStatsError("Unable to reach the server. Please check your connection and try again.");
    } else {
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
