/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlahqr from './../lib/zlahqr.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 upper-triangular (Hessenberg) diag(3,5) (column-major):
function tri2() {
	return new Complex128Array([ 3.0, 0.0, 0.0, 0.0, 1.0, 0.0, 5.0, 0.0 ]);
}


// TESTS //

test( 'zlahqr is a function', function t() {
	assert.strictEqual( typeof zlahqr, 'function', 'is a function' );
});

test( 'zlahqr has expected arity', function t() {
	assert.strictEqual( zlahqr.length, 13, 'has expected arity' );
});

test( 'zlahqr throws a RangeError for LDH < max(1,N)', function t() {
	assert.throws( function throws() {
		zlahqr( true, false, 2, 1, 2, tri2(), 1, new Complex128Array( 2 ), 1, 1, 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlahqr returns the eigenvalues of an upper-triangular Hessenberg matrix', function t() {
	const W = new Complex128Array( 2 );
	const info = zlahqr( true, false, 2, 1, 2, tri2(), 2, W, 1, 1, 2, new Complex128Array( 4 ), 2 );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( W.buffer );
	// Eigenvalues are the diagonal entries 3 and 5 (in some order):
	const re = [ view[ 0 ], view[ 2 ] ].sort( function asc( a, b ) {
		return a - b;
	});
	assert.ok( Math.abs( re[ 0 ] - 3.0 ) < 1e-12 && Math.abs( re[ 1 ] - 5.0 ) < 1e-12, 'eigenvalues are 3 and 5' );
});

test( 'zlahqr matches the ndarray form', function t() {
	const W1 = new Complex128Array( 2 );
	const info1 = zlahqr( true, false, 2, 1, 2, tri2(), 2, W1, 1, 1, 2, new Complex128Array( 4 ), 2 );

	const W2 = new Complex128Array( 2 );
	const info2 = ndarray( true, false, 2, 1, 2, tri2(), 1, 2, 0, W2, 1, 0, 1, 2, new Complex128Array( 4 ), 1, 2, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	const a1 = new Float64Array( W1.buffer );
	const a2 = new Float64Array( W2.buffer );
	for ( let i = 0; i < a1.length; i++ ) {
		assert.ok( Math.abs( a1[ i ] - a2[ i ] ) < 1e-14, 'W['+i+'] matches' );
	}
});
