/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dla_syrpvgrw from './../lib/dla_syrpvgrw.js';


// TESTS //

test( 'dla_syrpvgrw is a function', function t() {
	assert.strictEqual( typeof dla_syrpvgrw, 'function', 'is a function' );
});

test( 'dla_syrpvgrw has expected arity', function t() {
	assert.strictEqual( dla_syrpvgrw.length, 9, 'has expected arity' );
});

test( 'dla_syrpvgrw throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dla_syrpvgrw( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dla_syrpvgrw throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_syrpvgrw( 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dla_syrpvgrw throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		dla_syrpvgrw( 'upper', 2, 0, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Int32Array( 2 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dla_syrpvgrw throws RangeError for LDAF < max(1,N)', function t() {
	assert.throws( function throws() {
		dla_syrpvgrw( 'upper', 2, 0, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Int32Array( 2 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dla_syrpvgrw computes for valid 2x2 lower', function t() {
	var A = new Float64Array( [ 1, 0.5, 0, 1 ] );
	var AF = new Float64Array( [ 1, 0.5, 0, 0.75 ] );
	var IPIV = new Int32Array( [ 0, 1 ] );
	var WORK = new Float64Array( 4 );
	var r = dla_syrpvgrw( 'lower', 2, 0, A, 2, AF, 2, IPIV, WORK );
	assert.strictEqual( typeof r, 'number' );
});
