/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlar1v from './../lib/dlar1v.js';


// FUNCTIONS //

/**
* Invokes the layout wrapper with a canonical 3x3 tridiagonal input.
*
* @private
* @param {integer} N - override for the first argument
* @returns {void}
*/
function invoke( N ) {
	const mingma = new Float64Array( 1 );
	const nrminv = new Float64Array( 1 );
	const rqcorr = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 );
	const negcnt = new Int32Array( 1 );
	const resid = new Float64Array( 1 );
	const WORK = new Float64Array( 12 );
	const ztz = new Float64Array( 1 );
	const LLD = new Float64Array( [ 0.5, 0.4, 0.0 ] );
	const LD = new Float64Array( [ 1.0, 1.0, 0.0 ] );
	const D = new Float64Array( [ 2.0, 2.5, 1.6 ] );
	const L = new Float64Array( [ 0.5, 0.4, 0.0 ] );
	const Z = new Float64Array( 3 );
	const r = new Int32Array( 1 );
	return dlar1v( N, 1, 3, 1.0, D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK );
}


// TESTS //

test( 'dlar1v is a function', function t() {
	assert.strictEqual( typeof dlar1v, 'function', 'is a function' );
});

test( 'dlar1v executes without throwing on valid inputs', function t() {
	assert.doesNotThrow( function ok() {
		invoke( 3 );
	});
});

test( 'dlar1v throws a RangeError when `N` is negative', function t() {
	assert.throws( function throws() {
		invoke( -1 );
	}, RangeError );
});

test( 'dlar1v accepts N = 0 as a quick return', function t() {
	// With N = 0 none of the sweep loops execute; the routine should return without raising an exception (degenerate but valid input).
	assert.doesNotThrow( function ok() {
		const mingma = new Float64Array( 1 );
		const nrminv = new Float64Array( 1 );
		const rqcorr = new Float64Array( 1 );
		const ISUPPZ = new Int32Array( 2 );
		const negcnt = new Int32Array( 1 );
		const resid = new Float64Array( 1 );
		const WORK = new Float64Array( 1 );
		const ztz = new Float64Array( 1 );
		const LLD = new Float64Array( 1 );
		const LD = new Float64Array( 1 );
		const D = new Float64Array( 1 );
		const L = new Float64Array( 1 );
		const Z = new Float64Array( 1 );
		const r = new Int32Array( 1 );
		dlar1v( 0, 0, 0, 0.0, D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK );
	});
});
