/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites the general `M`-by-`N` complex matrix `C` with `Q*C`, `Q**H*C`, `C*Q`, or `C*Q**H`, where `Q` is a complex unitary matrix defined as the product of `K` elementary reflectors returned by `ztzrzf`.
*
* @param {string} side - `'left'` applies `Q` (or `Q**H`) from the left; `'right'` applies from the right
* @param {string} trans - `'no-transpose'` applies `Q`; `'conjugate-transpose'` applies `Q**H`
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {NonNegativeInteger} l - number of meaningful trailing entries in each reflector
* @param {Complex128Array} A - reflector vectors
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - scalar factors of the reflectors
* @param {integer} strideTAU - stride for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {TypeError} First argument must be a valid operation side
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {RangeError} Third argument must be a nonnegative integer
* @throws {RangeError} Fourth argument must be a nonnegative integer
* @throws {RangeError} Fifth argument must be a nonnegative integer
* @throws {RangeError} Sixth argument must be a nonnegative integer
* @returns {integer} `info` (0 on success)
*/
function zunmr3( side, trans, M, N, K, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var need;
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( l < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', l ) );
	}

	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. WORK is only touched when M>0, N>0, and K>0;
	// it needs `N` elements for a left apply and `M` for a right apply.
	if ( M > 0 && N > 0 && K > 0 ) {
		need = ( side === 'left' ) ? N : M;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( side, trans, M, N, K, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zunmr3;
