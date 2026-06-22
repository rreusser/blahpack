
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes, for a pair of N-by-N complex matrices (A, B), the generalized.
* eigenvalues and, optionally, the left and/or right generalized eigenvectors,
* with optional balancing (LAPACK-style interface).
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'no-vectors'` or `'compute-vectors'`
* @param {string} jobvr - `'no-vectors'` or `'compute-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input matrix A (N x N)
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Complex128Array} B - input matrix B (N x N)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Complex128Array} ALPHA - output eigenvalue numerators
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {Complex128Array} BETA - output eigenvalue denominators
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix
* @param {PositiveInteger} LDVL - leading dimension of VL
* @param {Complex128Array} VR - right eigenvector matrix
* @param {PositiveInteger} LDVR - leading dimension of VR
* @param {Float64Array} LSCALE - output left scaling/permutation
* @param {integer} strideLSCALE - stride for LSCALE
* @param {Float64Array} RSCALE - output right scaling/permutation
* @param {integer} strideRSCALE - stride for RSCALE
* @param {Float64Array} RCONDE - output eigenvalue condition numbers
* @param {integer} strideRCONDE - stride for RCONDE
* @param {Float64Array} RCONDV - output right eigenvector condition numbers
* @param {integer} strideRCONDV - stride for RCONDV
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} N must be a nonnegative integer
* @throws {RangeError} LDA, LDB, LDVL, LDVR must be valid
* @returns {Object} result with properties: info, ilo, ihi, abnrm, bbnrm
*/
function zggevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, VL, LDVL, VR, LDVR, LSCALE, strideLSCALE, RSCALE, strideRSCALE, RCONDE, strideRCONDE, RCONDV, strideRCONDV ) { // eslint-disable-line max-len, max-params
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDVL < 1 ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be a positive integer. Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be a positive integer. Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	return base( balanc, jobvl, jobvr, sense, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHA, strideALPHA, 0, BETA, strideBETA, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, LSCALE, strideLSCALE, 0, RSCALE, strideRSCALE, 0, RCONDE, strideRCONDE, 0, RCONDV, strideRCONDV, 0 );
}


// EXPORTS //

export default zggevx;
