#!/usr/bin/env python
"""
Fix TODO @param in strided.js and <routine>.js wrapper files.

For strided.js:
  - Copy @param JSDoc from base.js (remove @private, add @throws for string params)
  - Add validation for string params (uplo, trans, diag, side, norm, etc.)

For <routine>.js (BLAS-style wrappers):
  - If the file has real code (calls base()), extract params and generate proper docs
  - If it's a stub (throws 'not yet implemented'), just fix the @param TODO lines

Usage:
  python bin/fix_wrapper_docs.py          # fix all
  python bin/fix_wrapper_docs.py --dry-run # preview changes
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Map of string param names to their validator require path and description
STRING_VALIDATORS = {
    'uplo': {
        'require': "var isMatrixTriangle = require( '@stdlib/blas/base/assert/is-matrix-triangle' );",
        'var': 'isMatrixTriangle',
        'desc': 'a valid matrix triangle',
    },
    'trans': {
        'require': "var isTransposeOperation = require( '@stdlib/blas/base/assert/is-transpose-operation' );",
        'var': 'isTransposeOperation',
        'desc': 'a valid transpose operation',
    },
    'transa': {
        'require': "var isTransposeOperation = require( '@stdlib/blas/base/assert/is-transpose-operation' );",
        'var': 'isTransposeOperation',
        'desc': 'a valid transpose operation',
    },
    'transb': {
        'require': "var isTransposeOperation = require( '@stdlib/blas/base/assert/is-transpose-operation' );",
        'var': 'isTransposeOperation',
        'desc': 'a valid transpose operation',
    },
    'diag': {
        'require': "var isDiagonalType = require( '@stdlib/blas/base/assert/is-diagonal-type' );",
        'var': 'isDiagonalType',
        'desc': 'a valid diagonal type',
    },
    'side': {
        'require': "var isOperationSide = require( '@stdlib/blas/base/assert/is-operation-side' );",
        'var': 'isOperationSide',
        'desc': 'a valid operation side',
    },
}

# Ordinal words for throw descriptions
ORDINALS = [
    'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
    'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth',
]


def extract_jsdoc_from_base(base_path):
    """Extract JSDoc block from base.js, returning (description, param_lines, returns_line)."""
    with open(base_path) as f:
        content = f.read()

    # Find the JSDoc block that contains @param (the function JSDoc, not license)
    all_blocks = re.findall(r'/\*\*\n(.*?)\*/', content, re.DOTALL)
    block = None
    for b in all_blocks:
        if '@param' in b:
            block = b
            break
    if not block:
        return None, [], None
    lines = block.strip().split('\n')

    description_lines = []
    param_lines = []
    returns_line = None

    for line in lines:
        line = line.strip()
        if line.startswith('* @param'):
            # Remove @private
            param_lines.append(line)
        elif line.startswith('* @returns'):
            returns_line = line
        elif line.startswith('* @private'):
            continue
        elif not param_lines and not returns_line:
            description_lines.append(line)

    # Clean description
    desc = '\n'.join(description_lines).strip()

    return desc, param_lines, returns_line


def get_string_params_from_jsdoc(param_lines):
    """Extract param names that are {string} type."""
    string_params = []
    for line in param_lines:
        m = re.match(r'\* @param \{string\} (\w+)', line)
        if m:
            string_params.append(m.group(1))
    return string_params


def get_function_params(filepath):
    """Extract the parameter list from the function signature."""
    with open(filepath) as f:
        content = f.read()
    m = re.search(r'function \w+\(\s*([^)]+)\s*\)', content)
    if not m:
        return []
    params_str = m.group(1)
    # Remove eslint comments
    params_str = re.sub(r'\s*//.*', '', params_str)
    return [p.strip() for p in params_str.split(',') if p.strip()]


def fix_strided(strided_path, base_path, dry_run=False):
    """Fix strided.js: copy JSDoc from base.js, add validation."""
    with open(strided_path) as f:
        content = f.read()

    # Skip if already has proper validation (not a scaffold)
    # But still fix TODO params if present
    has_todo = 'TODO' in content and '@param' in content
    has_todo_type = '{TODO}' in content  # Some files have {TODO} as the type

    desc, param_lines, returns_line = extract_jsdoc_from_base(base_path)
    if not param_lines:
        return False

    func_params = get_function_params(strided_path)
    if not func_params:
        return False

    string_params = get_string_params_from_jsdoc(param_lines)
    # Only validate params that have known validators
    validatable = [(i, p) for i, p in enumerate(func_params) if p in STRING_VALIDATORS]

    # Build new JSDoc
    new_jsdoc_lines = []
    new_jsdoc_lines.append('/**')
    # Use description from base.js
    if desc:
        for line in desc.split('\n'):
            line = line.strip()
            if line == '*':
                new_jsdoc_lines.append(' *')
            else:
                new_jsdoc_lines.append(' ' + line)
    new_jsdoc_lines.append(' *')

    # Add param lines (from base.js, without @private)
    for pl in param_lines:
        new_jsdoc_lines.append(' ' + pl)

    # Add @throws for validated params
    for idx, pname in validatable:
        ordinal = ORDINALS[idx] if idx < len(ORDINALS) else f'{idx+1}th'
        validator_info = STRING_VALIDATORS[pname]
        new_jsdoc_lines.append(f' * @throws {{TypeError}} {ordinal} argument must be {validator_info["desc"]}')

    # Add returns
    if returns_line:
        new_jsdoc_lines.append(' ' + returns_line)

    new_jsdoc_lines.append(' */')

    new_jsdoc = '\n'.join(new_jsdoc_lines)

    # Build validation code
    validation_lines = []
    for idx, pname in validatable:
        validator_info = STRING_VALIDATORS[pname]
        ordinal = ORDINALS[idx] if idx < len(ORDINALS) else f'{idx+1}th'
        validation_lines.append(
            f"\tif ( !{validator_info['var']}( {pname} ) ) {{"
        )
        validation_lines.append(
            f"\t\tthrow new TypeError( format( 'invalid argument. {ordinal} argument must be {validator_info['desc']}. Value: `%s`.', {pname} ) );"
        )
        validation_lines.append('\t}')

    validation_code = '\n'.join(validation_lines)

    # Build requires
    needs_format = bool(validatable)
    needed_requires = set()
    for _, pname in validatable:
        needed_requires.add(STRING_VALIDATORS[pname]['require'])

    # Now rebuild the file
    # Find the existing JSDoc block and replace it
    old_jsdoc_match = re.search(r'/\*\*\n.*?\*/', content, re.DOTALL)
    if not old_jsdoc_match:
        return False

    # Replace JSDoc
    new_content = content[:old_jsdoc_match.start()] + new_jsdoc + content[old_jsdoc_match.end():]

    # Add validation after function opening brace (before return base(...))
    if validation_code and 'throw new TypeError' not in content:
        # Find function body
        func_match = re.search(r'(function \w+\([^)]*\)\s*\{[^\n]*\n)', new_content)
        if func_match:
            insert_pos = func_match.end()
            new_content = new_content[:insert_pos] + validation_code + '\n' + new_content[insert_pos:]

    # Add requires if not present
    if needed_requires:
        # Find the existing require section
        require_section_match = re.search(r"(var base = require\( '\./base\.js' \);)", new_content)
        if require_section_match:
            insert_before = require_section_match.start()
            new_requires = []
            for req in sorted(needed_requires):
                if req not in new_content:
                    new_requires.append(req)
            if needs_format and "var format = require( '@stdlib/string/format' );" not in new_content:
                new_requires.append("var format = require( '@stdlib/string/format' );")
            if new_requires:
                req_text = '\n'.join(new_requires) + '\n'
                new_content = new_content[:insert_before] + req_text + new_content[insert_before:]

    if new_content != content:
        if not dry_run:
            with open(strided_path, 'w') as f:
                f.write(new_content)
        return True
    return False


def fix_routine_js(routine_path, base_path, dry_run=False):
    """Fix <routine>.js: update TODO @param with proper descriptions."""
    with open(routine_path) as f:
        content = f.read()

    if 'TODO' not in content:
        return False

    # If it's a stub (not yet implemented), just fix the JSDoc
    is_stub = 'not yet implemented' in content

    _, base_params, base_returns = extract_jsdoc_from_base(base_path)
    if not base_params:
        return False

    func_params = get_function_params(routine_path)
    if not func_params:
        return False

    # Build a map of param name -> @param line from base.js
    base_param_map = {}
    for pl in base_params:
        m = re.match(r'\* @param \{[^}]+\} (\w+)', pl)
        if m:
            base_param_map[m.group(1)] = pl

    # For each TODO param in the routine file, try to match to base.js
    new_content = content
    for param_name in func_params:
        todo_pattern = rf'\* @param {{[^}}]+}} {re.escape(param_name)} - TODO'
        if re.search(todo_pattern, new_content):
            if param_name in base_param_map:
                replacement = base_param_map[param_name]
            elif param_name == 'order':
                replacement = "* @param {string} order - storage layout (`'row-major'` or `'column-major'`)"
            elif param_name == 'LDA':
                replacement = '* @param {PositiveInteger} LDA - leading dimension of `A`'
            elif param_name == 'LDB':
                replacement = '* @param {PositiveInteger} LDB - leading dimension of `B`'
            elif param_name == 'LDC':
                replacement = '* @param {PositiveInteger} LDC - leading dimension of `C`'
            elif param_name == 'LDAB':
                replacement = '* @param {PositiveInteger} LDAB - leading dimension of `AB`'
            else:
                # Keep the original type but replace TODO with generic desc
                replacement = f'* @param {{*}} {param_name} - {param_name}'
            new_content = re.sub(todo_pattern, replacement, new_content)

    # Also fix generic "TODO" returns
    new_content = re.sub(r'\* @returns \{\*\} result', '* @returns {*} result', new_content)

    if new_content != content:
        if not dry_run:
            with open(routine_path, 'w') as f:
                f.write(new_content)
        return True
    return False


def main():
    dry_run = '--dry-run' in sys.argv

    strided_count = 0
    routine_count = 0

    for pkg in ['blas', 'lapack']:
        pkg_dir = os.path.join(ROOT, 'lib', pkg)
        if not os.path.isdir(pkg_dir):
            continue
        for routine in sorted(os.listdir(pkg_dir)):
            routine_dir = os.path.join(pkg_dir, routine)
            lib_dir = os.path.join(routine_dir, 'lib')
            if not os.path.isdir(lib_dir):
                continue

            base_path = os.path.join(lib_dir, 'base.js')
            if not os.path.exists(base_path):
                continue

            # Fix strided.js
            strided_path = os.path.join(lib_dir, 'strided.js')
            if os.path.exists(strided_path):
                if fix_strided(strided_path, base_path, dry_run):
                    strided_count += 1
                    if dry_run:
                        print(f'  Would fix: {strided_path}')

            # Fix <routine>.js
            routine_js = os.path.join(lib_dir, f'{routine}.js')
            if os.path.exists(routine_js):
                if fix_routine_js(routine_js, base_path, dry_run):
                    routine_count += 1
                    if dry_run:
                        print(f'  Would fix: {routine_js}')

    action = 'Would fix' if dry_run else 'Fixed'
    print(f'\n{action} {strided_count} strided.js files')
    print(f'{action} {routine_count} <routine>.js files')


if __name__ == '__main__':
    main()
