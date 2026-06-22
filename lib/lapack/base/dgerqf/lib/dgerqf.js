
/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size (must match base.js)


// MAIN //

/**
* Computes an RQ factorization of a real M-by-N matrix A = R * Q.
*
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride for `TAU`
* @param {(Float64Array|null)} WORK - caller-provided workspace, or `null` to have an optimally-sized workspace allocated internally. Size must be at least `(ldwork * nb) + (ldt * nb)` elements, where `nb = min(32, min(M, N))`, `ldwork = max(1, M)`, and `ldt = nb`.
* @param {integer} strideWORK - stride for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be greater than or equal to max(1,M)
* @returns {integer} info status code
*/
function dgerqf( M, N, A, LDA, TAU, strideTAU, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
	var ldwork;
	var owork;
	var otau;
	var ldt;
	var sa1;
	var sa2;
	var nb;
	var K;

	sa1 = 1;
	sa2 = LDA;
	otau = stride2offset( N, strideTAU );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}

	// Allocate WORK if the caller passed null; size matches the base-layer partition (main scratch + block-reflector T).
	if ( WORK === null ) {
		K = min( M, N );
		nb = min( NB, K );
		if ( nb < 1 ) {
			nb = 1;
		}
		ldt = nb;
		ldwork = max( 1, M );
		WORK = new Float64Array( max( 1, ( ldwork * nb ) + ( ldt * nb ) ) );
		strideWORK = 1;
		owork = 0;
	} else {
		owork = stride2offset( N, strideWORK );
	}
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, otau, WORK, strideWORK, owork );
}


// EXPORTS //

export default dgerqf;
