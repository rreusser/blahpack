/**
* @license Apache-2.0
*
* Complex number arithmetic utilities.
*
* Two categories of functions:
*
* 1. **Scalar operations** (re-exported from stdlib): operate on Complex128
*    objects. Use these for occasional scalar computations outside hot loops.
*
* 2. **Indexed operations**: operate directly on a Float64Array view at a
*    given index. Use these inside hot inner loops to avoid allocating
*    Complex128 objects on every iteration.
*
* Usage (scalar):
*   var Complex128 = require('@stdlib/complex/float64/ctor');
*   var z1 = new Complex128(3, 4);
*   var z2 = new Complex128(1, 2);
*   var z3 = cmplx.mul(z1, z2);  // returns Complex128
*   var r = cmplx.abs(z1);        // returns number
*
* Usage (indexed, for hot loops on Float64Array views):
*   var reinterpret = require('@stdlib/strided/base/reinterpret-complex128');
*   var view = reinterpret(complexArray, 0);
*   var r = cmplx.absAt(view, idx);                     // |view[idx] + view[idx+1]*i|
*   cmplx.mulAt(view, outIdx, view, aIdx, view, bIdx);  // view[out] = view[a] * view[b]
*/

// MODULES //

import cmul from '@stdlib/complex/float64/base/mul/lib/index.js';
import cadd from '@stdlib/complex/float64/base/add/lib/index.js';
import cdiv from '@stdlib/math/base/ops/cdiv/lib/index.js';
import csub from '@stdlib/math/base/ops/csub/lib/index.js';
import cneg from '@stdlib/math/base/ops/cneg/lib/index.js';
import cabs from '@stdlib/math/base/special/cabs/lib/index.js';
import cabs2 from '@stdlib/math/base/special/cabs2/lib/index.js';
import conj from '@stdlib/complex/float64/conj/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// INDEXED OPERATIONS //
// These operate directly on Float64Array views at specific indices,
// avoiding allocation in hot loops.

/**
* Indexed absolute value: |view[idx] + view[idx+1]*i|.
*
* Overflow-safe via max/min scaling.
*
* @param {Float64Array} arr - interleaved complex data
* @param {NonNegativeInteger} idx - Float64 index of the real part
* @returns {number} absolute value
*/
function cabsAt( arr, idx ) {
	var ar = Math.abs( arr[ idx ] );
	var ai = Math.abs( arr[ idx + 1 ] );
	var mx;
	var mn;
	var r;
	if ( ar === 0.0 && ai === 0.0 ) {
		return 0.0;
	}
	if ( ar >= ai ) {
		mx = ar;
		mn = ai;
	} else {
		mx = ai;
		mn = ar;
	}
	r = mn / mx;
	return mx * Math.sqrt( 1.0 + r * r );
}

/**
* Indexed DCABS1: |view[idx]| + |view[idx+1]|.
*
* @param {Float64Array} arr - interleaved complex data
* @param {NonNegativeInteger} idx - Float64 index of the real part
* @returns {number} sum of absolute values
*/
function cabs1At( arr, idx ) {
	return Math.abs( arr[ idx ] ) + Math.abs( arr[ idx + 1 ] );
}

/**
* Indexed complex multiply: out[oi] = a[ai] * b[bi].
*
* @param {Float64Array} out - output array
* @param {NonNegativeInteger} oi - Float64 index for output
* @param {Float64Array} a - first operand array
* @param {NonNegativeInteger} ai - Float64 index for a
* @param {Float64Array} b - second operand array
* @param {NonNegativeInteger} bi - Float64 index for b
*/
function cmulAt( out, oi, a, ai, b, bi ) {
	var ar = a[ ai ];
	var aim = a[ ai + 1 ];
	var br = b[ bi ];
	var bim = b[ bi + 1 ];
	out[ oi ] = ar * br - aim * bim;
	out[ oi + 1 ] = ar * bim + aim * br;
}

/**
* Indexed complex divide: out[oi] = a[ai] / b[bi].
*
* Uses Smith's formula for numerical stability.
*
* @param {Float64Array} out - output array
* @param {NonNegativeInteger} oi - Float64 index for output
* @param {Float64Array} a - numerator array
* @param {NonNegativeInteger} ai - Float64 index for a
* @param {Float64Array} b - denominator array
* @param {NonNegativeInteger} bi - Float64 index for b
*/
function cdivAt( out, oi, a, ai, b, bi ) {
	var ar = a[ ai ];
	var aim = a[ ai + 1 ];
	var br = b[ bi ];
	var bim = b[ bi + 1 ];
	var r;
	var d;
	if ( Math.abs( bim ) <= Math.abs( br ) ) {
		r = bim / br;
		d = br + bim * r;
		out[ oi ] = ( ar + aim * r ) / d;
		out[ oi + 1 ] = ( aim - ar * r ) / d;
	} else {
		r = br / bim;
		d = bim + br * r;
		out[ oi ] = ( ar * r + aim ) / d;
		out[ oi + 1 ] = ( aim * r - ar ) / d;
	}
}


// EXPORTS //

export default {
	mul: cmul,
	add: cadd,
	div: cdiv,
	sub: csub,
	neg: cneg,
	abs: cabs,
	abs2: cabs2,
	conj: conj,
	real: real,
	imag: imag,
	absAt: cabsAt,
	abs1At: cabs1At,
	mulAt: cmulAt,
	divAt: cdivAt,
};
