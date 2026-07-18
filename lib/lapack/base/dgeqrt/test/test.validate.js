/**
* Property-based validation for dgeqrt, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `qrt` (BLOCKED compact-WY QR) ->
* reconstruction A = Q*R AND orthonormality of Q's columns.
*
* dgeqrt computes, for a general M-by-N matrix A (M >= N), the compact-WY QR
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
import dgeqrt from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
var ALL_LAYOUTS = schemes.dense.layouts();

// (M,N) sweep with M >= N (dgeqrt/2/3 require M >= N): squares from SIZES_SMALL
// plus tall rectangles straddling common block thresholds.
var PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 5, 3 ], [ 8, 3 ], [ 8, 5 ], [ 16, 5 ], [ 17, 8 ], [ 33, 16 ], [ 64, 17 ], [ 8, 1 ], [ 64, 33 ] ].forEach( function rect( p ) {
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
// given physical layout. Nothing is pre-written, so a block-T slot the routine
// fails to write reads back NaN and trips assertFinite.
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

// blocks(K,nb) -> [ [g0, ib], ... ] the compact-WY block partition.
function blocks( K, nb ) {
	var out = [];
	var g0;
	for ( g0 = 0; g0 < K; g0 += nb ) {
		out.push( [ g0, Math.min( nb, K - g0 ) ] );
	}
	return out;
}

// V (M x K): unit-lower-trapezoidal Householder columns from the factored A.
function readV( Ard, M, K ) {
	var V = new LogicalMatrix( sc, M, K );
	var i;
	var j;
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			V.set( i, j, ( i < j ) ? sc.zero : ( i === j ? sc.one : Ard.read( i, j ) ) );
		}
	}
	return V;
}

// R (M x N): upper trapezoid of the factored A (strict lower = 0).
function readR( Ard, M, N ) {
	var R = new LogicalMatrix( sc, M, N );
	var i;
	var j;
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
	var M = X.rows;
	var p = X.cols;
	var bl = blocks( K, nb );
	var g0;
	var ib;
	var W;
	var TW;
	var s;
	var bi;
	var a;
	var b;
	var c;
	var r;
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
	var R = readR( Ard, M, N );
	var V = readV( Ard, M, K );
	applyQ( R, V, Tread, K, nb );
	return R;
}

// Economy Q (M x K) = Q applied to the first K columns of I_M.
function formQ( Ard, Tread, M, K, nb ) {
	var Q = new LogicalMatrix( sc, M, K );
	var V = readV( Ard, M, K );
	var i;
	var j;
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
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
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
	var out = [];
	var bl = blocks( K, nb );
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

// nb sweep for a given N: {1, small, N} (nb divides the block structure).
function nbsFor( N ) {
	var set = {};
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
test( 'dgeqrt: A = Q*R and QᴴQ = I ((M,N) x nb x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var K = Math.min( M, N );
		nbsFor( N ).forEach( function eachNb( nb ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				var rng = new RNG( 0x100 + ( M * 1000 ) + ( N * 10 ) + nb );
				var A0 = logical.general( sc, rng, M, N );
				var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
				var Tr = allocT( nb, K, layout );
				var Wr = schemes.realizeVector( sc, poison( nb * N ), TIGHT_VEC );

				dgeqrt( M, N, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

				var label = 'dgeqrt M=' + M + ' N=' + N + ' nb=' + nb + ' layout=' + li;

				var recon = reconstruct( Ar, Tr.read, M, N, K, nb );
				checked( 'dgeqrt', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'label': label, 'factor': 100 } );
				} );

				var Q = formQ( Ar, Tr.read, M, K, nb );
				checked( 'dgeqrt', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				} );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. dgeqrt -> dgeqrt2 panel + dlarfb (dgemm/dtrmm),
// whose optimized kernels pick their summation form from operand strides, so the
// col<->row storage flip legitimately reorders the arithmetic (~1 ULP) while the
// reconstruction property above proves the flipped result is still correct.
// Therefore assert BIT-EXACTNESS only WITHIN a storage-order family (col vs row);
// this still fuzzes offset, leading-dim padding, and stride sign. A and T layouts
// are fuzzed together; WORK stays positive-stride (the ndarray guard measures
// `length - offset`).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var WORK_LAYOUTS = schemes.vectorLayouts().filter( function pos( L ) {
	return L.stride > 0;
} );

test( 'dgeqrt: bit-exact within storage-order family (col / row), blocked', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	var M = 33;
	var N = 20;
	var nb = 8; // multiple blocks (ceil(20/8)=3), each <= nb
	var K = Math.min( M, N );
	var SEED = 0xF00D;
	checked( 'dgeqrt', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = allocT( nb, K, variants[ ( i + 1 ) % variants.length ] );
			var Wr = schemes.realizeVector( sc, poison( nb * N ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );

			dgeqrt( M, N, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			return check.flattenLogical( sc, readFull( Ar, M, N ) ).concat( flattenT( Tr.read, K, nb ) );
		}, { 'label': 'dgeqrt layout invariance ' + fam + '-major (M=' + M + ' N=' + N + ' nb=' + nb + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE. dgeqrt takes nb as a parameter and needs
// WORK >= nb*N. Derive the wrapper's advertised minimum from its own throw
// boundary, run at exactly that length with a POISONED WORK on a multi-block
// case, and require finite output AND reconstruction.
test( 'dgeqrt: advertised WORK minimum suffices (Step 4c)', function t() {
	[ [ 40, 20, 8 ], [ 64, 40, 16 ] ].forEach( function eachCase( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var nb = pr[ 2 ];
		var K = Math.min( M, N );
		var SEED = 0xB10C + ( M * 7 ) + N;
		var label = 'dgeqrt WORK-min M=' + M + ' N=' + N + ' nb=' + nb;

		function run( len ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			var Tr = allocT( nb, K, null );
			var Wr = poisonedWork( sc, len );
			dgeqrt( M, N, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		var rng = new RNG( SEED );
		var A0 = logical.general( sc, rng, M, N );
		var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
		var Tr = allocT( nb, K, null );
		var Wr = poisonedWork( sc, minLen );
		dgeqrt( M, N, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr, 1, 0 );
		var recon = reconstruct( Ar, Tr.read, M, N, K, nb );
		check.assertReconstruct( sc, recon, A0, { 'label': label + ' (WORK=' + minLen + ')', 'factor': 100 } );
	} );
} );
