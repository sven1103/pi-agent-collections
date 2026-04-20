/**
 * Plan Toggle Extension
 *
 * Provides /plan command to toggle between full coding mode and read-only
 * question-answering mode. In plan mode, only read-only and research tools
 * are allowed.
 *
 * Usage:
 *   /plan on  - Enable read-only plan mode
 *   /plan off - Disable and return to full mode
 *   /plan     - Toggle current state
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

// Tools allowed in plan (read-only) mode
const PLAN_MODE_TOOLS = ["read", "bash", "grep", "find", "ls"];
const CUSTOM_TYPE = "plan-toggle";

// Default full toolset
const FULL_TOOLS = ["read", "bash", "edit", "write"];

export default function (pi: ExtensionAPI) {
  // In-memory state
  let planModeEnabled = false;

  // Update status bar and widget
  function updateStatus(ctx: ExtensionContext): void {
    if (planModeEnabled) {
      ctx.ui.setStatus("plan-mode", "[PLAN]");
    } else {
      ctx.ui.setStatus("plan-mode", undefined);
    }
  }

  // Persist state to session
  function persistState(): void {
    pi.appendEntry(CUSTOM_TYPE, {
      enabled: planModeEnabled,
    });
  }

  // Restore state from session entries
  function restoreState(entries: Array<{ type: string; customType?: string; data?: unknown }>): void {
    const entry = entries
      .filter((e) => e.type === "custom" && e.customType === CUSTOM_TYPE)
      .pop() as { data?: { enabled: boolean } } | undefined;

    if (entry?.data?.enabled !== undefined) {
      planModeEnabled = entry.data.enabled;
    }
  }

  function isPlanMode(): boolean {
    return planModeEnabled;
  }

  function setPlanMode(value: boolean, ctx?: ExtensionContext): void {
    planModeEnabled = value;
    if (value) {
      pi.setActiveTools(PLAN_MODE_TOOLS);
    } else {
      pi.setActiveTools(FULL_TOOLS);
    }
    if (ctx) {
      updateStatus(ctx);
    }
    persistState();
  }

  // === Command Registration ===
  pi.registerCommand("plan", {
    description: "Toggle read-only plan mode",
    handler: async (args, ctx) => {
      const targetMode = args.trim().toLowerCase();
      const currentMode = isPlanMode();

      // Determine new mode
      let newMode: boolean;
      if (targetMode === "on") {
        newMode = true;
      } else if (targetMode === "off") {
        newMode = false;
      } else {
        newMode = !currentMode;
      }

      // Only update if mode actually changed
      if (newMode === currentMode) {
        ctx.ui.notify(`Plan mode already ${newMode ? "ON" : "OFF"}`, "info");
        return;
      }

      // Apply new mode
      setPlanMode(newMode, ctx);

      if (newMode) {
        ctx.ui.notify("Plan ON - read-only mode", "success");

        // Send system message to inform LLM about plan mode
        pi.sendMessage({
          customType: "plan-mode",
          content: "[READ-ONLY MODE] Answer questions only. Available tools: read, bash, grep, find, ls. Do not modify files.",
          display: false,
        }, { triggerTurn: false });
      } else {
        ctx.ui.notify("Plan OFF - full mode", "success");
      }
    },
  });

  // === Tool Blocking ===
  // Block write tools in plan mode - but don't block completely, just restrict
  // This avoids stuck sessions by allowing the agent to continue with a notification
  pi.on("tool_call", async (event, ctx) => {
    if (!isPlanMode()) return;

    // Only block write tools (edit, write) - let read-only tools through
    if (!PLAN_MODE_TOOLS.includes(event.toolName)) {
      // Notify the user
      ctx.ui.notify(
        `Blocked: '${event.toolName}' not allowed in read-only mode. Type /plan off to enable.`,
        "error"
      );
      
      // Block the tool execution
      return { block: true, reason: "Plan mode active - write tools are disabled in read-only mode" };
    }
  });

  // === Session Start ===
  pi.on("session_start", async (_event, ctx) => {
    // Restore persisted state from session
    const entries = ctx.sessionManager.getEntries();
    restoreState(entries);

    // Sync agent state with restored mode
    if (isPlanMode()) {
      pi.setActiveTools(PLAN_MODE_TOOLS);
      updateStatus(ctx);
    }
  });

  // === Turn End: Persist state after each turn ===
  pi.on("turn_end", async () => {
    persistState();
  });

  // === Session Shutdown (cleanup if needed) ===
  pi.on("session_shutdown", async () => {
    // Ensure final state is persisted
    persistState();
  });
}
