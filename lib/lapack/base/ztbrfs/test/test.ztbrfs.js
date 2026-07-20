/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztbrfs from './../lib/ztbrfs.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// Diagonal (kd=0) triangular identity band, AB is 1xN (LDAB=1):
function diagAB() {
	return new Complex128Array([ 1.0, 0.0, 1.0, 0.0 ]);
}


// TESTS //

test( 'ztbrfs is a function', function t() {
	assert.strictEqual( typeof ztbrfs, 'function', 'is a function' );
});

test( 'ztbrfs has expected arity', function t() {
	assert.strictEqual( ztbrfs.length, 16, 'has expected arity' );
});

test( 'ztbrfs throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		ztbrfs( 'bogus', 'no-transpose', 'non-unit', 2, 0, 1, diagAB(), 1, new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), new Float64Array( 1 ), null, null );
	}, TypeError );
});

test( 'ztbrfs throws a RangeError for LDAB < kd+1', function t() {
	assert.throws( function throws() {
		ztbrfs( 'upper', 'no-transpose', 'non-unit', 2, 2, 1, diagAB(), 2, new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), new Float64Array( 1 ), null, null );
	}, RangeError );
});

test( 'ztbrfs refines the exact solution of I*x=b (X unchanged, tiny errors)', function t() {
	const X = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const BERR = new Float64Array( 1 );
	const info = ztbrfs( 'upper', 'no-transpose', 'non-unit', 2, 0, 1, diagAB(), 1, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 2, X, 2, new Float64Array( 1 ), BERR, null, null );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( X.buffer );
	assert.ok( Math.abs( view[ 0 ] - 3.0 ) < 1e-12 && Math.abs( view[ 2 ] - 5.0 ) < 1e-12, 'X unchanged' );
	assert.ok( BERR[ 0 ] < 1e-12, 'backward error is tiny' );
});

test( 'ztbrfs matches the ndarray form', function t() {
	const X1 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const Bk1 = new Float64Array( 1 );
	const info1 = ztbrfs( 'upper', 'no-transpose', 'non-unit', 2, 0, 1, diagAB(), 1, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 2, X1, 2, new Float64Array( 1 ), Bk1, null, null );

	const X2 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const Bk2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 2, 0, 1, diagAB(), 1, 1, 0, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 1, 2, 0, X2, 1, 2, 0, new Float64Array( 1 ), 1, 0, Bk2, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( Bk1[ 0 ] - Bk2[ 0 ] ) < 1e-14, 'BERR matches' );
	const v1 = new Float64Array( X1.buffer );
	const v2 = new Float64Array( X2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'X['+i+'] matches' );
	}
});
