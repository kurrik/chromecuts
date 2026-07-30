import {
  formatShortcut,
  getCommandsSorted,
  openShortcutsPage,
} from "./commands-ui.js";

const rowsEl = document.getElementById("command-rows");
const statsEl = document.getElementById("stats");
const openBtn = document.getElementById("open-shortcuts");
const reloadBtn = document.getElementById("reload-list");

async function render() {
  const commands = await getCommandsSorted();
  const bound = commands.filter((c) => c.shortcut).length;

  statsEl.textContent = `${bound} / ${commands.length} bound`;
  statsEl.className = bound === 0 ? "badge warn" : "badge";

  rowsEl.innerHTML = commands
    .map((c) => {
      const shortcut = c.shortcut
        ? `<span class="kbd">${escapeHtml(formatShortcut(c.shortcut))}</span>`
        : `<span class="kbd unset">Not set</span>`;
      return `
        <tr>
          <td>${escapeHtml(c.description || c.name)}</td>
          <td>${shortcut}</td>
          <td class="id">${escapeHtml(c.name)}</td>
        </tr>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

openBtn.addEventListener("click", openShortcutsPage);
reloadBtn.addEventListener("click", render);

render();
