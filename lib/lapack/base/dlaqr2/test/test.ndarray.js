// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaqr2 from './../lib/ndarray.js';

// FIXTURES //

import _6x6_hessenberg_nw_3 from './fixtures/6x6_hessenberg_nw_3.json' with { type: 'json' };
import _4x4_hessenberg_nw_2 from './fixtures/4x4_hessenberg_nw_2.json' with { type: 'json' };
import _4x4_nw_1_no_wantz from './fixtures/4x4_nw_1_no_wantz.json' with { type: 'json' };
import edge_case_ktop___kbot from './fixtures/edge_case_ktop___kbot.json' with { type: 'json' };
import _8x8_hessenberg_nw_4_partial from './fixtures/8x8_hessenberg_nw_4_partial.json' with { type: 'json' };
import _6x6_with_deflation from './fixtures/6x6_with_deflation.json' with { type: 'json' };
import _6x6_full_window from './fixtures/6x6_full_window.json' with { type: 'json' };
import _10x10_nw_5 from './fixtures/10x10_nw_5.json' with { type: 'json' };
import _10x10_nw_8_large_window from './fixtures/10x10_nw_8_large_window.json' with { type: 'json' };
import _6x6_nw_4_no_wantt_no_wantz from './fixtures/6x6_nw_4_no_wantt_no_wantz.json' with { type: 'json' };
import _8x8_nw_6_nearly_deflated from './fixtures/8x8_nw_6_nearly_deflated.json' with { type: 'json' };
import _6x6_nw_2_complex_pair from './fixtures/6x6_nw_2_complex_pair.json' with { type: 'json' };

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

/**
* Extracts an NxN submatrix from a Fortran column-major array with leading dimension LDA.
*
* @param {Array} arr - column-major flat array
* @param {integer} LDA - leading dimension
* @param {integer} N - number of rows/columns to extract
* @returns {Float64Array} column-major NxN array with leading dimension N
*/
function extractMatrix( arr, LDA, N ) {
	const out = new Float64Array( N * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out[ i + j * N ] = arr[ i + j * LDA ];
		}
	}
	return out;
}

/**
* Verifies that a column-major NxN matrix is orthogonal (Z^T * Z ~ I).
*/
function verifyOrthogonal( Z, N, tol, msg ) {
	let i, j, k, sum;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Z[ k + i * N ] * Z[ k + j * N ];
			}
			const expected = ( i === j ) ? 1.0 : 0.0;
			assertClose( sum, expected, tol, msg + ' ZtZ(' + i + ',' + j + ')' );
		}
	}
}

/**
* Runs dlaqr2 with the given parameters and returns results.
*/
function runDlaqr2( N, KTOP, KBOT, NW, Hin, Zin, WANTT, WANTZ, ILOZ, IHIZ ) {
	const NH = N;
	const NV = N;
	const lwork = 200;
	const H = new Float64Array( Hin );
	const Z = new Float64Array( Zin );
	const SR = new Float64Array( N );
	const SI = new Float64Array( N );
	const V = new Float64Array( N * N );
	const T = new Float64Array( N * N );
	const WV = new Float64Array( N * N );
	const WORK = new Float64Array( lwork );

	// Column-major: strideH1=1, strideH2=N
	const result = dlaqr2(
		WANTT, WANTZ, N, KTOP, KBOT, NW,
		H, 1, N, 0,
		ILOZ, IHIZ,
		Z, 1, N, 0,
		SR, 1, 0,
		SI, 1, 0,
		V, 1, N, 0,
		NH,
		T, 1, N, 0,
		NV,
		WV, 1, N, 0,
		WORK, 1, 0
	);

	return {
		'ns': result.ns,
		'nd': result.nd,
		'H': H,
		'Z': Z,
		'SR': SR,
		'SI': SI
	};
}

// TESTS //

test( 'dlaqr2: 6x6 hessenberg NW=3', function t() {
	const tc = _6x6_hessenberg_nw_3;
	const N = 6;
	// Fixture H/Z are packed NxN (print_matrix packs them)
	const Hin = new Float64Array( tc.H );
	const Zin = new Float64Array( tc.Z );

	// Build input (before dlaqr2 call)
	const H0 = new Float64Array( N * N );
	H0[ 0 + 0*N ] = 4.0; H0[ 0 + 1*N ] = 1.0; H0[ 0 + 2*N ] = 0.5; H0[ 0 + 3*N ] = 0.1; H0[ 0 + 4*N ] = 0.2; H0[ 0 + 5*N ] = 0.3;
	H0[ 1 + 0*N ] = 1.0; H0[ 1 + 1*N ] = 3.0; H0[ 1 + 2*N ] = 0.8; H0[ 1 + 3*N ] = 0.2; H0[ 1 + 4*N ] = 0.1; H0[ 1 + 5*N ] = 0.4;
	H0[ 2 + 1*N ] = 0.5; H0[ 2 + 2*N ] = 2.0; H0[ 2 + 3*N ] = 0.7; H0[ 2 + 4*N ] = 0.3; H0[ 2 + 5*N ] = 0.2;
	H0[ 3 + 2*N ] = 0.3; H0[ 3 + 3*N ] = 1.5; H0[ 3 + 4*N ] = 0.9; H0[ 3 + 5*N ] = 0.1;
	H0[ 4 + 3*N ] = 0.2; H0[ 4 + 4*N ] = 1.0; H0[ 4 + 5*N ] = 0.6;
	H0[ 5 + 4*N ] = 0.1; H0[ 5 + 5*N ] = 0.5;

	const Z0 = new Float64Array( N * N );
	for ( let ii = 0; ii < N; ii++ ) Z0[ ii + ii*N ] = 1.0;

	const r = runDlaqr2( N, 1, 6, 3, H0, Z0, true, true, 1, 6 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	assertArrayClose( Array.from( r.H ), Array.from( Hin ), 1e-12, 'H' );
	assertArrayClose( Array.from( r.Z ), Array.from( Zin ), 1e-12, 'Z' );
	assertArrayClose( Array.from( r.SR ), tc.SR.slice( 0, N ), 1e-12, 'SR' );
	assertArrayClose( Array.from( r.SI ), tc.SI.slice( 0, N ), 1e-12, 'SI' );
});

test( 'dlaqr2: 4x4 hessenberg NW=2', function t() {
	const tc = _4x4_hessenberg_nw_2;
	const N = 4;
	const Hin = new Float64Array( tc.H );

	const H0 = new Float64Array( N * N );
	H0[ 0 + 0*N ] = 5.0; H0[ 0 + 1*N ] = 2.0; H0[ 0 + 2*N ] = 0.3; H0[ 0 + 3*N ] = 0.1;
	H0[ 1 + 0*N ] = 1.0; H0[ 1 + 1*N ] = 4.0; H0[ 1 + 2*N ] = 1.5; H0[ 1 + 3*N ] = 0.2;
	H0[ 2 + 1*N ] = 0.8; H0[ 2 + 2*N ] = 3.0; H0[ 2 + 3*N ] = 1.0;
	H0[ 3 + 2*N ] = 0.5; H0[ 3 + 3*N ] = 2.0;

	const Z0 = new Float64Array( N * N );
	for ( let ii = 0; ii < N; ii++ ) Z0[ ii + ii*N ] = 1.0;

	const r = runDlaqr2( N, 1, 4, 2, H0, Z0, true, true, 1, 4 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	assertArrayClose( Array.from( r.H ), Array.from( Hin ), 1e-12, 'H' );
	assertArrayClose( Array.from( r.SR ), tc.SR.slice( 0, N ), 1e-12, 'SR' );
	assertArrayClose( Array.from( r.SI ), tc.SI.slice( 0, N ), 1e-12, 'SI' );
});

test( 'dlaqr2: 4x4 NW=1 no wantz', function t() {
	const tc = _4x4_nw_1_no_wantz;
	const N = 4;
	const Hin = new Float64Array( tc.H );

	const H0 = new Float64Array( N * N );
	H0[ 0 + 0*N ] = 5.0; H0[ 0 + 1*N ] = 2.0; H0[ 0 + 2*N ] = 0.3; H0[ 0 + 3*N ] = 0.1;
	H0[ 1 + 0*N ] = 1.0; H0[ 1 + 1*N ] = 4.0; H0[ 1 + 2*N ] = 1.5; H0[ 1 + 3*N ] = 0.2;
	H0[ 2 + 1*N ] = 0.8; H0[ 2 + 2*N ] = 3.0; H0[ 2 + 3*N ] = 1.0;
	H0[ 3 + 2*N ] = 0.5; H0[ 3 + 3*N ] = 2.0;

	const Z0 = new Float64Array( N * N );

	const r = runDlaqr2( N, 1, 4, 1, H0, Z0, true, false, 1, 4 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	assertArrayClose( Array.from( r.H ), Array.from( Hin ), 1e-12, 'H' );
	assertArrayClose( Array.from( r.SR ), tc.SR.slice( 0, N ), 1e-12, 'SR' );
	assertArrayClose( Array.from( r.SI ), tc.SI.slice( 0, N ), 1e-12, 'SI' );
});

test( 'dlaqr2: edge case ktop > kbot', function t() {
	const tc = edge_case_ktop___kbot;
	const N = 4;
	const H0 = new Float64Array( N * N );
	const Z0 = new Float64Array( N * N );

	const r = runDlaqr2( N, 3, 2, 2, H0, Z0, true, false, 1, N );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
});

test( 'dlaqr2: 8x8 hessenberg NW=4 partial', function t() {
	const tc = _8x8_hessenberg_nw_4_partial;
	const N = 8;
	const Hin = new Float64Array( tc.H );
	const Zin = new Float64Array( tc.Z );

	// Build input
	const H0 = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		H0[ i + i*N ] = ( N + 1 - (i+1) ) * 1.5;
		if ( i + 1 < N ) {
			H0[ i + (i+1)*N ] = 0.5;
			H0[ i+1 + i*N ] = 0.3;
		}
		if ( i + 2 < N ) {
			H0[ i + (i+2)*N ] = 0.1;
		}
	}

	const Z0 = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) Z0[ i + i*N ] = 1.0;

	const r = runDlaqr2( N, 2, 7, 4, H0, Z0, true, true, 1, 8 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	assertArrayClose( Array.from( r.H ), Array.from( Hin ), 1e-10, 'H' );
	assertArrayClose( Array.from( r.Z ), Array.from( Zin ), 1e-10, 'Z' );
	assertArrayClose( Array.from( r.SR ), tc.SR.slice( 0, N ), 1e-10, 'SR' );
	assertArrayClose( Array.from( r.SI ), tc.SI.slice( 0, N ), 1e-10, 'SI' );
});


test( 'dlaqr2: 6x6 with deflation', function t() {
	const tc = _6x6_with_deflation;
	const N = 6;
	const Hin = new Float64Array( tc.H );
	const Zin = new Float64Array( tc.Z );

	const H0 = new Float64Array( N * N );
	H0[ 0 + 0*N ] = 10.0; H0[ 0 + 1*N ] = 1.0;  H0[ 0 + 2*N ] = 0.5; H0[ 0 + 3*N ] = 0.1;    H0[ 0 + 4*N ] = 0.2;  H0[ 0 + 5*N ] = 0.3;
	H0[ 1 + 0*N ] = 2.0;  H0[ 1 + 1*N ] = 8.0;  H0[ 1 + 2*N ] = 0.8; H0[ 1 + 3*N ] = 0.2;    H0[ 1 + 4*N ] = 0.1;  H0[ 1 + 5*N ] = 0.4;
	H0[ 2 + 1*N ] = 1.5;  H0[ 2 + 2*N ] = 6.0;  H0[ 2 + 3*N ] = 0.7; H0[ 2 + 4*N ] = 0.3;    H0[ 2 + 5*N ] = 0.2;
	H0[ 3 + 2*N ] = 1.0;  H0[ 3 + 3*N ] = 4.0;  H0[ 3 + 4*N ] = 0.9; H0[ 3 + 5*N ] = 0.1;
	H0[ 4 + 3*N ] = 1e-14; H0[ 4 + 4*N ] = 3.0; H0[ 4 + 5*N ] = 0.6;
	H0[ 5 + 4*N ] = 1e-15; H0[ 5 + 5*N ] = 1.0;

	const Z0 = new Float64Array( N * N );
	for ( let ii = 0; ii < N; ii++ ) Z0[ ii + ii*N ] = 1.0;

	const r = runDlaqr2( N, 1, 6, 3, H0, Z0, true, true, 1, 6 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	// Check SR/SI in the kwtop..kbot range (indices 3..5 for kwtop=4, kbot=6)
	assertArrayClose( Array.from( r.SR ).slice( 3, 6 ), tc.SR.slice( 3, 6 ), 1e-10, 'SR' );
	assertArrayClose( Array.from( r.SI ).slice( 3, 6 ), tc.SI.slice( 3, 6 ), 1e-10, 'SI' );
	// Verify orthogonality of Z: Z^T * Z should be close to I
	verifyOrthogonal( r.Z, N, 1e-10, 'Z orthogonal' );
});

test( 'dlaqr2: 6x6 full window', function t() {
	const tc = _6x6_full_window;
	const N = 6;

	const H0 = new Float64Array( N * N );
	H0[ 0 + 0*N ] = 10.0; H0[ 0 + 1*N ] = 1.0;  H0[ 0 + 2*N ] = 0.5; H0[ 0 + 3*N ] = 0.1;    H0[ 0 + 4*N ] = 0.2;  H0[ 0 + 5*N ] = 0.3;
	H0[ 1 + 0*N ] = 2.0;  H0[ 1 + 1*N ] = 8.0;  H0[ 1 + 2*N ] = 0.8; H0[ 1 + 3*N ] = 0.2;    H0[ 1 + 4*N ] = 0.1;  H0[ 1 + 5*N ] = 0.4;
	H0[ 2 + 1*N ] = 1.5;  H0[ 2 + 2*N ] = 6.0;  H0[ 2 + 3*N ] = 0.7; H0[ 2 + 4*N ] = 0.3;    H0[ 2 + 5*N ] = 0.2;
	H0[ 3 + 2*N ] = 1.0;  H0[ 3 + 3*N ] = 4.0;  H0[ 3 + 4*N ] = 0.9; H0[ 3 + 5*N ] = 0.1;
	H0[ 4 + 3*N ] = 1e-14; H0[ 4 + 4*N ] = 3.0; H0[ 4 + 5*N ] = 0.6;
	H0[ 5 + 4*N ] = 1e-15; H0[ 5 + 5*N ] = 1.0;

	const Z0 = new Float64Array( N * N );
	for ( let ii = 0; ii < N; ii++ ) Z0[ ii + ii*N ] = 1.0;

	const r = runDlaqr2( N, 1, 6, 6, H0, Z0, true, true, 1, 6 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	// For full window with full deflation, compare sorted eigenvalues
	const srJS = Array.from( r.SR ).slice().sort();
	const srFort = tc.SR.slice( 0, N ).slice().sort();
	assertArrayClose( srJS, srFort, 1e-10, 'SR sorted' );
	verifyOrthogonal( r.Z, N, 1e-10, 'Z orthogonal' );
});

test( 'dlaqr2: 10x10 NW=5', function t() {
	const tc = _10x10_nw_5;
	const N = 10;

	const H0 = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		H0[ i + i*N ] = ( N + 1 - ( i + 1 ) ) * 2.0;
		if ( i + 1 < N ) {
			H0[ ( i + 1 ) + i*N ] = 0.8;
			H0[ i + ( i + 1 )*N ] = 0.6;
		}
		if ( i + 2 < N ) {
			H0[ i + ( i + 2 )*N ] = 0.15;
		}
	}

	const Z0 = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) Z0[ i + i*N ] = 1.0;

	const r = runDlaqr2( N, 1, 10, 5, H0, Z0, true, true, 1, 10 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	assertArrayClose( Array.from( r.H ), tc.H, 1e-10, 'H' );
	assertArrayClose( Array.from( r.Z ), tc.Z, 1e-10, 'Z' );
	assertArrayClose( Array.from( r.SR ).slice( 0, N ), tc.SR, 1e-10, 'SR' );
	assertArrayClose( Array.from( r.SI ).slice( 0, N ), tc.SI, 1e-10, 'SI' );
});

test( 'dlaqr2: 10x10 NW=8 large window', function t() {
	const tc = _10x10_nw_8_large_window;
	const N = 10;

	const H0 = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		H0[ i + i*N ] = ( i + 1 ) * 0.5 + 2.0;
		if ( i + 1 < N ) {
			H0[ ( i + 1 ) + i*N ] = 1.5;
			H0[ i + ( i + 1 )*N ] = 0.8;
		}
		if ( i + 2 < N ) {
			H0[ i + ( i + 2 )*N ] = 0.3;
		}
	}

	const Z0 = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) Z0[ i + i*N ] = 1.0;

	const r = runDlaqr2( N, 1, 10, 8, H0, Z0, true, true, 1, 10 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	assertArrayClose( Array.from( r.H ), tc.H, 1e-10, 'H' );
	assertArrayClose( Array.from( r.Z ), tc.Z, 1e-10, 'Z' );
	assertArrayClose( Array.from( r.SR ).slice( 0, N ), tc.SR, 1e-10, 'SR' );
	assertArrayClose( Array.from( r.SI ).slice( 0, N ), tc.SI, 1e-10, 'SI' );
});

test( 'dlaqr2: 6x6 NW=4 no wantt no wantz', function t() {
	const tc = _6x6_nw_4_no_wantt_no_wantz;
	const N = 6;

	const H0 = new Float64Array( N * N );
	H0[ 0 + 0*N ] = 4.0; H0[ 0 + 1*N ] = 1.0; H0[ 0 + 2*N ] = 0.5; H0[ 0 + 3*N ] = 0.1; H0[ 0 + 4*N ] = 0.2; H0[ 0 + 5*N ] = 0.3;
	H0[ 1 + 0*N ] = 1.0; H0[ 1 + 1*N ] = 3.0; H0[ 1 + 2*N ] = 0.8; H0[ 1 + 3*N ] = 0.2; H0[ 1 + 4*N ] = 0.1; H0[ 1 + 5*N ] = 0.4;
	H0[ 2 + 1*N ] = 0.5; H0[ 2 + 2*N ] = 2.0; H0[ 2 + 3*N ] = 0.7; H0[ 2 + 4*N ] = 0.3; H0[ 2 + 5*N ] = 0.2;
	H0[ 3 + 2*N ] = 0.3; H0[ 3 + 3*N ] = 1.5; H0[ 3 + 4*N ] = 0.9; H0[ 3 + 5*N ] = 0.1;
	H0[ 4 + 3*N ] = 0.2; H0[ 4 + 4*N ] = 1.0; H0[ 4 + 5*N ] = 0.6;
	H0[ 5 + 4*N ] = 0.1; H0[ 5 + 5*N ] = 0.5;

	const Z0 = new Float64Array( N * N );

	const r = runDlaqr2( N, 1, 6, 4, H0, Z0, false, false, 1, 6 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	assertArrayClose( Array.from( r.H ), tc.H, 1e-10, 'H' );
	assertArrayClose( Array.from( r.SR ).slice( 0, N ), tc.SR, 1e-10, 'SR' );
	assertArrayClose( Array.from( r.SI ).slice( 0, N ), tc.SI, 1e-10, 'SI' );
});

test( 'dlaqr2: 8x8 NW=6 nearly deflated', function t() {
	const tc = _8x8_nw_6_nearly_deflated;
	const N = 8;

	const H0 = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		H0[ i + i*N ] = ( i + 1 ) * 3.0;
		if ( i + 1 < N ) {
			H0[ i + ( i + 1 )*N ] = 1.0;
		}
		if ( i > 0 && i <= 4 ) {
			H0[ i + ( i - 1 )*N ] = 0.8;
		}
	}
	// Tiny subdiag entries near bottom
	H0[ 5 + 4*N ] = 1e-15;
	H0[ 6 + 5*N ] = 1e-14;
	H0[ 7 + 6*N ] = 1e-13;

	const Z0 = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) Z0[ i + i*N ] = 1.0;

	const r = runDlaqr2( N, 1, 8, 6, H0, Z0, true, true, 1, 8 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	// Verify at least some deflation occurred
	assert.ok( r.nd > 0, 'should have some deflation with tiny subdiag entries' );
	verifyOrthogonal( r.Z, N, 1e-10, 'Z orthogonal' );
});

test( 'dlaqr2: 6x6 NW=2 complex pair', function t() {
	const tc = _6x6_nw_2_complex_pair;
	const N = 6;

	const H0 = new Float64Array( N * N );
	H0[ 0 + 0*N ] = 10.0; H0[ 0 + 1*N ] = 1.0;  H0[ 0 + 2*N ] = 0.5;  H0[ 0 + 3*N ] = 0.2; H0[ 0 + 4*N ] = 0.1;  H0[ 0 + 5*N ] = 0.05;
	H0[ 1 + 0*N ] = 0.5;  H0[ 1 + 1*N ] = 8.0;  H0[ 1 + 2*N ] = 1.0;  H0[ 1 + 3*N ] = 0.3; H0[ 1 + 4*N ] = 0.2;  H0[ 1 + 5*N ] = 0.1;
	H0[ 2 + 1*N ] = 0.3;  H0[ 2 + 2*N ] = 6.0;  H0[ 2 + 3*N ] = 0.8;  H0[ 2 + 4*N ] = 0.3; H0[ 2 + 5*N ] = 0.15;
	H0[ 3 + 2*N ] = 0.2;  H0[ 3 + 3*N ] = 4.0;  H0[ 3 + 4*N ] = 1.0;  H0[ 3 + 5*N ] = 0.2;
	H0[ 4 + 3*N ] = 0.1;  H0[ 4 + 4*N ] = 1.0;  H0[ 4 + 5*N ] = 4.0;
	H0[ 5 + 4*N ] = -1.0; H0[ 5 + 5*N ] = 1.0;

	const Z0 = new Float64Array( N * N );
	for ( let ii = 0; ii < N; ii++ ) Z0[ ii + ii*N ] = 1.0;

	const r = runDlaqr2( N, 1, 6, 2, H0, Z0, true, true, 1, 6 );

	assert.strictEqual( r.ns, tc.ns, 'ns' );
	assert.strictEqual( r.nd, tc.nd, 'nd' );
	assertArrayClose( Array.from( r.H ), tc.H, 1e-10, 'H' );
	assertArrayClose( Array.from( r.Z ), tc.Z, 1e-10, 'Z' );
	assertArrayClose( Array.from( r.SR ).slice( 0, N ), tc.SR, 1e-10, 'SR' );
	assertArrayClose( Array.from( r.SI ).slice( 0, N ), tc.SI, 1e-10, 'SI' );
});
