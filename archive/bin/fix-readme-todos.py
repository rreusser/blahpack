#!/usr/bin/env python3
"""Fill README.md scaffold TODOs with real content lifted from
examples/index.js.

For each module, README.md contains up to four scaffold TODO markers:

  1. `// TODO: Add usage example` inside a code fence following the
     standard interface signature line. Replace with the call from
     `examples/index.js`.
  2. `// TODO: Add usage example` inside a code fence following the
     .ndarray interface signature line. Replace with the same call,
     rewritten to `routine.ndarray(...)` shape.
  3. `-   TODO: Add notes.` placeholder bullet. Replace with an empty
     bullet or remove (just remove for now).
  4. `// TODO: Add examples` inside a final Examples code fence. Replace
     with the call.

We only touch a TODO when we have material to fill it; otherwise it's
left alone. Modules whose `examples/index.js` still has its own TODO are
skipped entirely.

Usage:
    python bin/fix-readme-todos.py [--module <substring>] [--dry-run]
"""
import argparse
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def find_module_dirs():
    for pkg in ('blas', 'lapack'):
        pkg_dir = os.path.join(ROOT, 'lib', pkg, 'base')
        if not os.path.isdir(pkg_dir):
            continue
        for entry in sorted(os.listdir(pkg_dir)):
            mod_dir = os.path.join(pkg_dir, entry)
            if os.path.isdir(mod_dir):
                yield pkg, entry, mod_dir


def snake_to_camel(name):
    """Convert `dlasyf_rook` → `dlasyfRook`."""
    parts = name.split('_')
    if len(parts) <= 1:
        return name
    return parts[0] + ''.join(p[:1].upper() + p[1:] for p in parts[1:] if p)


def call_regex(routine):
    # Match any `routine(...)` or `routine.ndarray(...)` invocation in the
    # source — top-level statement, var assignment, or nested inside a
    # `console.log(routine.ndarray(...), ...)` expression. We don't require
    # the trailing `;` because the call may be an inner expression.
    # Also accept the camelCase variant of snake_case routine names —
    # examples/index.js often writes `var dlasyfRook = require(...)` and
    # then `dlasyfRook(...)`.
    inner = r"(?:[^()]|\([^()]*\))*"
    camel = snake_to_camel(routine)
    if camel != routine:
        name_alt = '(?:' + re.escape(routine) + '|' + re.escape(camel) + ')'
    else:
        name_alt = re.escape(routine)
    return re.compile(
        r'(' + name_alt + r'(?:\.ndarray)?)\s*\(\s*(' + inner + r')\s*\)',
    )


def extract_call(examples_content, routine):
    """Return (callname, args) for the first call found in examples/index.js,
    or None. If require uses base/ndarray, rewrite to .ndarray. The local
    var name may be either `routine` or its camelCase variant (e.g.
    `dlasyfRook` for `dlasyf_rook`).
    """
    camel = snake_to_camel(routine)
    require_pat = re.compile(
        r"var\s+(?:" + re.escape(routine) + "|" + re.escape(camel)
        + r")\s*=\s*require\(\s*['\"]([^'\"]+)['\"]\s*\)"
    )
    rm = require_pat.search(examples_content)
    require_path = rm.group(1) if rm else ''
    is_base_or_ndarray = ('lib/base' in require_path) or ('lib/ndarray' in require_path)
    pat = call_regex(routine)
    m = pat.search(examples_content)
    if not m:
        return None
    callname = m.group(1)
    args = re.sub(r'\s+', ' ', m.group(2).strip())
    # Normalize callname back to canonical snake_case for the README's
    # @example, since the public stdlib export uses the snake_case routine
    # name.
    if callname.startswith(camel) and camel != routine:
        callname = routine + callname[len(camel):]
    if is_base_or_ndarray and not callname.endswith('.ndarray'):
        callname = routine + '.ndarray'
    return callname, args


def extract_setup(examples_content, args):
    """Return list of (var_name, rhs) tuples that the call references."""
    referenced = set(re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', args))
    out = []
    for m in re.finditer(
        r'^\s*var\s+(\w+)\s*=\s*([^\n]*);\s*$',
        examples_content,
        re.MULTILINE,
    ):
        name = m.group(1)
        rhs = m.group(2).strip()
        if rhs.startswith('require('):
            continue
        if name not in referenced:
            continue
        out.append((name, rhs))
    return out


def array_imports_for(text):
    out = []
    seen = set()
    for ty, pkg in [
        ("Float64Array", "@stdlib/array/float64"),
        ("Complex128Array", "@stdlib/array/complex128"),
        ("Int32Array", "@stdlib/array/int32"),
        ("Uint8Array", "@stdlib/array/uint8"),
    ]:
        if re.search(r'\b' + ty + r'\b', text) and ty not in seen:
            out.append((ty, pkg))
            seen.add(ty)
    return out


def build_block(pkg, routine, callname, args, setup):
    body = '\n'.join(rhs for _, rhs in setup) + '\n' + args
    imports = array_imports_for(body)
    lines = []
    for ty, pkg_path in imports:
        lines.append("var {} = require( '{}' );".format(ty, pkg_path))
    lines.append("var {} = require( '@stdlib/{}/base/{}' );".format(routine, pkg, routine))
    lines.append('')
    for name, rhs in setup:
        lines.append('var {} = {};'.format(name, rhs))
    if setup:
        lines.append('')
    lines.append('{}( {} );'.format(callname, args))
    return '\n'.join(lines)


# Match a triple-backtick code fence that contains the TODO marker. The
# fence body is bounded by the next `\n```` so the regex cannot span past
# a closing fence and consume unrelated content. We exclude `\`\`\`` from the
# fence body via a negative lookahead repeated character class.
USAGE_TODO_BLOCK = re.compile(
    r"```javascript\n((?:(?!```)[^\n]*\n)*?)// TODO: Add usage example\n```",
    re.MULTILINE,
)
NOTES_TODO_LINE = re.compile(
    r"^-   TODO: Add notes\.\s*\n",
    re.MULTILINE,
)
EXAMPLES_TODO_BLOCK = re.compile(
    r"```javascript\n((?:(?!```)[^\n]*\n)*?)// TODO: Add examples\n```",
    re.MULTILINE,
)


def fix_module(pkg, routine, mod_dir, dry_run):
    readme_path = os.path.join(mod_dir, 'README.md')
    examples_path = os.path.join(mod_dir, 'examples', 'index.js')
    if not os.path.exists(readme_path) or not os.path.exists(examples_path):
        return False, 'missing files'
    with open(examples_path) as f:
        ex_content = f.read()
    if 'TODO' in ex_content:
        return False, 'examples/index.js has TODO'
    extracted = extract_call(ex_content, routine)
    if not extracted:
        return False, 'no call'
    callname, args = extracted
    setup = extract_setup(ex_content, args)
    block = build_block(pkg, routine, callname, args, setup)
    # We only have ndarray-shaped args extracted from examples/index.js
    # (which bypasses into base.js). The wrapper has a DIFFERENT signature
    # (LDA, no strideA1/strideA2/offset). Don't fabricate wrong calls — use
    # `routine.ndarray(...)` in both fences; it's slightly awkward next to
    # a standard-interface heading but at least correct and runnable.
    standard_block = block

    with open(readme_path) as f:
        readme = f.read()

    new_readme = readme
    changed = False

    # 1. Replace standard-interface usage TODO. The first match in the file
    # is associated with the standard wrapper section.
    matches = list(USAGE_TODO_BLOCK.finditer(new_readme))
    if matches:
        m = matches[0]
        replacement = '```javascript\n' + standard_block + '\n```'
        new_readme = new_readme[:m.start()] + replacement + new_readme[m.end():]
        changed = True
        # Now find the second match in the updated text (positions shifted).
        matches2 = list(USAGE_TODO_BLOCK.finditer(new_readme))
        if matches2:
            m2 = matches2[0]
            replacement2 = '```javascript\n' + block + '\n```'
            new_readme = new_readme[:m2.start()] + replacement2 + new_readme[m2.end():]

    # 2. Replace the Notes TODO bullet.
    new_readme, n = NOTES_TODO_LINE.subn(
        '-   See LAPACK reference documentation for full algorithmic details.\n',
        new_readme,
    )
    if n > 0:
        changed = True

    # 3. Replace the final Examples TODO block.
    if EXAMPLES_TODO_BLOCK.search(new_readme):
        new_readme = EXAMPLES_TODO_BLOCK.sub(
            '```javascript\n' + block + '\n```',
            new_readme,
        )
        changed = True

    if not changed:
        return False, 'no TODOs to replace'
    if not dry_run:
        with open(readme_path, 'w') as f:
            f.write(new_readme)
    return True, 'ok'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--module', help='only operate on modules matching this substring')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    changed = 0
    skipped = {}
    for pkg, routine, mod_dir in find_module_dirs():
        if args.module and args.module not in mod_dir:
            continue
        ok, reason = fix_module(pkg, routine, mod_dir, args.dry_run)
        if ok:
            changed += 1
        else:
            skipped[reason] = skipped.get(reason, 0) + 1
    print('changed:', changed)
    for r, n in sorted(skipped.items(), key=lambda kv: -kv[1]):
        print('  skip {:>4}  {}'.format(n, r))


if __name__ == '__main__':
    main()
