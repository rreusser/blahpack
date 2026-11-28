#!/usr/bin/env python3
"""
Generate <routine>.js BLAS/LAPACK-style API wrappers from base.js signatures.

Reads the base.js function signature and @param JSDoc to determine parameter
roles, then generates the appropriate wrapper that converts from the classic
BLAS/LAPACK API (order + LDA) to the ndarray API (strides + offsets).

Usage:
    python3 bin/gen_routine_js.py <pkg> <routine>          # Generate one
    python3 bin/gen_routine_js.py --all                    # Generate all stubs
    python3 bin/gen_routine_js.py --all --dry-run          # Preview
"""

import re
import os
import sys
import glob
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

# ─── Parameter Detection ───────────────────────────────────────────────────

def parse_base_js(filepath):
    """Parse base.js to extract function name, params, and their roles."""
    with open(filepath) as f:
        content = f.read()

    # Find the exported function name
    export_match = re.search(r'module\.exports\s*=\s*(\w+)', content)
    if not export_match:
        return None
    func_name = export_match.group(1)

    # Find the function declaration
    func_pattern = re.compile(
        r'function\s+' + re.escape(func_name) + r'\s*\(([^)]*)\)'
    )
    func_match = func_pattern.search(content)
    if not func_match:
        return None

    raw_params = [p.strip() for p in func_match.group(1).split(',')]

    # Parse @param JSDoc from the block above the function
    func_start = func_match.start()
    jsdoc_end = content.rfind('*/', 0, func_start)
    if jsdoc_end < 0:
        return None
    jsdoc_start = content.rfind('/**', 0, jsdoc_end)
    if jsdoc_start < 0:
        return None
    jsdoc = content[jsdoc_start:jsdoc_end + 2]

    # Extract @param types and names
    param_types = {}
    for m in re.finditer(r'@param\s*\{([^}]+)\}\s+(\w+)', jsdoc):
        ptype = m.group(1)
        pname = m.group(2)
        param_types[pname] = ptype

    # Extract description line
    desc_match = re.search(r'\*\s+([A-Z].*?)(?:\n|\*)', jsdoc)
    description = desc_match.group(1).strip().rstrip('.') if desc_match else func_name

    # Classify parameters into roles
    params = []
    i = 0
    while i < len(raw_params):
        name = raw_params[i]
        ptype = param_types.get(name, '')

        if ptype == 'string':
            params.append({'name': name, 'role': 'string'})
            i += 1
        elif 'Float64Array' in ptype or 'Complex128Array' in ptype or 'Int32Array' in ptype:
            # Array — check if followed by stride patterns
            arr_name = name
            arr_type = ptype

            # Look ahead for stride/offset pattern
            remaining = raw_params[i+1:]

            # 2D matrix: stride1, stride2, offset
            if (len(remaining) >= 3 and
                re.match(r'stride' + arr_name + r'?\d*1$|^s' + arr_name[0].lower() + r'1$|^strideA1$|^strideB1$|^strideC1$', remaining[0], re.I)):
                # Heuristic: if next 3 params match stride1, stride2, offset pattern
                s1, s2, off = remaining[0], remaining[1], remaining[2]
                if ('stride' in s1.lower() or s1.startswith('s')) and \
                   ('stride' in s2.lower() or s2.startswith('s')) and \
                   ('offset' in off.lower() or off.startswith('o')):
                    params.append({
                        'name': arr_name, 'role': 'matrix', 'type': arr_type,
                        'stride1': s1, 'stride2': s2, 'offset': off
                    })
                    i += 4
                    continue

            # Check for generic stride pattern: strideX, offsetX or stride, offset
            if len(remaining) >= 2:
                s, o = remaining[0], remaining[1]
                if (('stride' in s.lower() and 'offset' in o.lower()) or
                    (s.startswith('stride') and o.startswith('offset'))):
                    params.append({
                        'name': arr_name, 'role': 'vector', 'type': arr_type,
                        'stride': s, 'offset': o
                    })
                    i += 3
                    continue

            # Check for single stride (no offset) - e.g., incX
            if len(remaining) >= 1 and 'stride' in remaining[0].lower():
                params.append({
                    'name': arr_name, 'role': 'vector_no_offset', 'type': arr_type,
                    'stride': remaining[0]
                })
                i += 2
                continue

            # Plain array (no strides)
            params.append({'name': arr_name, 'role': 'array', 'type': arr_type})
            i += 1
        elif 'boolean' in ptype.lower():
            params.append({'name': name, 'role': 'boolean'})
            i += 1
        else:
            # Scalar (number, integer, etc.)
            params.append({'name': name, 'role': 'scalar', 'type': ptype})
            i += 1

    return {
        'name': func_name,
        'params': params,
        'description': description,
        'has_matrix': any(p['role'] == 'matrix' for p in params),
        'has_vector': any(p['role'] == 'vector' for p in params),
    }


# ─── Code Generation ───────────────────────────────────────────────────────

LICENSE_HEADER = """/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/"""


def get_vector_length_expr(param_name, all_params):
    """Determine the length expression for a vector based on context."""
    # Common conventions
    param_names = [p['name'] for p in all_params]
    if 'N' in param_names:
        return 'N'
    if 'M' in param_names:
        return 'M'
    return 'N'


def generate_routine_js(info, pkg, routine):
    """Generate the <routine>.js content."""
    has_matrix = info['has_matrix']
    params = info['params']
    func_name = info['name']

    # Determine what kind of wrapper this needs
    if has_matrix:
        return generate_matrix_wrapper(info, pkg, routine)
    elif info['has_vector']:
        return generate_vector_wrapper(info, pkg, routine)
    else:
        return generate_passthrough(info, pkg, routine)


def generate_vector_wrapper(info, pkg, routine):
    """Generate wrapper for Level-1 BLAS (vector operations)."""
    params = info['params']
    func_name = info['name']

    # Build public API signature (drop offsets)
    pub_params = []
    for p in params:
        if p['role'] == 'vector':
            pub_params.append(p['name'])
            pub_params.append(p['stride'])
        elif p['role'] == 'string':
            pub_params.append(p['name'])
        elif p['role'] == 'scalar':
            pub_params.append(p['name'])
        elif p['role'] == 'array':
            pub_params.append(p['name'])
        elif p['role'] == 'boolean':
            pub_params.append(p['name'])

    # Build base() call args (add computed offsets)
    base_args = []
    offset_computations = []
    for p in params:
        if p['role'] == 'vector':
            offset_var = 'o' + p['name'][0].lower()
            # Try to determine the vector length
            vlen = get_vector_length_expr(p['name'], params)
            offset_computations.append(
                f"\tvar {offset_var} = stride2offset( {vlen}, {p['stride']} );"
            )
            base_args.extend([p['name'], p['stride'], offset_var])
        elif p['role'] in ('string', 'scalar', 'array', 'boolean'):
            base_args.append(p['name'])

    pub_sig = ', '.join(pub_params)
    base_call = ', '.join(base_args)

    lines = [
        LICENSE_HEADER,
        "",
        "'use strict';",
        "",
        "// MODULES //",
        "",
        "var stride2offset = require( '@stdlib/strided/base/stride2offset' );",
        f"var base = require( './base.js' );",
        "",
        "",
        "// MAIN //",
        "",
        "/**",
        f"* {info['description']}.",
        "*",
    ]

    # Add @param tags
    for p in params:
        if p['role'] == 'vector':
            lines.append(f"* @param {{{p['type']}}} {p['name']} - input array")
            lines.append(f"* @param {{integer}} {p['stride']} - `{p['name']}` stride length")
        elif p['role'] == 'string':
            lines.append(f"* @param {{string}} {p['name']} - TODO")
        elif p['role'] == 'scalar':
            lines.append(f"* @param {{{p['type']}}} {p['name']} - TODO")
        elif p['role'] == 'array':
            lines.append(f"* @param {{{p['type']}}} {p['name']} - TODO")

    lines.extend([
        "* @returns {*} result",
        "*/",
        f"function {func_name}( {pub_sig} ) {{ // eslint-disable-line max-len, max-params",
    ])
    lines.extend(offset_computations)
    lines.append(f"\treturn base( {base_call} ); // eslint-disable-line max-len")
    lines.extend([
        "}",
        "",
        "",
        "// EXPORTS //",
        "",
        f"module.exports = {func_name};",
        "",
    ])

    return '\n'.join(lines)


def generate_matrix_wrapper(info, pkg, routine):
    """Generate wrapper for Level-2/3 BLAS and LAPACK with matrices."""
    params = info['params']
    func_name = info['name']

    # Build public API signature: replace (A, stride1, stride2, offset) with (A, LDA)
    # and add 'order' as first param
    pub_params = ['order']
    matrix_params = []  # track matrices for stride conversion
    vector_params = []  # track vectors for offset computation

    for p in params:
        if p['role'] == 'matrix':
            pub_params.append(p['name'])
            lda_name = 'LD' + p['name']
            pub_params.append(lda_name)
            matrix_params.append({
                'name': p['name'], 'lda': lda_name,
                'stride1': p['stride1'], 'stride2': p['stride2'],
                'offset': p['offset']
            })
        elif p['role'] == 'vector':
            pub_params.append(p['name'])
            pub_params.append(p['stride'])
            vector_params.append(p)
        elif p['role'] in ('string', 'scalar', 'boolean'):
            pub_params.append(p['name'])
        elif p['role'] == 'array':
            pub_params.append(p['name'])

    # Build base() call
    base_args = []
    for p in params:
        if p['role'] == 'matrix':
            s1_var = 's' + p['name'][0].lower() + '1'
            s2_var = 's' + p['name'][0].lower() + '2'
            base_args.extend([p['name'], s1_var, s2_var, '0'])
        elif p['role'] == 'vector':
            off_var = 'o' + p['name'][0].lower()
            base_args.extend([p['name'], p['stride'], off_var])
        elif p['role'] in ('string', 'scalar', 'boolean'):
            base_args.append(p['name'])
        elif p['role'] == 'array':
            base_args.append(p['name'])

    pub_sig = ', '.join(pub_params)
    base_call = ', '.join(base_args)

    lines = [
        LICENSE_HEADER,
        "",
        "'use strict';",
        "",
        "// MODULES //",
        "",
        "var isLayout = require( '@stdlib/blas/base/assert/is-layout' );",
        ]

    if vector_params:
        lines.append("var stride2offset = require( '@stdlib/strided/base/stride2offset' );")

    lines.extend([
        "var format = require( '@stdlib/string/format' );",
        "var base = require( './base.js' );",
        "",
        "",
        "// MAIN //",
        "",
        "/**",
        f"* {info['description']}.",
        "*",
        "* @param {string} order - storage layout ('row-major' or 'column-major')",
    ])

    # Add @param tags
    for p in params:
        if p['role'] == 'matrix':
            lda_name = 'LD' + p['name']
            lines.append(f"* @param {{{p['type']}}} {p['name']} - input matrix")
            lines.append(f"* @param {{PositiveInteger}} {lda_name} - leading dimension of `{p['name']}`")
        elif p['role'] == 'vector':
            lines.append(f"* @param {{{p['type']}}} {p['name']} - input array")
            lines.append(f"* @param {{integer}} {p['stride']} - `{p['name']}` stride length")
        elif p['role'] == 'string':
            lines.append(f"* @param {{string}} {p['name']} - TODO")
        elif p['role'] == 'scalar':
            lines.append(f"* @param {{{p['type']}}} {p['name']} - TODO")

    lines.extend([
        "* @throws {TypeError} first argument must be a valid order",
        "* @returns {*} result",
        "*/",
        f"function {func_name}( {pub_sig} ) {{ // eslint-disable-line max-len, max-params",
    ])

    # Variable declarations
    for mp in matrix_params:
        s1_var = 's' + mp['name'][0].lower() + '1'
        s2_var = 's' + mp['name'][0].lower() + '2'
        lines.append(f"\tvar {s1_var};")
        lines.append(f"\tvar {s2_var};")

    for vp in vector_params:
        off_var = 'o' + vp['name'][0].lower()
        lines.append(f"\tvar {off_var};")

    # Validation
    lines.extend([
        "",
        "\tif ( !isLayout( order ) ) {",
        "\t\tthrow new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );",
        "\t}",
    ])

    # Stride computation
    lines.append("\tif ( order === 'column-major' ) {")
    for mp in matrix_params:
        s1_var = 's' + mp['name'][0].lower() + '1'
        s2_var = 's' + mp['name'][0].lower() + '2'
        lines.append(f"\t\t{s1_var} = 1;")
        lines.append(f"\t\t{s2_var} = {mp['lda']};")
    lines.append("\t} else {")
    for mp in matrix_params:
        s1_var = 's' + mp['name'][0].lower() + '1'
        s2_var = 's' + mp['name'][0].lower() + '2'
        lines.append(f"\t\t{s1_var} = {mp['lda']};")
        lines.append(f"\t\t{s2_var} = 1;")
    lines.append("\t}")

    # Vector offset computation
    for vp in vector_params:
        off_var = 'o' + vp['name'][0].lower()
        vlen = get_vector_length_expr(vp['name'], params)
        lines.append(f"\t{off_var} = stride2offset( {vlen}, {vp['stride']} );")

    lines.append(f"\treturn base( {base_call} ); // eslint-disable-line max-len")
    lines.extend([
        "}",
        "",
        "",
        "// EXPORTS //",
        "",
        f"module.exports = {func_name};",
        "",
    ])

    return '\n'.join(lines)


def generate_passthrough(info, pkg, routine):
    """Generate a simple passthrough for routines without arrays."""
    func_name = info['name']
    params = info['params']
    pub_params = [p['name'] for p in params]
    pub_sig = ', '.join(pub_params)

    lines = [
        LICENSE_HEADER,
        "",
        "'use strict';",
        "",
        "// MODULES //",
        "",
        "var base = require( './base.js' );",
        "",
        "",
        "// MAIN //",
        "",
        "/**",
        f"* {info['description']}.",
        "*/",
        f"function {func_name}( {pub_sig} ) {{ // eslint-disable-line max-len, max-params",
        f"\treturn base( {pub_sig} ); // eslint-disable-line max-len",
        "}",
        "",
        "",
        "// EXPORTS //",
        "",
        f"module.exports = {func_name};",
        "",
    ]

    return '\n'.join(lines)


# ─── Main ──────────────────────────────────────────────────────────────────

def process_module(pkg, routine, dry_run=False):
    """Process a single module."""
    base_path = BASE_DIR / 'lib' / pkg / routine / 'lib' / 'base.js'
    out_path = BASE_DIR / 'lib' / pkg / routine / 'lib' / f'{routine}.js'

    if not base_path.exists():
        return None, f"No base.js found at {base_path}"

    info = parse_base_js(str(base_path))
    if info is None:
        return None, f"Could not parse {base_path}"

    content = generate_routine_js(info, pkg, routine)

    if not dry_run:
        with open(out_path, 'w') as f:
            f.write(content)

    return info, None


def main():
    dry_run = '--dry-run' in sys.argv
    do_all = '--all' in sys.argv

    if do_all:
        # Process all stub modules
        count = 0
        errors = []
        for pattern in ['lib/blas/*/lib', 'lib/lapack/*/lib']:
            for d in sorted(glob.glob(str(BASE_DIR / pattern))):
                d_rel = os.path.relpath(d, BASE_DIR)
                parts = d_rel.split(os.sep)
                # parts = ['lib', 'blas'|'lapack', '<routine>', 'lib']
                pkg = parts[1]  # blas or lapack
                routine = parts[3]
                rjs = Path(d) / f'{routine}.js'

                if not rjs.exists():
                    continue

                # Check if it's a stub
                with open(rjs) as f:
                    if 'not yet implemented' not in f.read() and 'not implemented' not in f.read():
                        continue

                info, err = process_module(pkg, routine, dry_run)
                if err:
                    errors.append(f"{routine}: {err}")
                else:
                    count += 1
                    if dry_run:
                        print(f"[DRY RUN] Would generate: {rjs}")
                    else:
                        print(f"Generated: {rjs}")

        print(f"\n{'Would generate' if dry_run else 'Generated'}: {count} files")
        if errors:
            print(f"Errors ({len(errors)}):")
            for e in errors:
                print(f"  {e}")
    else:
        # Process single module
        args = [a for a in sys.argv[1:] if not a.startswith('-')]
        if len(args) < 2:
            print("Usage: python3 bin/gen_routine_js.py <pkg> <routine>")
            print("       python3 bin/gen_routine_js.py --all [--dry-run]")
            sys.exit(1)

        pkg, routine = args[0], args[1]
        info, err = process_module(pkg, routine, dry_run)
        if err:
            print(f"Error: {err}", file=sys.stderr)
            sys.exit(1)
        else:
            out_path = BASE_DIR / 'lib' / pkg / routine / 'lib' / f'{routine}.js'
            if dry_run:
                with open(out_path) as f:
                    print(f.read())
            else:
                print(f"Generated: {out_path}")


if __name__ == '__main__':
    main()
