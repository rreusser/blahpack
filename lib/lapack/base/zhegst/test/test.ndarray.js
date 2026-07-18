

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// B matrix (Hermitian positive definite):
// B = [4 1+i 0; 1-i 5 2-i; 0 2+i 6]
const B_DATA = [
	4, 0, 1, -1, 0, 0,
	1, 1, 5, 0, 2, 1,
	0, 0, 2, -1, 6, 0
];

// A matrix (Hermitian), upper stored
const A_UPPER_DATA = [
	10, 0, 0, 0, 0, 0,
	2, 1, 8, 0, 0, 0,
	1, -2, 3, 1, 7, 0
];

// A matrix (Hermitian), lower stored
const A_LOWER_DATA = [
	10, 0, 2, -1, 1, 2,
	0, 0, 8, 0, 3, -1,
	0, 0, 0, 0, 7, 0
];

function makeB( uplo ) {
	const B = new Complex128Array( B_DATA );
	zpotrf( uplo, 3, B, 1, 3, 0 );
	return B;
}

// TESTS //

test( 'zhegst: itype1_upper', function t() {
	const tc = itype1_upper;
	const B = makeB( 'upper' );
	const A = new Complex128Array( A_UPPER_DATA );
	const info = zhegst( 1, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype1_lower', function t() {
	const tc = itype1_lower;
	const B = makeB( 'lower' );
	const A = new Complex128Array( A_LOWER_DATA );
	const info = zhegst( 1, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype2_upper', function t() {
	const tc = itype2_upper;
	const B = makeB( 'upper' );
	const A = new Complex128Array( A_UPPER_DATA );
	const info = zhegst( 2, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype2_lower', function t() {
	const tc = itype2_lower;
	const B = makeB( 'lower' );
	const A = new Complex128Array( A_LOWER_DATA );
	const info = zhegst( 2, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype3_upper', function t() {
	const tc = itype3_upper;
	const B = makeB( 'upper' );
	const A = new Complex128Array( A_UPPER_DATA );
	const info = zhegst( 3, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: itype3_lower', function t() {
	const tc = itype3_lower;
	const B = makeB( 'lower' );
	const A = new Complex128Array( A_LOWER_DATA );
	const info = zhegst( 3, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegst: n_zero', function t() {
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const info = zhegst( 1, 'upper', 0, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhegst: n_one', function t() {
	const tc = n_one;
	const A = new Complex128Array( [ 9, 0 ] );
	const B = new Complex128Array( [ 3, 0 ] );
	const info = zhegst( 1, 'upper', 1, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

// Helper to build N=70 diagonally dominant HPD matrix B (column-major flat, Complex128Array)
function makeBigB( uplo ) {
	const N = 70;
	const B = new Complex128Array( N * N );
	const Bv = reinterpret( B, 0 );
	let i, j, idx;
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
	const N = 70;
	const A = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	let i, j, idx;
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
	const N = 70;
	const A = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	let i, j, idx;
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
	const tc = blocked_itype1_upper_70;
	const N = 70;
	const B = makeBigB( 'upper' );
	const A = makeBigAUpper();
	const info = zhegst( 1, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype1 lower N=70', function t() {
	const tc = blocked_itype1_lower_70;
	const N = 70;
	const B = makeBigB( 'lower' );
	const A = makeBigALower();
	const info = zhegst( 1, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype2 upper N=70', function t() {
	const tc = blocked_itype2_upper_70;
	const N = 70;
	const B = makeBigB( 'upper' );
	const A = makeBigAUpper();
	const info = zhegst( 2, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype2 lower N=70', function t() {
	const tc = blocked_itype2_lower_70;
	const N = 70;
	const B = makeBigB( 'lower' );
	const A = makeBigALower();
	const info = zhegst( 2, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype3 upper N=70', function t() {
	const tc = blocked_itype3_upper_70;
	const N = 70;
	const B = makeBigB( 'upper' );
	const A = makeBigAUpper();
	const info = zhegst( 3, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});

test( 'zhegst: blocked itype3 lower N=70', function t() {
	const tc = blocked_itype3_lower_70;
	const N = 70;
	const B = makeBigB( 'lower' );
	const A = makeBigALower();
	const info = zhegst( 3, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-10, 'A' );
});
