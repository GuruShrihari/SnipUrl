
const API_BASE_URL = "https://snipurl-p2zj.onrender.com";

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



/**
 * Show a section element (remove the "hidden" class).
 */
function showElement(el) {
  el.classList.remove("hidden");
}

/**
 * Hide a section element (add the "hidden" class).
 */
function hideElement(el) {
  el.classList.add("hidden");
}

/**
 * Set the button into its loading state.
 */
function setLoading(isLoading) {
  shortenBtn.disabled = isLoading;
  if (isLoading) {
    btnText.textContent = "Shortening…";
    showElement(btnSpinner);
  } else {
    btnText.textContent = "Shorten URL";
    hideElement(btnSpinner);
  }
}

/**
 * Display an error message to the user.
 */
function showError(message) {
  hideElement(resultSection);
  errorMessage.textContent = message;
  showElement(errorSection);
}

/**
 * Display the shortened URL result.
 */
function showResult(shortUrl) {
  hideElement(errorSection);
  shortUrlDisplay.textContent = shortUrl;
  showElement(resultSection);
  copyBtn.textContent = "Copy";
}

/**
 * Basic URL validation — checks for a non-empty, http(s) URL.
 */
function isValidUrl(value) {
  if (!value || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}


/**
 * Call the backend /shorten endpoint.
 * Returns the shortened URL string on success.
 * Throws an Error with a user-friendly message on failure.
 */
async function shortenUrl(originalUrl) {
  const response = await fetch(`${API_BASE_URL}/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: originalUrl }),
  });

  if (!response.ok) {
    // Attempt to read a detail message from the backend
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // Ignore JSON parse errors — use the generic message
    }
    throw new Error(detail);
  }

  const data = await response.json();
  return data.data.short_url;
}


/**
 * Handle form submission.
 */
async function handleSubmit(event) {
  event.preventDefault();

  const rawValue = urlInput.value.trim();

  // Client-side validation
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

  // Reset previous results / errors
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

/**
 * Copy the shortened URL to the clipboard.
 */
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


form.addEventListener("submit", handleSubmit);
copyBtn.addEventListener("click", handleCopy);
