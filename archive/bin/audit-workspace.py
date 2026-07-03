#!/usr/bin/env python3
"""Audit the workspace.no-internal-alloc debt with per-module classification.

Reads a gate JSON dump and reports each violator with:
  - tier (fallback / no-param / complex)
  - allocations (line, type, size expression)
  - whether base.js has a WORK param already
  - whether tests pass null/0-sized WORK (forcing-fallback pattern)
  - a one-line action plan

This is informational only. See bin/fix-workspace.py for the codemod that
handles the simplest "fallback" tier mechanically.

Usage:
  python bin/audit-workspace.py                  # all violators
  python bin/audit-workspace.py --tier fallback  # filter
  python bin/audit-workspace.py --json           # machine-readable
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parent.parent

ALLOC_RE = re.compile(
    r"(?P<lhs>\b\w+)\s*=\s*new\s+(?P<ctor>Float64Array|Float32Array|Complex128Array|Complex64Array|Int32Array|Uint8Array)\s*\(\s*(?P<size>[^)]+?)\s*\)"
)
WORK_PARAM_RE = re.compile(
    r"function\s+\w+\s*\(([^)]*)\)", re.IGNORECASE
)


def find_violators(json_path: Path) -> List[str]:
    data = json.loads(json_path.read_text())
    mods = []
    for m in data.get("modules", []):
        for c in m.get("checks", []) or []:
            if c.get("status") == "fail" and c.get("id") == "workspace.no-internal-alloc":
                mods.append(m["module"])
                break
    return mods


def classify(module_dir: Path) -> dict:
    info = {
        "module": str(module_dir.relative_to(ROOT)),
        "tier": "unknown",
        "params": [],
        "has_work_param": False,
        "allocations": [],
        "has_fallback_block": False,
        "test_passes_null": False,
        "action": "",
    }
    base_path = module_dir / "lib" / "base.js"
    if not base_path.exists():
        info["action"] = "no base.js"
        return info
    src = base_path.read_text()

    m = WORK_PARAM_RE.search(src)
    if m:
        params = [p.strip().split()[0] for p in m.group(1).split(",") if p.strip()]
        info["params"] = params
        info["has_work_param"] = any(p.upper() in ("WORK", "RWORK", "IWORK") for p in params)

    # Collect allocations (skip scalar temps size <= 8 bare numeric)
    for i, line in enumerate(src.split("\n"), 1):
        if "//" in line.split("'")[0]:  # crude comment skip
            stripped = line.strip()
            if stripped.startswith("//") or stripped.startswith("*"):
                continue
        am = ALLOC_RE.search(line)
        if not am:
            continue
        size = am.group("size").strip()
        if size.isdigit() and int(size) <= 8:
            continue
        info["allocations"].append({
            "line": i,
            "lhs": am.group("lhs"),
            "ctor": am.group("ctor"),
            "size": size,
        })

    # Detect fallback block presence
    fallback_pat = re.compile(
        r"if\s*\(\s*(?:!\s*WORK\b|WORK\s*===?\s*null\b|WORK\s*\.\s*length\s*<)",
        re.IGNORECASE,
    )
    info["has_fallback_block"] = bool(fallback_pat.search(src))

    # Detect tests passing null for WORK
    test_dir = module_dir / "test"
    if test_dir.exists():
        for tf in test_dir.glob("test*.js"):
            t = tf.read_text()
            if re.search(r"\bnull\s*,\s*\d+\s*,\s*0", t) or re.search(r"new Float64Array\(\s*0\s*\)", t):
                info["test_passes_null"] = True
                break

    # Classify
    if info["has_fallback_block"]:
        info["tier"] = "fallback"
    elif info["has_work_param"]:
        info["tier"] = "complex"  # has WORK but allocates inline (not fallback shape)
    else:
        info["tier"] = "no-param"

    # Action
    if info["tier"] == "fallback":
        if info["test_passes_null"]:
            info["action"] = "Run bin/fix-workspace.py + update tests (they pass null WORK)"
        else:
            info["action"] = "Run bin/fix-workspace.py; tests likely OK"
    elif info["tier"] == "no-param":
        info["action"] = "Manual: add work/strideWork/offsetWork params + partition existing allocations"
    else:
        info["action"] = "Manual: review allocation shape (not a recognized fallback)"

    return info


def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--gate-json", default="/tmp/gate.json", help="cached gate --json output")
    ap.add_argument("--tier", choices=["fallback", "no-param", "complex", "all"], default="all")
    ap.add_argument("--json", action="store_true", help="emit JSON")
    args = ap.parse_args(argv)

    gp = Path(args.gate_json)
    if not gp.exists():
        print(f"error: {gp} does not exist. Run: node bin/gate.js --all --fast --json > {gp}", file=sys.stderr)
        return 2

    modules = [ROOT / m for m in find_violators(gp)]
    results = []
    for d in modules:
        r = classify(d)
        if args.tier != "all" and r["tier"] != args.tier:
            continue
        results.append(r)

    if args.json:
        print(json.dumps(results, indent=2))
        return 0

    # Table view, grouped by tier
    by_tier = {"fallback": [], "no-param": [], "complex": []}
    for r in results:
        by_tier.setdefault(r["tier"], []).append(r)
    for tier in ("fallback", "no-param", "complex"):
        rs = by_tier.get(tier, [])
        if not rs:
            continue
        print(f"### {tier} ({len(rs)} modules)")
        for r in rs:
            allocs = ", ".join(f"{a['lhs']}@{a['line']}" for a in r["allocations"][:3])
            extra = f" (test→null)" if r["test_passes_null"] else ""
            print(f"  {r['module']}{extra}")
            print(f"    allocs: {allocs}")
            print(f"    action: {r['action']}")
        print()
    print(f"Total: {len(results)} violators")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
