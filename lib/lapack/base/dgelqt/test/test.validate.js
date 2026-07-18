/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dgelqt, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `lqt` (BLOCKED compact-WY LQ) ->
* reconstruction A = L*Q AND orthonormality of Q.
*
* dgelqt is the LQ analog of dgeqrt. For a general M-by-N A it computes the
* compact-WY LQ factorization: on exit the lower trapezoid of A (on/below the
* diagonal) holds L; strict-UPPER row i holds the essential part of the
* Householder ROW reflector v_i (implicit 1 at (i,i)); and the SEPARATE
* mb-by-K array T (K = min(M,N)) holds the block reflector factors T1..TB stored
* side by side, T = (T1 T2 ... TB), each block upper triangular. Block b (starting
* at global index g0) occupies T(0:ib, g0:g0+ib); its diagonal T(a, g0+a) = tau of
* the (g0+a)-th reflector, so tau_j = T(j mod mb, j). Q = product of the block
* reflectors applied from the RIGHT, and A = L*Q.
*
* TWO-LEVEL ORACLE (the block-T entries dlarft/dlarfb consume are exercised, not
* just the tau diagonal):
*
*   (1) PER-REFLECTOR baseline — the proven dgelqf oracle. Extract tau_j from the T
*       diagonal, reconstruct A = L*Q and form Q by RIGHT-applying the individual
*       row reflectors H(i) = I - tau_i v_iᵀ v_i (i = K-1 downto 0). Validates the
*       factorization AND the tau diagonal of T.
*
*   (2) BLOCK-T — form a SECOND Q from the compact-WY BLOCK reflectors and require
*       it to match Q from (1) to backward-error tol. For LQ the block reflector
*       applied on the RIGHT is H_b = I - V_bᴴ T_bᵀ V_b (V_b = the ib unit-upper
*       row reflectors of the block; T_bᵀ, i.e. Z[a] = sum_{b>=a} T_b(a,b) W[b]),
*       and Q = ... H_1 H_0 applied right-to-left (highest block first). This
*       exercises the strict-upper block-T entries, which the per-tau oracle never
*       touches. (Empirically the T_bᵀ form with descending block order is the
*       unique variant that reproduces Q from (1); the other conj/transpose/order
*       placements diverge by O(1).)
*
* A = L*Q is an EXACT algebraic identity for ANY general A, so plain random general
* A suffices and conditioning is irrelevant.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgelqt from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'dgelqt';
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
var ALL_LAYOUTS = schemes.dense.layouts();

// (M,N) sweep: squares from SIZES_SMALL + rectangles straddling both M<N and M>N
// (LQ admits both). Block thresholds are exercised via the mb sweep below.
var PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 3, 5 ], [ 5, 3 ], [ 3, 8 ], [ 8, 3 ], [ 5, 8 ], [ 8, 5 ], [ 5, 16 ], [ 16, 5 ], [ 8, 17 ], [ 17, 8 ], [ 16, 33 ], [ 33, 16 ], [ 1, 8 ], [ 8, 1 ], [ 33, 64 ], [ 64, 33 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );


// HELPERS //

// Poisoned (NaN) array of `k` scalar values.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Allocate a POISONED dense (output-only) T buffer of `rows` x `cols` with the
// given physical layout. Nothing is pre-written, so any block-T slot the routine
// fails to write reads back NaN and trips the oracle's finiteness checks.
function allocT( rows, cols, layout ) {
	var A = schemes.denseAlloc( sc, rows, cols, layout );
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
	var out = [];
	var g0;
	for ( g0 = 0; g0 < K; g0 += mb ) {
		out.push( [ g0, Math.min( mb, K - g0 ) ] );
	}
	return out;
}

// Extract per-reflector tau from the T diagonal: tau_j = T(j mod mb, j).
function extractTaus( Tread, K, mb ) {
	var taus = [];
	var j;
	for ( j = 0; j < K; j++ ) {
		taus.push( Tread( j % mb, j ) );
	}
	return taus;
}

// The essential Householder row v_i (length N): 0 before col i, implicit 1 on the
// diagonal, and the stored strict-upper entries A(i, i+1:N-1) after it.
function reflectorRow( R, i, N ) {
	var v = [];
	var j;
	for ( j = 0; j < N; j++ ) {
		if ( j < i ) {
			v.push( sc.zero );
		} else if ( j === i ) {
			v.push( sc.one );
		} else {
			v.push( R.read( i, j ) );
		}
	}
	return v;
}

// Right-apply H(i)ᴴ: Mtx := Mtx - conj(tau) * (Mtx * conj(v)) * v, v a row vector
// of length Mtx.cols (bit-identical to the complex sibling under the real trait).
function applyHRight( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var ctau = sc.conj( tau );
	var coef;
	var dot;
	var r;
	var j;
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

// M-by-N lower-trapezoidal factor L (on/below diagonal; zero above).
function readL( R, M, N ) {
	var L = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( i >= j ) ? R.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// V (K x N): the unit-upper-trapezoidal Householder ROWS from the factored A.
function readV( R, K, N ) {
	var V = new LogicalMatrix( sc, K, N );
	var g;
	var j;
	var v;
	for ( g = 0; g < K; g++ ) {
		v = reflectorRow( R, g, N );
		for ( j = 0; j < N; j++ ) {
			V.set( g, j, v[ j ] );
		}
	}
	return V;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
function readFull( R, M, N ) {
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// (1) PER-REFLECTOR: Arec = L*Q, right-applying H(K-1)...H(0) to L.
function reconstruct( R, taus, M, N, K ) {
	var L = readL( R, M, N );
	var i;
	for ( i = K - 1; i >= 0; i-- ) {
		applyHRight( L, reflectorRow( R, i, N ), taus[ i ] );
	}
	return L;
}

// (1) PER-REFLECTOR: Q = H(K-1)...H(0), the N-by-N unitary formed by right-applying
// the reflectors to the identity.
function buildQ( R, taus, N, K ) {
	var Q = new LogicalMatrix( sc, N, N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	for ( i = K - 1; i >= 0; i-- ) {
		applyHRight( Q, reflectorRow( R, i, N ), taus[ i ] );
	}
	return Q;
}

// (2) BLOCK-T: C := C * Q, Q = ... H_1 H_0 with H_b = I - V_bᴴ T_bᵀ V_b applied
// from the RIGHT. Blocks are applied right-to-left (highest block first) so the
// leftmost factors (highest global reflector indices) are outermost, matching
// Q = H(K-1)...H(0). `Tread(i,j)` reads physical T; block b uses V rows
// g0..g0+ib-1 and T(0:ib, g0:g0+ib) (upper triangular).
function applyQblock( C, V, Tread, K, mb ) {
	var bl = blocks( K, mb );
	var g0;
	var ib;
	var W;
	var Z;
	var s;
	var bi;
	var a;
	var b;
	var r;
	var j;
	for ( bi = bl.length - 1; bi >= 0; bi-- ) {
		g0 = bl[ bi ][ 0 ];
		ib = bl[ bi ][ 1 ];
		for ( r = 0; r < C.rows; r++ ) {
			// W[a] = sum_j C[r][j] conj(V[g0+a][j])   (W = C * V_bᴴ)
			W = new Array( ib );
			for ( a = 0; a < ib; a++ ) {
				s = sc.zero;
				for ( j = 0; j < C.cols; j++ ) {
					s = sc.add( s, sc.mul( C.get( r, j ), sc.conj( V.get( g0 + a, j ) ) ) );
				}
				W[ a ] = s;
			}
			// Z[a] = sum_{b=a..ib-1} T_b(a,b) W[b]   (Z = W * T_bᵀ; T_b upper tri)
			Z = new Array( ib );
			for ( a = 0; a < ib; a++ ) {
				s = sc.zero;
				for ( b = a; b < ib; b++ ) {
					s = sc.add( s, sc.mul( Tread( a, g0 + b ), W[ b ] ) );
				}
				Z[ a ] = s;
			}
			// C[r][j] -= sum_a Z[a] V[g0+a][j]
			for ( j = 0; j < C.cols; j++ ) {
				s = C.get( r, j );
				for ( a = 0; a < ib; a++ ) {
					s = sc.sub( s, sc.mul( Z[ a ], V.get( g0 + a, j ) ) );
				}
				C.set( r, j, s );
			}
		}
	}
}

// (2) BLOCK-T: N-by-N Q built from the compact block reflectors alone.
function buildQblock( R, Tread, N, K, mb ) {
	var Q = new LogicalMatrix( sc, N, N );
	var V = readV( R, K, N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	applyQblock( Q, V, Tread, K, mb );
	return Q;
}

// Flatten the meaningful (block upper-triangular) T entries in a fixed order for a
// layout-invariant bit-exact comparison (skips poisoned unused slots).
function flattenT( Tread, K, mb ) {
	var out = [];
	var bl = blocks( K, mb );
	var comp;
	var bi;
	var g0;
	var ib;
	var a;
	var b;
	var k;
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

// Corrected minimum WORK length: the trailing dlarfb (side='right', rowwise)
// scratch scales with trailing ROWS, peaking at (M-min(mb,K))*min(mb,K); the
// reference mb*N is a lower bound valid only for M<=N. (See LEARNINGS 2026-07-18.)
function workLen( M, N, mb ) {
	var K = Math.min( M, N );
	if ( K === 0 ) {
		return 0;
	}
	var ib0 = Math.min( mb, K );
	return Math.max( mb * N, ( M - ib0 ) * ib0 );
}

// mb sweep for a given K: {1, 2, ~K/2, K}, deduped and clamped to [1, K].
function mbsFor( K ) {
	var set = {};
	[ 1, 2, Math.max( 1, Math.floor( K / 2 ) ), K ].forEach( function add( mb ) {
		if ( mb >= 1 && mb <= K ) {
			set[ mb ] = true;
		}
	} );
	return Object.keys( set ).map( Number );
}


// TESTS //

// Steps 2/3/5 (L2): reconstruction A = L*Q, orthonormality QᴴQ = I, AND the
// block-T Q matching the per-reflector Q, across the (M,N) sweep, mb sweep, and
// every dense storage layout (backward-error tolerance; bit-exactness is deferred
// to the layout-invariance test).
test( 'dgelqt: A=L*Q, QᴴQ=I, and block-T Q match ((M,N) x mb x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var K = Math.min( M, N );
		mbsFor( K ).forEach( function eachMb( mb ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				var rng = new RNG( 0x100 + ( M * 1000 ) + ( N * 10 ) + mb );
				var A0 = logical.general( sc, rng, M, N );
				var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
				var Tr = allocT( mb, K, layout );
				var Wr = schemes.realizeVector( sc, poison( workLen( M, N, mb ) ), TIGHT_VEC );

				dgelqt( M, N, mb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 1 ] );

				var label = 'dgelqt M=' + M + ' N=' + N + ' mb=' + mb + ' layout=' + li;
				var taus = extractTaus( Tr.read, K, mb );

				var recon = reconstruct( Ar, taus, M, N, K );
				checked( ROUTINE, 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'label': label + ' A=L*Q', 'factor': 100 } );
				} );

				var Q = buildQ( Ar, taus, N, K );
				checked( ROUTINE, 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q unitary' } );
				} );

				var Qb = buildQblock( Ar, Tr.read, N, K, mb );
				checked( ROUTINE, 'block-T', function run() {
					check.assertReconstruct( sc, Qb, Q, { 'label': label + ' Q(block-T) == Q(reflector)', 'factor': 100 } );
				} );
			} );
		} );
	} );
} );


// Step 4 (L3): layout-invariance fuzz on genuinely multi-block cases. dgelqt ->
// dgelqt3 panel + dlarfb (dgemm/dtrmm), whose optimized kernels choose their
// summation form from operand strides, so the col<->row storage flip legitimately
// reorders the arithmetic (~1 ULP) while the reconstruction property above proves
// the flipped result still correct. Therefore assert BIT-EXACTNESS only WITHIN a
// storage-order family (col vs row); this still fuzzes offset, leading-dim
// padding, and stride sign. A and T layouts are fuzzed together. WORK stays
// UNIT-stride (base.js passes stride 1 to dlarfb, so a non-unit WORK stride is out
// of contract) — its offset/lead are still varied.
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var WORK_LAYOUTS = schemes.vectorLayouts().filter( function unit( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
} );

test( 'dgelqt: bit-exact within storage-order family (col / row), blocked', function t() {
	[ [ 33, 20, 8 ], [ 20, 33, 8 ], [ 24, 24, 7 ], [ 16, 40, 5 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ], sz[ 2 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ], sz[ 2 ] );
	} );
} );

function runInvariance( variants, fam, M, N, mb ) {
	var K = Math.min( M, N );
	var SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = allocT( mb, K, variants[ ( i + 1 ) % variants.length ] );
			var Wr = schemes.realizeVector( sc, poison( workLen( M, N, mb ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );

			dgelqt( M, N, mb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 1 ] );

			return check.flattenLogical( sc, readFull( Ar, M, N ) ).concat( flattenT( Tr.read, K, mb ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major (M=' + M + ' N=' + N + ' mb=' + mb + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE. dgelqt needs WORK >= mb*N. Derive the wrapper's
// advertised minimum from its own throw boundary, run at exactly that length with
// a POISONED WORK on a multi-block case, and require finite output AND
// reconstruction. A too-small claim over-reads poisoned padding -> NaN (real bug,
// under-count class).
test( 'dgelqt: advertised WORK minimum suffices (Step 4c)', function t() {
	[ [ 40, 20, 8 ], [ 20, 40, 8 ], [ 64, 40, 16 ] ].forEach( function eachCase( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var mb = pr[ 2 ];
		var K = Math.min( M, N );
		var SEED = 0xB10C + ( M * 7 ) + N;
		var label = 'dgelqt WORK-min M=' + M + ' N=' + N + ' mb=' + mb;

		function run( len ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			var Tr = allocT( mb, K, null );
			var Wr = poisonedWork( sc, len );
			dgelqt( M, N, mb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr, 0 );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		var rng = new RNG( SEED );
		var A0 = logical.general( sc, rng, M, N );
		var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
		var Tr = allocT( mb, K, null );
		var Wr = poisonedWork( sc, minLen );
		dgelqt( M, N, mb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr, 0 );
		var taus = extractTaus( Tr.read, K, mb );
		var recon = reconstruct( Ar, taus, M, N, K );
		check.assertReconstruct( sc, recon, A0, { 'label': label + ' A=L*Q (WORK=' + minLen + ')', 'factor': 100 } );
	} );
} );
