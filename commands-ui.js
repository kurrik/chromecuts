/**
 * Shared helpers for popup + options pages.
 */

/** Preferred display order for tab-navigation commands. */
export const COMMAND_ORDER = [
  "next-tab",
  "prev-tab",
  "first-tab",
  "last-tab",
  "go-tab-1",
  "go-tab-2",
  "go-tab-3",
  "go-tab-4",
  "go-tab-5",
  "go-tab-6",
  "go-tab-7",
  "go-tab-8",
  "move-tab-left",
  "move-tab-right",
  "close-tab",
  "reopen-tab",
  "new-tab",
  "duplicate-tab",
  "pin-tab",
  "reload-tab",
  "mute-tab",
  "discard-tab",
];

export async function getCommandsSorted() {
  const commands = await chrome.commands.getAll();
  // Drop Chrome's reserved _execute_* entries from the list.
  const usable = commands.filter((c) => !c.name.startsWith("_execute"));

  const order = new Map(COMMAND_ORDER.map((name, i) => [name, i]));
  usable.sort((a, b) => {
    const ai = order.has(a.name) ? order.get(a.name) : 999;
    const bi = order.has(b.name) ? order.get(b.name) : 999;
    if (ai !== bi) return ai - bi;
    return (a.description || a.name).localeCompare(b.description || b.name);
  });
  return usable;
}

/**
 * Turn Chrome's shortcut string (e.g. "Alt+Shift+J") into friendlier labels.
 * On Mac, Chrome already uses ⌘/⌥-style in some places; we normalize.
 */
export function formatShortcut(shortcut) {
  if (!shortcut) return "Not set";

  const isMac = navigator.platform.toUpperCase().includes("MAC");

  const parts = shortcut.split("+").map((part) => {
    switch (part) {
      case "Ctrl":
        return isMac ? "⌃" : "Ctrl";
      case "Command":
      case "⌘":
        return "⌘";
      case "Alt":
        return isMac ? "⌥" : "Alt";
      case "Shift":
        return isMac ? "⇧" : "Shift";
      case "MacCtrl":
        return "⌃";
      default:
        return part.length === 1 ? part.toUpperCase() : part;
    }
  });

  return isMac ? parts.join("") : parts.join(" + ");
}

export function openShortcutsPage() {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
}
