/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztrcon from './../lib/ztrcon.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 complex identity (upper-triangular; column-major, re/im interleaved):
function identity2() {
	return new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
}


// TESTS //

test( 'ztrcon is a function', function t() {
	assert.strictEqual( typeof ztrcon, 'function', 'is a function' );
});

test( 'ztrcon has expected arity', function t() {
	assert.strictEqual( ztrcon.length, 11, 'has expected arity' );
});

test( 'ztrcon throws a TypeError for an invalid norm', function t() {
	assert.throws( function throws() {
		ztrcon( 'bogus', 'upper', 'non-unit', 2, identity2(), 2, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'ztrcon throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		ztrcon( 'one-norm', 'bogus', 'non-unit', 2, identity2(), 2, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'ztrcon throws a TypeError for an invalid diag', function t() {
	assert.throws( function throws() {
		ztrcon( 'one-norm', 'upper', 'bogus', 2, identity2(), 2, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'ztrcon throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		ztrcon( 'one-norm', 'upper', 'non-unit', -1, identity2(), 2, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'ztrcon throws a RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		ztrcon( 'one-norm', 'upper', 'non-unit', 2, identity2(), 1, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'ztrcon auto-allocates workspace and returns rcond=1 for the identity', function t() {
	const RCOND = new Float64Array( 1 );
	const info = ztrcon( 'one-norm', 'upper', 'non-unit', 2, identity2(), 2, RCOND, null, 1, null, 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	assert.ok( Math.abs( RCOND[ 0 ] - 1.0 ) < 1e-12, 'rcond is 1 for the identity' );
});

test( 'ztrcon matches the ndarray form for the identity', function t() {
	const rc1 = new Float64Array( 1 );
	const info1 = ztrcon( 'one-norm', 'upper', 'non-unit', 2, identity2(), 2, rc1, null, 1, null, 1 );

	const rc2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = ndarray( 'one-norm', 'upper', 'non-unit', 2, identity2(), 1, 2, 0, rc2, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( rc1[ 0 ] - rc2[ 0 ] ) < 1e-14, 'rcond matches the ndarray form' );
});
