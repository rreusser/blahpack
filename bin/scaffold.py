#!/usr/bin/env python

"""
Generate the stdlib-js module scaffold for a BLAS/LAPACK routine.

Usage:
  python bin/scaffold.py blas daxpy
  python bin/scaffold.py lapack dpotf2
  python bin/scaffold.py lapack dpotf2 --dry-run

Generates all boilerplate files that do NOT depend on the algorithm:
  - package.json
  - lib/index.js
  - lib/main.js
  - lib/<routine>.js (BLAS-style wrapper — stub for LAPACK)
  - lib/ndarray.js (validation wrapper — stub body, correct signature)
  - lib/base.js (stub with correct signature)
  - test/test.js (scaffold)
  - README.md (scaffold)
  - docs/repl.txt (scaffold)
  - docs/types/index.d.ts (scaffold)
  - examples/index.js (scaffold)

The base.js and ndarray.js stubs have the correct function signature
(from signature.py) but a TODO body. The human/AI fills in the algorithm.
"""

import os
import sys
import json
import argparse
import textwrap

# Add bin/ to path so we can import signature
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from signature import generate_signature

YEAR = '2025'
# License headers omitted during development to reduce context/token cost.
# Run bin/add_licenses.sh before contributing to stdlib to add them back.
LICENSE_HEADER = ""

STDLIB_VALIDATORS = {
    'uplo': ('isMatrixTriangle', '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js', 'a valid matrix triangle'),
    'trans': ('isTransposeOperation', '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js', 'a valid transpose operation'),
    'transa': ('isTransposeOperation', '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js', 'a valid transpose operation'),
    'transb': ('isTransposeOperation', '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js', 'a valid transpose operation'),
    'diag': ('isDiagonalType', '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js', 'a valid diagonal type'),
    'side': ('isOperationSide', '@stdlib/blas/base/assert/is-operation-side/lib/index.js', 'a valid operation side'),
}

ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
            'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth',
            'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth',
            'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth']


def indent(text, prefix='\t'):
    return '\n'.join(prefix + line if line.strip() else '' for line in text.splitlines())


def build_blas_args(sig):
    """Build BLAS/LAPACK-style args (order + LDs) from the ndarray signature.

    Returns (blas_args, blas_arg_meta, array_ld_map) where array_ld_map maps
    array names to their LD param names.

    The 'order' param is only added for routines with 2D arrays (matrix ops).
    For 1D-only routines (level 1 BLAS), strides are kept as-is and offsets
    are dropped.
    """
    blas_args = []
    blas_arg_meta = []
    array_ld_map = {}  # array_name -> LD_name

    js_args = sig['js_args']
    js_arg_meta = sig['js_arg_meta']
    arrays_info = sig.get('arrays', {})

    # Determine if we have any 2D arrays
    has_2d = any(info['dim'] == 2 for info in arrays_info.values())

    # Add order only for matrix routines (2D arrays present)
    if has_2d:
        blas_args.append('order')
        blas_arg_meta.append({'name': 'order', 'type': 'string', 'desc': "storage layout ('row-major' or 'column-major')"})

    i = 0
    while i < len(js_args):
        name = js_args[i]
        meta = js_arg_meta[i]

        # Check if this is a 2D array (followed by stride1, stride2, offset)
        if meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array') and i + 3 < len(js_args):
            next1 = js_args[i + 1]
            next2 = js_args[i + 2]
            next3 = js_args[i + 3]
            if next1.startswith('stride') and next2.startswith('stride') and next3.startswith('offset'):
                # This is a 2D array — replace strides+offset with LD
                blas_args.append(name)
                blas_arg_meta.append(meta)
                ld_name = f'LD{name}'
                blas_args.append(ld_name)
                blas_arg_meta.append({'name': ld_name, 'type': 'PositiveInteger', 'desc': f'leading dimension of `{name}`'})
                array_ld_map[name] = ld_name
                i += 4
                continue

        # Check if this is a 1D array (followed by stride, offset)
        if meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array') and i + 2 < len(js_args):
            next1 = js_args[i + 1]
            next2 = js_args[i + 2]
            if next1.startswith('stride') and next2.startswith('offset'):
                # 1D array — keep array and stride but drop offset
                blas_args.append(name)
                blas_arg_meta.append(meta)
                stride_name = js_args[i + 1]
                blas_args.append(stride_name)
                blas_arg_meta.append({'name': stride_name, 'type': 'integer', 'desc': js_arg_meta[i + 1]['desc']})
                i += 3
                continue

        # Regular scalar param
        blas_args.append(name)
        blas_arg_meta.append(meta)
        i += 1

    return blas_args, blas_arg_meta, array_ld_map


def get_type_keywords(routine):
    """Get type-specific keywords based on routine prefix."""
    prefix = routine[0].lower()
    if prefix == 'd':
        return ['float64', 'double', 'float64array']
    elif prefix == 'z':
        return ['complex128', 'complex', 'complex128array']
    elif prefix == 's':
        return ['float32', 'float', 'float32array']
    elif prefix == 'c':
        return ['complex64', 'complex', 'complex64array']
    return ['float64', 'double', 'float64array']


def get_blas_level(routine, sig):
    """Determine the BLAS level for keyword generation."""
    arrays_info = sig.get('arrays', {})
    has_2d = any(info['dim'] == 2 for info in arrays_info.values())
    array_count = len(arrays_info)
    if has_2d:
        if array_count >= 3:
            return 'level 3'
        return 'level 2'
    return 'level 1'


def gen_base_js(routine, sig, description):
    """Generate lib/base.js — core algorithm stub with correct signature."""
    args = ', '.join(sig['js_args'])
    eslint = ' // eslint-disable-line max-len, max-params' if len(sig['js_args']) > 6 else ''
    eslint_block = '\n/* eslint-disable max-len, max-params */\n' if len(sig['js_args']) > 6 else ''
    returns_line = gen_jsdoc_returns(sig)
    returns_doc = f'\n{returns_line}' if returns_line else ''
    return f"""{LICENSE_HEADER}
{eslint_block}
// MAIN //

/**
* {description}
*
* @private
{gen_jsdoc_params(sig)}{returns_doc}
*/
function {routine}( {args} ) {{{eslint}
\t// TODO: implement
\tthrow new Error( 'not yet implemented' );
}}


// EXPORTS //

export default {routine};
"""


def gen_ndarray_js(routine, sig, package, description):
    """Generate lib/ndarray.js — validation wrapper with string param checks."""
    args = ', '.join(sig['js_args'])
    base_args = ', '.join(sig['js_args'])
    eslint = ' // eslint-disable-line max-len, max-params' if len(sig['js_args']) > 6 else ''
    eslint_call = ' // eslint-disable-line max-len' if len(sig['js_args']) > 6 else ''
    returns_line = gen_jsdoc_returns(sig)
    returns_doc = f'\n{returns_line}' if returns_line else ''

    # Determine which string params need validation
    string_params = []
    for i, meta in enumerate(sig.get('js_arg_meta', [])):
        if meta['type'] == 'string' and meta['name'] in STDLIB_VALIDATORS:
            var_name, require_path, err_desc = STDLIB_VALIDATORS[meta['name']]
            ordinal = ORDINALS[i] if i < len(ORDINALS) else f'{i+1}th'
            string_params.append({
                'name': meta['name'],
                'var': var_name,
                'require': require_path,
                'desc': err_desc,
                'ordinal': ordinal,
            })

    # Build imports
    imports = []
    seen_vars = set()
    for sp in string_params:
        if sp['var'] not in seen_vars:
            imports.append(f"import {sp['var']} from '{sp['require']}';")
            seen_vars.add(sp['var'])
    if string_params:
        imports.append("import format from '@stdlib/string/format/lib/index.js';")
    imports.append("import base from './base.js';")

    imports_block = '\n'.join(imports)

    # Build validation code
    validation_lines = []
    for sp in string_params:
        validation_lines.append(f"\tif ( !{sp['var']}( {sp['name']} ) ) {{")
        validation_lines.append(f"\t\tthrow new TypeError( format( 'invalid argument. {sp['ordinal']} argument must be {sp['desc']}. Value: `%s`.', {sp['name']} ) );")
        validation_lines.append('\t}')
    validation_block = '\n'.join(validation_lines)

    # Build @throws JSDoc
    throws_lines = []
    for sp in string_params:
        throws_lines.append(f'* @throws {{TypeError}} {sp["ordinal"]} argument must be {sp["desc"]}')
    throws_block = '\n'.join(throws_lines)
    if throws_block:
        throws_block = '\n' + throws_block

    body = validation_block + '\n' if validation_block else ''
    body += f'\treturn base( {base_args} );{eslint_call}'

    eslint_block = '\n/* eslint-disable max-len, max-params */\n' if len(sig['js_args']) > 6 else ''

    return f"""{LICENSE_HEADER}
{eslint_block}
// MODULES //

{imports_block}


// MAIN //

/**
* {description}
*
{gen_jsdoc_params(sig)}{throws_block}{returns_doc}
*/
function {routine}( {args} ) {{{eslint}
{body}
}}


// EXPORTS //

export default {routine};
"""


def gen_routine_js(routine, sig, package, description):
    """Generate lib/<routine>.js — BLAS/LAPACK-style API wrapper with layout conversion."""
    blas_args, blas_arg_meta, array_ld_map = build_blas_args(sig)
    has_order = 'order' in blas_args
    args_str = ', '.join(blas_args)
    eslint = ' // eslint-disable-line max-len, max-params' if len(blas_args) > 6 else ''
    eslint_call = ' // eslint-disable-line max-len' if len(sig['js_args']) > 6 else ''
    returns_line = gen_jsdoc_returns(sig)
    returns_doc = f'\n{returns_line}' if returns_line else ''

    # Identify 1D arrays that need stride2offset
    arrays_1d = []
    i = 0
    js_args = sig['js_args']
    js_arg_meta_list = sig['js_arg_meta']
    while i < len(js_args):
        meta = js_arg_meta_list[i]
        if meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array') and i + 2 < len(js_args):
            next1 = js_args[i + 1]
            next2 = js_args[i + 2]
            # Check it's 1D (not 2D: stride, offset but NOT stride, stride, offset)
            is_2d = (i + 3 < len(js_args) and
                     next1.startswith('stride') and
                     js_args[i + 2].startswith('stride') and
                     js_args[i + 3].startswith('offset'))
            if not is_2d and next1.startswith('stride') and next2.startswith('offset'):
                arrays_1d.append({
                    'name': js_args[i],
                    'stride': next1,
                    'offset': next2,
                })
                i += 3
                continue
        i += 1

    # Build imports
    imports = []
    if has_order:
        imports.append("import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';")
    imports.append("import format from '@stdlib/string/format/lib/index.js';")

    # String param validators
    string_params = []
    seen_vars = set()
    for i, meta in enumerate(blas_arg_meta):
        if meta['type'] == 'string' and meta['name'] in STDLIB_VALIDATORS:
            var_name, require_path, err_desc = STDLIB_VALIDATORS[meta['name']]
            ordinal = ORDINALS[i] if i < len(ORDINALS) else f'{i+1}th'
            string_params.append({
                'name': meta['name'],
                'var': var_name,
                'require': require_path,
                'desc': err_desc,
                'ordinal': ordinal,
            })
            if var_name not in seen_vars:
                imports.append(f"import {var_name} from '{require_path}';")
                seen_vars.add(var_name)

    if array_ld_map:
        imports.append("import max from '@stdlib/math/base/special/fast/max/lib/index.js';")
    if arrays_1d and not has_order:
        imports.append("import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';")
    imports.append("import base from './base.js';")

    requires_block = '\n'.join(imports)

    # Build JSDoc params
    jsdoc_lines = []
    for meta in blas_arg_meta:
        jsdoc_lines.append(f'* @param {{{meta["type"]}}} {meta["name"]} - {meta["desc"]}')
    jsdoc_params = '\n'.join(jsdoc_lines)

    # Build @throws JSDoc
    throws_lines = []
    if has_order:
        throws_lines.append('* @throws {TypeError} first argument must be a valid order')
    for sp in string_params:
        throws_lines.append(f'* @throws {{TypeError}} {sp["ordinal"]} argument must be {sp["desc"]}')
    throws_block = '\n'.join(throws_lines)
    if throws_block:
        throws_block = '\n' + throws_block

    # Build validation code
    validation_lines = []

    # Layout validation (only for matrix routines)
    if has_order:
        validation_lines.append('\tif ( !isLayout( order ) ) {')
        validation_lines.append("\t\tthrow new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );")
        validation_lines.append('\t}')

    # String param validation
    for sp in string_params:
        validation_lines.append(f"\tif ( !{sp['var']}( {sp['name']} ) ) {{")
        validation_lines.append(f"\t\tthrow new TypeError( format( 'invalid argument. {sp['ordinal']} argument must be {sp['desc']}. Value: `%s`.', {sp['name']} ) );")
        validation_lines.append('\t}')

    # Dimension validation (M, N, K >= 0)
    dim_params = []
    for i, meta in enumerate(blas_arg_meta):
        if meta['name'] in ('M', 'N', 'K') and meta['type'] in ('NonNegativeInteger', 'integer'):
            ordinal = ORDINALS[i] if i < len(ORDINALS) else f'{i+1}th'
            dim_params.append({'name': meta['name'], 'ordinal': ordinal})
    for dp in dim_params:
        validation_lines.append(f"\tif ( {dp['name']} < 0 ) {{")
        validation_lines.append(f"\t\tthrow new RangeError( format( 'invalid argument. {dp['ordinal']} argument must be a nonnegative integer. Value: `%d`.', {dp['name']} ) );")
        validation_lines.append('\t}')

    # LD validation for matrix routines.
    #
    # Compact-WY family note: the T factor of compact-WY routines (dgeqrt,
    # dgelqt, dtpqrt, dtplqt, dgemqrt, dlatsqr, etc., plus z-prefix) has
    # leading dimension constrained by the block size (nb/mb), not M/N. If
    # the array is `T` and the routine has a block-size parameter, use that
    # instead. Surfaced repeatedly by translation agents (dlatsqr, zlatsqr,
    # dlamtsqr).
    block_param = None
    for cand in ('nb', 'mb', 'NB', 'MB'):
        if cand in blas_args:
            block_param = cand
            break

    for arr_name, ld_name in array_ld_map.items():
        ld_idx = blas_args.index(ld_name)
        ld_ordinal = ORDINALS[ld_idx] if ld_idx < len(ORDINALS) else f'{ld_idx+1}th'
        if arr_name == 'T' and block_param is not None:
            # Compact-WY: T is block-by-something, LDT >= max(1, block_param)
            validation_lines.append(f"\tif ( {ld_name} < max( 1, {block_param} ) ) {{")
            validation_lines.append(f"\t\tthrow new RangeError( format( 'invalid argument. {ld_ordinal} argument must be greater than or equal to max(1,{block_param}). Value: `%d`.', {ld_name} ) );")
            validation_lines.append('\t}')
            continue
        dim_for_ld = 'N' if 'N' in blas_args else ('M' if 'M' in blas_args else None)
        if dim_for_ld:
            validation_lines.append(f"\tif ( order === 'row-major' && {ld_name} < max( 1, N ) ) {{")
            validation_lines.append(f"\t\tthrow new RangeError( format( 'invalid argument. {ld_ordinal} argument must be greater than or equal to max(1,N). Value: `%d`.', {ld_name} ) );")
            validation_lines.append('\t}')
            if 'M' in blas_args:
                validation_lines.append(f"\tif ( order === 'column-major' && {ld_name} < max( 1, M ) ) {{")
                validation_lines.append(f"\t\tthrow new RangeError( format( 'invalid argument. {ld_ordinal} argument must be greater than or equal to max(1,M). Value: `%d`.', {ld_name} ) );")
                validation_lines.append('\t}')

    validation_block = '\n'.join(validation_lines)

    # Build stride variable declarations and order-to-stride conversion
    stride_decl_lines = []
    stride_cm_lines = []
    stride_rm_lines = []
    offset_lines = []
    base_call_args = []

    # Map from ndarray args to what we pass in the base call
    i = 0
    while i < len(js_args):
        name = js_args[i]
        meta = js_arg_meta_list[i]

        # Check if 2D array
        if meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array') and i + 3 < len(js_args):
            next1 = js_args[i + 1]
            next2 = js_args[i + 2]
            next3 = js_args[i + 3]
            if next1.startswith('stride') and next2.startswith('stride') and next3.startswith('offset'):
                s1 = f's{name.lower()}1'
                s2 = f's{name.lower()}2'
                ld_name = array_ld_map[name]
                stride_decl_lines.append(f'\tvar {s1};')
                stride_decl_lines.append(f'\tvar {s2};')
                stride_cm_lines.append(f'\t\t{s1} = 1;')
                stride_cm_lines.append(f'\t\t{s2} = {ld_name};')
                stride_rm_lines.append(f'\t\t{s1} = {ld_name};')
                stride_rm_lines.append(f'\t\t{s2} = 1;')
                base_call_args.extend([name, s1, s2, '0'])
                i += 4
                continue

        # Check if 1D array
        if meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array') and i + 2 < len(js_args):
            next1 = js_args[i + 1]
            next2 = js_args[i + 2]
            if next1.startswith('stride') and next2.startswith('offset'):
                stride_name = next1
                if has_order:
                    # Matrix routine with 1D array — shouldn't normally happen
                    base_call_args.extend([name, stride_name, '0'])
                else:
                    # 1D routine — use stride2offset
                    offset_var = f'o{name}'
                    # Find the dimension param (N is the standard)
                    dim_name = 'N'
                    for m in blas_arg_meta:
                        if m['name'] == 'N':
                            dim_name = 'N'
                            break
                    offset_lines.append(f'\tvar {offset_var} = stride2offset( {dim_name}, {stride_name} );')
                    base_call_args.extend([name, stride_name, offset_var])
                i += 3
                continue

        # Regular scalar
        base_call_args.append(name)
        i += 1

    base_call_str = ', '.join(base_call_args)

    stride_decls = '\n'.join(stride_decl_lines)
    stride_cm = '\n'.join(stride_cm_lines)
    stride_rm = '\n'.join(stride_rm_lines)

    # Build the stride conversion block (only for matrix routines)
    if stride_decl_lines:
        stride_block = f"""\tif ( order === 'column-major' ) {{
{stride_cm}
\t}} else {{
{stride_rm}
\t}}"""
    else:
        stride_block = ''

    # Build the full function body
    body_parts = []
    if stride_decl_lines:
        body_parts.append(stride_decls)
        body_parts.append('')
    if offset_lines:
        body_parts.append('\n'.join(offset_lines))
    body_parts.append(validation_block)
    if stride_block:
        body_parts.append(stride_block)
    body_parts.append(f'\treturn base( {base_call_str} );{eslint_call}')

    body = '\n'.join(body_parts)

    eslint_disable = ''
    if len(blas_args) > 6:
        eslint_disable = '\n/* eslint-disable max-len, max-params */\n'

    return f"""{LICENSE_HEADER}
{eslint_disable}
// MODULES //

{requires_block}


// MAIN //

/**
* {description}
*
{jsdoc_params}{throws_block}{returns_doc}
*/
function {routine}( {args_str} ) {{{eslint}
{body}
}}


// EXPORTS //

export default {routine};
"""


def gen_main_js(routine):
    """Generate lib/main.js — attaches .ndarray to the routine."""
    return f"""{LICENSE_HEADER}

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import {routine} from './{routine}.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( {routine}, 'ndarray', ndarray );


// EXPORTS //

export default {routine};
"""


def gen_index_js(routine, package, description):
    """Generate lib/index.js — entry point."""
    return f"""{LICENSE_HEADER}

export {{ default }} from './main.js';
export {{ default as ndarray }} from './ndarray.js';
"""


def gen_package_json(routine, package, description, sig):
    """Generate package.json."""
    type_kw = get_type_keywords(routine)
    blas_level = get_blas_level(routine, sig)
    keywords = [
        'stdlib', 'stdmath', 'mathematics', 'math',
        package, blas_level, routine,
        'linear', 'algebra', 'subroutines',
        'array', 'ndarray',
    ] + type_kw

    pkg = {
        "name": f"@stdlib/{package}/base/{routine}",
        "version": "0.0.0",
        "description": description,
        "license": "Apache-2.0",
        "type": "module",
        "author": {
            "name": "The Stdlib Authors",
            "url": "https://github.com/stdlib-js/stdlib/graphs/contributors"
        },
        "contributors": [{
            "name": "The Stdlib Authors",
            "url": "https://github.com/stdlib-js/stdlib/graphs/contributors"
        }],
        "main": "./lib",
        "directories": {
            "doc": "./docs",
            "example": "./examples",
            "lib": "./lib",
            "test": "./test"
        },
        "types": "./docs/types",
        "scripts": {
            "test": f"node --test test/test.js test/test.{routine}.js test/test.ndarray.js"
        },
        "homepage": "https://github.com/stdlib-js/stdlib",
        "repository": {
            "type": "git",
            "url": "git://github.com/stdlib-js/stdlib.git"
        },
        "bugs": {
            "url": "https://github.com/stdlib-js/stdlib/issues"
        },
        "dependencies": {},
        "devDependencies": {},
        "engines": {
            "node": ">=0.10.0",
            "npm": ">2.7.0"
        },
        "os": [
            "aix", "darwin", "freebsd", "linux", "macos",
            "openbsd", "sunos", "win32", "windows"
        ],
        "keywords": keywords,
    }
    return json.dumps(pkg, indent=2) + '\n'


def gen_test_js(routine, package, sig):
    """Generate test/test.js — export and arity checks only."""
    return f"""{LICENSE_HEADER}

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import {routine} from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {{
\tassert.strictEqual( typeof {routine}, 'function', 'main export is a function' );
}});

test( 'main export has an ndarray method', function t() {{
\tassert.strictEqual( typeof {routine}.ndarray, 'function', 'has ndarray method' );
}});
"""


def gen_test_routine_js(routine, package, sig, description):
    """Generate test/test.<routine>.js — layout wrapper validation tests."""
    blas_args, blas_arg_meta, array_ld_map = build_blas_args(sig)
    arity = len(blas_args)

    # Build test cases for validation
    test_lines = []

    test_lines.append(f"test( '{routine} is a function', function t() {{")
    test_lines.append(f"\tassert.strictEqual( typeof {routine}, 'function', 'is a function' );")
    test_lines.append('});')
    test_lines.append('')
    test_lines.append(f"test( '{routine} has expected arity', function t() {{")
    test_lines.append(f"\tassert.strictEqual( {routine}.length, {arity}, 'has expected arity' );")
    test_lines.append('});')
    test_lines.append('')

    # TypeError test for invalid order
    test_lines.append(f"test( '{routine} throws TypeError for invalid order', function t() {{")
    test_lines.append('\tassert.throws( function throws() {')
    # Build dummy args
    dummy_args = _build_dummy_blas_args(blas_args, blas_arg_meta, override={'order': "'invalid'"})
    test_lines.append(f'\t\t{routine}( {dummy_args} );')
    test_lines.append('\t}, TypeError );')
    test_lines.append('});')
    test_lines.append('')

    # TypeError tests for string params
    for i, meta in enumerate(blas_arg_meta):
        if meta['type'] == 'string' and meta['name'] in STDLIB_VALIDATORS:
            test_lines.append(f"test( '{routine} throws TypeError for invalid {meta['name']}', function t() {{")
            test_lines.append('\tassert.throws( function throws() {')
            dummy_args = _build_dummy_blas_args(blas_args, blas_arg_meta, override={meta['name']: "'invalid'"})
            test_lines.append(f'\t\t{routine}( {dummy_args} );')
            test_lines.append('\t}, TypeError );')
            test_lines.append('});')
            test_lines.append('')

    # RangeError tests for dimension params
    for i, meta in enumerate(blas_arg_meta):
        if meta['name'] in ('M', 'N', 'K') and meta['type'] in ('NonNegativeInteger', 'integer'):
            test_lines.append(f"test( '{routine} throws RangeError for negative {meta['name']}', function t() {{")
            test_lines.append('\tassert.throws( function throws() {')
            dummy_args = _build_dummy_blas_args(blas_args, blas_arg_meta, override={meta['name']: '-1'})
            test_lines.append(f'\t\t{routine}( {dummy_args} );')
            test_lines.append('\t}, RangeError );')
            test_lines.append('});')
            test_lines.append('')

    tests_block = '\n'.join(test_lines)

    return f"""{LICENSE_HEADER}

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import {routine} from './../lib/{routine}.js';


// TESTS //

{tests_block}
"""


def gen_test_ndarray_js(routine, package, sig, description):
    """Generate test/test.ndarray.js — scaffold for ndarray-interface tests.

    IMPORTANT: this file requires lib/ndarray.js (the public ndarray
    surface), not lib/base.js. Tests must exercise the validator —
    bypassing it has hidden silent-correctness bugs in the past
    (validator strings disagreeing with base.js dispatch keys).
    If you genuinely need to drive base.js directly, create a separate
    test.base.js for those cases.
    """
    return f"""{LICENSE_HEADER}

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import {routine} from './../lib/ndarray.js';


// TESTS //

test( '{routine} ndarray is a function', function t() {{
\tassert.strictEqual( typeof {routine}, 'function', 'is a function' );
}});

test( 'TODO: implement ndarray tests with fixtures', function t() {{
\tassert.ok( true, 'scaffold — implement real tests with fixtures' );
}});
"""


def _build_dummy_blas_args(blas_args, blas_arg_meta, override=None):
    """Build a dummy argument string for test validation calls."""
    if override is None:
        override = {}
    parts = []
    for i, (name, meta) in enumerate(zip(blas_args, blas_arg_meta)):
        if name in override:
            parts.append(override[name])
        elif meta['type'] == 'string':
            if name == 'order':
                parts.append("'row-major'")
            elif name in ('trans', 'transa', 'transb'):
                parts.append("'no-transpose'")
            elif name == 'uplo':
                parts.append("'upper'")
            elif name == 'diag':
                parts.append("'non-unit'")
            elif name == 'side':
                parts.append("'left'")
            else:
                parts.append("'no-transpose'")
        elif meta['type'] in ('Float64Array', 'Float32Array'):
            parts.append('new Float64Array( 4 )')
        elif meta['type'] in ('NonNegativeInteger', 'PositiveInteger', 'integer', 'number'):
            parts.append('2')
        else:
            parts.append('2')
    return ', '.join(parts)


def gen_readme(routine, package, description, sig):
    """Generate README.md — stdlib-style scaffold with both APIs documented."""
    mod_path = f'@stdlib/{package}/base/{routine}'
    ndarray_args = ', '.join(sig['js_args'])
    blas_args, blas_arg_meta, array_ld_map = build_blas_args(sig)
    blas_args_str = ', '.join(blas_args)

    # Generate parameter list for layout wrapper section
    blas_param_lines = []
    for meta in blas_arg_meta:
        if meta['name'] == 'order':
            blas_param_lines.append(f"-   **order**: storage layout (`'row-major'` or `'column-major'`).")
        else:
            desc = meta['desc']
            if meta['name'].startswith('LD'):
                arr = meta['name'][2:]
                blas_param_lines.append(f'-   **{meta["name"]}**: leading dimension of `{arr}`.')
            else:
                blas_param_lines.append(f'-   **{meta["name"]}**: {desc}.')

    blas_params_str = '\n'.join(blas_param_lines)

    # Generate parameter list for ndarray section (only stride/offset params)
    ndarray_param_lines = []
    for meta in sig.get('js_arg_meta', []):
        name = meta['name']
        desc = meta['desc']
        if name.startswith('stride'):
            arr_ref = name.replace('stride', '')
            if arr_ref and arr_ref[-1] in ('1', '2'):
                arr_name = arr_ref[:-1]
                dim = arr_ref[-1]
                ndarray_param_lines.append(f'-   **{name}**: stride of dimension {dim} of `{arr_name}`.')
            else:
                ndarray_param_lines.append(f'-   **{name}**: {desc}.')
        elif name.startswith('offset'):
            arr_ref = name.replace('offset', '')
            ndarray_param_lines.append(f'-   **{name}**: starting index for `{arr_ref}`.')
        else:
            typed = meta['type']
            if typed in ('Float64Array', 'Float32Array', 'Int32Array'):
                typed = f'[`{typed}`][mdn-{typed.lower()}]'
            ndarray_param_lines.append(f'-   **{name}**: {desc}.')

    ndarray_params_str = '\n'.join(ndarray_param_lines)

    license_header = """<!--

@license Apache-2.0

Copyright (c) {year} The Stdlib Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->""".format(year=YEAR)

    return f"""{license_header}

# {routine}

> {description}

<section class="usage">

## Usage

```javascript
import {routine} from '{mod_path}/lib/index.js';
```

#### {routine}( {blas_args_str} )

{description}

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

// TODO: Add usage example
```

The function has the following parameters:

{blas_params_str}

#### {routine}.ndarray( {ndarray_args} )

{description}, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

// TODO: Add usage example
```

The function has the following additional parameters:

{ndarray_params_str}

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   TODO: Add notes.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
// TODO: Add examples
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
"""


def gen_repl_txt(routine, sig, description):
    """Generate docs/repl.txt — stdlib-style with both layout and ndarray sections."""
    blas_args, blas_arg_meta, array_ld_map = build_blas_args(sig)
    blas_args_str = ', '.join(blas_args)
    ndarray_args = ', '.join(sig['js_args'])

    returns_type = sig.get('returns_jsdoc', 'void')

    # Generate BLAS-style parameter docs
    blas_param_lines = []
    for meta in blas_arg_meta:
        repl_type = meta['type']
        if repl_type == 'NonNegativeInteger':
            repl_type = 'integer'
        elif repl_type == 'PositiveInteger':
            repl_type = 'integer'
        blas_param_lines.append(f'    {meta["name"]}: {repl_type}')
        if meta['name'] == 'order':
            blas_param_lines.append("        Row-major (C-style) or column-major (Fortran-style) order.")
        elif meta['name'].startswith('LD'):
            arr = meta['name'][2:]
            blas_param_lines.append(f'        leading dimension of `{arr}`.')
        else:
            blas_param_lines.append(f'        {meta["desc"]}.')
        blas_param_lines.append('')

    blas_params_str = '\n'.join('    ' + line if line.strip() else '' for line in blas_param_lines)

    # Generate ndarray parameter docs
    ndarray_param_lines = []
    for meta in sig.get('js_arg_meta', []):
        repl_type = meta['type']
        if repl_type == 'NonNegativeInteger':
            repl_type = 'integer'
        elif repl_type == 'PositiveInteger':
            repl_type = 'integer'
        ndarray_param_lines.append(f'    {meta["name"]}: {repl_type}')
        if meta['name'].startswith('stride') and meta['name'][-1] in ('1', '2'):
            arr_ref = meta['name'].replace('stride', '')[:-1]
            dim = meta['name'][-1]
            ndarray_param_lines.append(f'        stride of dimension {dim} of `{arr_ref}`.')
        elif meta['name'].startswith('offset'):
            arr_ref = meta['name'].replace('offset', '')
            ndarray_param_lines.append(f'        starting index for `{arr_ref}`.')
        else:
            ndarray_param_lines.append(f'        {meta["desc"]}.')
        ndarray_param_lines.append('')

    ndarray_params_str = '\n'.join('    ' + line if line.strip() else '' for line in ndarray_param_lines)

    return f"""
{{{{alias}}}}( {blas_args_str} )
    {description}

    Parameters
    ----------
{blas_params_str}
    Returns
    -------
    out: {returns_type}
        Result.

    Examples
    --------
    // TODO: Add examples


{{{{alias}}}}.ndarray( {ndarray_args} )
    {description}, using alternative indexing semantics.

    Parameters
    ----------
{ndarray_params_str}
    Returns
    -------
    out: {returns_type}
        Result.

    Examples
    --------
    // TODO: Add examples

    See Also
    --------
"""


def gen_types_dts(routine, package, sig, description):
    """Generate docs/types/index.d.ts — stdlib-style with both signatures."""
    mod_path = f'@stdlib/{package}/base/{routine}'
    blas_args, blas_arg_meta, array_ld_map = build_blas_args(sig)

    ts_type_map = {
        'integer': 'number',
        'NonNegativeInteger': 'number',
        'PositiveInteger': 'number',
        'number': 'number',
        'string': 'string',
        'boolean': 'boolean',
        'Float64Array': 'Float64Array',
        'Float32Array': 'Float32Array',
        'Int32Array': 'Int32Array',
    }

    # Determine TS type for string params in BLAS signature
    ts_string_type_map = {
        'order': 'Layout',
        'trans': 'TransposeOperation',
        'transa': 'TransposeOperation',
        'transb': 'TransposeOperation',
        'uplo': 'string',
        'diag': 'string',
        'side': 'string',
    }

    # Collect which typed imports we need
    needs_layout = 'order' in blas_args
    needs_transpose = any(n in blas_args for n in ('trans', 'transa', 'transb'))

    imports = []
    if needs_layout or needs_transpose:
        type_imports = []
        if needs_transpose:
            type_imports.append('TransposeOperation')
        if needs_layout:
            type_imports.append('Layout')
        imports.append(f"import {{ {', '.join(type_imports)} }} from '@stdlib/types/blas';")

    imports_block = '\n'.join(imports)

    # Generate BLAS-style TS params
    blas_ts_params = []
    for meta in blas_arg_meta:
        name = meta['name']
        if name in ts_string_type_map:
            ts_type = ts_string_type_map[name]
        else:
            ts_type = ts_type_map.get(meta['type'], 'any')
        blas_ts_params.append(f'\t\t{name}: {ts_type}')

    blas_ts_params_str = ', '.join(f'{name}: {ts_type}' for name, ts_type in
        [(meta['name'], ts_string_type_map.get(meta['name'], ts_type_map.get(meta['type'], 'any'))) for meta in blas_arg_meta])

    # Generate ndarray TS params
    ndarray_ts_params_str = ', '.join(f'{meta["name"]}: {ts_string_type_map.get(meta["name"], ts_type_map.get(meta["type"], "any"))}' for meta in sig.get('js_arg_meta', []))

    # Determine return type
    returns_ts = 'number' if sig.get('returns_jsdoc') else 'void'
    for meta in sig.get('js_arg_meta', []):
        if meta['type'] in ('Float64Array', 'Float32Array'):
            returns_ts = meta['type']
            break

    # Build JSDoc for layout wrapper
    blas_jsdoc_lines = []
    for meta in blas_arg_meta:
        if meta['name'] == 'order':
            blas_jsdoc_lines.append('\t* @param order - storage layout')
        elif meta['name'].startswith('LD'):
            arr = meta['name'][2:]
            blas_jsdoc_lines.append(f'\t* @param {meta["name"]} - leading dimension of `{arr}`')
        else:
            blas_jsdoc_lines.append(f'\t* @param {meta["name"]} - {meta["desc"]}')
    blas_jsdoc_params = '\n'.join(blas_jsdoc_lines)
    if returns_ts != 'void':
        blas_jsdoc_params += '\n\t* @returns result'

    # Build JSDoc for ndarray
    ndarray_jsdoc_lines = []
    for meta in sig.get('js_arg_meta', []):
        name = meta['name']
        if name.startswith('stride') and name[-1] in ('1', '2'):
            arr_ref = name.replace('stride', '')[:-1]
            ndarray_jsdoc_lines.append(f'\t* @param {name} - stride of `{arr_ref}`')
        elif name.startswith('offset'):
            arr_ref = name.replace('offset', '')
            ndarray_jsdoc_lines.append(f'\t* @param {name} - starting index for `{arr_ref}`')
        else:
            ndarray_jsdoc_lines.append(f'\t* @param {name} - {meta["desc"]}')
    ndarray_jsdoc_params = '\n'.join(ndarray_jsdoc_lines)
    if returns_ts != 'void':
        ndarray_jsdoc_params += '\n\t* @returns result'

    license = """/*
* @license Apache-2.0
*
* Copyright (c) {year} The Stdlib Authors.
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
*/""".format(year=YEAR)

    return f"""{license}

// TypeScript Version: 4.1

/// <reference types="@stdlib/types"/>

{imports_block}

/**
* Interface describing `{routine}`.
*/
interface Routine {{
\t/**
\t* {description}
\t*
{blas_jsdoc_params}
\t*/
\t( {blas_ts_params_str} ): {returns_ts};

\t/**
\t* {description}, using alternative indexing semantics.
\t*
{ndarray_jsdoc_params}
\t*/
\tndarray( {ndarray_ts_params_str} ): {returns_ts};
}}

/**
* {description}
*/
declare var {routine}: Routine;


// EXPORTS //

export = {routine};
"""


def gen_examples_js(routine, package, sig):
    """Generate examples/index.js — working example. Picks Complex128Array
    for z/c-prefix routines (random utils don't support complex dtype yet),
    otherwise uses discreteUniform. The call itself is a TODO placeholder."""
    mod_path = f'@stdlib/{package}/base/{routine}'
    arrays_info = sig.get('arrays', {})
    has_2d = any(info['dim'] == 2 for info in arrays_info.values())
    is_complex = routine.startswith(('z', 'c'))

    if is_complex:
        if has_2d:
            return f"""{LICENSE_HEADER}

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import {routine} from '{mod_path}/lib/index.js';

var M = 3;
var N = 3;
var A = new Complex128Array( M * N );
var B = new Complex128Array( M * N );
var C = new Complex128Array( M * N );

// TODO: Adjust call to match the specific routine signature
{routine}( 'row-major', M, N, A, B, C );
console.log( C ); // eslint-disable-line no-console
"""
        return f"""{LICENSE_HEADER}

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import {routine} from '{mod_path}/lib/index.js';

var N = 10;
var x = new Complex128Array( N );
var y = new Complex128Array( N );

// TODO: Adjust call to match the specific routine signature
{routine}( N, x, 1, y, 1 );
console.log( y ); // eslint-disable-line no-console
"""

    if has_2d:
        return f"""{LICENSE_HEADER}

// MODULES //

import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import {routine} from '{mod_path}/lib/index.js';

var opts = {{
\t'dtype': 'float64'
}};

var M = 3;
var N = 3;
var A = discreteUniform( M * N, -10, 10, opts );
var B = discreteUniform( M * N, -10, 10, opts );
var C = discreteUniform( M * N, -10, 10, opts );

// TODO: Adjust call to match the specific routine signature
{routine}( 'row-major', M, N, 1.0, A, N, B, N, 0.0, C, N );
console.log( C ); // eslint-disable-line no-console
"""
    return f"""{LICENSE_HEADER}

// MODULES //

import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import {routine} from '{mod_path}/lib/index.js';

var opts = {{
\t'dtype': 'float64'
}};

var N = 10;
var x = discreteUniform( N, -10, 10, opts );
var y = discreteUniform( N, -10, 10, opts );

// TODO: Adjust call to match the specific routine signature
{routine}( N, 1.0, x, 1, y, 1 );
console.log( y ); // eslint-disable-line no-console
"""


def gen_benchmark_js(routine, package, sig, description):
    """Generate benchmark/benchmark.js — BLAS-style benchmark."""
    blas_args, blas_arg_meta, array_ld_map = build_blas_args(sig)
    arrays_info = sig.get('arrays', {})
    has_2d = any(info['dim'] == 2 for info in arrays_info.values())
    is_complex = routine.startswith(('z', 'c'))
    # Cap N for matrix (N*N) benchmarks so buffers stay ~8 MB per array.
    # 2D: max=3 → N=1000 → N*N=1e6 doubles = 8 MB. 1D: max=6 → 1e6 doubles = 8 MB.
    max_exp = 3 if has_2d else 6

    # Build benchmark call args
    if has_2d:
        # Matrix benchmark — build a call like dgemm('row-major', 'no-transpose', ..., N, N, N, 1.0, A, N, B, N, 1.0, C, N)
        call_parts = []
        for meta in blas_arg_meta:
            name = meta['name']
            if name == 'order':
                call_parts.append("'row-major'")
            elif name in ('trans', 'transa', 'transb'):
                call_parts.append("'no-transpose'")
            elif name == 'uplo':
                call_parts.append("'upper'")
            elif name == 'diag':
                call_parts.append("'non-unit'")
            elif name == 'side':
                call_parts.append("'left'")
            elif meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array', 'Complex64Array'):
                call_parts.append(name)
            elif name in ('M', 'N', 'K'):
                call_parts.append('N')
            elif name.startswith('LD'):
                call_parts.append('N')
            elif name in ('alpha', 'beta'):
                call_parts.append('1.0')
            else:
                call_parts.append('N')
        call_str = ', '.join(call_parts)

        # Build array creation
        array_names = [meta['name'] for meta in blas_arg_meta if meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array', 'Complex64Array')]
        if is_complex:
            array_creates = '\n'.join(f"\tvar {name} = new Complex128Array( N * N );" for name in array_names)
        else:
            array_creates = '\n'.join(f"\tvar {name} = uniform( N * N, -10.0, 10.0, options );" for name in array_names)
    else:
        # Vector benchmark
        call_parts = []
        for meta in blas_arg_meta:
            name = meta['name']
            if name == 'order':
                call_parts.append("'row-major'")
            elif name in ('trans', 'transa', 'transb'):
                call_parts.append("'no-transpose'")
            elif meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array', 'Complex64Array'):
                call_parts.append(name)
            elif name in ('M', 'N', 'K'):
                call_parts.append('N')
            elif name.startswith('inc'):
                call_parts.append('1')
            elif name in ('alpha', 'beta'):
                call_parts.append('1.0')
            else:
                call_parts.append('N')
        call_str = ', '.join(call_parts)

        array_names = [meta['name'] for meta in blas_arg_meta if meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array', 'Complex64Array')]
        if is_complex:
            array_creates = '\n'.join(f"\tvar {name} = new Complex128Array( N );" for name in array_names)
        else:
            array_creates = '\n'.join(f"\tvar {name} = uniform( N, -10.0, 10.0, options );" for name in array_names)

    if is_complex:
        random_import = "import Complex128Array from '@stdlib/array/complex128/lib/index.js';"
        options_block = ""
    else:
        random_import = "import uniform from '@stdlib/random/array/uniform/lib/index.js';"
        options_block = "var options = {\n\t'dtype': 'float64'\n};\n\n\n"

    return f"""{LICENSE_HEADER}

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
{random_import}
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import {{ name as pkg }} from './../package.json' with {{ type: 'json' }};
import {routine} from './../lib/{routine}.js';


// VARIABLES //

{options_block}// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {{PositiveInteger}} len - array length
* @returns {{Function}} benchmark function
*/
function createBenchmark( len ) {{
\tvar N = len;
{array_creates}
\treturn benchmark;

\t/**
\t* Benchmark function.
\t*
\t* @private
\t* @param {{Benchmark}} b - benchmark instance
\t*/
\tfunction benchmark( b ) {{
\t\tvar y;
\t\tvar i;

\t\tb.tic();
\t\tfor ( i = 0; i < b.iterations; i++ ) {{
\t\t\ty = {routine}( {call_str} );
\t\t\tif ( isnan( y ) ) {{
\t\t\t\tb.fail( 'should not return NaN' );
\t\t\t}}
\t\t}}
\t\tb.toc();
\t\tif ( isnan( y ) ) {{
\t\t\tb.fail( 'should not return NaN' );
\t\t}}
\t\tb.pass( 'benchmark finished' );
\t\tb.end();
\t}}
}}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {{
\tvar len;
\tvar min;
\tvar max;
\tvar f;
\tvar i;

\tmin = 1; // 10^min
\tmax = {max_exp}; // 10^max

\tfor ( i = min; i <= max; i++ ) {{
\t\tlen = pow( 10, i );
\t\tf = createBenchmark( len );
\t\tbench( format( '%s:len=%d', pkg, len ), f );
\t}}
}}

main();
"""


def gen_benchmark_ndarray_js(routine, package, sig, description):
    """Generate benchmark/benchmark.ndarray.js — ndarray-style benchmark."""
    arrays_info = sig.get('arrays', {})
    has_2d = any(info['dim'] == 2 for info in arrays_info.values())
    is_complex = routine.startswith(('z', 'c'))
    # Cap N for matrix benchmarks; see gen_benchmark_js for rationale.
    max_exp = 3 if has_2d else 6
    js_args = sig['js_args']
    js_arg_meta = sig['js_arg_meta']

    # Build ndarray benchmark call args
    call_parts = []
    for meta in js_arg_meta:
        name = meta['name']
        if name in ('trans', 'transa', 'transb'):
            call_parts.append("'no-transpose'")
        elif name == 'uplo':
            call_parts.append("'upper'")
        elif name == 'diag':
            call_parts.append("'non-unit'")
        elif name == 'side':
            call_parts.append("'left'")
        elif meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array', 'Complex64Array'):
            call_parts.append(name)
        elif name in ('M', 'N', 'K'):
            call_parts.append('N')
        elif name.startswith('stride') and name[-1] in ('1', '2'):
            if name[-1] == '1':
                call_parts.append('N')
            else:
                call_parts.append('1')
        elif name.startswith('stride'):
            call_parts.append('1')
        elif name.startswith('offset'):
            call_parts.append('0')
        elif name in ('alpha', 'beta'):
            call_parts.append('1.0')
        else:
            call_parts.append('N')
    call_str = ', '.join(call_parts)

    # Build array creation
    array_names = [meta['name'] for meta in js_arg_meta if meta['type'] in ('Float64Array', 'Float32Array', 'Complex128Array', 'Complex64Array')]
    if is_complex:
        if has_2d:
            array_creates = '\n'.join(f"\tvar {name} = new Complex128Array( N * N );" for name in array_names)
        else:
            array_creates = '\n'.join(f"\tvar {name} = new Complex128Array( N );" for name in array_names)
    elif has_2d:
        array_creates = '\n'.join(f"\tvar {name} = uniform( N * N, -10.0, 10.0, options );" for name in array_names)
    else:
        array_creates = '\n'.join(f"\tvar {name} = uniform( N, -10.0, 10.0, options );" for name in array_names)

    if is_complex:
        random_import = "import Complex128Array from '@stdlib/array/complex128/lib/index.js';"
        options_block = ""
    else:
        random_import = "import uniform from '@stdlib/random/array/uniform/lib/index.js';"
        options_block = "var options = {\n\t'dtype': 'float64'\n};\n\n\n"

    return f"""{LICENSE_HEADER}

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
{random_import}
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import {{ name as pkg }} from './../package.json' with {{ type: 'json' }};
import {routine} from './../lib/ndarray.js';


// VARIABLES //

{options_block}// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {{PositiveInteger}} len - array length
* @returns {{Function}} benchmark function
*/
function createBenchmark( len ) {{
\tvar N = len;
{array_creates}
\treturn benchmark;

\t/**
\t* Benchmark function.
\t*
\t* @private
\t* @param {{Benchmark}} b - benchmark instance
\t*/
\tfunction benchmark( b ) {{
\t\tvar y;
\t\tvar i;

\t\tb.tic();
\t\tfor ( i = 0; i < b.iterations; i++ ) {{
\t\t\ty = {routine}( {call_str} );
\t\t\tif ( isnan( y ) ) {{
\t\t\t\tb.fail( 'should not return NaN' );
\t\t\t}}
\t\t}}
\t\tb.toc();
\t\tif ( isnan( y ) ) {{
\t\t\tb.fail( 'should not return NaN' );
\t\t}}
\t\tb.pass( 'benchmark finished' );
\t\tb.end();
\t}}
}}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {{
\tvar len;
\tvar min;
\tvar max;
\tvar f;
\tvar i;

\tmin = 1; // 10^min
\tmax = {max_exp}; // 10^max

\tfor ( i = min; i <= max; i++ ) {{
\t\tlen = pow( 10, i );
\t\tf = createBenchmark( len );
\t\tbench( format( '%s:ndarray:len=%d', pkg, len ), f );
\t}}
}}

main();
"""


def gen_test_ts(routine, package, sig, description):
    """Generate docs/types/test.ts — TypeScript compile-time tests."""
    blas_args, blas_arg_meta, array_ld_map = build_blas_args(sig)

    # Determine return type
    returns_ts = 'number' if sig.get('returns_jsdoc') else 'void'
    for meta in sig.get('js_arg_meta', []):
        if meta['type'] in ('Float64Array', 'Float32Array'):
            returns_ts = meta['type']
            break

    # Build dummy call for layout wrapper
    blas_dummy_parts = []
    for meta in blas_arg_meta:
        name = meta['name']
        if name == 'order':
            blas_dummy_parts.append("'row-major'")
        elif name in ('trans', 'transa', 'transb'):
            blas_dummy_parts.append("'no-transpose'")
        elif name == 'uplo':
            blas_dummy_parts.append("'upper'")
        elif name == 'diag':
            blas_dummy_parts.append("'non-unit'")
        elif name == 'side':
            blas_dummy_parts.append("'left'")
        elif meta['type'] in ('Float64Array', 'Float32Array'):
            blas_dummy_parts.append(f'new {meta["type"]}( 4 )')
        else:
            blas_dummy_parts.append('2')
    blas_call = ', '.join(blas_dummy_parts)

    # Build dummy call for ndarray
    ndarray_dummy_parts = []
    for meta in sig.get('js_arg_meta', []):
        name = meta['name']
        if name in ('trans', 'transa', 'transb'):
            ndarray_dummy_parts.append("'no-transpose'")
        elif name == 'uplo':
            ndarray_dummy_parts.append("'upper'")
        elif name == 'diag':
            ndarray_dummy_parts.append("'non-unit'")
        elif name == 'side':
            ndarray_dummy_parts.append("'left'")
        elif meta['type'] in ('Float64Array', 'Float32Array'):
            ndarray_dummy_parts.append(f'new {meta["type"]}( 4 )')
        else:
            ndarray_dummy_parts.append('2')
    ndarray_call = ', '.join(ndarray_dummy_parts)

    license = """/*
* @license Apache-2.0
*
* Copyright (c) {year} The Stdlib Authors.
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
*/""".format(year=YEAR)

    return f"""{license}

import {routine} from './index';


// TESTS //

// The function returns a {returns_ts}...
{{
\t{routine}( {blas_call} ); // $ExpectType {returns_ts}
}}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{{
\t{routine}(); // $ExpectError
}}

// The ndarray method returns a {returns_ts}...
{{
\t{routine}.ndarray( {ndarray_call} ); // $ExpectType {returns_ts}
}}

// The compiler throws an error if the ndarray method is provided an unsupported number of arguments...
{{
\t{routine}.ndarray(); // $ExpectError
}}
"""


def gen_learnings_md(routine):
    """Generate LEARNINGS.md template, prefix-aware."""
    is_complex = routine.startswith(('z', 'c'))
    complex_section = (
        '## Complex number handling\n\n'
        '(Note any subtleties in complex arithmetic — what was inlined vs.\n'
        'library calls, conjugation gotchas, real/imag extraction patterns.)\n'
    ) if is_complex else ''
    return (
        f'# {routine}: Translation Learnings\n\n'
        'Document anything surprising or non-obvious that came up during\n'
        'translation. Only write sections where you have something to say —\n'
        'leave out sections that would just say "N/A". The goal is to capture\n'
        'hard-won knowledge that helps future translations.\n\n'
        '## Translation pitfalls\n\n'
        '(Index off-by-ones, Fortran loop bound surprises, non-obvious\n'
        'packed storage conventions, string flag values that differ from\n'
        'the standard table, etc.)\n\n'
        '## Dependency interface surprises\n\n'
        '(Unexpected calling conventions, parameter ordering, stride\n'
        'semantics, or return value conventions in dependencies.)\n\n'
        + complex_section
    )


def gen_jsdoc_params(sig):
    """Generate JSDoc @param lines from signature metadata."""
    lines = []
    for meta in sig.get('js_arg_meta', []):
        lines.append(f'* @param {{{meta["type"]}}} {meta["name"]} - {meta["desc"]}')
    return '\n'.join(lines)


def gen_jsdoc_returns(sig):
    """Generate JSDoc @returns line from signature metadata."""
    rj = sig.get('returns_jsdoc')
    if rj is None:
        return ''
    if sig['returns'] == 'integer':
        return f'* @returns {{{rj}}} status code (0 = success)'
    return f'* @returns {{{rj}}} result'


def main():
    parser = argparse.ArgumentParser(description='Generate stdlib-js module scaffold')
    parser.add_argument('package', choices=['blas', 'lapack'], help='Package (blas or lapack)')
    parser.add_argument('routine', help='Routine name (e.g., daxpy, dpotf2)')
    parser.add_argument('--description', '-d', default=None, help='One-line description')
    parser.add_argument('--dry-run', action='store_true', help='Print files without writing')
    args = parser.parse_args()

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Locate Fortran source
    if args.package == 'blas':
        fortran_path = os.path.join(root_dir, 'data', 'BLAS-3.12.0', f'{args.routine}.f')
    else:
        fortran_path = os.path.join(root_dir, 'data', 'lapack-3.12.0', 'SRC', f'{args.routine}.f')

    if not os.path.exists(fortran_path):
        # Try .f90 extension
        fortran_path_f90 = fortran_path.replace('.f', '.f90')
        if os.path.exists(fortran_path_f90):
            fortran_path = fortran_path_f90
        else:
            print(f'Error: {fortran_path} not found', file=sys.stderr)
            sys.exit(1)

    # Generate signature
    sig = generate_signature(fortran_path)
    if sig is None:
        print(f'Error: could not parse {fortran_path}', file=sys.stderr)
        sys.exit(1)

    description = args.description or f'TODO: Add description for {args.routine.upper()}.'

    # Build output directory
    out_dir = os.path.join(root_dir, 'lib', args.package, 'base', args.routine)

    # Generate all files
    files = {
        'package.json': gen_package_json(args.routine, args.package, description, sig),
        'lib/base.js': gen_base_js(args.routine, sig, description),
        'lib/ndarray.js': gen_ndarray_js(args.routine, sig, args.package, description),
        f'lib/{args.routine}.js': gen_routine_js(args.routine, sig, args.package, description),
        'lib/main.js': gen_main_js(args.routine),
        'lib/index.js': gen_index_js(args.routine, args.package, description),
        'test/test.js': gen_test_js(args.routine, args.package, sig),
        f'test/test.{args.routine}.js': gen_test_routine_js(args.routine, args.package, sig, description),
        'test/test.ndarray.js': gen_test_ndarray_js(args.routine, args.package, sig, description),
        'README.md': gen_readme(args.routine, args.package, description, sig),
        'docs/repl.txt': gen_repl_txt(args.routine, sig, description),
        'docs/types/index.d.ts': gen_types_dts(args.routine, args.package, sig, description),
        'docs/types/test.ts': gen_test_ts(args.routine, args.package, sig, description),
        'examples/index.js': gen_examples_js(args.routine, args.package, sig),
        'benchmark/benchmark.js': gen_benchmark_js(args.routine, args.package, sig, description),
        'benchmark/benchmark.ndarray.js': gen_benchmark_ndarray_js(args.routine, args.package, sig, description),
        'LEARNINGS.md': gen_learnings_md(args.routine),
    }

    for rel_path, content in files.items():
        full_path = os.path.join(out_dir, rel_path)
        if args.dry_run:
            print(f'=== {rel_path} ===')
            print(content[:200] + ('...' if len(content) > 200 else ''))
            print()
        else:
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            # Don't overwrite files that may have real content
            protected = {'lib/base.js', 'test/test.js', 'LEARNINGS.md'}
            if os.path.exists(full_path) and rel_path in protected:
                print(f'  SKIP (exists): {rel_path}', file=sys.stderr)
                continue
            with open(full_path, 'w') as f:
                f.write(content)
            print(f'  Created: {rel_path}', file=sys.stderr)

    if not args.dry_run:
        print(f'\nScaffold written to {out_dir}', file=sys.stderr)
        print(f'Next: implement lib/base.js, then run: node --test {out_dir}/test/test.js', file=sys.stderr)


if __name__ == '__main__':
    main()
