// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetd2 from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import upper_diagonal from './fixtures/upper_diagonal.json' with { type: 'json' };
import lower_diagonal from './fixtures/lower_diagonal.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build inputs for a 4x4 Hermitian matrix test.
* H = [ 4,       1+i,    2-i,    0.5+0.5i ]
*     [ 1-i,     5,      1+2i,   1-i      ]
*     [ 2+i,     1-2i,   6,      2+i      ]
*     [ 0.5-0.5i,1+i,    2-i,    7        ]
*/
function makeHerm4() {
	// Column-major interleaved re/im
	var A = new Complex128Array([
		4, 0,    1, -1,   2, 1,    0.5, -0.5,  // col 0
		1, 1,    5, 0,    1, -2,   1, 1,        // col 1
		2, -1,   1, 2,    6, 0,    2, -1,       // col 2
		0.5, 0.5, 1, -1,  2, 1,   7, 0         // col 3
	]);
	return A;
}

// TESTS //

test( 'zhetd2: upper_4x4', function t() {
	var tc = upper_4x4;
	var A = makeHerm4();
	var d = new Float64Array( 4 );
	var e = new Float64Array( 3 );
	var TAU = new Complex128Array( 3 );
	var info = zhetd2( 'upper', 4, A, 1, 4, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	var Av = reinterpret( A, 0 );
	var Tv = reinterpret( TAU, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( Tv ), tc.tau, 1e-14, 'tau' );
});

test( 'zhetd2: lower_4x4', function t() {
	var tc = lower_4x4;
	var A = makeHerm4();
	var d = new Float64Array( 4 );
	var e = new Float64Array( 3 );
	var TAU = new Complex128Array( 3 );
	var info = zhetd2( 'lower', 4, A, 1, 4, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	var Av = reinterpret( A, 0 );
	var Tv = reinterpret( TAU, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( Tv ), tc.tau, 1e-14, 'tau' );
});

test( 'zhetd2: n_one_upper', function t() {
	var tc = n_one_upper;
	var A = new Complex128Array( [ 3, 0 ] );
	var d = new Float64Array( 1 );
	var e = new Float64Array( 0 );
	var TAU = new Complex128Array( 0 );
	var info = zhetd2( 'upper', 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( d[ 0 ], tc.d1, 1e-14, 'd1' );
});

test( 'zhetd2: n_one_lower', function t() {
	var tc = n_one_lower;
	var A = new Complex128Array( [ 5, 0 ] );
	var d = new Float64Array( 1 );
	var e = new Float64Array( 0 );
	var TAU = new Complex128Array( 0 );
	var info = zhetd2( 'lower', 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( d[ 0 ], tc.d1, 1e-14, 'd1' );
});

test( 'zhetd2: n_zero', function t() {
	var A = new Complex128Array( 0 );
	var d = new Float64Array( 0 );
	var e = new Float64Array( 0 );
	var TAU = new Complex128Array( 0 );
	var info = zhetd2( 'upper', 0, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhetd2: upper_diagonal (tau=0 path)', function t() {
	var tc = upper_diagonal;
	// 3x3 diagonal stored in 4x4 buffer (LDA=4 in Fortran, but we use N=3)
	var A = new Complex128Array([
		2, 0,   0, 0,   0, 0,
		0, 0,   5, 0,   0, 0,
		0, 0,   0, 0,   8, 0
	]);
	var d = new Float64Array( 3 );
	var e = new Float64Array( 2 );
	var TAU = new Complex128Array( 2 );
	var Tv = reinterpret( TAU, 0 );
	var info = zhetd2( 'upper', 3, A, 1, 3, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( Tv ), tc.tau, 1e-14, 'tau' );
});

test( 'zhetd2: lower_diagonal (tau=0 path)', function t() {
	var tc = lower_diagonal;
	var A = new Complex128Array([
		2, 0,   0, 0,   0, 0,
		0, 0,   5, 0,   0, 0,
		0, 0,   0, 0,   8, 0
	]);
	var d = new Float64Array( 3 );
	var e = new Float64Array( 2 );
	var TAU = new Complex128Array( 2 );
	var Tv = reinterpret( TAU, 0 );
	var info = zhetd2( 'lower', 3, A, 1, 3, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( Tv ), tc.tau, 1e-14, 'tau' );
});
