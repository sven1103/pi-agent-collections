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

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// Tools allowed in plan (read-only) mode
const PLAN_ALLOWED_TOOLS = ["read", "grep", "find", "ls"];

// Track current mode
let planMode = false;

export default function (pi: ExtensionAPI) {

  // === Command Registration ===
  pi.registerCommand("plan", {
    description: "Toggle read-only plan mode",
    handler: async (args, ctx) => {
      const targetMode = args.trim().toLowerCase();
      
      if (targetMode === "on") {
        planMode = true;
      } else if (targetMode === "off") {
        planMode = false;
      } else {
        planMode = !planMode;
      }

      if (planMode) {
        // Restrict to read-only tools
        pi.setActiveTools(PLAN_ALLOWED_TOOLS);
        ctx.ui.setStatus("plan", "[PLAN]");
        ctx.ui.notify("Plan ON - read-only mode", "success");
        
        // Send a system message to reinforce behavior (no triggerTurn - wait for user input)
        pi.sendMessage({
          customType: "plan",
          content: "[READ-ONLY MODE] Answer questions only. Use: read, grep, find, ls. Do not modify files.",
          display: false,
        });
      } else {
        // Restore full tools
        pi.setActiveTools(["read", "bash", "edit", "write"]);
        ctx.ui.setStatus("plan", "");
        ctx.ui.notify("Plan OFF - full mode", "success");
      }
    },
  });

  // === Tool Blocking ===
  pi.on("tool_call", (event, ctx) => {
    if (!planMode) return;
    
    if (!PLAN_ALLOWED_TOOLS.includes(event.toolName)) {
      ctx.ui.notify(
        `Blocked: '${event.toolName}' not allowed in read-only mode. Type /plan off to enable.`,
        "error"
      );
      return { block: true, reason: "Plan mode active" };
    }
  });

  // === Session Start ===
  pi.on("session_start", async (_event, ctx) => {
    planMode = false;
    if (ctx.hasUI) {
      ctx.ui.notify("Tip: /plan toggles read-only mode", "info");
    }
  });
}
