/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zporfs from './../lib/zporfs.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

function identity2() {
	return new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
}


// TESTS //

test( 'zporfs is a function', function t() {
	assert.strictEqual( typeof zporfs, 'function', 'is a function' );
});

test( 'zporfs has expected arity', function t() {
	assert.strictEqual( zporfs.length, 15, 'has expected arity' );
});

test( 'zporfs throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		zporfs( 'bogus', 2, 1, identity2(), 2, identity2(), 2, new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), new Float64Array( 1 ), null, null );
	}, TypeError );
});

test( 'zporfs throws a RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zporfs( 'lower', 2, 1, identity2(), 1, identity2(), 2, new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), new Float64Array( 1 ), null, null );
	}, RangeError );
});

test( 'zporfs refines the exact solution of I*x=b (X unchanged, tiny errors)', function t() {
	const X = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const BERR = new Float64Array( 1 );
	const info = zporfs( 'lower', 2, 1, identity2(), 2, identity2(), 2, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 2, X, 2, new Float64Array( 1 ), BERR, null, null );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( X.buffer );
	assert.ok( Math.abs( view[ 0 ] - 3.0 ) < 1e-12 && Math.abs( view[ 2 ] - 5.0 ) < 1e-12, 'X unchanged' );
	assert.ok( BERR[ 0 ] < 1e-12, 'backward error is tiny' );
});

test( 'zporfs matches the ndarray form', function t() {
	const X1 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const Bk1 = new Float64Array( 1 );
	const info1 = zporfs( 'lower', 2, 1, identity2(), 2, identity2(), 2, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 2, X1, 2, new Float64Array( 1 ), Bk1, null, null );

	const X2 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const Bk2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = ndarray( 'lower', 2, 1, identity2(), 1, 2, 0, identity2(), 1, 2, 0, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 1, 2, 0, X2, 1, 2, 0, new Float64Array( 1 ), 1, 0, Bk2, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( Bk1[ 0 ] - Bk2[ 0 ] ) < 1e-14, 'BERR matches' );
	const v1 = new Float64Array( X1.buffer );
	const v2 = new Float64Array( X2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'X['+i+'] matches' );
	}
});
