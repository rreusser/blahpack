/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunhr_col from './../lib/zunhr_col.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	const abs = Math.abs( actual - expected );
	const ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}

function identityM( M, N ) {
	const A = new Complex128Array( M * N );
	const v = reinterpret( A, 0 );
	let k;
	for ( k = 0; k < Math.min( M, N ); k += 1 ) {
		v[ 2 * ( k + ( k * M ) ) ] = 1.0;
	}
	return A;
}


// TESTS //

test( 'zunhr_col: is a function', function t() {
	assert.strictEqual( typeof zunhr_col, 'function', 'is a function' );
});

test( 'zunhr_col: has expected arity', function t() {
	assert.strictEqual( zunhr_col.length, 10, 'has expected arity' );
});

test( 'zunhr_col: throws TypeError for invalid order', function t() {
	assert.throws( function f() {
		zunhr_col( 'invalid', 2, 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zunhr_col: throws RangeError for negative M', function t() {
	assert.throws( function f() {
		zunhr_col( 'column-major', -1, 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunhr_col: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zunhr_col( 'column-major', 2, -1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunhr_col: throws RangeError for column-major LDA < max(1,M)', function t() {
	assert.throws( function f() {
		zunhr_col( 'column-major', 4, 2, 1, new Complex128Array( 16 ), 2, new Complex128Array( 8 ), 4, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunhr_col: throws RangeError for row-major LDA < max(1,N)', function t() {
	assert.throws( function f() {
		zunhr_col( 'row-major', 4, 4, 1, new Complex128Array( 16 ), 2, new Complex128Array( 16 ), 4, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunhr_col: throws RangeError for column-major LDT < max(1,M)', function t() {
	assert.throws( function f() {
		zunhr_col( 'column-major', 4, 2, 1, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunhr_col: throws RangeError for row-major LDT < max(1,N)', function t() {
	assert.throws( function f() {
		zunhr_col( 'row-major', 4, 4, 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunhr_col: column-major identity 3x3 produces info=0', function t() {
	// Wrapper currently requires LDT >= max(1,M) for column-major and
	// LDT >= max(1,N) for row-major (see zunhr_col.js LDT validation).
	const M = 3;
	const N = 3;
	const nb = 1;
	const A = identityM( M, N );

	// Allocate T with enough rows to satisfy LDT=M validation (over-allocates).
	const T = new Complex128Array( M * N );
	const d = new Float64Array( N );
	const info = zunhr_col( 'column-major', M, N, nb, A, M, T, M, d, 1 );
	assert.strictEqual( info, 0, 'info' );
	approxEqual( d[ 0 ], -1.0, 1e-12, 'd[0]' );
});

test( 'zunhr_col: row-major path executes (1x1 trivial)', function t() {
	// Row-major selects different strides; LDA, LDT >= max(1,N).
	const A = new Complex128Array( [ 1, 0 ] );
	const T = new Complex128Array( 1 );
	const d = new Float64Array( 1 );
	const info = zunhr_col( 'row-major', 1, 1, 1, A, 1, T, 1, d, 1 );
	assert.strictEqual( info, 0, 'info' );
	approxEqual( d[ 0 ], -1.0, 1e-10, 'd[0]' );
});
