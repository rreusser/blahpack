// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebrd from '../../zgebrd/lib/base.js';
import zungbr from './../lib/ndarray.js';

// FIXTURES //

import vect_q_m_ge_k from './fixtures/vect_q_m_ge_k.json' with { type: 'json' };
import vect_p_k_lt_n from './fixtures/vect_p_k_lt_n.json' with { type: 'json' };
import vect_q_m_lt_k from './fixtures/vect_q_m_lt_k.json' with { type: 'json' };
import vect_p_k_ge_n from './fixtures/vect_p_k_ge_n.json' with { type: 'json' };

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

/**
* Set up 4x3 matrix for bidiagonal reduction.
*/
function setup4x3() {
	const LDA = 6;
	const A = new Complex128Array( LDA * 6 );
	const Av = reinterpret( A, 0 );
	// Column 0
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=1; Av[4]=0; Av[5]=-1; Av[6]=1; Av[7]=1;
	// Column 1
	Av[2*LDA]=0; Av[2*LDA+1]=2; Av[2*LDA+2]=1; Av[2*LDA+3]=0; Av[2*LDA+4]=3; Av[2*LDA+5]=1; Av[2*LDA+6]=2; Av[2*LDA+7]=0;
	// Column 2
	Av[4*LDA]=3; Av[4*LDA+1]=1; Av[4*LDA+2]=0; Av[4*LDA+3]=0; Av[4*LDA+4]=1; Av[4*LDA+5]=0; Av[4*LDA+6]=2; Av[4*LDA+7]=1;

	const TAUQ = new Complex128Array( 6 );
	const TAUP = new Complex128Array( 6 );
	const D = new Float64Array( 6 );
	const E = new Float64Array( 6 );
	const WORK = new Complex128Array( 200 );
	zgebrd( 4, 3, A, 1, LDA, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 200 );
	return { A: A, TAUQ: TAUQ, TAUP: TAUP, LDA: LDA };
}

/**
* Set up 3x5 matrix for bidiagonal reduction.
*/
function setup3x5() {
	const LDA = 6;
	const A = new Complex128Array( LDA * 6 );
	const Av = reinterpret( A, 0 );
	// Row 0
	Av[0]=1; Av[1]=0;
	Av[2*LDA]=2; Av[2*LDA+1]=1;
	Av[4*LDA]=0; Av[4*LDA+1]=0;
	Av[6*LDA]=1; Av[6*LDA+1]=1;
	Av[8*LDA]=3; Av[8*LDA+1]=0;
	// Row 1
	Av[2]=0; Av[3]=2;
	Av[2*LDA+2]=1; Av[2*LDA+3]=0;
	Av[4*LDA+2]=3; Av[4*LDA+3]=1;
	Av[6*LDA+2]=2; Av[6*LDA+3]=0;
	Av[8*LDA+2]=1; Av[8*LDA+3]=1;
	// Row 2
	Av[4]=3; Av[5]=1;
	Av[2*LDA+4]=0; Av[2*LDA+5]=0;
	Av[4*LDA+4]=1; Av[4*LDA+5]=0;
	Av[6*LDA+4]=2; Av[6*LDA+5]=1;
	Av[8*LDA+4]=0; Av[8*LDA+5]=2;

	const TAUQ = new Complex128Array( 6 );
	const TAUP = new Complex128Array( 6 );
	const D = new Float64Array( 6 );
	const E = new Float64Array( 6 );
	const WORK = new Complex128Array( 200 );
	zgebrd( 3, 5, A, 1, LDA, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 200 );
	return { A: A, TAUQ: TAUQ, TAUP: TAUP, LDA: LDA };
}

/**
* Set up 3x4 matrix for bidiagonal reduction (M < K case).
*/
function setup3x4() {
	const LDA = 6;
	const A = new Complex128Array( LDA * 6 );
	const Av = reinterpret( A, 0 );
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=1; Av[4]=0; Av[5]=-1;
	Av[2*LDA]=0; Av[2*LDA+1]=2; Av[2*LDA+2]=1; Av[2*LDA+3]=0; Av[2*LDA+4]=3; Av[2*LDA+5]=1;
	Av[4*LDA]=3; Av[4*LDA+1]=1; Av[4*LDA+2]=0; Av[4*LDA+3]=0; Av[4*LDA+4]=1; Av[4*LDA+5]=0;
	Av[6*LDA]=1; Av[6*LDA+1]=1; Av[6*LDA+2]=2; Av[6*LDA+3]=0; Av[6*LDA+4]=2; Av[6*LDA+5]=1;

	const TAUQ = new Complex128Array( 6 );
	const TAUP = new Complex128Array( 6 );
	const D = new Float64Array( 6 );
	const E = new Float64Array( 6 );
	const WORK = new Complex128Array( 200 );
	zgebrd( 3, 4, A, 1, LDA, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 200 );
	return { A: A, TAUQ: TAUQ, TAUP: TAUP, LDA: LDA };
}

// TESTS //

test( 'zungbr: VECT=Q, M >= K (4x3 bidiagonal)', function t() {
	const tc = vect_q_m_ge_k;
	const bd = setup4x3();
	const WORK = new Complex128Array( 200 );
	const info = zungbr('apply-Q', 4, 3, 3, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( bd.A, tc.a.length ), tc.a, 1e-12, 'a' );
});

test( 'zungbr: VECT=P, K < N (3x5 bidiagonal)', function t() {
	const tc = vect_p_k_lt_n;
	const bd = setup3x5();
	const WORK = new Complex128Array( 200 );
	const info = zungbr('apply-P', 3, 5, 3, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( bd.A, tc.a.length ), tc.a, 1e-12, 'a' );
});

test( 'zungbr: VECT=Q, M < K (3x4 bidiagonal, Q is 3x3)', function t() {
	const tc = vect_q_m_lt_k;
	const bd = setup3x4();
	const WORK = new Complex128Array( 200 );
	const info = zungbr('apply-Q', 3, 3, 4, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( bd.A, tc.a.length ), tc.a, 1e-12, 'a' );
});

test( 'zungbr: VECT=P, K >= N (4x3 bidiagonal, P^H is 3x3)', function t() {
	const tc = vect_p_k_ge_n;
	const bd = setup4x3();
	const WORK = new Complex128Array( 200 );
	const info = zungbr('apply-P', 3, 3, 4, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( bd.A, tc.a.length ), tc.a, 1e-12, 'a' );
});

test( 'zungbr: M=0, N=0 quick return', function t() {
	const A = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const info = zungbr('apply-Q', 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

/**
* Reduces a deterministic pseudo-random M-by-N matrix to bidiagonal form (column-major, LDA = M).
*/
function setupLarge( M, N ) {
	const A = new Complex128Array( M * N );
	const Av = reinterpret( A, 0 );
	const mn = Math.min( M, N );
	let s = 3;
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		s = ( ( s * 69069 ) + 1 ) % 4294967296;
		Av[ i ] = ( 2.0 * ( s / 4294967296 ) ) - 1.0;
	}
	const TAUQ = new Complex128Array( mn );
	const TAUP = new Complex128Array( mn );
	const D = new Float64Array( mn );
	const E = new Float64Array( mn );
	const WORK = new Complex128Array( ( M + N ) * 64 );
	zgebrd( M, N, A, 1, M, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );
	return { A: A, TAUQ: TAUQ, TAUP: TAUP };
}

/**
* Returns max |(Q^H Q - I)(i,j)| for the leading n-by-n block of a column-major complex matrix.
*/
function unitaryError( A, n, lda ) {
	const Av = reinterpret( A, 0 );
	let err = 0.0;
	let re;
	let im;
	let i;
	let j;
	let k;
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			re = ( i === j ) ? -1.0 : 0.0;
			im = 0.0;
			for ( k = 0; k < n; k++ ) {
				const a = 2 * ( k + ( i * lda ) );
				const b = 2 * ( k + ( j * lda ) );
				re += ( Av[ a ] * Av[ b ] ) + ( Av[ a + 1 ] * Av[ b + 1 ] );
				im += ( Av[ a ] * Av[ b + 1 ] ) - ( Av[ a + 1 ] * Av[ b ] );
			}
			err = Math.max( err, Math.abs( re ), Math.abs( im ) );
		}
	}
	return err;
}

function maxDiff( A, B ) {
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	let err = 0.0;
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		err = Math.max( err, Math.abs( Av[ i ] - Bv[ i ] ) );
	}
	return err;
}

test( 'zungbr: VECT=Q, M < K, M-1 > NB accepts the reference minimum min(M,N) and matches an optimal-WORK run (ticket 0100)', function t() {
	let bd = setupLarge( 34, 40 );
	assert.throws( function throws() {
		zungbr( 'apply-Q', 34, 34, 40, bd.A, 1, 34, 0, bd.TAUQ, 1, 0, new Complex128Array( 33 ), 1, 0 );
	}, RangeError );
	bd = setupLarge( 34, 40 );
	const ref = setupLarge( 34, 40 );
	let info = zungbr( 'apply-Q', 34, 34, 40, bd.A, 1, 34, 0, bd.TAUQ, 1, 0, new Complex128Array( 34 ), 1, 0 );
	assert.equal( info, 0 );
	assert.ok( unitaryError( bd.A, 34, 34 ) < 1e-13, 'Q^H Q = I' );
	info = zungbr( 'apply-Q', 34, 34, 40, ref.A, 1, 34, 0, ref.TAUQ, 1, 0, new Complex128Array( 33 * 32 ), 1, 0 );
	assert.equal( info, 0 );
	assert.ok( maxDiff( bd.A, ref.A ) < 1e-13, 'minimum-WORK Q matches optimal-WORK Q' );
});

test( 'zungbr: VECT=P, K >= N, N-1 > NB accepts the reference minimum min(M,N) and matches an optimal-WORK run (ticket 0100)', function t() {
	let bd = setupLarge( 40, 34 );
	assert.throws( function throws() {
		zungbr( 'apply-P', 34, 34, 40, bd.A, 1, 40, 0, bd.TAUP, 1, 0, new Complex128Array( 33 ), 1, 0 );
	}, RangeError );
	bd = setupLarge( 40, 34 );
	const ref = setupLarge( 40, 34 );
	let info = zungbr( 'apply-P', 34, 34, 40, bd.A, 1, 40, 0, bd.TAUP, 1, 0, new Complex128Array( 34 ), 1, 0 );
	assert.equal( info, 0 );
	assert.ok( unitaryError( bd.A, 34, 40 ) < 1e-13, 'P P^H = I' );
	info = zungbr( 'apply-P', 34, 34, 40, ref.A, 1, 40, 0, ref.TAUP, 1, 0, new Complex128Array( 33 * 32 ), 1, 0 );
	assert.equal( info, 0 );
	assert.ok( maxDiff( bd.A, ref.A ) < 1e-13, 'minimum-WORK P^H matches optimal-WORK P^H' );
});

test( 'zungbr: M >= K and K < N past the blocking threshold accept the reference minimum min(M,N) (ticket 0100)', function t() {
	let bd = setupLarge( 48, 40 );
	let ref = setupLarge( 48, 40 );
	let info = zungbr( 'apply-Q', 48, 40, 40, bd.A, 1, 48, 0, bd.TAUQ, 1, 0, new Complex128Array( 40 ), 1, 0 );
	assert.equal( info, 0 );
	info = zungbr( 'apply-Q', 48, 40, 40, ref.A, 1, 48, 0, ref.TAUQ, 1, 0, new Complex128Array( 40 * 32 ), 1, 0 );
	assert.equal( info, 0 );
	assert.ok( maxDiff( bd.A, ref.A ) < 1e-13, 'apply-Q: minimum-WORK matches optimal-WORK' );
	bd = setupLarge( 40, 48 );
	ref = setupLarge( 40, 48 );
	info = zungbr( 'apply-P', 40, 48, 40, bd.A, 1, 40, 0, bd.TAUP, 1, 0, new Complex128Array( 40 ), 1, 0 );
	assert.equal( info, 0 );
	info = zungbr( 'apply-P', 40, 48, 40, ref.A, 1, 40, 0, ref.TAUP, 1, 0, new Complex128Array( 40 * 32 ), 1, 0 );
	assert.equal( info, 0 );
	assert.ok( maxDiff( bd.A, ref.A ) < 1e-13, 'apply-P: minimum-WORK matches optimal-WORK' );
	assert.throws( function throws() {
		zungbr( 'apply-P', 40, 48, 40, bd.A, 1, 40, 0, bd.TAUP, 1, 0, new Complex128Array( 39 ), 1, 0 );
	}, RangeError );
});
