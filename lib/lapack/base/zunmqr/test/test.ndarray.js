// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqr2 from '../../zgeqr2/lib/base.js';
import zunmqr from './../lib/ndarray.js';

// FIXTURES //

import left_notrans_4x4 from './fixtures/left_notrans_4x4.json' with { type: 'json' };
import left_conjtrans_4x4 from './fixtures/left_conjtrans_4x4.json' with { type: 'json' };
import right_notrans_4x4 from './fixtures/right_notrans_4x4.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };

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
* Compute QR of the 4x3 test matrix in a 6x6 container (LDA=6).
*/
function qr4x3() {
	var LDA = 6;
	var A = new Complex128Array( LDA * 6 );
	var Av = reinterpret( A, 0 );
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=1; Av[4]=0; Av[5]=0; Av[6]=1; Av[7]=1;
	Av[2*LDA]=0; Av[2*LDA+1]=2; Av[2*LDA+2]=1; Av[2*LDA+3]=0; Av[2*LDA+4]=3; Av[2*LDA+5]=1; Av[2*LDA+6]=2; Av[2*LDA+7]=0;
	Av[4*LDA]=3; Av[4*LDA+1]=1; Av[4*LDA+2]=0; Av[4*LDA+3]=0; Av[4*LDA+4]=1; Av[4*LDA+5]=0; Av[4*LDA+6]=2; Av[4*LDA+7]=1;
	var TAU = new Complex128Array( 3 );
	var WORK = new Complex128Array( 20 );
	zgeqr2( 4, 3, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	return {
		'A': A,
		'TAU': TAU,
		'LDA': LDA
	};
}

/**
* Create 4x4 identity in a 6x6 container (LDC=6, complex).
*/
function eye4in6() {
	var LDC = 6;
	var C = new Complex128Array( LDC * 6 );
	var Cv = reinterpret( C, 0 );
	Cv[ 2 * ( 0 + 0 * LDC ) ] = 1.0;
	Cv[ 2 * ( 1 + 1 * LDC ) ] = 1.0;
	Cv[ 2 * ( 2 + 2 * LDC ) ] = 1.0;
	Cv[ 2 * ( 3 + 3 * LDC ) ] = 1.0;
	return C;
}

// TESTS //

test( 'zunmqr: left, no transpose (Q*I)', function t() {
	var tc = left_notrans_4x4;
	var qr = qr4x3();
	var LDC = 6;
	var C = eye4in6();
	var WORK = new Complex128Array( 200 );
	var info = zunmqr('left', 'no-transpose', 4, 4, 3, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	var Cv = reinterpret( C, 0 );
	assertArrayClose( Array.from( Cv.subarray( 0, tc.c.length ) ), tc.c, 1e-10, 'c' );
});

test( 'zunmqr: left, conjugate transpose (Q^H*I)', function t() {
	var tc = left_conjtrans_4x4;
	var qr = qr4x3();
	var LDC = 6;
	var C = eye4in6();
	var WORK = new Complex128Array( 200 );
	var info = zunmqr('left', 'conjugate-transpose', 4, 4, 3, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	var Cv = reinterpret( C, 0 );
	assertArrayClose( Array.from( Cv.subarray( 0, tc.c.length ) ), tc.c, 1e-10, 'c' );
});

test( 'zunmqr: right, no transpose (I*Q)', function t() {
	var tc = right_notrans_4x4;
	var qr = qr4x3();
	var LDC = 6;
	var C = eye4in6();
	var WORK = new Complex128Array( 200 );
	var info = zunmqr('right', 'no-transpose', 4, 4, 3, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	var Cv = reinterpret( C, 0 );
	assertArrayClose( Array.from( Cv.subarray( 0, tc.c.length ) ), tc.c, 1e-10, 'c' );
});

test( 'zunmqr: M=0 quick return', function t() {
	var tc = m_zero;
	var A = new Complex128Array( 5 );
	var TAU = new Complex128Array( 2 );
	var C = new Complex128Array( 5 );
	var WORK = new Complex128Array( 20 );
	var info = zunmqr('left', 'no-transpose', 0, 4, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zunmqr: N=0 quick return', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 5 );
	var TAU = new Complex128Array( 2 );
	var C = new Complex128Array( 5 );
	var WORK = new Complex128Array( 20 );
	var info = zunmqr('left', 'no-transpose', 4, 0, 0, A, 1, 4, 0, TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zunmqr: K=0 quick return', function t() {
	var tc = k_zero;
	var A = new Complex128Array( 5 );
	var TAU = new Complex128Array( 2 );
	var C = new Complex128Array( 5 );
	var WORK = new Complex128Array( 20 );
	var info = zunmqr('left', 'no-transpose', 4, 4, 0, A, 1, 4, 0, TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zunmqr: left, no transpose, rectangular C (4x2)', function t() {
	var tc = left_notrans_rect;
	var qr = qr4x3();
	var LDC = 6;
	var C = new Complex128Array( LDC * 6 );
	var Cv = reinterpret( C, 0 );

	// C = [1+1i 0+2i; 3+0i 1-1i; -1+1i 4+0i; 2+0i 0+3i]
	Cv[0]=1; Cv[1]=1; Cv[2]=3; Cv[3]=0; Cv[4]=-1; Cv[5]=1; Cv[6]=2; Cv[7]=0;
	Cv[2*LDC]=0; Cv[2*LDC+1]=2; Cv[2*LDC+2]=1; Cv[2*LDC+3]=-1; Cv[2*LDC+4]=4; Cv[2*LDC+5]=0; Cv[2*LDC+6]=0; Cv[2*LDC+7]=3;

	var WORK = new Complex128Array( 200 );
	var info = zunmqr('left', 'no-transpose', 4, 2, 3, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( Array.from( Cv.subarray( 0, tc.c.length ) ), tc.c, 1e-10, 'c' );
});

// BLOCKED PATH TESTS (K > NB=32) //

/**
* Generate a deterministic M-by-N complex matrix using a simple LCG.
* Returns a Complex128Array of size LDA*N (column-major) with the
* M-by-N data filled in.
*/
function deterministicMatrix( M, N, LDA, seed ) {
	var A = new Complex128Array( LDA * N );
	var Av = reinterpret( A, 0 );
	var x = seed || 12345;
	var i;
	var j;
	var idx;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
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
* Compute QR factorization of an M-by-K matrix (K > 32 to trigger blocked path).
*/
function qrLarge( M, K ) {
	var LDA = M;
	var A = deterministicMatrix( M, K, LDA, 54321 );
	var TAU = new Complex128Array( K );
	var WORK = new Complex128Array( K );
	zgeqr2( M, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	return {
		'A': A,
		'TAU': TAU,
		'LDA': LDA
	};
}

/**
* Create M-by-M identity as Complex128Array in column-major with LDC=M.
*/
function eyeComplex( M ) {
	var C = new Complex128Array( M * M );
	var Cv = reinterpret( C, 0 );
	var i;
	for ( i = 0; i < M; i++ ) {
		Cv[ 2 * ( i + i * M ) ] = 1.0;
	}
	return C;
}

/**
* Check that a matrix is approximately equal to the identity.
* C is M-by-M in column-major with LDC.
*/
function assertApproxIdentity( C, M, LDC, tol, msg ) {
	var Cv = reinterpret( C, 0 );
	var expected;
	var actual_re;
	var actual_im;
	var idx;
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx = 2 * ( i + j * LDC );
			actual_re = Cv[ idx ];
			actual_im = Cv[ idx + 1 ];
			expected = ( i === j ) ? 1.0 : 0.0;
			assert.ok(Math.abs( actual_re - expected ) < tol, msg + ': real(' + i + ',' + j + ') expected ' + expected + ', got ' + actual_re);
			assert.ok(Math.abs( actual_im ) < tol, msg + ': imag(' + i + ',' + j + ') expected 0, got ' + actual_im);
		}
	}
}

test( 'zunmqr: blocked path, left, no transpose (K=35, forward iteration)', function t() {
	// K=35 > NB=32, so the blocked path is taken.
	// Verify: apply Q to I, then apply Q^H to the result => should get I back.
	var M = 40;
	var K = 35;
	var N = M;
	var LDC = M;
	var qr = qrLarge( M, K );
	var WORK = new Complex128Array( N * 64 );

	// Step 1: C = I, apply Q from the left (trans = 'no-transpose') => C = Q*I = Q
	var C = eyeComplex( M );
	var info = zunmqr('left', 'no-transpose', M, N, K, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q*I' );

	// Step 2: Apply Q^H from the left to Q => C = Q^H * Q = I
	info = zunmqr('left', 'conjugate-transpose', M, N, K, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q^H*Q' );

	// Verify Q^H * Q = I
	assertApproxIdentity( C, M, LDC, 1e-10, 'Q^H*Q=I (blocked, forward)' );
});

test( 'zunmqr: blocked path, left, conjugate transpose (K=35, backward iteration)', function t() {
	// K=35 > NB=32, so the blocked path is taken.
	// For zunmqr: left+trans = 'conjugate-transpose' uses forward iteration (i3>0),
	// left+trans = 'no-transpose' uses backward iteration (i3<0).
	// Verify: apply Q^H to I, then apply Q to the result => should get I back.
	var M = 40;
	var K = 35;
	var N = M;
	var LDC = M;
	var qr = qrLarge( M, K );
	var WORK = new Complex128Array( N * 64 );

	// Step 1: C = I, apply Q^H from the left (trans = 'conjugate-transpose') => C = Q^H
	var C = eyeComplex( M );
	var info = zunmqr('left', 'conjugate-transpose', M, N, K, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q^H*I' );

	// Step 2: Apply Q from the left to Q^H => C = Q * Q^H = I
	info = zunmqr('left', 'no-transpose', M, N, K, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q*Q^H' );

	// Verify Q * Q^H = I
	assertApproxIdentity( C, M, LDC, 1e-10, 'Q*Q^H=I (blocked, backward)' );
});

test( 'zunmqr: blocked path, right, no transpose (K=35, covers side=R blocked)', function t() {
	// K=35 > NB=32, blocked path. side = 'right' => nq=N, nw=M.
	// Covers lines 139-141 (ni/jc set for side=R) and 159-161 (zlarfb from right).
	// right+notran => forward iteration.
	// Verify: apply Q from right to I, then apply Q^H from right => I*Q*Q^H = I.
	var N = 40;
	var K = 35;
	var M = N;
	var LDC = M;
	var qr = qrLarge( N, K );
	var WORK = new Complex128Array( M * 64 );

	// Step 1: C = I, apply Q from right (I*Q)
	var C = eyeComplex( M );
	var info = zunmqr('right', 'no-transpose', M, N, K, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after I*Q' );

	// Step 2: Apply Q^H from right => C*Q^H = I*Q*Q^H = I
	info = zunmqr('right', 'conjugate-transpose', M, N, K, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*Q^H' );

	assertApproxIdentity( C, M, LDC, 1e-10, 'I*Q*Q^H=I (blocked, right)' );
});

test( 'zunmqr: blocked path, right, conjugate transpose (K=35, covers side=R blocked backward)', function t() {
	// K=35 > NB=32, blocked path. side = 'right', trans = 'conjugate-transpose' => backward iteration.
	// Verify: apply Q^H from right, then Q from right => I*Q^H*Q = I.
	var N = 40;
	var K = 35;
	var M = N;
	var LDC = M;
	var qr = qrLarge( N, K );
	var WORK = new Complex128Array( M * 64 );

	// Step 1: C = I, apply Q^H from right (I*Q^H)
	var C = eyeComplex( M );
	var info = zunmqr('right', 'conjugate-transpose', M, N, K, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after I*Q^H' );

	// Step 2: Apply Q from right => C*Q = I*Q^H*Q = I
	info = zunmqr('right', 'no-transpose', M, N, K, qr.A, 1, qr.LDA, 0, qr.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*Q' );

	assertApproxIdentity( C, M, LDC, 1e-10, 'I*Q^H*Q=I (blocked, right, backward)' );
});
