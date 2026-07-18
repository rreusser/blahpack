/**
* Property-based validation for zgeqrt, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `qrt` (BLOCKED compact-WY QR) ->
* reconstruction A = Q*R AND orthonormality of Q's columns.
*
* zgeqrt computes, for a general complex M-by-N matrix A (M >= N), the compact-WY QR
* factorization: on exit the upper trapezoid of A holds R, the strict-lower part
* of column i holds v_i(i+1:M-1) with implicit v_i(i) = 1, and the SEPARATE
* nb-by-K array T holds the block reflector factors T1..TB stored side by side
* (T = (T1 T2 ... TB), each block upper triangular). Block b (starting at global
* column g0) is written into T(0:ib, g0:g0+ib); its diagonal T(a,g0+a) = tau of
* the (g0+a)-th elementary reflector, so tau_j = T(j mod nb, j).
*
* The block reflector H_b = I - V_b T_b V_bᴴ (V_b = the ib unit-lower Householder
* columns of the block), and Q = H_1 H_2 ... H_B, with A = Q*R. We reconstruct A
* and form the economy Q DIRECTLY from V and the compact block T's (NOT from the
* per-column tau alone) — so this validates the FULL compact-WY T storage
* (diagonal AND strict-upper) that dlarfb consumes, not just the tau diagonal.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgeqrt from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
const ALL_LAYOUTS = schemes.dense.layouts();

// (M,N) sweep with M >= N (zgeqrt/2/3 require M >= N): squares from SIZES_SMALL
// plus tall rectangles straddling common block thresholds.
const PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 5, 3 ], [ 8, 3 ], [ 8, 5 ], [ 16, 5 ], [ 17, 8 ], [ 33, 16 ], [ 64, 17 ], [ 8, 1 ], [ 64, 33 ] ].forEach( function rect( p ) {
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

// blocks(K,nb) -> [ [g0, ib], ... ] the compact-WY block partition.
function blocks( K, nb ) {
	const out = [];
	let g0;
	for ( g0 = 0; g0 < K; g0 += nb ) {
		out.push( [ g0, Math.min( nb, K - g0 ) ] );
	}
	return out;
}

// V (M x K): unit-lower-trapezoidal Householder columns from the factored A.
function readV( Ard, M, K ) {
	const V = new LogicalMatrix( sc, M, K );
	let i, j;
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			V.set( i, j, ( i < j ) ? sc.zero : ( i === j ? sc.one : Ard.read( i, j ) ) );
		}
	}
	return V;
}

// R (M x N): upper trapezoid of the factored A (strict lower = 0).
function readR( Ard, M, N ) {
	const R = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			R.set( i, j, ( i <= j ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return R;
}

// X := Q * X in place, Q = H_1 H_2 ... H_B, H_b = I - V_b T_b V_bᴴ. `Tread(i,j)`
// reads physical T; block b uses V columns g0..g0+ib-1 and T(0:ib, g0:g0+ib)
// (upper triangular). Apply blocks last-to-first so H_B is innermost.
function applyQ( X, V, Tread, K, nb ) {
	const M = X.rows;
	const p = X.cols;
	const bl = blocks( K, nb );
	let g0, ib, W, TW, s, bi, a, b, c, r;
	for ( bi = bl.length - 1; bi >= 0; bi-- ) {
		g0 = bl[ bi ][ 0 ];
		ib = bl[ bi ][ 1 ];
		for ( c = 0; c < p; c++ ) {
			// W[a] = sum_r conj(V[r][g0+a]) X[r][c]
			W = new Array( ib );
			for ( a = 0; a < ib; a++ ) {
				s = sc.zero;
				for ( r = g0; r < M; r++ ) {
					s = sc.add( s, sc.mul( sc.conj( V.get( r, g0 + a ) ), X.get( r, c ) ) );
				}
				W[ a ] = s;
			}
			// TW[a] = sum_{b=a..ib-1} T_b(a,b) W[b]  (T_b upper triangular)
			TW = new Array( ib );
			for ( a = 0; a < ib; a++ ) {
				s = sc.zero;
				for ( b = a; b < ib; b++ ) {
					s = sc.add( s, sc.mul( Tread( a, g0 + b ), W[ b ] ) );
				}
				TW[ a ] = s;
			}
			// X[r][c] -= sum_a V[r][g0+a] TW[a]
			for ( r = g0; r < M; r++ ) {
				s = X.get( r, c );
				for ( a = 0; a < ib; a++ ) {
					s = sc.sub( s, sc.mul( V.get( r, g0 + a ), TW[ a ] ) );
				}
				X.set( r, c, s );
			}
		}
	}
}

// Reconstruct A = Q * R (M x N).
function reconstruct( Ard, Tread, M, N, K, nb ) {
	const R = readR( Ard, M, N );
	const V = readV( Ard, M, K );
	applyQ( R, V, Tread, K, nb );
	return R;
}

// Economy Q (M x K) = Q applied to the first K columns of I_M.
function formQ( Ard, Tread, M, K, nb ) {
	const Q = new LogicalMatrix( sc, M, K );
	const V = readV( Ard, M, K );
	let i, j;
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	applyQ( Q, V, Tread, K, nb );
	return Q;
}

// Read factored A (M x N) into a LogicalMatrix.
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

// Flatten the meaningful (block upper-triangular) T entries, in a fixed order,
// for a layout-invariant bit-exact comparison (skips poisoned unused slots).
function flattenT( Tread, K, nb ) {
	const out = [];
	const bl = blocks( K, nb );
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

// nb sweep for a given N: {1, small, N} (nb divides the block structure).
function nbsFor( N ) {
	const set = {};
	[ 1, 2, Math.max( 1, Math.floor( N / 2 ) ), N ].forEach( function add( nb ) {
		if ( nb >= 1 && nb <= N ) {
			set[ nb ] = true;
		}
	} );
	return Object.keys( set ).map( Number );
}


// Steps 2/3/5: reconstruction (A = Q*R) AND orthonormality (QᴴQ = I) across the
// (M,N) sweep, nb sweep, and every dense storage layout (backward-error
// tolerance; bit-exactness is deferred to the layout-invariance test).
test( 'zgeqrt: A = Q*R and QᴴQ = I ((M,N) x nb x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const K = Math.min( M, N );
		nbsFor( N ).forEach( function eachNb( nb ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				const rng = new RNG( 0x100 + ( M * 1000 ) + ( N * 10 ) + nb );
				const A0 = logical.general( sc, rng, M, N );
				const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
				const Tr = allocT( nb, K, layout );
				const Wr = schemes.realizeVector( sc, poison( nb * N ), TIGHT_VEC );

				zgeqrt( M, N, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

				const label = 'zgeqrt M=' + M + ' N=' + N + ' nb=' + nb + ' layout=' + li;

				const recon = reconstruct( Ar, Tr.read, M, N, K, nb );
				checked( 'zgeqrt', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'label': label, 'factor': 100 } );
				} );

				const Q = formQ( Ar, Tr.read, M, K, nb );
				checked( 'zgeqrt', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				} );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. zgeqrt -> zgeqrt2 panel + dlarfb (dgemm/dtrmm),
// whose optimized kernels pick their summation form from operand strides, so the
// col<->row storage flip legitimately reorders the arithmetic (~1 ULP) while the
// reconstruction property above proves the flipped result is still correct.
// Therefore assert BIT-EXACTNESS only WITHIN a storage-order family (col vs row);
// this still fuzzes offset, leading-dim padding, and stride sign. A and T layouts
// are fuzzed together; WORK stays positive-stride (the ndarray guard measures
// `length - offset`).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const WORK_LAYOUTS = schemes.vectorLayouts().filter( function pos( L ) {
	return L.stride > 0;
} );

test( 'zgeqrt: bit-exact within storage-order family (col / row), blocked', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	const M = 33;
	const N = 20;
	const nb = 8; // multiple blocks (ceil(20/8)=3), each <= nb
	const K = Math.min( M, N );
	const SEED = 0xF00D;
	checked( 'zgeqrt', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = allocT( nb, K, variants[ ( i + 1 ) % variants.length ] );
			const Wr = schemes.realizeVector( sc, poison( nb * N ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );

			zgeqrt( M, N, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			return check.flattenLogical( sc, readFull( Ar, M, N ) ).concat( flattenT( Tr.read, K, nb ) );
		}, { 'label': 'zgeqrt layout invariance ' + fam + '-major (M=' + M + ' N=' + N + ' nb=' + nb + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE. zgeqrt takes nb as a parameter and needs
// WORK >= nb*N. Derive the wrapper's advertised minimum from its own throw
// boundary, run at exactly that length with a POISONED WORK on a multi-block
// case, and require finite output AND reconstruction.
test( 'zgeqrt: advertised WORK minimum suffices (Step 4c)', function t() {
	[ [ 40, 20, 8 ], [ 64, 40, 16 ] ].forEach( function eachCase( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const nb = pr[ 2 ];
		const K = Math.min( M, N );
		const SEED = 0xB10C + ( M * 7 ) + N;
		const label = 'zgeqrt WORK-min M=' + M + ' N=' + N + ' nb=' + nb;

		function run( len ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			const Tr = allocT( nb, K, null );
			const Wr = poisonedWork( sc, len );
			zgeqrt( M, N, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		const rng = new RNG( SEED );
		const A0 = logical.general( sc, rng, M, N );
		const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
		const Tr = allocT( nb, K, null );
		const Wr = poisonedWork( sc, minLen );
		zgeqrt( M, N, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr, 1, 0 );
		const recon = reconstruct( Ar, Tr.read, M, N, K, nb );
		check.assertReconstruct( sc, recon, A0, { 'label': label + ' (WORK=' + minLen + ')', 'factor': 100 } );
	} );
} );
