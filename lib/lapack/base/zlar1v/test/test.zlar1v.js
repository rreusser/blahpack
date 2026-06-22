/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlar1v from './../lib/zlar1v.js';


// FUNCTIONS //

/**
* Invokes the layout wrapper with a canonical 3x3 tridiagonal input.
*
* @private
* @param {integer} N - override for the first argument
* @returns {void}
*/
function invoke( N ) {
	var mingma = new Float64Array( 1 );
	var nrminv = new Float64Array( 1 );
	var rqcorr = new Float64Array( 1 );
	var ISUPPZ = new Int32Array( 2 );
	var negcnt = new Int32Array( 1 );
	var resid = new Float64Array( 1 );
	var WORK = new Float64Array( 12 );
	var ztz = new Float64Array( 1 );
	var LLD = new Float64Array( [ 0.5, 0.4, 0.0 ] );
	var LD = new Float64Array( [ 1.0, 1.0, 0.0 ] );
	var D = new Float64Array( [ 2.0, 2.5, 1.6 ] );
	var L = new Float64Array( [ 0.5, 0.4, 0.0 ] );
	var Z = new Complex128Array( 3 );
	var r = new Int32Array( 1 );
	return zlar1v( N, 1, 3, 1.0, D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK, 1 );
}


// TESTS //

test( 'zlar1v is a function', function t() {
	assert.strictEqual( typeof zlar1v, 'function', 'is a function' );
});

test( 'zlar1v executes without throwing on valid inputs', function t() {
	assert.doesNotThrow( function ok() {
		invoke( 3 );
	});
});

test( 'zlar1v throws a RangeError when `N` is negative', function t() {
	assert.throws( function throws() {
		invoke( -1 );
	}, RangeError );
});

test( 'zlar1v accepts N = 0 as a quick return', function t() {
	// With N = 0 none of the sweep loops execute; the routine should return without raising an exception (degenerate but valid input).
	assert.doesNotThrow( function ok() {
		var mingma = new Float64Array( 1 );
		var nrminv = new Float64Array( 1 );
		var rqcorr = new Float64Array( 1 );
		var ISUPPZ = new Int32Array( 2 );
		var negcnt = new Int32Array( 1 );
		var resid = new Float64Array( 1 );
		var WORK = new Float64Array( 1 );
		var ztz = new Float64Array( 1 );
		var LLD = new Float64Array( 1 );
		var LD = new Float64Array( 1 );
		var D = new Float64Array( 1 );
		var L = new Float64Array( 1 );
		var Z = new Complex128Array( 1 );
		var r = new Int32Array( 1 );
		zlar1v( 0, 0, 0, 0.0, D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK, 1 );
	});
});
