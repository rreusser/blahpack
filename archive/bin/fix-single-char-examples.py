#!/usr/bin/env python3
"""Replace single-char Fortran flags in examples/benchmark files.

For each module:
1. Parse `lib/<routine>/lib/base.js` JSDoc for `@param {string} <name> - ...`
   tags. Extract the accepted long-form string values from backtick-quoted
   literals in each tag's description (e.g. `'all'`, `'compute-vectors'`).
2. Read the function signature in `lib/<routine>/lib/base.js`,
   `lib/<routine>/lib/ndarray.js`, and `lib/<routine>/lib/<routine>.js` to
   know what each positional arg's param name is.
3. In example/benchmark files, find calls to the routine (`<routine>(...)`,
   `<routine>.ndarray(...)`). For each positional `'X'` literal, look up the
   corresponding param name and the param's accepted values. If exactly one
   accepted value starts with the same letter as `'X'` (case-insensitive),
   replace.

Limitations:
- Only handles single-call lines (most examples are one-liners).
- Skips ambiguous matches (multiple long-form values starting with same letter).
- Does not modify comments or require lines.

Usage:
    python bin/fix-single-char-examples.py [--module <substring>] [--dry-run]
        [--report]   # show per-module decisions even when nothing changes
"""
import argparse
import os
import re
import sys

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


JSDOC_STRING_PARAM = re.compile(
    r'@param\s*\{string\}\s*(\w+)\s*-\s*([^\n]*(?:\n\s*\*\s+(?!@)[^\n]*)*)',
    re.MULTILINE,
)
BACKTICK_LITERAL = re.compile(r"`'([a-zA-Z][a-zA-Z0-9_-]*)'`")


def extract_string_param_values(content, param_names):
    """Return {param_name: [accepted long-form values]} for each `@param
    {string}` in content. Pulls accepted values from two sources:

    1. JSDoc descriptions: backtick-quoted single-quoted literals
       (e.g. `'all'`, `'compute-vectors'`).
    2. Function-body equality/inequality checks: `param === 'value'` and
       `param !== 'value'` patterns. This catches modules whose JSDoc says
       only "specifies whether eigenvectors are computed" without listing
       the values.

    `param_names` is the list of declared string params (so we know which
    identifiers to look for in the body).
    """
    values = {}
    string_param_set = set()

    # Source 1: JSDoc backtick literals.
    for m in JSDOC_STRING_PARAM.finditer(content):
        name = m.group(1)
        desc = m.group(2)
        string_param_set.add(name)
        accepted = []
        for vm in BACKTICK_LITERAL.finditer(desc):
            v = vm.group(1)
            if v not in accepted:
                accepted.append(v)
        if accepted:
            values[name] = accepted

    # Source 2: function-body equality patterns. For each declared string
    # param, find `<name> === '<value>'`, `<name> !== '<value>'`, and
    # `<name> = '<value>'` (assignment to a documented "default" value).
    for name in string_param_set:
        body_values = []
        for pat in (
            r'\b' + re.escape(name) + r'\s*[!=]==\s*\'([a-zA-Z][a-zA-Z0-9_-]*)\'',
            r'\b' + re.escape(name) + r'\s*=\s*\'([a-zA-Z][a-zA-Z0-9_-]*)\'\s*;',
        ):
            for vm in re.finditer(pat, content):
                v = vm.group(1)
                if v not in body_values:
                    body_values.append(v)
        if body_values:
            existing = values.get(name, [])
            for v in body_values:
                if v not in existing:
                    existing.append(v)
            values[name] = existing

    # Source 3: JSDoc descriptions sometimes list values without backticks,
    # e.g. `* @param {string} fact - 'not-factored', 'equilibrate', or 'factored'`.
    # We re-scan each `@param {string}` block for plain `'value'` literals.
    PLAIN_LITERAL = re.compile(r"'([a-zA-Z][a-zA-Z0-9_-]*)'")
    for m in JSDOC_STRING_PARAM.finditer(content):
        name = m.group(1)
        desc = m.group(2)
        existing = values.get(name, [])
        for vm in PLAIN_LITERAL.finditer(desc):
            v = vm.group(1)
            if v not in existing:
                existing.append(v)
        if existing:
            values[name] = existing

    return values


# Match `function NAME( a, b, c )`. Picks up the exported function.
FN_SIGNATURE = re.compile(r'function\s+\w+\s*\(\s*([^)]*)\)')


def extract_param_list(content):
    """Return [param_name, ...] from the first function declaration that
    looks like the routine's main function.
    """
    m = FN_SIGNATURE.search(content)
    if not m:
        return None
    raw = m.group(1)
    return [p.strip() for p in raw.split(',') if p.strip()]


# Match a routine call like `routine( ... )` OR `routine.ndarray( ... )`.
# Captures the args text (no nested parens — accepted limitation).
def call_regex(routine):
    return re.compile(
        r'(\b' + re.escape(routine) + r'(?:\.ndarray)?)\s*\(\s*([^)]*)\)'
    )


# Tokenize a comma-separated arg list, respecting strings and the SOME nesting
# present in real examples (e.g. `new Float64Array( N * N )`).
def tokenize_args(args_text):
    tokens = []
    cur = []
    depth = 0
    i = 0
    in_str = None
    while i < len(args_text):
        c = args_text[i]
        if in_str:
            cur.append(c)
            if c == '\\' and i + 1 < len(args_text):
                cur.append(args_text[i + 1])
                i += 2
                continue
            if c == in_str:
                in_str = None
            i += 1
            continue
        if c in ("'", '"'):
            in_str = c
            cur.append(c)
            i += 1
            continue
        if c in '([{':
            depth += 1
            cur.append(c)
            i += 1
            continue
        if c in ')]}':
            depth -= 1
            cur.append(c)
            i += 1
            continue
        if c == ',' and depth == 0:
            tokens.append(''.join(cur).strip())
            cur = []
            i += 1
            continue
        cur.append(c)
        i += 1
    last = ''.join(cur).strip()
    if last:
        tokens.append(last)
    return tokens


SINGLE_CHAR_LITERAL = re.compile(r"^'([A-Z])'$")

# Conventional LAPACK Fortran-letter → long-form names this project uses.
# When the first-letter match heuristic fails, try this alias table.
# Each entry lists every long-form value we've seen mapped to that letter.
# A match is unambiguous when the intersection with the param's accepted
# values has exactly one entry.
LAPACK_LETTER_ALIASES = {
    'A': ['all', 'all-columns', 'all-rows', 'apply-v', 'apply-q'],
    'B': ['both', 'block', 'backward', 'bottom-pivot'],
    'C': ['conjugate-transpose', 'column', 'column-major', 'compute-v',
          'compute-vectors'],
    'E': ['entire', 'equilibrate', 'eigenvalues'],
    'F': ['factored', 'forward'],
    'I': ['identity', 'initialize', 'index'],
    'L': ['lower', 'left', 'left-vectors'],
    'N': ['none', 'no-vectors', 'not-sorted', 'no-sort', 'no-transpose',
          'non-unit', 'no-v', 'no'],
    'O': ['overwrite'],
    'P': ['p-only', 'permute', 'apply-P'],
    'Q': ['q-only', 'apply-Q'],
    'R': ['right', 'row', 'row-major', 'right-vectors'],
    'S': ['some', 'sort', 'sorted', 'economy', 'safe-minimum', 'schur'],
    'T': ['transpose', 'top-pivot'],
    'U': ['upper', 'unit', 'update', 'upper-hessenberg'],
    'V': ['update', 'compute-vectors', 'value', 'variable-pivot',
          'compute-v', 'compute'],
    'X': [],
    'Y': [],
    'Z': [],
}


def map_single_char(letter, accepted_values):
    """Return the accepted-value string corresponding to `letter` if
    exactly one match is found, otherwise None.

    Resolution order:
      1. First-letter (case-insensitive) match against the param's accepted
         values. If unique, use it.
      2. Otherwise, intersect the alias table for `letter` with the
         accepted values. If unique, use it.
    """
    # 1. First-letter heuristic.
    matches = [v for v in accepted_values
               if v and v[0].lower() == letter.lower()]
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        # Multiple values start with the same letter; fall through to alias
        # table only if it picks a single value also present in `matches`.
        aliases = LAPACK_LETTER_ALIASES.get(letter.upper(), [])
        narrowed = [v for v in matches if v in aliases]
        if len(narrowed) == 1:
            return narrowed[0]
        return None
    # 2. Alias table (no first-letter match).
    aliases = LAPACK_LETTER_ALIASES.get(letter.upper(), [])
    cross = [v for v in accepted_values if v in aliases]
    if len(cross) == 1:
        return cross[0]
    return None


REQUIRE_LINE = re.compile(
    r"var\s+(\w+)\s*=\s*require\(\s*['\"]([^'\"]+)['\"]\s*\)"
)


def detect_routine_imports(content, routine):
    """Find `var <name> = require( ... )` lines that bind to the routine's
    own files. Returns {local_name: 'wrapper'|'ndarray'|'base'}.
    """
    bindings = {}
    for m in REQUIRE_LINE.finditer(content):
        name = m.group(1)
        target = m.group(2)
        # Strip `./../lib/...` prefix variations.
        norm = target.replace('\\', '/').strip()
        if 'ndarray.js' in norm and '/lib/' in norm:
            bindings[name] = 'ndarray'
        elif 'base.js' in norm and '/lib/' in norm:
            bindings[name] = 'base'
        elif norm.endswith('/lib') or norm.endswith('/lib/index.js') or norm.endswith('/lib/main.js'):
            bindings[name] = 'wrapper'
        elif norm.endswith('/' + routine + '.js'):
            bindings[name] = 'wrapper'
    return bindings


def fix_example_file(file_path, routine, base_params, ndarray_params,
                     wrapper_params, string_param_values, log_lines):
    """Apply replacements in a single example/benchmark file. Returns the
    new content (or original on no change).
    """
    with open(file_path) as f:
        content = f.read()
    new_content = content
    bindings = detect_routine_imports(content, routine)
    pattern = call_regex(routine)
    # We rewrite each match in turn. Operate from the end so positions stay
    # stable as we substitute.
    matches = list(pattern.finditer(content))
    for m in reversed(matches):
        full = m.group(0)
        callname = m.group(1)
        is_ndarray = callname.endswith('.ndarray')
        args_text = m.group(2)
        tokens = tokenize_args(args_text)
        # Decide which parameter list applies. Priority:
        #   <routine>.ndarray(...) → ndarray params
        #   require resolved routine to ndarray.js → ndarray params
        #   require resolved to base.js → base params
        #   otherwise → wrapper params (the standard interface)
        local = callname.split('.', 1)[0]
        binding = bindings.get(local)
        if is_ndarray or binding == 'ndarray':
            params = ndarray_params
        elif binding == 'base':
            params = base_params
        else:
            params = wrapper_params or base_params
        if not params:
            continue
        # Walk tokens; for each that's `'X'`, look up the param at that index.
        new_tokens = list(tokens)
        changed_any = False
        for i, tok in enumerate(tokens):
            sm = SINGLE_CHAR_LITERAL.match(tok)
            if not sm:
                continue
            if i >= len(params):
                continue
            param_name = params[i]
            accepted = string_param_values.get(param_name)
            if not accepted:
                log_lines.append(
                    '  {}: param[{}]={} (no accepted-values data)'.format(
                        os.path.relpath(file_path, ROOT), i, param_name))
                continue
            target = map_single_char(sm.group(1), accepted)
            if not target:
                log_lines.append(
                    '  {}: param[{}]={} {!r} -> ambiguous in {}'.format(
                        os.path.relpath(file_path, ROOT), i, param_name,
                        sm.group(1), accepted))
                continue
            new_tokens[i] = "'" + target + "'"
            changed_any = True
            log_lines.append(
                '  {}: param[{}]={} {!r} -> {!r}'.format(
                    os.path.relpath(file_path, ROOT), i, param_name,
                    sm.group(1), target))
        if not changed_any:
            continue
        # Rebuild call. Preserve original whitespace minimally — join with
        # ', '. If the source had no whitespace after `(`, we still emit
        # the canonical form. Tests treat both as equivalent.
        new_args = ', '.join(new_tokens)
        new_call = callname + '( ' + new_args + ' )'
        new_content = new_content[:m.start()] + new_call + new_content[m.end():]
    return content, new_content


def merge_param_values(primary, secondary):
    """Union the value sets across sources. Wrappers, ndarray.js, and base.js
    each may contain part of the valid value set — buggy wrappers often
    have INCOMPLETE validators (e.g. `equed !== 'row' && equed !== 'both'
    && equed !== 'column'` while base.js also accepts `'none'`). The union
    gives the codemod the complete set of values to match a single-char
    against.
    """
    out = {}
    for k, v in primary.items():
        out[k] = list(v)
    for k, v in secondary.items():
        if k not in out:
            out[k] = list(v)
        else:
            for item in v:
                if item not in out[k]:
                    out[k].append(item)
    return out


def fix_module(pkg, routine, mod_dir, dry_run, report):
    base_path = os.path.join(mod_dir, 'lib', 'base.js')
    if not os.path.exists(base_path):
        return [], []

    with open(base_path) as f:
        base_content = f.read()
    base_params = extract_param_list(base_content) or []
    base_string_values = extract_string_param_values(base_content, base_params)

    wrapper_path = os.path.join(mod_dir, 'lib', routine + '.js')
    wrapper_params = None
    wrapper_string_values = {}
    if os.path.exists(wrapper_path):
        with open(wrapper_path) as f:
            wrapper_content = f.read()
        wrapper_params = extract_param_list(wrapper_content)
        if wrapper_params:
            wrapper_string_values = extract_string_param_values(
                wrapper_content, wrapper_params)

    ndarray_path = os.path.join(mod_dir, 'lib', 'ndarray.js')
    ndarray_params = None
    ndarray_string_values = {}
    if os.path.exists(ndarray_path):
        with open(ndarray_path) as f:
            ndarray_content = f.read()
        ndarray_params = extract_param_list(ndarray_content)
        if ndarray_params:
            ndarray_string_values = extract_string_param_values(
                ndarray_content, ndarray_params)

    # Prefer wrapper/ndarray-validator values (the public-API contract);
    # fall back to base.js for params not validated at the wrapper level.
    public_string_values = merge_param_values(
        merge_param_values(wrapper_string_values, ndarray_string_values),
        base_string_values,
    )
    string_param_values = public_string_values

    files = [
        os.path.join(mod_dir, 'examples', 'index.js'),
        os.path.join(mod_dir, 'benchmark', 'benchmark.js'),
        os.path.join(mod_dir, 'benchmark', 'benchmark.ndarray.js'),
    ]

    changed = []
    log = []
    for fp in files:
        if not os.path.exists(fp):
            continue
        old, new = fix_example_file(
            fp, routine, base_params, ndarray_params, wrapper_params,
            string_param_values, log)
        if new != old:
            changed.append(os.path.relpath(fp, ROOT))
            if not dry_run:
                with open(fp, 'w') as f:
                    f.write(new)

    return changed, log


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--module', help='only operate on modules whose path matches this substring')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--report', action='store_true',
                    help='print per-replacement decisions (incl. ambiguous)')
    args = ap.parse_args()

    total_changed = 0
    total_logs = []
    for pkg, routine, mod_dir in find_module_dirs():
        if args.module and args.module not in mod_dir:
            continue
        changed, log = fix_module(pkg, routine, mod_dir,
                                  args.dry_run, args.report)
        if changed or (args.report and log):
            print('# {} {}'.format(routine, ' '.join(changed) if changed else '(no changes)'))
            for line in log:
                print(line)
            total_changed += len(changed)
            total_logs.extend(log)

    print('TOTAL: {} files {}changed'.format(
        total_changed, '(would be) ' if args.dry_run else ''))


if __name__ == '__main__':
    main()
