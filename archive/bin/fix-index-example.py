#!/usr/bin/env python3
"""Fill `lib/index.js` `// TODO: Add example` placeholder with the actual call
found in `examples/index.js`.

For each module:
1. Read `examples/index.js`. Skip if it still has a TODO marker.
2. Extract the routine call(s) from it. Routines may be invoked as
   `routine(...)` or `routine.ndarray(...)`. Capture the entire call
   including arg list (single-line, possibly with nested parens).
3. Read `lib/index.js`. If the JSDoc `@example` block contains
   `// TODO: Add example`, replace it with the real call(s) and the
   require boilerplate (`@stdlib/<pkg>/base/<routine>` instead of the
   relative path examples/index.js uses).
4. Write back. Skip when the example call uses base.js bypass without a
   public-surface call (rare).

The replacement preserves the existing `@module` line and any other JSDoc
content; it only swaps the TODO line(s) for real example content.

Usage:
    python bin/fix-index-example.py [--module <substring>] [--dry-run]
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


# Match a single-line invocation `routine(...)` or `routine.ndarray(...)`
# ending with `;`. The arg list may span the line and contain nested
# parens (`new Float64Array( ... )`); we accept up to two nesting levels.
def call_regex(routine):
    # Match `routine(` or `routine.ndarray(` followed by an arg list ending
    # with `)`. We assemble the regex with explicit nesting to handle
    # `new Float64Array( ... )` inside the call.
    inner = r"(?:[^()]|\([^()]*\))*"
    return re.compile(
        r'^(\s*)(?:var\s+\w+\s*=\s*|[\w.]+\s*=\s*)?(' + re.escape(routine)
        + r'(?:\.ndarray)?)\s*\(\s*(' + inner + r')\s*\)\s*;',
        re.MULTILINE,
    )


# Match the full `@module` + `@example` block in lib/index.js. Captures
# everything from the `@module` line through the closing `*/`.
INDEX_TODO_BLOCK = re.compile(
    r"(\* @module @stdlib/[^\n]+\n)([\s\S]*?\*/)",
    re.MULTILINE,
)
TODO_LINE = re.compile(r"^\s*\*\s*//\s*TODO:?\s*Add\s+example\s*\n", re.MULTILINE)


def extract_calls(examples_content, routine):
    """Return up to two distinct calls (standard then ndarray, if both
    appear) from examples/index.js.

    If the file requires `./../lib/base.js` (the bypass pattern), rewrite
    bare `routine(...)` calls as `routine.ndarray(...)` since base and
    ndarray share the same arg layout but the public surface is `.ndarray`.
    """
    require_path = ''
    rm = re.search(
        r"var\s+" + re.escape(routine) + r"\s*=\s*require\(\s*['\"]([^'\"]+)['\"]\s*\)",
        examples_content,
    )
    if rm:
        require_path = rm.group(1)
    is_base_or_ndarray = ('lib/base' in require_path) or ('lib/ndarray' in require_path)

    pat = call_regex(routine)
    calls = []
    seen = set()
    for m in pat.finditer(examples_content):
        callname = m.group(2)
        args = m.group(3).strip()
        args = re.sub(r'\s+', ' ', args)
        # If the example imports base.js or ndarray.js but uses the bare
        # `routine(...)` call, the call-shape is ndarray-like; rewrite to
        # `routine.ndarray(...)` so the @example references the public
        # surface.
        if is_base_or_ndarray and not callname.endswith('.ndarray'):
            callname = routine + '.ndarray'
        key = (callname, args)
        if key in seen:
            continue
        seen.add(key)
        calls.append((callname, args))
        if len(calls) >= 2:
            break
    return calls


def needs_array_import(args):
    return 'Float64Array' in args or 'Complex128Array' in args or 'Int32Array' in args or 'Uint8Array' in args


def find_array_imports(args):
    """Find which @stdlib/array imports are needed for the call."""
    out = []
    if 'Float64Array' in args and 'Complex128Array' not in args.replace('Complex128Array', ''):
        out.append(("Float64Array", "@stdlib/array/float64"))
    if 'Complex128Array' in args:
        out.append(("Complex128Array", "@stdlib/array/complex128"))
    if 'Float64Array' in args and 'Float64Array' not in [x[0] for x in out]:
        out.append(("Float64Array", "@stdlib/array/float64"))
    if 'Int32Array' in args:
        out.append(("Int32Array", "@stdlib/array/int32"))
    if 'Uint8Array' in args:
        out.append(("Uint8Array", "@stdlib/array/uint8"))
    return out


def build_example_block(pkg, routine, calls, examples_content):
    """Build a JSDoc `@example` lines (lines with `* ` prefix) for the
    given calls. We extract the relevant `var X = new ...Array(...);` setup
    lines from examples_content so the example actually runs.
    """
    if not calls:
        return None
    # Collect unique variable definitions from the example file. We grab any
    # `var name = expression;` line whose name is referenced in the calls.
    referenced = set()
    for _, args in calls:
        for tok in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', args):
            referenced.add(tok)
    var_decl = re.compile(
        r'^\s*var\s+(\w+)\s*=\s*([^\n]*);\s*$',
        re.MULTILINE,
    )
    setup_lines = []
    for m in var_decl.finditer(examples_content):
        name = m.group(1)
        rhs = m.group(2).strip()
        # Skip the require of the routine itself (we'll insert the
        # canonical require).
        if rhs.startswith('require('):
            continue
        if name not in referenced:
            continue
        setup_lines.append((name, rhs))

    # Identify which array-types are needed, to add `var Float64Array = require( ... );` etc.
    type_imports = []
    seen_types = set()
    body_text = '\n'.join(rhs for _, rhs in setup_lines) + '\n' + '\n'.join(args for _, args in calls)
    for ty, pkg_path in [
        ("Float64Array", "@stdlib/array/float64"),
        ("Complex128Array", "@stdlib/array/complex128"),
        ("Int32Array", "@stdlib/array/int32"),
        ("Uint8Array", "@stdlib/array/uint8"),
    ]:
        if re.search(r'\b' + ty + r'\b', body_text) and ty not in seen_types:
            type_imports.append((ty, pkg_path))
            seen_types.add(ty)

    # Compose the @example block.
    lines = []
    lines.append('*')
    lines.append('* @example')
    for ty, pkg_path in type_imports:
        lines.append('* var {} = require( \'{}\' );'.format(ty, pkg_path))
    lines.append('* var {} = require( \'@stdlib/{}/base/{}\' );'.format(routine, pkg, routine))
    if type_imports or True:
        lines.append('*')
    for name, rhs in setup_lines:
        lines.append('* var {} = {};'.format(name, rhs))
    if setup_lines:
        lines.append('*')
    for callname, args in calls:
        lines.append('* {}( {} );'.format(callname, args))
    return '\n'.join(lines)


def fix_module(pkg, routine, mod_dir, dry_run):
    examples_path = os.path.join(mod_dir, 'examples', 'index.js')
    index_path = os.path.join(mod_dir, 'lib', 'index.js')
    if not os.path.exists(examples_path) or not os.path.exists(index_path):
        return False, 'missing files'
    with open(examples_path) as f:
        ex_content = f.read()
    if 'TODO' in ex_content:
        return False, 'examples/index.js still has TODO'
    with open(index_path) as f:
        idx_content = f.read()
    if not TODO_LINE.search(idx_content):
        return False, 'no TODO in index.js'

    calls = extract_calls(ex_content, routine)
    if not calls:
        return False, 'no usable call extracted'

    block = build_example_block(pkg, routine, calls, ex_content)
    if not block:
        return False, 'block-build failed'

    # Replace the existing `* @example\n* // TODO: Add example` block with
    # the new content. Heuristic: find the line containing the TODO and
    # back up to the immediately preceding `* @example` line.
    todo_match = TODO_LINE.search(idx_content)
    if not todo_match:
        return False, 'no TODO line'
    # Trace back to find `* @example` line right above.
    pre = idx_content[:todo_match.start()]
    last_example_idx = pre.rfind('* @example')
    if last_example_idx == -1:
        return False, 'no @example marker'
    # Find the start of that line.
    line_start = pre.rfind('\n', 0, last_example_idx) + 1
    # The block we'll replace runs from line_start through todo_match.end().
    replacement = block + '\n'
    new_content = (
        idx_content[:line_start]
        + replacement
        + idx_content[todo_match.end():]
    )

    if new_content == idx_content:
        return False, 'no-op'
    if not dry_run:
        with open(index_path, 'w') as f:
            f.write(new_content)
    return True, 'ok'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--module', help='only operate on modules matching this substring')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    changed = 0
    skipped_reasons = {}
    for pkg, routine, mod_dir in find_module_dirs():
        if args.module and args.module not in mod_dir:
            continue
        ok, reason = fix_module(pkg, routine, mod_dir, args.dry_run)
        if ok:
            changed += 1
        else:
            skipped_reasons[reason] = skipped_reasons.get(reason, 0) + 1
    print('changed:', changed)
    print('skip reasons:')
    for r, n in sorted(skipped_reasons.items(), key=lambda kv: -kv[1]):
        print('  {:>4}  {}'.format(n, r))


if __name__ == '__main__':
    main()
