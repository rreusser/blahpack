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

function extractRaw( C, count ) {
	var Cv = reinterpret( C, 0 );
	var result = [];
	var i;
	for ( i = 0; i < count; i++ ) {
		result.push( Cv[ i ] );
	}
	return result;
}

function lq3x5() {
	var LDA = 6;
	var A = new Complex128Array( LDA * 6 );
	var Av = reinterpret( A, 0 );
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
	var TAU = new Complex128Array( 6 );
	var WORK = new Complex128Array( 20 );
	zgelq2( 3, 5, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU, LDA: LDA };
}

function eye5in6() {
	var LDC = 6;
	var C = new Complex128Array( LDC * 6 );
	var Cv = reinterpret( C, 0 );
	var i;
	for ( i = 0; i < 5; i++ ) {
		Cv[ 2 * ( i + i * LDC ) ] = 1.0;
	}
	return C;
}

// TESTS //

test( 'zunmlq: left, no transpose (Q*I)', function t() {
	var tc = left_notrans_5x5;
	var lq = lq3x5();
	var LDC = 6;
	var C = eye5in6();
	var WORK = new Complex128Array( 200 );
	var info = zunmlq('left', 'no-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmlq: left, conjugate transpose (Q^H*I)', function t() {
	var tc = left_conjtrans_5x5;
	var lq = lq3x5();
	var LDC = 6;
	var C = eye5in6();
	var WORK = new Complex128Array( 200 );
	var info = zunmlq('left', 'conjugate-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmlq: right, no transpose (I*Q)', function t() {
	var tc = right_notrans_5x5;
	var lq = lq3x5();
	var LDC = 6;
	var C = eye5in6();
	var WORK = new Complex128Array( 200 );
	var info = zunmlq('right', 'no-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmlq: M=0 quick return', function t() {
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var info = zunmlq('left', 'no-transpose', 0, 5, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunmlq: N=0 quick return', function t() {
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var info = zunmlq('left', 'no-transpose', 5, 0, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunmlq: K=0 quick return', function t() {
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var info = zunmlq('left', 'no-transpose', 5, 5, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunmlq: right, conjugate transpose on rectangular C', function t() {
	var tc = right_conjtrans_rect;
	var lq = lq3x5();
	var LDC = 6;
	var C = new Complex128Array( LDC * 6 );
	var Cv = reinterpret( C, 0 );
	Cv[0]=1; Cv[1]=1; Cv[2]=3; Cv[3]=0; Cv[4]=-1; Cv[5]=1;
	Cv[2*LDC]=0; Cv[2*LDC+1]=2; Cv[2*LDC+2]=1; Cv[2*LDC+3]=-1; Cv[2*LDC+4]=4; Cv[2*LDC+5]=0;
	Cv[4*LDC]=2; Cv[4*LDC+1]=0; Cv[4*LDC+2]=0; Cv[4*LDC+3]=1; Cv[4*LDC+4]=1; Cv[4*LDC+5]=1;
	Cv[6*LDC]=1; Cv[6*LDC+1]=0; Cv[6*LDC+2]=2; Cv[6*LDC+3]=0; Cv[6*LDC+4]=0; Cv[6*LDC+5]=3;
	Cv[8*LDC]=0; Cv[8*LDC+1]=1; Cv[8*LDC+2]=1; Cv[8*LDC+3]=1; Cv[8*LDC+4]=2; Cv[8*LDC+5]=0;
	var WORK = new Complex128Array( 200 );
	var info = zunmlq('right', 'conjugate-transpose', 3, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

// BLOCKED PATH TESTS (K > NB=32) //

/**
* Generate a deterministic K-by-M complex matrix for LQ factorization using a simple LCG.
* Returns a Complex128Array of size LDA*M (column-major).
*/
function deterministicMatrix( rows, cols, LDA, seed ) {
	var A = new Complex128Array( LDA * cols );
	var Av = reinterpret( A, 0 );
	var x = seed || 12345;
	var i;
	var j;
	var idx;
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
	var LDA = K;
	var A = deterministicMatrix( K, Ncols, LDA, 67890 );
	var TAU = new Complex128Array( K );
	var WORK = new Complex128Array( K );
	zgelq2( K, Ncols, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU, LDA: LDA };
}

/**
* Create N-by-N identity as Complex128Array in column-major with LDC=N.
*/
function eyeComplex( N ) {
	var C = new Complex128Array( N * N );
	var Cv = reinterpret( C, 0 );
	var i;
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
	var Cv = reinterpret( C, 0 );
	var expected;
	var actual_re;
	var actual_im;
	var idx;
	var i;
	var j;
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
	var K = 35;
	var M = 40;
	var N = M;
	var LDC = M;
	var lq = lqLarge( K, M );
	var WORK = new Complex128Array( N * 64 );

	// Step 1: C = I, apply Q from the left (trans = 'no-transpose') => C = Q*I = Q
	var C = eyeComplex( M );
	var info = zunmlq('left', 'no-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
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
	var K = 35;
	var M = 40;
	var N = M;
	var LDC = M;
	var lq = lqLarge( K, M );
	var WORK = new Complex128Array( N * 64 );

	// Step 1: C = I, apply Q^H from the left (trans = 'conjugate-transpose') => C = Q^H
	var C = eyeComplex( M );
	var info = zunmlq('left', 'conjugate-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
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
	var N = 40;
	var K = 35;
	var M = N;
	var LDC = M;
	var lq = lqLarge( K, N );
	var WORK = new Complex128Array( M * 64 );

	// Step 1: C = I, apply Q from right (I*Q)
	var C = eyeComplex( M );
	var info = zunmlq('right', 'no-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after I*Q' );

	// Step 2: Apply Q^H from right => C*Q^H = I*Q*Q^H = I
	info = zunmlq('right', 'conjugate-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*Q^H' );

	assertApproxIdentity( C, M, LDC, 1e-10, 'I*Q*Q^H=I (blocked, right)' );
});

test( 'zunmlq: blocked path, right, conjugate transpose (K=35, covers side=R blocked forward)', function t() {
	// K=35 > NB=32, blocked path. side = 'right', trans = 'conjugate-transpose'.
	// For zunmlq: right+!notran => forward iteration (i3>0).
	var N = 40;
	var K = 35;
	var M = N;
	var LDC = M;
	var lq = lqLarge( K, N );
	var WORK = new Complex128Array( M * 64 );

	// Step 1: C = I, apply Q^H from right (I*Q^H)
	var C = eyeComplex( M );
	var info = zunmlq('right', 'conjugate-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after I*Q^H' );

	// Step 2: Apply Q from right => C*Q = I*Q^H*Q = I
	info = zunmlq('right', 'no-transpose', M, N, K, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*Q' );

	assertApproxIdentity( C, M, LDC, 1e-10, 'I*Q^H*Q=I (blocked, right, forward)' );
});

