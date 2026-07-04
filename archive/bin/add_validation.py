#!/usr/bin/env python
"""
Add string parameter validation to ndarray.js files that lack it.

For params with stdlib assertion helpers (uplo, trans, diag, side), uses those.
For other params (job, norm, compq, etc.), generates manual whitelist checks.

Usage:
  python bin/add_validation.py          # fix all
  python bin/add_validation.py --dry-run
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Valid values for each string param type
PARAM_VALUES = {
    # stdlib helpers exist for these
    'uplo': None,  # handled by isMatrixTriangle
    'trans': None,  # handled by isTransposeOperation
    'transa': None,
    'transb': None,
    'diag': None,  # handled by isDiagonalType
    'side': None,  # handled by isOperationSide

    # Manual validation needed for these
    'job': {
        'gebal': ['none', 'permute', 'scale', 'both'],
        'hseqr': ['eigenvalues', 'schur'],
        'trsen': ['none', 'eigenvalues', 'subspace', 'both'],
        'default': ['none', 'permute', 'scale', 'both'],
    },
    'jobz': ['no-vectors', 'compute-vectors'],
    'jobvl': ['no-vectors', 'compute-vectors'],
    'jobvr': ['no-vectors', 'compute-vectors'],
    'jobvs': ['no-vectors', 'compute-vectors'],
    'jobu': ['none', 'compute', 'initialize', 'update'],
    'jobv': ['none', 'compute', 'initialize', 'update'],
    'jobq': ['none', 'compute', 'initialize', 'update'],
    'compq': ['none', 'initialize', 'update'],
    'compz': ['none', 'initialize', 'update'],
    'norm': ['max', 'one-norm', 'inf-norm', 'frobenius'],
    'range': ['all', 'value', 'index'],
    'sort': ['none', 'sort'],
    'order': ['block', 'entire'],
    'trana': ['no-transpose', 'transpose'],
    'tranb': ['no-transpose', 'transpose'],
    'fact': ['not-factored', 'equilibrate', 'factored'],
    'equed': ['none', 'row', 'column', 'both'],
    'howmny': ['all', 'backtransform', 'selected'],
    'direct': ['forward', 'backward'],
    'storev': ['columnwise', 'rowwise'],
    'vect': ['apply-Q', 'apply-P'],
    'way': ['convert', 'revert'],
    'normin': ['yes', 'no'],
}

ORDINALS = [
    'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
    'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth',
    'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth',
]


def get_string_params(ndarray_path, base_path):
    """Get string param names from the function signature."""
    with open(base_path) as f:
        base_content = f.read()

    # Find @param {string} lines
    string_params = []
    for m in re.finditer(r'@param \{string\}\s+(\w+)', base_content):
        string_params.append(m.group(1))

    # Get the ndarray function param order
    with open(ndarray_path) as f:
        nd_content = f.read()
    func_match = re.search(r'function \w+\(\s*([^)]+)\s*\)', nd_content)
    if not func_match:
        return [], nd_content
    all_params = [p.strip() for p in re.sub(r'\s*//.*', '', func_match.group(1)).split(',')]

    # Return only string params that appear in the ndarray signature
    result = [(all_params.index(p), p) for p in string_params if p in all_params]
    return result, nd_content


def get_valid_values(param_name, routine_name):
    """Get the list of valid values for a parameter."""
    vals = PARAM_VALUES.get(param_name)
    if vals is None:
        return None  # Has stdlib helper
    if isinstance(vals, dict):
        # Routine-specific values
        for key, v in vals.items():
            if key in routine_name:
                return v
        return vals.get('default', [])
    return vals


def add_validation(ndarray_path, base_path, dry_run=False):
    """Add validation to ndarray.js if needed."""
    with open(ndarray_path) as f:
        content = f.read()

    if 'throw new TypeError' in content:
        return False

    routine = os.path.basename(os.path.dirname(os.path.dirname(ndarray_path)))
    string_params, _ = get_string_params(ndarray_path, base_path)

    if not string_params:
        return False

    # Build validation code
    validation_lines = []
    needs_format = False
    throws_lines = []

    for idx, param_name in string_params:
        ordinal = ORDINALS[idx] if idx < len(ORDINALS) else f'{idx+1}th'
        values = get_valid_values(param_name, routine)

        if values is None:
            # Has stdlib helper - already handled by fix_wrapper_docs.py
            continue

        # Manual whitelist validation
        conditions = ' && '.join(f"{param_name} !== '{v}'" for v in values)
        validation_lines.append(f'\tif ( {conditions} ) {{')
        validation_lines.append(
            f"\t\tthrow new TypeError( format( 'invalid argument. {ordinal} argument must be a valid {param_name} value. Value: `%s`.', {param_name} ) );"
        )
        validation_lines.append('\t}')
        needs_format = True
        throws_lines.append(f' * @throws {{TypeError}} {ordinal} argument must be a valid {param_name} value')

    if not validation_lines:
        return False

    # Add format require if needed
    if needs_format and "var format = require( '@stdlib/string/format' );" not in content:
        base_require = "var base = require( './base.js' );"
        content = content.replace(
            base_require,
            "var format = require( '@stdlib/string/format' );\n" + base_require
        )

    # Add @throws to JSDoc
    for throw_line in reversed(throws_lines):
        # Insert before @returns
        content = re.sub(
            r'(\s*\* @returns)',
            '\n' + throw_line + r'\1',
            content,
            count=1
        )

    # Insert validation after function opening
    func_match = re.search(r'(function \w+\([^)]*\)\s*\{[^\n]*\n)', content)
    if func_match:
        insert_pos = func_match.end()
        validation_code = '\n'.join(validation_lines) + '\n'
        content = content[:insert_pos] + validation_code + content[insert_pos:]

    if not dry_run:
        with open(ndarray_path, 'w') as f:
            f.write(content)

    return True


def main():
    dry_run = '--dry-run' in sys.argv
    count = 0

    for pkg in ['blas', 'lapack']:
        base_dir = os.path.join(ROOT, 'lib', pkg, 'base')
        if not os.path.isdir(base_dir):
            continue
        for routine in sorted(os.listdir(base_dir)):
            ndarray_path = os.path.join(base_dir, routine, 'lib', 'ndarray.js')
            base_path = os.path.join(base_dir, routine, 'lib', 'base.js')
            if not os.path.exists(ndarray_path) or not os.path.exists(base_path):
                continue

            if add_validation(ndarray_path, base_path, dry_run):
                count += 1
                if dry_run:
                    print(f'  Would fix: {routine}')
                else:
                    print(f'  Fixed: {routine}')

    action = 'Would fix' if dry_run else 'Fixed'
    print(f'\n{action} {count} files')


if __name__ == '__main__':
    main()
