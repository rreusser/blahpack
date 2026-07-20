/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zpbcon from './../lib/zpbcon.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// Diagonal (kd=0) identity, banded storage AB is 1xN; its own Cholesky factor:
function diagAB() {
	return new Complex128Array([ 1.0, 0.0, 1.0, 0.0 ]);
}


// TESTS //

test( 'zpbcon is a function', function t() {
	assert.strictEqual( typeof zpbcon, 'function', 'is a function' );
});

test( 'zpbcon has expected arity', function t() {
	assert.strictEqual( zpbcon.length, 11, 'has expected arity' );
});

test( 'zpbcon throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		zpbcon( 'bogus', 2, 0, diagAB(), 1, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'zpbcon throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		zpbcon( 'upper', -1, 0, diagAB(), 1, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zpbcon throws a RangeError for a negative kd', function t() {
	assert.throws( function throws() {
		zpbcon( 'upper', 2, -1, diagAB(), 1, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zpbcon throws a RangeError for LDAB < kd+1', function t() {
	assert.throws( function throws() {
		zpbcon( 'upper', 2, 2, diagAB(), 2, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zpbcon auto-allocates workspace and returns rcond=1 for the diagonal identity', function t() {
	const rcond = new Float64Array( 1 );
	const info = zpbcon( 'upper', 2, 0, diagAB(), 1, 1.0, rcond, null, 1, null, 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	assert.ok( Math.abs( rcond[ 0 ] - 1.0 ) < 1e-12, 'rcond is 1 for the identity' );
});

test( 'zpbcon matches the ndarray form for the diagonal identity', function t() {
	const rc1 = new Float64Array( 1 );
	const info1 = zpbcon( 'upper', 2, 0, diagAB(), 1, 1.0, rc1, null, 1, null, 1 );

	const rc2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = ndarray( 'upper', 2, 0, diagAB(), 1, 1, 0, 1.0, rc2, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( rc1[ 0 ] - rc2[ 0 ] ) < 1e-14, 'rcond matches the ndarray form' );
});
