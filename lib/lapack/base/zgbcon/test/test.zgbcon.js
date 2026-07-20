/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgbcon from './../lib/zgbcon.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// Diagonal (kl=ku=0) identity; factored band storage AB is 1xN (LDAB=1):
function diagAB() {
	return new Complex128Array([ 1.0, 0.0, 1.0, 0.0 ]);
}

// Identity pivots (1-indexed, each row to itself):
function ipiv() {
	return new Int32Array([ 1, 2 ]);
}


// TESTS //

test( 'zgbcon is a function', function t() {
	assert.strictEqual( typeof zgbcon, 'function', 'is a function' );
});

test( 'zgbcon has expected arity', function t() {
	assert.strictEqual( zgbcon.length, 14, 'has expected arity' );
});

test( 'zgbcon throws a TypeError for an invalid norm', function t() {
	assert.throws( function throws() {
		zgbcon( 'bogus', 2, 0, 0, diagAB(), 1, ipiv(), 1, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'zgbcon throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		zgbcon( 'one-norm', -1, 0, 0, diagAB(), 1, ipiv(), 1, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zgbcon throws a RangeError for LDAB < 2*kl+ku+1', function t() {
	assert.throws( function throws() {
		zgbcon( 'one-norm', 2, 1, 1, diagAB(), 3, ipiv(), 1, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zgbcon auto-allocates workspace and returns rcond=1 for the diagonal identity', function t() {
	const rcond = new Float64Array( 1 );
	const info = zgbcon( 'one-norm', 2, 0, 0, diagAB(), 1, ipiv(), 1, 1.0, rcond, null, 1, null, 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	assert.ok( Math.abs( rcond[ 0 ] - 1.0 ) < 1e-12, 'rcond is 1 for the identity' );
});

test( 'zgbcon matches the ndarray form for the diagonal identity', function t() {
	const rc1 = new Float64Array( 1 );
	const info1 = zgbcon( 'one-norm', 2, 0, 0, diagAB(), 1, ipiv(), 1, 1.0, rc1, null, 1, null, 1 );

	const rc2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = ndarray( 'one-norm', 2, 0, 0, diagAB(), 1, 1, 0, ipiv(), 1, 0, 1.0, rc2, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( rc1[ 0 ] - rc2[ 0 ] ) < 1e-14, 'rcond matches the ndarray form' );
});
