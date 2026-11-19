/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Executes a single multishift QZ sweep on the matrix pencil `(A, B)`.
*
* @param {boolean} ilschur - if true, update the full Schur form
* @param {boolean} ilq - if true, update the matrix `Q`
* @param {boolean} ilz - if true, update the matrix `Z`
* @param {NonNegativeInteger} N - order of the matrices
* @param {NonNegativeInteger} ilo - (0-based) first index of the active Hessenberg region
* @param {NonNegativeInteger} ihi - (0-based) last index of the active Hessenberg region
* @param {NonNegativeInteger} nshifts - desired number of shifts
* @param {PositiveInteger} nblock_desired - desired size of the computational windows
* @param {Float64Array} SR - real parts of the shifts
* @param {integer} strideSR - stride for `SR`
* @param {NonNegativeInteger} offsetSR - starting index for `SR`
* @param {Float64Array} SI - imaginary parts of the shifts
* @param {integer} strideSI - stride for `SI`
* @param {NonNegativeInteger} offsetSI - starting index for `SI`
* @param {Float64Array} SS - scales of the shifts
* @param {integer} strideSS - stride for `SS`
* @param {NonNegativeInteger} offsetSS - starting index for `SS`
* @param {Float64Array} A - matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Q - matrix `Q`
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} Z - matrix `Z`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} QC - workspace matrix
* @param {integer} strideQC1 - stride of the first dimension of `QC`
* @param {integer} strideQC2 - stride of the second dimension of `QC`
* @param {NonNegativeInteger} offsetQC - starting index for `QC`
* @param {Float64Array} ZC - workspace matrix
* @param {integer} strideZC1 - stride of the first dimension of `ZC`
* @param {integer} strideZC2 - stride of the second dimension of `ZC`
* @param {NonNegativeInteger} offsetZC - starting index for `ZC`
* @param {Float64Array} WORK - workspace of size at least `N * nblockDesired`
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `ilo` must be a nonnegative integer
* @throws {RangeError} `ihi` must be a nonnegative integer
* @throws {RangeError} `nshifts` must be a nonnegative integer
* @throws {RangeError} `nblockDesired` must be a positive integer
* @returns {integer} status code (`0` on success, negative on illegal argument)
*/
function dlaqz4( ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblock_desired, SR, strideSR, offsetSR, SI, strideSI, offsetSI, SS, strideSS, offsetSS, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, QC, strideQC1, strideQC2, offsetQC, ZC, strideZC1, strideZC2, offsetZC, WORK, strideWork, offsetWork ) {
	if ( nblock_desired < nshifts + 1 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument is invalid (rejected when `nblock_desired < nshifts + 1`). Value: `%d`.', nblock_desired ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', ilo ) );
	}
	if ( ihi < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ihi ) );
	}
	if ( nshifts < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', nshifts ) );
	}
	const minWork = N * nblock_desired;
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblock_desired, SR, strideSR, offsetSR, SI, strideSI, offsetSI, SS, strideSS, offsetSS, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, QC, strideQC1, strideQC2, offsetQC, ZC, strideZC1, strideZC2, offsetZC, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dlaqz4;
