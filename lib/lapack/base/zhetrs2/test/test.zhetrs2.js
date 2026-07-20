/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhetrs2 from './../lib/zhetrs2.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 complex identity (its own zhetrf factorization; column-major):
function identity2() {
	return new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
}

// Identity pivots (0-based 1x1 pivots):
function ipiv() {
	return new Int32Array([ 0, 1 ]);
}


// TESTS //

test( 'zhetrs2 is a function', function t() {
	assert.strictEqual( typeof zhetrs2, 'function', 'is a function' );
});

test( 'zhetrs2 has expected arity', function t() {
	assert.strictEqual( zhetrs2.length, 11, 'has expected arity' );
});

test( 'zhetrs2 throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrs2( 'bogus', 2, 1, identity2(), 2, ipiv(), 1, new Complex128Array( 2 ), 2, null, 1 );
	}, TypeError );
});

test( 'zhetrs2 throws a RangeError for LDB < max(1,N)', function t() {
	assert.throws( function throws() {
		zhetrs2( 'lower', 2, 1, identity2(), 2, ipiv(), 1, new Complex128Array( 2 ), 1, null, 1 );
	}, RangeError );
});

test( 'zhetrs2 solves I*X=B (solution equals the RHS), auto-allocating WORK', function t() {
	const B = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const info = zhetrs2( 'lower', 2, 1, identity2(), 2, ipiv(), 1, B, 2, null, 1 );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( B.buffer );
	assert.ok( Math.abs( view[ 0 ] - 3.0 ) < 1e-12 && Math.abs( view[ 1 ] + 1.0 ) < 1e-12, 'X[0]' );
	assert.ok( Math.abs( view[ 2 ] - 5.0 ) < 1e-12 && Math.abs( view[ 3 ] - 2.0 ) < 1e-12, 'X[1]' );
});

test( 'zhetrs2 matches the ndarray form', function t() {
	const B1 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const info1 = zhetrs2( 'lower', 2, 1, identity2(), 2, ipiv(), 1, B1, 2, null, 1 );

	const B2 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const WORK = new Complex128Array( 2 );
	const info2 = ndarray( 'lower', 2, 1, identity2(), 1, 2, 0, ipiv(), 1, 0, B2, 1, 2, 0, WORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	const v1 = new Float64Array( B1.buffer );
	const v2 = new Float64Array( B2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'B['+i+'] matches' );
	}
});
