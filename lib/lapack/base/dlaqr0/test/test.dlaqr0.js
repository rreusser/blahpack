/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr0 from './../lib/dlaqr0.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 upper-triangular (Hessenberg) diag(3,5) (column-major):
function tri2() {
	return new Float64Array([ 3.0, 0.0, 1.0, 5.0 ]);
}


// TESTS //

test( 'dlaqr0 is a function', function t() {
	assert.strictEqual( typeof dlaqr0, 'function', 'is a function' );
});

test( 'dlaqr0 has expected arity', function t() {
	assert.strictEqual( dlaqr0.length, 17, 'has expected arity' );
});

test( 'dlaqr0 throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		dlaqr0( true, false, -1, 1, 2, tri2(), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 1, 2, new Float64Array( 4 ), 2, null, 1 );
	}, RangeError );
});

test( 'dlaqr0 returns the eigenvalues of an upper-triangular Hessenberg matrix (auto WORK)', function t() {
	const WR = new Float64Array( 2 );
	const WI = new Float64Array( 2 );
	const info = dlaqr0( true, false, 2, 1, 2, tri2(), 2, WR, 1, WI, 1, 1, 2, new Float64Array( 4 ), 2, null, 1 );
	assert.strictEqual( info, 0, 'info is 0' );

	const re = [ WR[ 0 ], WR[ 1 ] ].sort( function asc( a, b ) {
		return a - b;
	});
	assert.ok( Math.abs( re[ 0 ] - 3.0 ) < 1e-12 && Math.abs( re[ 1 ] - 5.0 ) < 1e-12, 'real eigenvalues are 3 and 5' );
	assert.ok( Math.abs( WI[ 0 ] ) < 1e-12 && Math.abs( WI[ 1 ] ) < 1e-12, 'imaginary parts are zero' );
});

test( 'dlaqr0 matches the ndarray form', function t() {
	const WR1 = new Float64Array( 2 );
	const WI1 = new Float64Array( 2 );
	const info1 = dlaqr0( true, false, 2, 1, 2, tri2(), 2, WR1, 1, WI1, 1, 1, 2, new Float64Array( 4 ), 2, null, 1 );

	const WR2 = new Float64Array( 2 );
	const WI2 = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info2 = ndarray( true, false, 2, 1, 2, tri2(), 1, 2, 0, WR2, 1, 0, WI2, 1, 0, 1, 2, new Float64Array( 4 ), 1, 2, 0, WORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( WR1[ 0 ] - WR2[ 0 ] ) < 1e-14 && Math.abs( WR1[ 1 ] - WR2[ 1 ] ) < 1e-14, 'WR matches' );
});
