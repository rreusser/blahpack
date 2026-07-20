/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgerfs from './../lib/zgerfs.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

function identity2() {
	return new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
}
function ipiv() {
	return new Int32Array([ 0, 1 ]);
}


// TESTS //

test( 'zgerfs is a function', function t() {
	assert.strictEqual( typeof zgerfs, 'function', 'is a function' );
});

test( 'zgerfs has expected arity', function t() {
	assert.strictEqual( zgerfs.length, 16, 'has expected arity' );
});

test( 'zgerfs throws a TypeError for an invalid trans', function t() {
	assert.throws( function throws() {
		zgerfs( 'bogus', 2, 1, identity2(), 2, identity2(), 2, ipiv(), new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), new Float64Array( 1 ), null, null );
	}, TypeError );
});

test( 'zgerfs throws a RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zgerfs( 'no-transpose', 2, 1, identity2(), 1, identity2(), 2, ipiv(), new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), new Float64Array( 1 ), null, null );
	}, RangeError );
});

test( 'zgerfs refines the exact solution of I*x=b (X unchanged, tiny errors)', function t() {
	const B = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const X = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ] );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const info = zgerfs( 'no-transpose', 2, 1, identity2(), 2, identity2(), 2, ipiv(), B, 2, X, 2, FERR, BERR, null, null );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( X.buffer );
	assert.ok( Math.abs( view[ 0 ] - 3.0 ) < 1e-12 && Math.abs( view[ 2 ] - 5.0 ) < 1e-12, 'X unchanged' );
	assert.ok( BERR[ 0 ] < 1e-12, 'backward error is tiny' );
});

test( 'zgerfs matches the ndarray form', function t() {
	const X1 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const F1 = new Float64Array( 1 );
	const Bk1 = new Float64Array( 1 );
	const info1 = zgerfs( 'no-transpose', 2, 1, identity2(), 2, identity2(), 2, ipiv(), new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 2, X1, 2, F1, Bk1, null, null );

	const X2 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const F2 = new Float64Array( 1 );
	const Bk2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = ndarray( 'no-transpose', 2, 1, identity2(), 1, 2, 0, identity2(), 1, 2, 0, ipiv(), 1, 0, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 1, 2, 0, X2, 1, 2, 0, F2, 1, 0, Bk2, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( Bk1[ 0 ] - Bk2[ 0 ] ) < 1e-14, 'BERR matches' );
	const v1 = new Float64Array( X1.buffer );
	const v2 = new Float64Array( X2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'X['+i+'] matches' );
	}
});
