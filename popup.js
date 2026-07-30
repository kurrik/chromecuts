import { formatShortcut, getCommandsSorted } from "./commands-ui.js";

const listEl = document.getElementById("shortcut-list");
const boundCountEl = document.getElementById("bound-count");
const openShortcutsBtn = document.getElementById("open-shortcuts");
const openOptionsBtn = document.getElementById("open-options");

async function render() {
  const commands = await getCommandsSorted();
  const bound = commands.filter((c) => c.shortcut);

  boundCountEl.textContent = `${bound.length} bound`;

  if (bound.length === 0) {
    listEl.innerHTML =
      '<li class="empty">No shortcuts bound yet. Click “Remap keys” to assign them.</li>';
    return;
  }

  listEl.innerHTML = bound
    .map(
      (c) => `
      <li>
        <span class="desc">${escapeHtml(c.description || c.name)}</span>
        <span class="kbd">${escapeHtml(formatShortcut(c.shortcut))}</span>
      </li>`
    )
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

openShortcutsBtn.addEventListener("click", () => {
  // Opens Chrome's built-in shortcut remapper for this extension.
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

openOptionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

render();
