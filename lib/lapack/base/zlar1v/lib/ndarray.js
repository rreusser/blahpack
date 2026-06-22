/* eslint-disable max-len, max-params */

// MODULES //

import isNonNegativeInteger$cjs from '@stdlib/assert/is-nonnegative-integer/lib/index.js';
const isNonNegativeInteger = isNonNegativeInteger$cjs.isPrimitive;
import isInteger$cjs from '@stdlib/assert/is-integer/lib/index.js';
const isInteger = isInteger$cjs.isPrimitive;
import isNumber$cjs from '@stdlib/assert/is-number/lib/index.js';
const isNumber = isNumber$cjs.isPrimitive;
import isFloat64Array from '@stdlib/assert/is-float64array/lib/index.js';
import isInt32Array from '@stdlib/assert/is-int32array/lib/index.js';
import isComplex128Array from '@stdlib/assert/is-complex128array/lib/index.js';
import isBoolean$cjs from '@stdlib/assert/is-boolean/lib/index.js';
const isBoolean = isBoolean$cjs.isPrimitive;
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the (scaled) `r`-th column of the inverse of the submatrix in rows `b1` through `bn` of the tridiagonal matrix `L*D*L^T - lambda*I` (complex eigenvector container).
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} b1 - (1-based) first index of the submatrix
* @param {integer} bn - (1-based) last index of the submatrix
* @param {number} lambda - shift (approximate eigenvalue)
* @param {Float64Array} D - diagonal of `L*D*L^T`
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} L - sub-diagonal of the unit lower bidiagonal factor
* @param {integer} strideL - stride length for `L`
* @param {NonNegativeInteger} offsetL - starting index for `L`
* @param {Float64Array} LD - element-wise product `L*D`
* @param {integer} strideLD - stride length for `LD`
* @param {NonNegativeInteger} offsetLD - starting index for `LD`
* @param {Float64Array} LLD - element-wise product `L*D*L`
* @param {integer} strideLLD - stride length for `LLD`
* @param {NonNegativeInteger} offsetLLD - starting index for `LLD`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {number} gaptol - tolerance that determines when a column of the inverse has converged
* @param {Complex128Array} Z - output eigenvector (length `N`)
* @param {integer} strideZ - stride length for `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {boolean} wantnc - if `true`, compute `negcnt`
* @param {Int32Array} negcnt - output (length >= 1)
* @param {Float64Array} ztz - output (length >= 1)
* @param {Float64Array} mingma - output (length >= 1)
* @param {Int32Array} r - in/out (length >= 1)
* @param {Int32Array} ISUPPZ - output (length >= 2)
* @param {integer} strideISUPPZ - stride length for `ISUPPZ`
* @param {NonNegativeInteger} offsetISUPPZ - starting index for `ISUPPZ`
* @param {Float64Array} nrminv - output (length >= 1)
* @param {Float64Array} resid - output (length >= 1)
* @param {Float64Array} rqcorr - output (length >= 1)
* @param {Float64Array} WORK - workspace (length >= 4*N)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {TypeError} arguments must have the correct type
*/
function zlar1v( N, b1, bn, lambda, D, strideD, offsetD, L, strideL, offsetL, LD, strideLD, offsetLD, LLD, strideLLD, offsetLLD, pivmin, gaptol, Z, strideZ, offsetZ, wantnc, negcnt, ztz, mingma, r, ISUPPZ, strideISUPPZ, offsetISUPPZ, nrminv, resid, rqcorr, WORK, strideWORK, offsetWORK ) {
	if ( !isNonNegativeInteger( N ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%s`.', N ) );
	}
	if ( !isInteger( b1 ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be an integer. Value: `%s`.', b1 ) );
	}
	if ( !isInteger( bn ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be an integer. Value: `%s`.', bn ) );
	}
	if ( !isNumber( lambda ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a number. Value: `%s`.', lambda ) );
	}
	if ( !isFloat64Array( D ) ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a Float64Array. Value: `%s`.', D ) );
	}
	if ( !isInteger( strideD ) ) {
		throw new TypeError( format( 'invalid argument. Sixth argument must be an integer. Value: `%s`.', strideD ) );
	}
	if ( !isNonNegativeInteger( offsetD ) ) {
		throw new TypeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%s`.', offsetD ) );
	}
	if ( !isFloat64Array( L ) ) {
		throw new TypeError( format( 'invalid argument. Eighth argument must be a Float64Array. Value: `%s`.', L ) );
	}
	if ( !isInteger( strideL ) ) {
		throw new TypeError( format( 'invalid argument. Ninth argument must be an integer. Value: `%s`.', strideL ) );
	}
	if ( !isNonNegativeInteger( offsetL ) ) {
		throw new TypeError( format( 'invalid argument. Tenth argument must be a nonnegative integer. Value: `%s`.', offsetL ) );
	}
	if ( !isFloat64Array( LD ) ) {
		throw new TypeError( format( 'invalid argument. 11th argument must be a Float64Array. Value: `%s`.', LD ) );
	}
	if ( !isInteger( strideLD ) ) {
		throw new TypeError( format( 'invalid argument. 12th argument must be an integer. Value: `%s`.', strideLD ) );
	}
	if ( !isNonNegativeInteger( offsetLD ) ) {
		throw new TypeError( format( 'invalid argument. 13th argument must be a nonnegative integer. Value: `%s`.', offsetLD ) );
	}
	if ( !isFloat64Array( LLD ) ) {
		throw new TypeError( format( 'invalid argument. 14th argument must be a Float64Array. Value: `%s`.', LLD ) );
	}
	if ( !isInteger( strideLLD ) ) {
		throw new TypeError( format( 'invalid argument. 15th argument must be an integer. Value: `%s`.', strideLLD ) );
	}
	if ( !isNonNegativeInteger( offsetLLD ) ) {
		throw new TypeError( format( 'invalid argument. 16th argument must be a nonnegative integer. Value: `%s`.', offsetLLD ) );
	}
	if ( !isNumber( pivmin ) ) {
		throw new TypeError( format( 'invalid argument. 17th argument must be a number. Value: `%s`.', pivmin ) );
	}
	if ( !isNumber( gaptol ) ) {
		throw new TypeError( format( 'invalid argument. 18th argument must be a number. Value: `%s`.', gaptol ) );
	}
	if ( !isComplex128Array( Z ) ) {
		throw new TypeError( format( 'invalid argument. 19th argument must be a Complex128Array. Value: `%s`.', Z ) );
	}
	if ( !isInteger( strideZ ) ) {
		throw new TypeError( format( 'invalid argument. 20th argument must be an integer. Value: `%s`.', strideZ ) );
	}
	if ( !isNonNegativeInteger( offsetZ ) ) {
		throw new TypeError( format( 'invalid argument. 21st argument must be a nonnegative integer. Value: `%s`.', offsetZ ) );
	}
	if ( !isBoolean( wantnc ) ) {
		throw new TypeError( format( 'invalid argument. 22nd argument must be a boolean. Value: `%s`.', wantnc ) );
	}
	if ( !isInt32Array( negcnt ) ) {
		throw new TypeError( format( 'invalid argument. 23rd argument must be an Int32Array. Value: `%s`.', negcnt ) );
	}
	if ( !isFloat64Array( ztz ) ) {
		throw new TypeError( format( 'invalid argument. 24th argument must be a Float64Array. Value: `%s`.', ztz ) );
	}
	if ( !isFloat64Array( mingma ) ) {
		throw new TypeError( format( 'invalid argument. 25th argument must be a Float64Array. Value: `%s`.', mingma ) );
	}
	if ( !isInt32Array( r ) ) {
		throw new TypeError( format( 'invalid argument. 26th argument must be an Int32Array. Value: `%s`.', r ) );
	}
	if ( !isInt32Array( ISUPPZ ) ) {
		throw new TypeError( format( 'invalid argument. 27th argument must be an Int32Array. Value: `%s`.', ISUPPZ ) );
	}
	if ( !isInteger( strideISUPPZ ) ) {
		throw new TypeError( format( 'invalid argument. 28th argument must be an integer. Value: `%s`.', strideISUPPZ ) );
	}
	if ( !isNonNegativeInteger( offsetISUPPZ ) ) {
		throw new TypeError( format( 'invalid argument. 29th argument must be a nonnegative integer. Value: `%s`.', offsetISUPPZ ) );
	}
	if ( !isFloat64Array( nrminv ) ) {
		throw new TypeError( format( 'invalid argument. 30th argument must be a Float64Array. Value: `%s`.', nrminv ) );
	}
	if ( !isFloat64Array( resid ) ) {
		throw new TypeError( format( 'invalid argument. 31st argument must be a Float64Array. Value: `%s`.', resid ) );
	}
	if ( !isFloat64Array( rqcorr ) ) {
		throw new TypeError( format( 'invalid argument. 32nd argument must be a Float64Array. Value: `%s`.', rqcorr ) );
	}
	if ( !isFloat64Array( WORK ) ) {
		throw new TypeError( format( 'invalid argument. 33rd argument must be a Float64Array. Value: `%s`.', WORK ) );
	}
	if ( !isInteger( strideWORK ) ) {
		throw new TypeError( format( 'invalid argument. 34th argument must be an integer. Value: `%s`.', strideWORK ) );
	}
	if ( !isNonNegativeInteger( offsetWORK ) ) {
		throw new TypeError( format( 'invalid argument. 35th argument must be a nonnegative integer. Value: `%s`.', offsetWORK ) );
	}
	base( N, b1, bn, lambda, D, strideD, offsetD, L, strideL, offsetL, LD, strideLD, offsetLD, LLD, strideLLD, offsetLLD, pivmin, gaptol, Z, strideZ, offsetZ, wantnc, negcnt, ztz, mingma, r, ISUPPZ, strideISUPPZ, offsetISUPPZ, nrminv, resid, rqcorr, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default zlar1v;
