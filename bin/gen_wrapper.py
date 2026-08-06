#!/usr/bin/env python
"""
Generate <routine>.js BLAS/LAPACK-style API wrappers from base.js signatures.

For each module with a stub wrapper, generates a real implementation that:
- Accepts order/layout param (for BLAS) or assumes column-major (for LAPACK internal)
- Converts LDA + order to strides
- Computes offsets from strides for vectors
- Calls base.js

Usage:
  python bin/gen_wrapper.py                    # fix all stubs
  python bin/gen_wrapper.py --dry-run          # preview
  python bin/gen_wrapper.py lib/blas/base/dgemm  # fix one module
"""

import os
import re
import sys
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LICENSE = ""

# --- Ratified strided-form conventions (see lint/CONVENTIONS.md, mirrored in
# lint/lib/strided-projection.cjs). Keep these in sync with that projection. ---

WORKSPACE_RE = re.compile(r'^[a-z]?work[a-z0-9]*$', re.IGNORECASE)

# Packed-matrix storage codes (chars 2-3 of a BLAS/LAPACK routine name).
PACKED_CODES = {'sp', 'hp', 'tp', 'pp'}


def storage_code(routine):
    """The 2-letter storage code of a routine name (dspmv -> 'sp')."""
    return routine[1:3].lower()


def is_workspace(name):
    """A workspace array by conventional name (WORK, IWORK, RWORK, ...)."""
    return bool(WORKSPACE_RE.match(name))


def is_packed_matrix(name, routine):
    """A packed matrix: packed-storage routine + a '...P' matrix name (AP, AFP)."""
    return storage_code(routine) in PACKED_CODES and bool(re.search(r'p$', name, re.IGNORECASE))


def parse_base_signature(base_path, routine=None):
    """Extract the exported routine's function name, params, and @param types.

    base.js may declare helper functions (e.g. `cabs`) before the exported one,
    so the exported routine is selected by name (the function named `routine`);
    only if that is not found do we fall back to the last documented function.
    Selecting the first @param-documented function would pick a helper.
    """
    with open(base_path) as f:
        content = f.read()

    def parse_block(block_body, params_str):
        params_str = re.sub(r'\s*//.*', '', params_str)
        params = [p.strip() for p in params_str.split(',') if p.strip()]
        param_types = {}
        for line in block_body.split('\n'):
            m = re.match(r'\s*\* @param \{([^}]+)\}\s+(\w+)', line)
            if m:
                param_types[m.group(2)] = m.group(1)
        return params, param_types

    blocks = re.findall(r'/\*\*\n(.*?)\*/\s*\nfunction (\w+)\(\s*([^)]+)\s*\)', content, re.DOTALL)
    documented = [b for b in blocks if '@param' in b[0]]

    # Prefer the function named after the routine.
    if routine:
        for block_body, func_name, params_str in documented:
            if func_name.lower() == routine.lower():
                params, param_types = parse_block(block_body, params_str)
                return func_name, params, param_types

        # Direct by-name search — robust to anything (e.g. an eslint-disable
        # line) sitting between the JSDoc and `function <routine>(`.
        m = re.search(r'function\s+(' + re.escape(routine) + r')\s*\(\s*([^)]*)\s*\)', content, re.IGNORECASE)
        if m:
            params = [p.strip() for p in re.sub(r'\s*//.*', '', m.group(2)).split(',') if p.strip()]
            # Best-effort @param types from the nearest preceding JSDoc block.
            param_types = {}
            pre = content[:m.start()]
            jd = re.findall(r'/\*\*(.*?)\*/', pre, re.DOTALL)
            if jd:
                for line in jd[-1].split('\n'):
                    mm = re.match(r'\s*\* @param \{([^}]+)\}\s+(\w+)', line)
                    if mm:
                        param_types[mm.group(2)] = mm.group(1)
            return m.group(1), params, param_types

    # Fallback: the LAST documented function (the exported one follows helpers).
    if documented:
        block_body, func_name, params_str = documented[-1]
        params, param_types = parse_block(block_body, params_str)
        return func_name, params, param_types

    m = re.search(r'function (\w+)\(\s*([^)]+)\s*\)', content)
    if m:
        params_str = re.sub(r'\s*//.*', '', m.group(2))
        return m.group(1), [p.strip() for p in params_str.split(',')], {}

    return None, [], {}


def _is_stride(x):
    return bool(re.match(r'stride', x, re.IGNORECASE))


def _is_offset(x):
    return bool(re.match(r'offset', x, re.IGNORECASE))


def classify_params(params, param_types, routine=''):
    """Classify base.js params into wrapper param groups.

    Detection is POSITIONAL (an array is a param followed by its stride/offset),
    mirroring lint/lib/strided-projection.cjs exactly — not name-matched — so it
    handles complex vectors whose stride/offset use a prefix-stripped logical
    name (`zx`, `strideX`, `offsetX`). Keep this in lock-step with that
    projection; a cross-check test asserts the two agree over the whole corpus.
    """
    groups = []  # list of (wrapper_params, base_call_args, setup_code)

    n = len(params)
    i = 0
    while i < n:
        p = params[i]
        ptype = param_types.get(p, '')
        n1 = params[i+1] if i+1 < n else ''
        n2 = params[i+2] if i+2 < n else ''
        n3 = params[i+3] if i+3 < n else ''

        # 2-D matrix (incl. banded): P, strideP1, strideP2, offsetP -> P, LD<P>
        if _is_stride(n1) and _is_stride(n2) and _is_offset(n3):
            groups.append(('matrix2d', p, n1, n2, n3))
            i += 4
            continue

        # 1-D array: P, strideP, offsetP
        if _is_stride(n1) and _is_offset(n2):
            if is_workspace(p):
                groups.append(('workspace', p, n1, n2))     # no stride: scratch
            elif is_packed_matrix(p, routine):
                groups.append(('packed', p, n1, n2))        # no stride; takes order
            else:
                groups.append(('vector', p, n1, n2))        # keep stride, drop offset
            i += 3
            continue

        # Complex scalar as array: P, offsetP -> P. The offset must be suffixed
        # (`offsetX`), never a bare `offset` (a standalone scalar parameter).
        if _is_offset(n1) and n1.lower() != 'offset':
            groups.append(('scalar_array', p, n1))
            i += 2
            continue

        # Plain scalar / dimension / character.
        groups.append(('passthrough', p, ptype))
        i += 1

    return groups


def generate_wrapper(routine, pkg, base_path):
    """Generate the <routine>.js wrapper content."""
    func_name, params, param_types = parse_base_signature(base_path, routine)
    if not func_name:
        return None

    groups = classify_params(params, param_types, routine)

    # Build wrapper params, setup code, and base call args
    wrapper_params = []
    setup_lines = []
    base_args = []
    var_decls = set()
    has_matrix = False
    has_vector = False

    # The strided form takes `order` iff the routine has a matrix argument — a
    # 2-D/banded matrix (passed by leading dimension) or a packed matrix. This
    # holds for both BLAS and LAPACK (e.g. stdlib's dlaswp). Vector-only routines
    # take no `order`.
    needs_order = any(g[0] in ('matrix2d', 'packed') for g in groups)

    if needs_order:
        wrapper_params.append('order')

    for g in groups:
        if g[0] == 'passthrough':
            wrapper_params.append(g[1])
            base_args.append(g[1])
        elif g[0] == 'matrix2d':
            _, name, s1, s2, off = g
            has_matrix = True
            ld_name = 'LD' + name
            wrapper_params.append(name)
            wrapper_params.append(ld_name)
            var_s1 = 's' + name.lower() + '1'
            var_s2 = 's' + name.lower() + '2'
            var_decls.add(var_s1)
            var_decls.add(var_s2)
            base_args.extend([name, var_s1, var_s2, '0'])
        elif g[0] == 'vector':
            _, name, stride_name, offset_name = g
            has_vector = True
            wrapper_params.append(name)
            wrapper_params.append(stride_name)
            var_off = 'o' + name.lower()
            var_decls.add(var_off)
            base_args.extend([name, stride_name, var_off])
        elif g[0] in ('workspace', 'packed'):
            # No stride and no offset in the strided form: workspace is
            # contiguous scratch; a packed matrix is a contiguous triangle.
            # Both are passed to base with stride 1 and offset 0.
            _, name, stride_name, offset_name = g
            wrapper_params.append(name)
            base_args.extend([name, '1', '0'])
        elif g[0] == 'scalar_array':
            _, name, offset_name = g
            wrapper_params.append(name)
            base_args.extend([name, '0'])

    # Generate stride setup
    if has_matrix:
        matrix_groups = [g for g in groups if g[0] == 'matrix2d']
        for g in matrix_groups:
            _, name, s1, s2, off = g
            ld_name = 'LD' + name
            vs1 = 's' + name.lower() + '1'
            vs2 = 's' + name.lower() + '2'
            if needs_order:
                setup_lines.append(f"\tif ( order === 'column-major' ) {{")
                setup_lines.append(f'\t\t{vs1} = 1;')
                setup_lines.append(f'\t\t{vs2} = {ld_name};')
                setup_lines.append('\t} else {')
                setup_lines.append(f'\t\t{vs1} = {ld_name};')
                setup_lines.append(f'\t\t{vs2} = 1;')
                setup_lines.append('\t}')
            else:
                # LAPACK: always column-major
                setup_lines.append(f'\t{vs1} = 1;')
                setup_lines.append(f'\t{vs2} = {ld_name};')

    # Generate offset computation for vectors
    if has_vector:
        vector_groups = [g for g in groups if g[0] == 'vector']
        for g in vector_groups:
            _, name, stride_name, offset_name = g
            var_off = 'o' + name.lower()
            # Find dimension param - use N as default
            dim = 'N'
            setup_lines.append(f'\t{var_off} = stride2offset( {dim}, {stride_name} );')

    # Build var declarations
    sorted_vars = sorted(var_decls, key=lambda v: (-len(v), v))

    # Build JSDoc
    jsdoc_lines = ['/**']
    # Get description from base.js
    with open(base_path) as f:
        base_content = f.read()
    desc_match = re.search(r'/\*\*\n\s*\*(.*?)\n\s*\*\s*\n', base_content, re.DOTALL)
    if desc_match:
        desc = desc_match.group(1).strip().lstrip('* ').split('\n')[0]
        jsdoc_lines.append(f'* {desc}')
    else:
        jsdoc_lines.append(f'* BLAS/LAPACK-style API for {routine}.')
    jsdoc_lines.append('*')

    for wp in wrapper_params:
        if wp == 'order':
            jsdoc_lines.append("* @param {string} order - storage layout (`'row-major'` or `'column-major'`)")
        elif wp.startswith('LD'):
            jsdoc_lines.append(f'* @param {{PositiveInteger}} {wp} - leading dimension of `{wp[2:]}`')
        elif wp in param_types:
            pt = param_types[wp]
            jsdoc_lines.append(f'* @param {{{pt}}} {wp} - {wp}')
        else:
            jsdoc_lines.append(f'* @param {{*}} {wp} - {wp}')

    if needs_order:
        jsdoc_lines.append('* @throws {TypeError} first argument must be a valid order')
    jsdoc_lines.append('* @returns {*} result')
    jsdoc_lines.append('*/')

    # Assemble the file
    lines = [LICENSE, '', "'use strict';", '', '// MODULES //', '']

    requires = ["var base = require( './base.js' );"]
    if needs_order:
        requires.insert(0, "var isLayout = require( '@stdlib/blas/base/assert/is-layout' );")
    if has_vector:
        requires.insert(-1 if not needs_order else 1, "var stride2offset = require( '@stdlib/strided/base/stride2offset' );")
    if needs_order:
        requires.insert(len(requires) - 1, "var format = require( '@stdlib/string/format' );")

    lines.extend(requires)
    lines.extend(['', '', '// MAIN //', ''])
    lines.extend(jsdoc_lines)

    eslint = ''
    if len(wrapper_params) > 6:
        eslint = ' // eslint-disable-line max-len, max-params'

    lines.append(f'function {routine}( {", ".join(wrapper_params)} ) {{{eslint}')

    if sorted_vars:
        for v in sorted_vars:
            lines.append(f'\tvar {v};')

    if needs_order:
        lines.append('')
        lines.append("\tif ( !isLayout( order ) ) {")
        lines.append("\t\tthrow new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );")
        lines.append('\t}')

    if setup_lines:
        lines.append('')
        lines.extend(setup_lines)

    base_call = f'\treturn base( {", ".join(base_args)} );'
    if len(base_call) > 100:
        base_call += ' // eslint-disable-line max-len'
    lines.append(base_call)
    lines.append('}')
    lines.extend(['', '', '// EXPORTS //', '', f'module.exports = {routine};', ''])

    return '\n'.join(lines)


def emit_signatures():
    """Print JSON { routine: [wrapper params...] } for every blas/lapack routine.

    Used by lint/verify-generator.cjs to assert the generator agrees with the
    lint projection (lint/lib/strided-projection.cjs) — one convention, two
    implementations, kept in lock-step.
    """
    out = {}
    for pkg in ['blas', 'lapack']:
        base_dir = os.path.join(ROOT, 'lib', pkg, 'base')
        if not os.path.isdir(base_dir):
            continue
        for routine in sorted(os.listdir(base_dir)):
            base_path = os.path.join(base_dir, routine, 'lib', 'base.js')
            if not os.path.exists(base_path):
                continue
            try:
                res = generate_wrapper(routine, pkg, base_path)
            except Exception:  # noqa: E722 - a parse failure is reported as a gap
                continue
            if not res:
                continue
            m = re.search(r'function\s+' + re.escape(routine) + r'\s*\(([^)]*)\)', res)
            if m:
                out[routine] = [p.strip() for p in m.group(1).split(',') if p.strip()]
    json.dump(out, sys.stdout)


def main():
    if '--emit-signatures' in sys.argv:
        emit_signatures()
        return
    dry_run = '--dry-run' in sys.argv
    target = None
    for arg in sys.argv[1:]:
        if not arg.startswith('-') and os.path.isdir(arg):
            target = arg

    count = 0
    for pkg in ['blas', 'lapack']:
        base_dir = os.path.join(ROOT, 'lib', pkg, 'base')
        if not os.path.isdir(base_dir):
            continue
        for routine in sorted(os.listdir(base_dir)):
            routine_dir = os.path.join(base_dir, routine)
            if target and routine_dir != os.path.abspath(target):
                continue

            wrapper_path = os.path.join(routine_dir, 'lib', f'{routine}.js')
            base_path = os.path.join(routine_dir, 'lib', 'base.js')

            if not os.path.exists(wrapper_path) or not os.path.exists(base_path):
                continue

            with open(wrapper_path) as f:
                content = f.read()
            if 'not yet implemented' not in content:
                continue

            result = generate_wrapper(routine, pkg, base_path)
            if result:
                if dry_run:
                    print(f'  Would fix: {wrapper_path}')
                else:
                    with open(wrapper_path, 'w') as f:
                        f.write(result)
                    print(f'  Fixed: {routine}')
                count += 1

    action = 'Would fix' if dry_run else 'Fixed'
    print(f'\n{action} {count} wrapper files')


if __name__ == '__main__':
    main()
