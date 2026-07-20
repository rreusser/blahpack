/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgecon from './../lib/zgecon.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 complex identity (column-major, re/im interleaved):
function identity2() {
	return new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
}


// TESTS //

test( 'zgecon is a function', function t() {
	assert.strictEqual( typeof zgecon, 'function', 'is a function' );
});

test( 'zgecon has expected arity', function t() {
	assert.strictEqual( zgecon.length, 11, 'has expected arity' );
});

test( 'zgecon throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zgecon( 'invalid', 'one-norm', 2, identity2(), 2, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'zgecon throws a TypeError for an invalid norm', function t() {
	assert.throws( function throws() {
		zgecon( 'column-major', 'bogus', 2, identity2(), 2, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, TypeError );
});

test( 'zgecon throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		zgecon( 'column-major', 'one-norm', -1, identity2(), 2, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zgecon throws a RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zgecon( 'column-major', 'one-norm', 2, identity2(), 1, 1.0, new Float64Array( 1 ), null, 1, null, 1 );
	}, RangeError );
});

test( 'zgecon auto-allocates workspace and returns rcond=1 for the identity (column-major)', function t() {
	const A = identity2();
	const rcond = new Float64Array( 1 );
	const info = zgecon( 'column-major', 'one-norm', 2, A, 2, 1.0, rcond, null, 1, null, 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	assert.ok( Math.abs( rcond[ 0 ] - 1.0 ) < 1e-12, 'rcond is 1 for the identity' );
});

test( 'zgecon (column-major) matches the ndarray form for the identity', function t() {
	const rc1 = new Float64Array( 1 );
	const info1 = zgecon( 'column-major', 'one-norm', 2, identity2(), 2, 1.0, rc1, null, 1, null, 1 );

	// Equivalent ndarray call: column-major => strideA1=1, strideA2=LDA=2:
	const rc2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 4 );
	const info2 = ndarray( 'one-norm', 2, identity2(), 1, 2, 0, 1.0, rc2, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( rc1[ 0 ] - rc2[ 0 ] ) < 1e-14, 'rcond matches the ndarray form' );
});

test( 'zgecon: row-major matches column-major for the identity (layout-invariant)', function t() {
	const rcC = new Float64Array( 1 );
	zgecon( 'column-major', 'one-norm', 2, identity2(), 2, 1.0, rcC, null, 1, null, 1 );

	const rcR = new Float64Array( 1 );
	zgecon( 'row-major', 'one-norm', 2, identity2(), 2, 1.0, rcR, null, 1, null, 1 );

	assert.ok( Math.abs( rcC[ 0 ] - rcR[ 0 ] ) < 1e-14, 'row-major matches column-major' );
});
