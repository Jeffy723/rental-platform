export function formatCurrency(amount) {
  const numeric = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(numeric);
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

function getFlashStorageKey(scope) {
  return `flash:${scope || "global"}`;
}

export function setFlashMessage(message, type = "success", scope = "global") {
  sessionStorage.setItem(getFlashStorageKey(scope), JSON.stringify({ message, type }));
}

function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}

export function showToast(message, type = "success") {
  const stack = ensureToastStack();
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : "success"}`;
  toast.textContent = message;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

export function renderFlashMessage(scope = "global") {
  const raw = sessionStorage.getItem(getFlashStorageKey(scope));
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.message) {
      showToast(parsed.message, parsed.type || "success");
    }
  } catch (error) {
    console.error("Invalid flash message payload:", error);
  }

  sessionStorage.removeItem(getFlashStorageKey(scope));
}
