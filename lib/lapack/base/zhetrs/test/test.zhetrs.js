/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhetrs from './../lib/zhetrs.js';
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

test( 'zhetrs is a function', function t() {
	assert.strictEqual( typeof zhetrs, 'function', 'is a function' );
});

test( 'zhetrs has expected arity', function t() {
	assert.strictEqual( zhetrs.length, 10, 'has expected arity' );
});

test( 'zhetrs throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zhetrs( 'invalid', 'lower', 2, 1, identity2(), 2, ipiv(), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zhetrs throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrs( 'column-major', 'bogus', 2, 1, identity2(), 2, ipiv(), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zhetrs throws a RangeError for LDB < max(1,N)', function t() {
	assert.throws( function throws() {
		zhetrs( 'column-major', 'lower', 2, 1, identity2(), 2, ipiv(), 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zhetrs solves I*X=B (solution equals the RHS)', function t() {
	const B = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const info = zhetrs( 'column-major', 'lower', 2, 1, identity2(), 2, ipiv(), 1, B, 2 );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( B.buffer );
	assert.ok( Math.abs( view[ 0 ] - 3.0 ) < 1e-12 && Math.abs( view[ 1 ] + 1.0 ) < 1e-12, 'X[0]' );
	assert.ok( Math.abs( view[ 2 ] - 5.0 ) < 1e-12 && Math.abs( view[ 3 ] - 2.0 ) < 1e-12, 'X[1]' );
});

test( 'zhetrs (column-major) matches the ndarray form', function t() {
	const B1 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const info1 = zhetrs( 'column-major', 'lower', 2, 1, identity2(), 2, ipiv(), 1, B1, 2 );

	const B2 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const info2 = ndarray( 'lower', 2, 1, identity2(), 1, 2, 0, ipiv(), 1, 0, B2, 1, 2, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	const v1 = new Float64Array( B1.buffer );
	const v2 = new Float64Array( B2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'B['+i+'] matches' );
	}
});
