/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zgelqt, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `lqt` (BLOCKED compact-WY LQ) ->
* reconstruction A = L*Q AND unitarity of Q.
*
* zgelqt computes, for a general complex M-by-N matrix A, the compact-WY LQ
* factorization A = L*Q (Q unitary). On exit the lower trapezoid of A holds the
* M-by-min(M,N) lower-trapezoidal L; the strict-UPPER part of ROW i holds the
* essential Householder ROW reflector v_i (cols i+1..N-1) with an implicit 1 at
* (i,i); and the SEPARATE mb-by-K array T (K = min(M,N)) holds the block reflector
* factors T1..TB side by side (T = (T1 T2 ... TB), each block upper triangular).
* Block b (global column g0) is written into T(0:ib, g0:g0+ib); its diagonal
* T(a,g0+a) = tau of the (g0+a)-th elementary reflector, so tau_j = T(j mod mb, j).
*
* TWO-LEVEL ORACLE:
*
*   1. PER-REFLECTOR (baseline, tau diagonal). Q = H(k-1)ᴴ...H(0)ᴴ applied from the
*      RIGHT with conj(tau)/conj(v) (the validated complex-LQ convention shared with
*      zgelq2/zgelqf). Validates the factorization and the T DIAGONAL (tau) only.
*
*   2. BLOCK-T (full compact-WY). A SECOND Q is built from the block reflectors
*      directly: for complex LQ the block form is the dual/conjugate-transpose of
*      dgeqrt's column form (I - V_b T_b V_bᴴ), namely
*
*          H_b = I - V_bᴴ · T_bᴴ · V_b     (applied on the RIGHT: C := C·H_b)
*
*      with V_b the ib unit-UPPER Householder ROWS of the block and T_bᴴ the
*      conjugate-transpose of the stored upper-triangular block. This reproduces the
*      per-reflector Q at ib=1 EXACTLY (algebraic identity: conj of the stored
*      diagonal tau), and for ib>1 it exercises the STRICT-UPPER T entries that
*      zlarfb consumes. We require A = L*Q_block, Q_block unitary, AND Q_block equal
*      to the per-reflector Q (backward-error tolerance).
*
* A = L*Q is an EXACT algebraic identity for ANY general M-by-N A, so plain random
* general A suffices; the (M,N) sweep spans squares plus wide (M<N) and tall (M>N)
* rectangles, and mb ranges over {1, 2, ~K/2, K}.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgelqt from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
const ALL_LAYOUTS = schemes.dense.layouts();

// (M,N) sweep: squares from SIZES_SMALL plus wide (M<N) and tall (M>N)
// rectangles straddling common block thresholds.
const PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 3, 5 ], [ 3, 8 ], [ 5, 8 ], [ 5, 16 ], [ 8, 17 ], [ 16, 33 ], [ 17, 64 ], [ 1, 8 ], [ 33, 64 ], [ 8, 3 ], [ 8, 5 ], [ 16, 5 ], [ 33, 16 ], [ 64, 17 ], [ 8, 1 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );


// HELPERS //

// Poisoned (NaN) array of `k` scalar values.
function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Generous WORK length: the wrapper guard needs mb*N, while the internal 2D
// scratch (leading dim = trailing rows) can touch up to ~(M-mb)*mb elements on a
// tall (M>N) matrix — mb*max(M,N) plus slack covers BOTH so a poisoned WORK never
// over-reads on a correct routine (and the minimum is probed separately below).
function workLen( M, N, mb ) {
	return ( mb * Math.max( M, N ) ) + ( mb * mb ) + 1;
}

// Allocate a POISONED dense (output-only) T buffer of `rows` x `cols` with the
// given physical layout. Nothing is pre-written, so a block-T slot the routine
// fails to write reads back NaN and trips assertFinite.
function allocT( rows, cols, layout ) {
	const A = schemes.denseAlloc( sc, rows, cols, layout );
	return {
		'data': A.data,
		'args': [ A.s1, A.s2, A.offset ],
		'read': function read( i, j ) {
			return sc.read( A.data, A.addr( i, j ) );
		}
	};
}

// blocks(K,mb) -> [ [g0, ib], ... ] the compact-WY block partition.
function blocks( K, mb ) {
	const out = [];
	let g0;
	for ( g0 = 0; g0 < K; g0 += mb ) {
		out.push( [ g0, Math.min( mb, K - g0 ) ] );
	}
	return out;
}

// tau of the j-th elementary reflector = T( j mod mb, j ) (block-diagonal).
function tausFromT( Tread, K, mb ) {
	const taus = [];
	let j;
	for ( j = 0; j < K; j++ ) {
		taus.push( Tread( j % mb, j ) );
	}
	return taus;
}

// Read the essential Householder row v_i (length N): 0 before col i, implicit 1
// on the diagonal, stored strict-upper entries A(i,i+1:N-1) after it.
function reflectorRow( Ard, i, N ) {
	const v = [];
	let j;
	for ( j = 0; j < N; j++ ) {
		if ( j < i ) {
			v.push( sc.zero );
		} else if ( j === i ) {
			v.push( sc.one );
		} else {
			v.push( Ard.read( i, j ) );
		}
	}
	return v;
}

// V (K x N): unit-upper-trapezoidal Householder ROWS from the factored A.
function readVrows( Ard, K, N ) {
	const V = new LogicalMatrix( sc, K, N );
	let i, j;
	for ( i = 0; i < K; i++ ) {
		for ( j = 0; j < N; j++ ) {
			V.set( i, j, ( j < i ) ? sc.zero : ( j === i ? sc.one : Ard.read( i, j ) ) );
		}
	}
	return V;
}

// Read the M-by-N lower-trapezoidal factor L (on/below diagonal; zero above).
function readL( Ard, M, N ) {
	const L = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( i >= j ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
function readFull( Ard, M, N ) {
	const F = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}


// PER-REFLECTOR ORACLE (baseline; validates factorization + tau diagonal) //

// Right-apply H(i)ᴴ: Mtx := Mtx - conj(tau) * (Mtx * conj(v)) * v, v a row vector
// of length Mtx.cols. Faithful to C*H(i)ᴴ = C - conj(tau)(C v) vᴴ; complex LQ has
// Q = H(k-1)ᴴ ... H(0)ᴴ (shared with zgelq2/zgelqf).
function applyHRight( Mtx, v, tau ) {
	const rows = Mtx.rows;
	const cols = Mtx.cols;
	const ctau = sc.conj( tau );
	let coef, dot, r, j;
	for ( r = 0; r < rows; r++ ) {
		dot = sc.zero;
		for ( j = 0; j < cols; j++ ) {
			dot = sc.add( dot, sc.mul( Mtx.get( r, j ), sc.conj( v[ j ] ) ) );
		}
		coef = sc.mul( ctau, dot );
		for ( j = 0; j < cols; j++ ) {
			Mtx.set( r, j, sc.sub( Mtx.get( r, j ), sc.mul( coef, v[ j ] ) ) );
		}
	}
}

// Arec = L * Q, right-applying H(k-1)...H(0) to L (i = k-1 downto 0).
function reconstructPR( Ard, taus, M, N, k ) {
	const L = readL( Ard, M, N );
	let i;
	for ( i = k - 1; i >= 0; i-- ) {
		applyHRight( L, reflectorRow( Ard, i, N ), taus[ i ] );
	}
	return L;
}

// Q = H(k-1)...H(0) (N x N unitary), right-applied to the identity.
function buildQPR( Ard, taus, N, k ) {
	const Q = new LogicalMatrix( sc, N, N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	for ( i = k - 1; i >= 0; i-- ) {
		applyHRight( Q, reflectorRow( Ard, i, N ), taus[ i ] );
	}
	return Q;
}


// BLOCK-T ORACLE (full compact-WY; validates strict-upper T) //

// X := X * Q in place, Q = H_{B-1} ... H_1 H_0 with H_b = I - V_bᴴ T_bᴴ V_b
// (right-applied). V_b = ROWS g0..g0+ib-1 of `Vr`; T_bᴴ(a,b) = conj( Tread(b,g0+a) )
// (conjugate-transpose of the stored upper-triangular block). Apply blocks
// last-to-first so H_0 is applied innermost (rightmost factor).
function applyQright( X, Vr, Tread, K, mb ) {
	const rows = X.rows;
	const N = X.cols;
	const bl = blocks( K, mb );
	let g0, ib, W, Y, s, bi, a, b, r, j;
	for ( bi = bl.length - 1; bi >= 0; bi-- ) {
		g0 = bl[ bi ][ 0 ];
		ib = bl[ bi ][ 1 ];
		for ( r = 0; r < rows; r++ ) {
			// W[a] = sum_j X[r][j] * conj( V(g0+a, j) )  (V rows unit-upper; support cols >= g0):
			W = new Array( ib );
			for ( a = 0; a < ib; a++ ) {
				s = sc.zero;
				for ( j = g0; j < N; j++ ) {
					s = sc.add( s, sc.mul( X.get( r, j ), sc.conj( Vr.get( g0 + a, j ) ) ) );
				}
				W[ a ] = s;
			}
			// Y[b] = sum_{a=b..ib-1} W[a] * conj( T(b, g0+a) )   ( = T_bᴴ, lower triangular ):
			Y = new Array( ib );
			for ( b = 0; b < ib; b++ ) {
				s = sc.zero;
				for ( a = b; a < ib; a++ ) {
					s = sc.add( s, sc.mul( W[ a ], sc.conj( Tread( b, g0 + a ) ) ) );
				}
				Y[ b ] = s;
			}
			// X[r][j] -= sum_b Y[b] * V(g0+b, j):
			for ( j = g0; j < N; j++ ) {
				s = X.get( r, j );
				for ( b = 0; b < ib; b++ ) {
					s = sc.sub( s, sc.mul( Y[ b ], Vr.get( g0 + b, j ) ) );
				}
				X.set( r, j, s );
			}
		}
	}
}

// Reconstruct A = L*Q from the block-T representation (M x N).
function reconstructBT( Ard, Tread, M, N, K, mb ) {
	const L = readL( Ard, M, N );
	applyQright( L, readVrows( Ard, K, N ), Tread, K, mb );
	return L;
}

// Q (N x N unitary) from the block-T representation.
function buildQBT( Ard, Tread, N, K, mb ) {
	const Q = new LogicalMatrix( sc, N, N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	applyQright( Q, readVrows( Ard, K, N ), Tread, K, mb );
	return Q;
}


// Flatten the meaningful (block upper-triangular) T entries in a fixed order for a
// layout-invariant bit-exact comparison (skips poisoned unused slots).
function flattenT( Tread, K, mb ) {
	const out = [];
	const bl = blocks( K, mb );
	let comp, bi, g0, ib, a, b, k;
	for ( bi = 0; bi < bl.length; bi++ ) {
		g0 = bl[ bi ][ 0 ];
		ib = bl[ bi ][ 1 ];
		for ( b = 0; b < ib; b++ ) {
			for ( a = 0; a <= b; a++ ) {
				comp = sc.components( Tread( a, g0 + b ) );
				for ( k = 0; k < comp.length; k++ ) {
					out.push( comp[ k ] );
				}
			}
		}
	}
	return out;
}

// mb sweep for a given K: {1, 2, ~K/2, K}.
function mbsFor( K ) {
	const set = {};
	[ 1, 2, Math.max( 1, Math.floor( K / 2 ) ), K ].forEach( function add( mb ) {
		if ( mb >= 1 && mb <= K ) {
			set[ mb ] = true;
		}
	} );
	return Object.keys( set ).map( Number );
}


// TESTS //

// Steps 2/3/5 (L2): reconstruction A = L*Q AND unitarity of Q, via BOTH the
// per-reflector (tau diagonal) and the block-T (full compact-WY) oracle, plus a
// direct Q_block == Q_perreflector cross-check, across the (M,N) sweep, mb sweep,
// and every dense storage layout (backward-error tolerance; bit-exactness deferred
// to the layout-invariance test).
test( 'zgelqt: A = L*Q and QᴴQ = I via per-reflector AND block-T ((M,N) x mb x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const K = Math.min( M, N );
		if ( K === 0 ) {
			return;
		}
		mbsFor( K ).forEach( function eachMb( mb ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				const rng = new RNG( 0x100 + ( M * 1000 ) + ( N * 10 ) + mb );
				const A0 = logical.general( sc, rng, M, N );
				const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
				const Tr = allocT( mb, K, layout );
				const Wr = schemes.realizeVector( sc, poison( workLen( M, N, mb ) ), TIGHT_VEC );

				zgelqt( M, N, mb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 1 ] );

				const label = 'zgelqt M=' + M + ' N=' + N + ' mb=' + mb + ' layout=' + li;
				const taus = tausFromT( Tr.read, K, mb );

				// Level 1: per-reflector reconstruction + unitarity (tau diagonal).
				const reconPR = reconstructPR( Ar, taus, M, N, K );
				checked( 'zgelqt', 'reconstruct', function run() {
					check.assertReconstruct( sc, reconPR, A0, { 'label': label + ' A=L*Q (per-reflector)', 'factor': 100 } );
				} );
				const Qpr = buildQPR( Ar, taus, N, K );
				checked( 'zgelqt', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Qpr, { 'label': label + ' Q (per-reflector)' } );
				} );

				// Level 2: block-T reconstruction + unitarity + cross-check (strict-upper T).
				const reconBT = reconstructBT( Ar, Tr.read, M, N, K, mb );
				checked( 'zgelqt', 'reconstruct-blockT', function run() {
					check.assertReconstruct( sc, reconBT, A0, { 'label': label + ' A=L*Q (block-T)', 'factor': 100 } );
				} );
				const Qbt = buildQBT( Ar, Tr.read, N, K, mb );
				checked( 'zgelqt', 'orthonormal-blockT', function run() {
					check.assertOrthonormal( sc, Qbt, { 'label': label + ' Q (block-T)' } );
				} );
				checked( 'zgelqt', 'blockT-matches-perreflector', function run() {
					check.assertReconstruct( sc, Qbt, Qpr, { 'label': label + ' Q_block == Q_perreflector', 'factor': 100 } );
				} );
			} );
		} );
	} );
} );


// Step 4 (L3): layout-invariance fuzz. zgelqt -> zgelqt3 panel + zlarfb (zgemm/
// ztrmm), whose optimized kernels pick their summation form from operand strides,
// so the col<->row storage flip legitimately reorders the arithmetic (~1 ULP)
// while the reconstruction property above proves the flipped result is still
// correct. Therefore assert BIT-EXACTNESS only WITHIN a storage-order family
// (col vs row); this still fuzzes offset, leading-dim padding, and stride sign. A
// and T layouts are fuzzed together; WORK stays stride-1 (base.js passes an
// internal 2D leading dim, so only its offset is a free parameter).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const WORK_LEADS = [ 0, 2, 5 ];

test( 'zgelqt: bit-exact within storage-order family (col / row), blocked', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	const M = 20;
	const N = 33;
	const mb = 8; // multiple blocks (ceil(20/8)=3), each <= mb
	const K = Math.min( M, N );
	const SEED = 0xF00D;
	checked( 'zgelqt', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = allocT( mb, K, variants[ ( i + 1 ) % variants.length ] );
			const Wr = schemes.realizeVector( sc, poison( workLen( M, N, mb ) ), { 'stride': 1, 'lead': WORK_LEADS[ i % WORK_LEADS.length ], 'tail': 0 } );

			zgelqt( M, N, mb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 1 ] );

			return check.flattenLogical( sc, readFull( Ar, M, N ) ).concat( flattenT( Tr.read, K, mb ) );
		}, { 'label': 'zgelqt layout invariance ' + fam + '-major (M=' + M + ' N=' + N + ' mb=' + mb + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE. zgelqt takes mb as a parameter and needs
// WORK >= mb*N (the natural M<=N LQ domain, where the trailing-block leading
// dimension never exceeds N). Derive the wrapper's advertised minimum from its own
// throw boundary, run at exactly that length with a POISONED WORK on a multi-block
// case, and require finite output AND reconstruction.
test( 'zgelqt: advertised WORK minimum suffices (Step 4c)', function t() {
	[ [ 20, 40, 8 ], [ 40, 64, 16 ] ].forEach( function eachCase( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const mb = pr[ 2 ];
		const K = Math.min( M, N );
		const SEED = 0xB10C + ( M * 7 ) + N;
		const label = 'zgelqt WORK-min M=' + M + ' N=' + N + ' mb=' + mb;

		function run( len ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			const Tr = allocT( mb, K, null );
			const Wr = poisonedWork( sc, len );
			zgelqt( M, N, mb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr, 0 );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		const rng = new RNG( SEED );
		const A0 = logical.general( sc, rng, M, N );
		const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
		const Tr = allocT( mb, K, null );
		const Wr = poisonedWork( sc, minLen );
		zgelqt( M, N, mb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr, 0 );
		const recon = reconstructBT( Ar, Tr.read, M, N, K, mb );
		check.assertReconstruct( sc, recon, A0, { 'label': label + ' (WORK=' + minLen + ')', 'factor': 100 } );
	} );
} );
