/**
 * ChromeCuts — service worker
 * Handles keyboard commands for tab navigation and management.
 */

const GO_TAB = /^go-tab-(\d+)$/;

chrome.commands.onCommand.addListener(async (command) => {
  try {
    await handleCommand(command);
  } catch (err) {
    console.error(`ChromeCuts: failed on "${command}"`, err);
  }
});

async function handleCommand(command) {
  const goMatch = command.match(GO_TAB);
  if (goMatch) {
    await activateTabByIndex(Number(goMatch[1]) - 1);
    return;
  }

  switch (command) {
    case "next-tab":
      await cycleTab(1);
      break;
    case "prev-tab":
      await cycleTab(-1);
      break;
    case "first-tab":
      await activateTabByIndex(0);
      break;
    case "last-tab":
      await activateLastTab();
      break;
    case "close-tab":
      await closeActiveTab();
      break;
    case "reopen-tab":
      await reopenClosedTab();
      break;
    case "move-tab-left":
      await moveActiveTab(-1);
      break;
    case "move-tab-right":
      await moveActiveTab(1);
      break;
    case "duplicate-tab":
      await duplicateActiveTab();
      break;
    case "pin-tab":
      await togglePinActiveTab();
      break;
    case "new-tab":
      await chrome.tabs.create({});
      break;
    case "reload-tab":
      await reloadActiveTab();
      break;
    case "mute-tab":
      await toggleMuteActiveTab();
      break;
    case "discard-tab":
      await discardActiveTab();
      break;
    default:
      console.warn(`ChromeCuts: unknown command "${command}"`);
  }
}

async function getWindowTabs() {
  const win = await chrome.windows.getCurrent({ populate: false });
  return chrome.tabs.query({ windowId: win.id });
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

/** Cycle tabs in the current window (wraps around). */
async function cycleTab(delta) {
  const tabs = await getWindowTabs();
  if (tabs.length === 0) return;

  const activeIndex = tabs.findIndex((t) => t.active);
  if (activeIndex < 0) return;

  const nextIndex = (activeIndex + delta + tabs.length) % tabs.length;
  await chrome.tabs.update(tabs[nextIndex].id, { active: true });
}

/** Activate tab by 0-based index in the current window. */
async function activateTabByIndex(index) {
  const tabs = await getWindowTabs();
  if (index < 0 || index >= tabs.length) return;
  await chrome.tabs.update(tabs[index].id, { active: true });
}

async function activateLastTab() {
  const tabs = await getWindowTabs();
  if (tabs.length === 0) return;
  await chrome.tabs.update(tabs[tabs.length - 1].id, { active: true });
}

async function closeActiveTab() {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  await chrome.tabs.remove(tab.id);
}

async function reopenClosedTab() {
  // Prefer sessions API (restores full session state when available).
  const sessions = await chrome.sessions.getRecentlyClosed({ maxResults: 1 });
  const session = sessions[0];
  if (!session) return;

  if (session.tab?.sessionId) {
    await chrome.sessions.restore(session.tab.sessionId);
  } else if (session.window?.sessionId) {
    await chrome.sessions.restore(session.window.sessionId);
  }
}

async function moveActiveTab(delta) {
  const tab = await getActiveTab();
  if (!tab?.id || tab.index == null) return;

  const tabs = await getWindowTabs();
  const newIndex = Math.max(0, Math.min(tabs.length - 1, tab.index + delta));
  if (newIndex === tab.index) return;

  await chrome.tabs.move(tab.id, { index: newIndex });
}

async function duplicateActiveTab() {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  await chrome.tabs.duplicate(tab.id);
}

async function togglePinActiveTab() {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  await chrome.tabs.update(tab.id, { pinned: !tab.pinned });
}

async function reloadActiveTab() {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  await chrome.tabs.reload(tab.id);
}

async function toggleMuteActiveTab() {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  const muted = tab.mutedInfo?.muted ?? false;
  await chrome.tabs.update(tab.id, { muted: !muted });
}

/** Suspend tab to free memory (Chrome discard). */
async function discardActiveTab() {
  const tab = await getActiveTab();
  if (!tab?.id || tab.active === false) return;
  // Don't discard the only tab or chrome:// pages that can't be discarded cleanly.
  try {
    await chrome.tabs.discard(tab.id);
  } catch {
    // discard can fail on special pages; ignore
  }
}
