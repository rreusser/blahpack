/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlacrm from './../lib/zlacrm.js';


// TESTS //

test( 'zlacrm is a function', function t() {
	assert.strictEqual( typeof zlacrm, 'function', 'is a function' );
});

test( 'zlacrm has expected arity', function t() {
	assert.strictEqual( zlacrm.length, 10, 'has expected arity' );
});

test( 'zlacrm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlacrm( 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 16 ) );
	}, TypeError );
});

test( 'zlacrm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlacrm( 'column-major', -1, 2, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'zlacrm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlacrm( 'column-major', 2, -1, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'zlacrm throws RangeError for LDA too small', function t() {
	assert.throws( function throws() {
		zlacrm( 'column-major', 4, 2, new Complex128Array( 8 ), 2, new Float64Array( 4 ), 2, new Complex128Array( 8 ), 4, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'zlacrm throws RangeError for LDB too small', function t() {
	assert.throws( function throws() {
		zlacrm( 'column-major', 2, 3, new Complex128Array( 6 ), 2, new Float64Array( 9 ), 2, new Complex128Array( 6 ), 2, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'zlacrm throws RangeError for LDC too small', function t() {
	assert.throws( function throws() {
		zlacrm( 'column-major', 4, 2, new Complex128Array( 8 ), 4, new Float64Array( 4 ), 2, new Complex128Array( 8 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'zlacrm returns C unchanged for M=0 quick return', function t() {
	var ret;
	var C;
	C = new Complex128Array( [ 1.0, 2.0 ] );
	ret = zlacrm( 'column-major', 0, 1, new Complex128Array( 1 ), 1, new Float64Array( 1 ), 1, C, 1, new Float64Array( 1 ) );
	assert.strictEqual( ret, C );
});
