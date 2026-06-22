/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_porpvgrw from './../lib/zla_porpvgrw.js';


// TESTS //

test( 'zla_porpvgrw is a function', function t() {
	assert.strictEqual( typeof zla_porpvgrw, 'function', 'is a function' );
});

test( 'zla_porpvgrw has expected arity', function t() {
	assert.strictEqual( zla_porpvgrw.length, 7, 'has expected arity' );
});

test( 'zla_porpvgrw throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zla_porpvgrw( 'invalid', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zla_porpvgrw computes for valid 2x2', function t() {
	var Aflat = new Float64Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	var AFflat = new Float64Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	var A = new Complex128Array( Aflat.buffer );
	var AF = new Complex128Array( AFflat.buffer );
	var WORK = new Float64Array( 4 );
	var r = zla_porpvgrw( 'lower', 2, A, 2, AF, 2, WORK );
	assert.strictEqual( typeof r, 'number' );
});
