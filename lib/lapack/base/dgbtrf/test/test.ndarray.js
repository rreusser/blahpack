// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dgbtrf from './../lib/ndarray.js';

// FIXTURES //

import tridiag_4x4 from './fixtures/tridiag_4x4.json' with { type: 'json' };
import pentadiag_5x5 from './fixtures/pentadiag_5x5.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import pivot_2x2 from './fixtures/pivot_2x2.json' with { type: 'json' };
import kl1_ku2_3x3 from './fixtures/kl1_ku2_3x3.json' with { type: 'json' };
import blocked_100x100_kl33 from './fixtures/blocked_100x100_kl33.json' with { type: 'json' };
import dgbtrs from '../../dgbtrs/lib/base.js';

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

// TESTS //

test( 'dgbtrf: N=0 quick return', function t() {
	const AB = new Float64Array( 16 );
	const IPIV = new Int32Array( 4 );
	const info = dgbtrf( 3, 0, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dgbtrf: M=0 quick return', function t() {
	const AB = new Float64Array( 16 );
	const IPIV = new Int32Array( 4 );
	const info = dgbtrf( 0, 3, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dgbtrf: tridiag_4x4', function t() {
	const tc = tridiag_4x4;
	const AB = new Float64Array( [
		0.0, 0.0, 4.0, -1.0,
		0.0, -1.0, 4.0, -1.0,
		0.0, -1.0, 4.0, -1.0,
		0.0, -1.0, 4.0, 0.0
	] );
	const IPIV = new Int32Array( 4 );
	const info = dgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( AB ), tc.AB, 1e-14, 'AB' );
	let i;
	for ( i = 0; i < 4; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'dgbtrf: pentadiag_5x5', function t() {
	const tc = pentadiag_5x5;
	const AB = new Float64Array( 7 * 5 );
	AB[ 4 ] = 6.0; AB[ 5 ] = -2.0; AB[ 6 ] = 1.0;
	AB[ 7 + 3 ] = -2.0; AB[ 7 + 4 ] = 6.0; AB[ 7 + 5 ] = -2.0; AB[ 7 + 6 ] = 1.0;
	AB[ 14 + 2 ] = 1.0; AB[ 14 + 3 ] = -2.0; AB[ 14 + 4 ] = 6.0; AB[ 14 + 5 ] = -2.0; AB[ 14 + 6 ] = 1.0;
	AB[ 21 + 2 ] = 1.0; AB[ 21 + 3 ] = -2.0; AB[ 21 + 4 ] = 6.0; AB[ 21 + 5 ] = -2.0;
	AB[ 28 + 2 ] = 1.0; AB[ 28 + 3 ] = -2.0; AB[ 28 + 4 ] = 6.0;
	const IPIV = new Int32Array( 5 );
	const info = dgbtrf( 5, 5, 2, 2, AB, 1, 7, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( AB ), tc.AB, 1e-14, 'AB' );
	let i;
	for ( i = 0; i < 5; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'dgbtrf: one_by_one', function t() {
	const tc = one_by_one;
	const AB = new Float64Array( [ 7.0 ] );
	const IPIV = new Int32Array( 1 );
	const info = dgbtrf( 1, 1, 0, 0, AB, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( AB ), tc.AB, 1e-14, 'AB' );
	assert.equal( IPIV[ 0 ], tc.ipiv[ 0 ] - 1, 'ipiv[0]' );
});

test( 'dgbtrf: pivot_2x2', function t() {
	const tc = pivot_2x2;
	const AB = new Float64Array( 4 * 2 );
	AB[ 2 ] = 1.0; AB[ 3 ] = 3.0;
	AB[ 4 + 1 ] = 2.0; AB[ 4 + 2 ] = 4.0;
	const IPIV = new Int32Array( 2 );
	const info = dgbtrf( 2, 2, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( AB ), tc.AB, 1e-14, 'AB' );
	let i;
	for ( i = 0; i < 2; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'dgbtrf: kl1_ku2_3x3', function t() {
	const tc = kl1_ku2_3x3;
	const AB = new Float64Array( 5 * 3 );
	AB[ 3 ] = 5.0; AB[ 4 ] = 2.0;
	AB[ 5 + 2 ] = 3.0; AB[ 5 + 3 ] = 6.0; AB[ 5 + 4 ] = 1.0;
	AB[ 10 + 1 ] = 1.0; AB[ 10 + 2 ] = 4.0; AB[ 10 + 3 ] = 7.0;
	const IPIV = new Int32Array( 3 );
	const info = dgbtrf( 3, 3, 1, 2, AB, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( AB ), tc.AB, 1e-14, 'AB' );
	let i;
	for ( i = 0; i < 3; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'dgbtrf: blocked path 100x100 with KL=33 KU=33', function t() {
	const N = 100;
	const kl = 33;
	const ku = 33;
	const kv = ku + kl;
	const LDAB = 2 * kl + ku + 1;
	const AB_orig = new Float64Array( LDAB * N );
	const AB = new Float64Array( LDAB * N );
	const IPIV = new Int32Array( N );
	const b = new Float64Array( N );
	const x = new Float64Array( N );
	let i, j, resid, bnorm, val;

	// Build a diagonally dominant banded matrix
	for ( j = 0; j < N; j++ ) {
		AB_orig[ kv + j * LDAB ] = 10.0 * N + ( j + 1 );
		for ( i = 1; i <= Math.min( kl, N - j - 1 ); i++ ) {
			AB_orig[ kv + i + j * LDAB ] = -1.0 + 0.01 * i;
		}
		for ( i = 1; i <= Math.min( ku, j ); i++ ) {
			AB_orig[ kv - i + j * LDAB ] = -1.0 + 0.02 * i;
		}
	}

	// Copy for factorization
	for ( i = 0; i < AB_orig.length; i++ ) {
		AB[ i ] = AB_orig[ i ];
	}

	// Set up known solution x_true = [1, 2, 3, ..., N]
	// Compute b = A * x_true using the banded structure
	for ( i = 0; i < N; i++ ) {
		val = 0.0;
		for ( j = Math.max( 0, i - kl ); j <= Math.min( N - 1, i + ku ); j++ ) {
			// A(i,j) is stored at AB_orig[ kv + i - j + j * LDAB ]
			val += AB_orig[ kv + i - j + j * LDAB ] * ( j + 1 );
		}
		b[ i ] = val;
	}

	// Factorize
	const tc = blocked_100x100_kl33;
	const info = dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info should match reference' );

	// Compare the factorization itself against the Fortran reference output.
	// The solve-based residual check below is too forgiving on its own: this
	// matrix is strongly diagonally dominant and the residual is normalized by
	// ||b|| ~ 1000*||x||, which let a blocked-path off-by-one (trailing update
	// one column short) pass undetected.
	assertArrayClose( Array.from( AB ), tc.AB, 1e-13, 'AB' );
	for ( i = 0; i < N; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}

	// Solve using dgbtrs
	for ( i = 0; i < N; i++ ) {
		x[ i ] = b[ i ];
	}
	dgbtrs( 'no-transpose', N, kl, ku, 1, AB, 1, LDAB, 0, IPIV, 1, 0, x, 1, N, 0 );

	// Verify solution: x should be [1, 2, 3, ..., N]
	bnorm = 0.0;
	resid = 0.0;
	for ( i = 0; i < N; i++ ) {
		bnorm += b[ i ] * b[ i ];
		resid += ( x[ i ] - ( i + 1 ) ) * ( x[ i ] - ( i + 1 ) );
	}
	resid = Math.sqrt( resid ) / Math.sqrt( bnorm );
	assert.ok( resid < 1e-8, 'relative residual should be small: ' + resid );
});
