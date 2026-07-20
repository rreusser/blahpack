/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaqr4 from './../lib/zlaqr4.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 upper-triangular (Hessenberg) diag(3,5) (column-major):
function tri2() {
	return new Complex128Array([ 3.0, 0.0, 0.0, 0.0, 1.0, 0.0, 5.0, 0.0 ]);
}


// TESTS //

test( 'zlaqr4 is a function', function t() {
	assert.strictEqual( typeof zlaqr4, 'function', 'is a function' );
});

test( 'zlaqr4 has expected arity', function t() {
	assert.strictEqual( zlaqr4.length, 15, 'has expected arity' );
});

test( 'zlaqr4 throws a RangeError for LDH < max(1,N)', function t() {
	assert.throws( function throws() {
		zlaqr4( true, false, 2, 1, 2, tri2(), 1, new Complex128Array( 2 ), 1, 1, 2, new Complex128Array( 4 ), 2, null, 1 );
	}, RangeError );
});

test( 'zlaqr4 returns the eigenvalues of an upper-triangular Hessenberg matrix (auto WORK)', function t() {
	const w = new Complex128Array( 2 );
	const info = zlaqr4( true, false, 2, 1, 2, tri2(), 2, w, 1, 1, 2, new Complex128Array( 4 ), 2, null, 1 );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( w.buffer );
	const re = [ view[ 0 ], view[ 2 ] ].sort( function asc( a, b ) {
		return a - b;
	});
	assert.ok( Math.abs( re[ 0 ] - 3.0 ) < 1e-12 && Math.abs( re[ 1 ] - 5.0 ) < 1e-12, 'eigenvalues are 3 and 5' );
});

test( 'zlaqr4 matches the ndarray form', function t() {
	const w1 = new Complex128Array( 2 );
	const info1 = zlaqr4( true, false, 2, 1, 2, tri2(), 2, w1, 1, 1, 2, new Complex128Array( 4 ), 2, null, 1 );

	const w2 = new Complex128Array( 2 );
	const WORK = new Complex128Array( 2 );
	const info2 = ndarray( true, false, 2, 1, 2, tri2(), 1, 2, 0, w2, 1, 0, 1, 2, new Complex128Array( 4 ), 1, 2, 0, WORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	const a1 = new Float64Array( w1.buffer );
	const a2 = new Float64Array( w2.buffer );
	for ( let i = 0; i < a1.length; i++ ) {
		assert.ok( Math.abs( a1[ i ] - a2[ i ] ) < 1e-14, 'w['+i+'] matches' );
	}
});
