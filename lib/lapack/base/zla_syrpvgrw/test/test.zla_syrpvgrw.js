/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_syrpvgrw from './../lib/zla_syrpvgrw.js';


// TESTS //

test( 'zla_syrpvgrw is a function', function t() {
	assert.strictEqual( typeof zla_syrpvgrw, 'function', 'is a function' );
});

test( 'zla_syrpvgrw has expected arity', function t() {
	assert.strictEqual( zla_syrpvgrw.length, 9, 'has expected arity' );
});

test( 'zla_syrpvgrw throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zla_syrpvgrw( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zla_syrpvgrw throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_syrpvgrw( 'upper', -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Int32Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zla_syrpvgrw throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zla_syrpvgrw( 'upper', 2, 0, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zla_syrpvgrw throws RangeError for LDAF < max(1,N)', function t() {
	assert.throws( function throws() {
		zla_syrpvgrw( 'upper', 2, 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Int32Array( 2 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zla_syrpvgrw computes for valid 2x2 lower', function t() {
	var Aflat = new Float64Array( [ 1, 0, 0.5, 0, 0, 0, 1, 0 ] );
	var AFflat = new Float64Array( [ 1, 0, 0.5, 0, 0, 0, 0.75, 0 ] );
	var A = new Complex128Array( Aflat.buffer );
	var AF = new Complex128Array( AFflat.buffer );
	var IPIV = new Int32Array( [ 0, 1 ] );
	var WORK = new Float64Array( 4 );
	var r = zla_syrpvgrw( 'lower', 2, 0, A, 2, AF, 2, IPIV, WORK );
	assert.strictEqual( typeof r, 'number' );
});
