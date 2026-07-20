/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zpocon from './../lib/zpocon.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 complex identity (its own Cholesky factor; column-major, re/im interleaved):
function identity2() {
	return new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
}


// TESTS //

test( 'zpocon is a function', function t() {
	assert.strictEqual( typeof zpocon, 'function', 'is a function' );
});

test( 'zpocon has expected arity', function t() {
	assert.strictEqual( zpocon.length, 11, 'has expected arity' );
});

test( 'zpocon throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zpocon( 'invalid', 'upper', 2, identity2(), 2, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'zpocon throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		zpocon( 'column-major', 'bogus', 2, identity2(), 2, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'zpocon throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		zpocon( 'column-major', 'upper', -1, identity2(), 2, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zpocon throws a RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zpocon( 'column-major', 'upper', 2, identity2(), 1, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zpocon auto-allocates workspace and returns rcond=1 for the identity (column-major)', function t() {
	const rcond = new Float64Array( 1 );
	const info = zpocon( 'column-major', 'upper', 2, identity2(), 2, 1.0, rcond, null, 1, null, 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	assert.ok( Math.abs( rcond[ 0 ] - 1.0 ) < 1e-12, 'rcond is 1 for the identity' );
});

test( 'zpocon (column-major) matches the ndarray form for the identity', function t() {
	const rc1 = new Float64Array( 1 );
	const info1 = zpocon( 'column-major', 'upper', 2, identity2(), 2, 1.0, rc1, null, 1, null, 1 );

	const rc2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = ndarray( 'upper', 2, identity2(), 1, 2, 0, 1.0, rc2, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( rc1[ 0 ] - rc2[ 0 ] ) < 1e-14, 'rcond matches the ndarray form' );
});

test( 'zpocon: upper/lower agree for the identity', function t() {
	const rcU = new Float64Array( 1 );
	zpocon( 'column-major', 'upper', 2, identity2(), 2, 1.0, rcU, null, 1, null, 1 );

	const rcL = new Float64Array( 1 );
	zpocon( 'column-major', 'lower', 2, identity2(), 2, 1.0, rcL, null, 1, null, 1 );

	assert.ok( Math.abs( rcU[ 0 ] - rcL[ 0 ] ) < 1e-14, 'upper matches lower' );
});
