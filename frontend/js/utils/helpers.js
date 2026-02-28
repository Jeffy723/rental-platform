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
  sessionStorage.setItem(
    getFlashStorageKey(scope),
    JSON.stringify({
      message,
      type
    })
  );
}

export function showToast(message, type = "success") {

  const toast = document.createElement("div");
  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.background = type === "error" ? "#dc2626" : "#16a34a";
  toast.style.color = "#ffffff";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
  toast.style.zIndex = "9999";
  toast.style.fontSize = "14px";

  document.body.appendChild(toast);

  // remove after 2 seconds
  setTimeout(() => {
    toast.remove();
  }, 2000);
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