// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelq2 from '../../zgelq2/lib/base.js';
import zunmlq from './../lib/ndarray.js';

// FIXTURES //

import left_notrans_5x5 from './fixtures/left_notrans_5x5.json' with { type: 'json' };
import left_conjtrans_5x5 from './fixtures/left_conjtrans_5x5.json' with { type: 'json' };
import right_notrans_5x5 from './fixtures/right_notrans_5x5.json' with { type: 'json' };
import right_conjtrans_rect from './fixtures/right_conjtrans_rect.json' with { type: 'json' };

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

function extractRaw( C, count ) {
	const Cv = reinterpret( C, 0 );
	const result = [];
	let i;
	for ( i = 0; i < count; i++ ) {
		result.push( Cv[ i ] );
	}
	return result;
}

function lq3x5() {
	const LDA = 6;
	const A = new Complex128Array( LDA * 6 );
	const Av = reinterpret( A, 0 );
	Av[0]=1; Av[1]=0;
	Av[2*LDA]=2; Av[2*LDA+1]=1;
	Av[4*LDA]=0; Av[4*LDA+1]=0;
	Av[6*LDA]=1; Av[6*LDA+1]=1;
	Av[8*LDA]=3; Av[8*LDA+1]=0;
	Av[2]=0; Av[3]=2;
	Av[2*LDA+2]=1; Av[2*LDA+3]=0;
	Av[4*LDA+2]=3; Av[4*LDA+3]=1;
	Av[6*LDA+2]=2; Av[6*LDA+3]=0;
	Av[8*LDA+2]=1; Av[8*LDA+3]=1;
	Av[4]=3; Av[5]=1;
	Av[2*LDA+4]=0; Av[2*LDA+5]=0;
	Av[4*LDA+4]=1; Av[4*LDA+5]=0;
	Av[6*LDA+4]=2; Av[6*LDA+5]=1;
	Av[8*LDA+4]=0; Av[8*LDA+5]=2;
	const TAU = new Complex128Array( 6 );
	const WORK = new Complex128Array( 20 );
	zgelq2( 3, 5, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU, LDA: LDA };
}

function eye5in6() {
	const LDC = 6;
	const C = new Complex128Array( LDC * 6 );
	const Cv = reinterpret( C, 0 );
	let i;
	for ( i = 0; i < 5; i++ ) {
		Cv[ 2 * ( i + i * LDC ) ] = 1.0;
	}
	return C;
}

// TESTS //

test( 'zunmlq: left, no transpose (Q*I)', function t() {
	const tc = left_notrans_5x5;
	const lq = lq3x5();
	const LDC = 6;
	const C = eye5in6();
	const WORK = new Complex128Array( 200 );
	const info = zunmlq('left', 'no-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmlq: left, conjugate transpose (Q^H*I)', function t() {
	const tc = left_conjtrans_5x5;
	const lq = lq3x5();
	const LDC = 6;
	const C = eye5in6();
	const WORK = new Complex128Array( 200 );
	const info = zunmlq('left', 'conjugate-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmlq: right, no transpose (I*Q)', function t() {
	const tc = right_notrans_5x5;
	const lq = lq3x5();
	const LDC = 6;
	const C = eye5in6();
	const WORK = new Complex128Array( 200 );
	const info = zunmlq('right', 'no-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmlq: M=0 quick return', function t() {
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const info = zunmlq('left', 'no-transpose', 0, 5, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunmlq: N=0 quick return', function t() {
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const info = zunmlq('left', 'no-transpose', 5, 0, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunmlq: K=0 quick return', function t() {
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const info = zunmlq('left', 'no-transpose', 5, 5, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunmlq: right, conjugate transpose on rectangular C', function t() {
	const tc = right_conjtrans_rect;
	const lq = lq3x5();
	const LDC = 6;
	const C = new Complex128Array( LDC * 6 );
	const Cv = reinterpret( C, 0 );
	Cv[0]=1; Cv[1]=1; Cv[2]=3; Cv[3]=0; Cv[4]=-1; Cv[5]=1;
	Cv[2*LDC]=0; Cv[2*LDC+1]=2; Cv[2*LDC+2]=1; Cv[2*LDC+3]=-1; Cv[2*LDC+4]=4; Cv[2*LDC+5]=0;
	Cv[4*LDC]=2; Cv[4*LDC+1]=0; Cv[4*LDC+2]=0; Cv[4*LDC+3]=1; Cv[4*LDC+4]=1; Cv[4*LDC+5]=1;
	Cv[6*LDC]=1; Cv[6*LDC+1]=0; Cv[6*LDC+2]=2; Cv[6*LDC+3]=0; Cv[6*LDC+4]=0; Cv[6*LDC+5]=3;
	Cv[8*LDC]=0; Cv[8*LDC+1]=1; Cv[8*LDC+2]=1; Cv[8*LDC+3]=1; Cv[8*LDC+4]=2; Cv[8*LDC+5]=0;
	const WORK = new Complex128Array( 200 );
	const info = zunmlq('right', 'conjugate-transpose', 3, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

// BLOCKED PATH TESTS (K > NB=32) //

/**
* Generate a deterministic K-by-M complex matrix for LQ factorization using a simple LCG.
* Returns a Complex128Array of size LDA*M (column-major).
*/
function deterministicMatrix( rows, cols, LDA, seed ) {
	const A = new Complex128Array( LDA * cols );
	const Av = reinterpret( A, 0 );
	let x = seed || 12345;
	let i, j, idx;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			idx = 2 * ( i + j * LDA );
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			Av[ idx ] = ( ( x % 2000 ) - 1000 ) / 500.0;
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			Av[ idx + 1 ] = ( ( x % 2000 ) - 1000 ) / 500.0;
		}
	}
	return A;
}

/**
* Compute LQ factorization of a K-by-Ncols matrix (K > 32 to trigger blocked path).
* For side = 'left', nq = M (rows of C), and the reflectors have length nq.
* So we factor a K-by-nq matrix where nq = M.
*/
function lqLarge( K, Ncols ) {
	const LDA = K;
	const A = deterministicMatrix( K, Ncols, LDA, 67890 );
	const TAU = new Complex128Array( K );
	const WORK = new Complex128Array( K );
	zgelq2( K, Ncols, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU, LDA: LDA };
}

/**
* Create N-by-N identity as Complex128Array in column-major with LDC=N.
*/
function eyeComplex( N ) {
	const C = new Complex128Array( N * N );
	const Cv = reinterpret( C, 0 );
	let i;
	for ( i = 0; i < N; i++ ) {
		Cv[ 2 * ( i + i * N ) ] = 1.0;
	}
	return C;
}

/**
* Check that a matrix is approximately equal to the identity.
* C is N-by-N in column-major with LDC.
*/
function assertApproxIdentity( C, N, LDC, tol, msg ) {
	const Cv = reinterpret( C, 0 );
	let expected, actual_re, actual_im, idx, i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = 2 * ( i + j * LDC );
			actual_re = Cv[ idx ];
			actual_im = Cv[ idx + 1 ];
			expected = ( i === j ) ? 1.0 : 0.0;
			assert.ok(
				Math.abs( actual_re - expected ) < tol,
				msg + ': real(' + i + ',' + j + ') expected ' + expected + ', got ' + actual_re
			);
			assert.ok(
				Math.abs( actual_im ) < tol,
				msg + ': imag(' + i + ',' + j + ') expected 0, got ' + actual_im
			);
		}
	}
}

test( 'zunmlq: blocked path, left, no transpose (K=35, forward iteration)', function t() {
	// K=35 > NB=32, so the blocked path is taken.
	// For zunmlq: left+notran => forward iteration (i3>0).
	// LQ factorization of K-by-Ncols: K=35 reflectors, each of length Ncols.
	// side = 'left' => nq = M (rows of C), and reflectors have length nq.
	// So Ncols = M = nq = 40.
	const K = 35;
	const M = 40;
	const N = M;
	const LDC = M;
	const lq = lqLarge( K, M );
	const WORK = new Complex128Array( N * 64 );

	// Step 1: C = I, apply Q from the left (trans = 'no-transpose') => C = Q*I = Q
	const C = eyeComplex( M );
	let info = zunmlq('left', 'no-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q*I' );

	// Step 2: Apply Q^H from the left to Q => C = Q^H * Q = I
	info = zunmlq('left', 'conjugate-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q^H*Q' );

	// Verify Q^H * Q = I
	assertApproxIdentity( C, M, LDC, 1e-10, 'Q^H*Q=I (blocked, forward)' );
});

test( 'zunmlq: blocked path, left, conjugate transpose (K=35, backward iteration)', function t() {
	// K=35 > NB=32, so the blocked path is taken.
	// For zunmlq: left+!notran => backward iteration (i3<0).
	const K = 35;
	const M = 40;
	const N = M;
	const LDC = M;
	const lq = lqLarge( K, M );
	const WORK = new Complex128Array( N * 64 );

	// Step 1: C = I, apply Q^H from the left (trans = 'conjugate-transpose') => C = Q^H
	const C = eyeComplex( M );
	let info = zunmlq('left', 'conjugate-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q^H*I' );

	// Step 2: Apply Q from the left to Q^H => C = Q * Q^H = I
	info = zunmlq('left', 'no-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q*Q^H' );

	// Verify Q * Q^H = I
	assertApproxIdentity( C, M, LDC, 1e-10, 'Q*Q^H=I (blocked, backward)' );
});

test( 'zunmlq: blocked path, right, no transpose (K=35, covers side=R blocked)', function t() {
	// K=35 > NB=32, blocked path. side = 'right' => nq=N, nw=M.
	// Covers lines 144-146 (ni/jc set for side=R) and 170-172 (zlarfb from right).
	// For zunmlq: right+notran => backward iteration (i3<0).
	// LQ factorization: K-by-N matrix, reflectors have length N.
	const N = 40;
	const K = 35;
	const M = N;
	const LDC = M;
	const lq = lqLarge( K, N );
	const WORK = new Complex128Array( M * 64 );

	// Step 1: C = I, apply Q from right (I*Q)
	const C = eyeComplex( M );
	let info = zunmlq('right', 'no-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after I*Q' );

	// Step 2: Apply Q^H from right => C*Q^H = I*Q*Q^H = I
	info = zunmlq('right', 'conjugate-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*Q^H' );

	assertApproxIdentity( C, M, LDC, 1e-10, 'I*Q*Q^H=I (blocked, right)' );
});

test( 'zunmlq: blocked path, right, conjugate transpose (K=35, covers side=R blocked forward)', function t() {
	// K=35 > NB=32, blocked path. side = 'right', trans = 'conjugate-transpose'.
	// For zunmlq: right+!notran => forward iteration (i3>0).
	const N = 40;
	const K = 35;
	const M = N;
	const LDC = M;
	const lq = lqLarge( K, N );
	const WORK = new Complex128Array( M * 64 );

	// Step 1: C = I, apply Q^H from right (I*Q^H)
	const C = eyeComplex( M );
	let info = zunmlq('right', 'conjugate-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after I*Q^H' );

	// Step 2: Apply Q from right => C*Q = I*Q^H*Q = I
	info = zunmlq('right', 'no-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*Q' );

	assertApproxIdentity( C, M, LDC, 1e-10, 'I*Q^H*Q=I (blocked, right, forward)' );
});

