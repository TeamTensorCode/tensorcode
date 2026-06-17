// Pyodide loader + test runner. Loads Pyodide from the CDN on first use,
// installs numpy, then executes user code against a list of test cases.

import type { TestCase } from "./problem-tests";

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideAPI>;
    __pyodidePromise?: Promise<PyodideAPI>;
  }
}

type PyodideAPI = {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (pkg: string | string[]) => Promise<void>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  globals: { set: (k: string, v: unknown) => void };
};

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("pyodide script failed")));
      // already loaded
      if ((existing as HTMLScriptElement).dataset.loaded === "true") resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = "true";
      resolve();
    };
    s.onerror = () => reject(new Error("pyodide script failed"));
    document.head.appendChild(s);
  });
}

export async function getPyodide(onStatus?: (s: string) => void): Promise<PyodideAPI> {
  if (typeof window === "undefined") throw new Error("Pyodide only runs in the browser");
  if (window.__pyodidePromise) return window.__pyodidePromise;
  window.__pyodidePromise = (async () => {
    onStatus?.("Loading Python runtime…");
    await loadScript(`${PYODIDE_BASE}pyodide.js`);
    const pyodide = await window.loadPyodide!({ indexURL: PYODIDE_BASE });
    onStatus?.("Loading numpy…");
    await pyodide.loadPackage("numpy");
    onStatus?.("Ready");
    return pyodide;
  })();
  return window.__pyodidePromise;
}

export type TestResult = {
  name: string;
  call: string;
  ok: boolean;
  expected?: string;
  actual?: string;
  error?: string;
};

export type RunOutcome = {
  stdout: string;
  stderr: string;
  compileError?: string;
  results: TestResult[];
};

const HARNESS = `
import json, traceback, numpy as np

def __run(user_code, cases_json):
    ns = {'np': np}
    out = {'compile_error': None, 'results': []}
    try:
        exec(user_code, ns)
    except Exception:
        out['compile_error'] = traceback.format_exc()
        return json.dumps(out)
    cases = json.loads(cases_json)
    for case in cases:
        rec = {'name': case['name'], 'call': case['call'], 'ok': False}
        try:
            result = eval(case['call'], ns)
            rec['actual'] = repr(result)
            if case.get('check'):
                check_ns = dict(ns); check_ns['result'] = result
                rec['ok'] = bool(eval(case['check'], check_ns))
                rec['expected'] = case['check']
            else:
                expected = eval(case['expected'], ns)
                rec['expected'] = repr(expected)
                tol = float(case.get('tol') or 1e-5)
                if isinstance(expected, (int, float, np.floating, np.integer)):
                    rec['ok'] = abs(float(result) - float(expected)) <= tol
                elif isinstance(expected, tuple):
                    rec['ok'] = all(np.allclose(np.asarray(a), np.asarray(e), atol=tol) for a, e in zip(result, expected))
                else:
                    rec['ok'] = bool(np.allclose(np.asarray(result), np.asarray(expected), atol=tol))
        except Exception:
            rec['error'] = traceback.format_exc()
        out['results'].append(rec)
    return json.dumps(out)
`;

export async function runUserCode(
  userCode: string,
  cases: TestCase[],
  onStatus?: (s: string) => void,
): Promise<RunOutcome> {
  const pyodide = await getPyodide(onStatus);
  let stdout = "";
  let stderr = "";
  pyodide.setStdout({ batched: (s: string) => (stdout += s + "\n") });
  pyodide.setStderr({ batched: (s: string) => (stderr += s + "\n") });
  pyodide.globals.set("__user_code", userCode);
  pyodide.globals.set("__cases_json", JSON.stringify(cases));
  const raw = (await pyodide.runPythonAsync(
    `${HARNESS}\n__run(__user_code, __cases_json)`,
  )) as string;
  const parsed = JSON.parse(raw) as { compile_error: string | null; results: TestResult[] };
  return {
    stdout,
    stderr,
    compileError: parsed.compile_error ?? undefined,
    results: parsed.results,
  };
}
