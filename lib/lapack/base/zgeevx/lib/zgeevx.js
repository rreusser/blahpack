
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes eigenvalues, eigenvectors, and reciprocal condition numbers for a complex nonsymmetric matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} balanc - specifies the operation type
* @param {string} jobvl - specifies the operation type
* @param {string} jobvr - specifies the operation type
* @param {string} sense - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} SCALE - input array
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {number} abnrm - abnrm
* @param {Float64Array} RCONDE - input array
* @param {integer} strideRCONDE - stride length for `RCONDE`
* @param {Float64Array} RCONDV - input array
* @param {integer} strideRCONDV - stride length for `RCONDV`
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {integer} lwork - lwork
* @param {Float64Array} RWORK - output array
* @param {integer} strideRWork - stride length for `RWORK`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} N must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zgeevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, w, strideW, VL, LDVL, VR, LDVR, ilo, ihi, SCALE, strideSCALE, abnrm, RCONDE, strideRCONDE, RCONDV, strideRCONDV, WORK, strideWork, lwork, RWORK, strideRWork ) { // eslint-disable-line max-len, max-params
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var sa1;
	var sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N);
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	return base( balanc, jobvl, jobvr, sense, N, A, sa1, sa2, 0, w, strideW, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, ilo, ihi, SCALE, strideSCALE, 0, abnrm, RCONDE, strideRCONDE, 0, RCONDV, strideRCONDV, 0, WORK, strideWork, 0, lwork, RWORK, strideRWork, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgeevx;
