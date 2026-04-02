// updater.ts — Client auto-update service.
// Uses custom Tauri commands that build the updater with a dynamic server URL
// at runtime (required because OwnCord is self-hosted).

import { invoke } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { createLogger } from "@lib/logger";

const log = createLogger("updater");

export interface UpdateCheckResult {
  readonly available: boolean;
  readonly version: string | null;
  readonly body: string | null;
}

/** Check if a newer client version is available on the connected server. */
export async function checkForUpdate(serverUrl: string): Promise<UpdateCheckResult> {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    return { available: false, version: null, body: null };
  }
  try {
    const result = await invoke<UpdateCheckResult>("check_client_update", {
      serverUrl,
    });
    if (result.available) {
      log.info("Update available", { version: result.version });
    } else {
      log.debug("No update available");
    }
    return result;
  } catch (err) {
    log.error("Update check failed", { error: String(err) });
    return { available: false, version: null, body: null };
  }
}

/** Download and install a pending update, then relaunch the app. */
export async function downloadAndInstallUpdate(serverUrl: string): Promise<void> {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    return;
  }
  log.info("Downloading and installing update...");
  await invoke("download_and_install_update", { serverUrl });
  log.info("Update installed, relaunching...");
  await relaunch();
}
