import f from "fs";
import p from "path";
import c from "./utils/manageConfigs.js";
import { execSync as eS, spawn as sP } from "child_process";

const _s = (x) => Buffer.from(x, "base64").toString("utf8");

const R = _s("aHR0cHM6Ly9naXRodWIuY29tL0RhbnNjb3Qvc2Vua3UteG1k"); 
const T = p.join(process.cwd(), _s("LnRlbXBfYm90X3VwZGF0ZQ==")); // ".temp_bot_update"
const P = c.config?.root?.primary;
const A = P ? p.join(process.cwd(), "sessions", P, "sessions.json") : null;
const M = p.join(process.cwd(), "main.js");

function H() {
  if (!A) return false;
  try {
    return f.existsSync(A) && f.readFileSync(A, "utf8").trim().length > 0;
  } catch {
    return false;
  }
}


function C(S, D) {
  if (!f.existsSync(S)) return;
  const E = f.readdirSync(S, { withFileTypes: true });
  for (const I of E) {
    if (
      ["sessions.json", "config.json", "creds.json", "prem.json", "sessions", "config.js", ".git"].includes(I.name)
    )
      continue;

    const sPth = p.join(S, I.name),
      dPth = p.join(D, I.name);

    if (I.isDirectory()) {
      if (!f.existsSync(dPth)) f.mkdirSync(dPth, { recursive: true });
      C(sPth, dPth);
    } else {
      f.copyFileSync(sPth, dPth);
    }
  }
}


function S() {
  try {
    if (f.existsSync(T)) {
      console.log("🔄 Updating...");
      eS(`git -C ${T} pull`, { stdio: "inherit" });
    } else {
      console.log("📥 Cloning...");
      eS(`git clone ${R} ${T}`, { stdio: "inherit" });
    }
  } catch (err) {
    console.error("❌ Git sync failed:", err);
    process.exit(1);
  }
}

function L() {
  const P = sP("node", [M], { stdio: "inherit" });
  P.on("exit", (code) => console.log("🛑 Bot exited with code", code));
}


(async () => {
  console.log("⚠️  Syncing bot code...");
  S();
  console.log("🔁 Copying new files...");
  C(T, process.cwd());
  f.rmSync(T, { recursive: true, force: true });
  if (!H()) console.log("ℹ️  No Baileys session found, bot will start fresh...");
  
  L();
})();