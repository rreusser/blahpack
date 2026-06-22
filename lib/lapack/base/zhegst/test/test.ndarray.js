

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpotrf from '../../zpotrf/lib/base.js';
import zhegst from './../lib/ndarray.js';

// FIXTURES //

import itype1_upper from './fixtures/itype1_upper.json' with { type: 'json' };
import itype1_lower from './fixtures/itype1_lower.json' with { type: 'json' };
import itype2_upper from './fixtures/itype2_upper.json' with { type: 'json' };
import itype2_lower from './fixtures/itype2_lower.json' with { type: 'json' };
import itype3_upper from './fixtures/itype3_upper.json' with { type: 'json' };
import itype3_lower from './fixtures/itype3_lower.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import blocked_itype1_upper_70 from './fixtures/blocked_itype1_upper_70.json' with { type: 'json' };
import blocked_itype1_lower_70 from './fixtures/blocked_itype1_lower_70.json' with { type: 'json' };
import blocked_itype2_upper_70 from './fixtures/blocked_itype2_upper_70.json' with { type: 'json' };
import blocked_itype2_lower_70 from './fixtures/blocked_itype2_lower_70.json' with { type: 'json' };
import blocked_itype3_upper_70 from './fixtures/blocked_itype3_upper_70.json' with { type: 'json' };
import blocked_itype3_lower_70 from './fixtures/blocked_itype3_lower_70.json' with { type: 'json' };

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

// B matrix (Hermitian positive definite):
// B = [4 1+i 0; 1-i 5 2-i; 0 2+i 6]
var B_DATA = [
	4, 0, 1, -1, 0, 0,
	1, 1, 5, 0, 2, 1,
	0, 0, 2, -1, 6, 0
];

// A matrix (Hermitian), upper stored
var A_UPPER_DATA = [
	10, 0, 0, 0, 0, 0,
	2, 1, 8, 0, 0, 0,
	1, -2, 3, 1, 7, 0
];

// A matrix (Hermitian), lower stored
var A_LOWER_DATA = [
	10, 0, 2, -1, 1, 2,
	0, 0, 8, 0, 3, -1,
	0, 0, 0, 0, 7, 0
];

function makeB( uplo ) {
	var B = new Complex128Array( B_DATA );
	zpotrf( uplo, 3, B, 1, 3, 0 );
	return B;
}

// TESTS //

test( 'zhegst: itype1_upper', function t() {
	var tc = itype1_upper;
	var B = makeB( 'upper' );
	var A = new Complex128Array( A_UPPER_DATA );
	var info = zhegst( 1, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype1_lower', function t() {
	var tc = itype1_lower;
	var B = makeB( 'lower' );
	var A = new Complex128Array( A_LOWER_DATA );
	var info = zhegst( 1, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype2_upper', function t() {
	var tc = itype2_upper;
	var B = makeB( 'upper' );
	var A = new Complex128Array( A_UPPER_DATA );
	var info = zhegst( 2, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype2_lower', function t() {
	var tc = itype2_lower;
	var B = makeB( 'lower' );
	var A = new Complex128Array( A_LOWER_DATA );
	var info = zhegst( 2, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype3_upper', function t() {
	var tc = itype3_upper;
	var B = makeB( 'upper' );
	var A = new Complex128Array( A_UPPER_DATA );
	var info = zhegst( 3, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype3_lower', function t() {
	var tc = itype3_lower;
	var B = makeB( 'lower' );
	var A = new Complex128Array( A_LOWER_DATA );
	var info = zhegst( 3, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: n_zero', function t() {
	var A = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var info = zhegst( 1, 'upper', 0, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhegst: n_one', function t() {
	var tc = n_one;
	var A = new Complex128Array( [ 9, 0 ] );
	var B = new Complex128Array( [ 3, 0 ] );
	var info = zhegst( 1, 'upper', 1, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

// Helper to build N=70 diagonally dominant HPD matrix B (column-major flat, Complex128Array)
function makeBigB( uplo ) {
	var N = 70;
	var B = new Complex128Array( N * N );
	var Bv = reinterpret( B, 0 );
	var i;
	var j;
	var idx;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = ( j * N + i ) * 2;
			if ( i === j ) {
				Bv[ idx ] = N + 1.0;
				Bv[ idx + 1 ] = 0.0;
			} else if ( i === j - 1 ) {
				Bv[ idx ] = 0.5;
				Bv[ idx + 1 ] = 0.1;
			} else if ( i === j + 1 ) {
				Bv[ idx ] = 0.5;
				Bv[ idx + 1 ] = -0.1;
			}
		}
	}
	zpotrf( uplo, N, B, 1, N, 0 );
	return B;
}

// Helper to build N=70 Hermitian A in upper storage (column-major flat)
function makeBigAUpper() {
	var N = 70;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var i;
	var j;
	var idx;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			idx = ( j * N + i ) * 2;
			if ( i === j ) {
				Av[ idx ] = 2 * N + ( i + 1 );
				Av[ idx + 1 ] = 0.0;
			} else {
				Av[ idx ] = 0.1 * ( ( i + 1 ) + ( j + 1 ) );
				Av[ idx + 1 ] = 0.05 * ( ( j + 1 ) - ( i + 1 ) );
			}
		}
	}
	return A;
}

// Helper to build N=70 Hermitian A in lower storage (column-major flat)
function makeBigALower() {
	var N = 70;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var i;
	var j;
	var idx;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			idx = ( j * N + i ) * 2;
			if ( i === j ) {
				Av[ idx ] = 2 * N + ( i + 1 );
				Av[ idx + 1 ] = 0.0;
			} else {
				Av[ idx ] = 0.1 * ( ( i + 1 ) + ( j + 1 ) );
				Av[ idx + 1 ] = -0.05 * ( ( i + 1 ) - ( j + 1 ) );
			}
		}
	}
	return A;
}

test( 'zhegst: blocked itype1 upper N=70', function t() {
	var tc = blocked_itype1_upper_70;
	var N = 70;
	var B = makeBigB( 'upper' );
	var A = makeBigAUpper();
	var info = zhegst( 1, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype1 lower N=70', function t() {
	var tc = blocked_itype1_lower_70;
	var N = 70;
	var B = makeBigB( 'lower' );
	var A = makeBigALower();
	var info = zhegst( 1, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype2 upper N=70', function t() {
	var tc = blocked_itype2_upper_70;
	var N = 70;
	var B = makeBigB( 'upper' );
	var A = makeBigAUpper();
	var info = zhegst( 2, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype2 lower N=70', function t() {
	var tc = blocked_itype2_lower_70;
	var N = 70;
	var B = makeBigB( 'lower' );
	var A = makeBigALower();
	var info = zhegst( 2, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype3 upper N=70', function t() {
	var tc = blocked_itype3_upper_70;
	var N = 70;
	var B = makeBigB( 'upper' );
	var A = makeBigAUpper();
	var info = zhegst( 3, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype3 lower N=70', function t() {
	var tc = blocked_itype3_lower_70;
	var N = 70;
	var B = makeBigB( 'lower' );
	var A = makeBigALower();
	var info = zhegst( 3, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});
