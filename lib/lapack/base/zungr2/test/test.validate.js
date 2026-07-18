/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zungr2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ungr2` FORMS the M-by-N matrix Q
* with orthonormal ROWS (the last M rows of the N-by-N unitary) from the
* elementary reflectors an RQ factorization (zgerqf/zgerq2) leaves in the first
* K = M rows of A. This is the UNBLOCKED former (applies each reflector with a
* single zlarf), so there is NO block seam and WORK need is the plain max(1,M).
* It CONSUMES a factorization, so it is validated as the second half of the
* composition zgerqf -> zungr2:
*
*   - factor a random general M-by-N A0 (M <= N, k = min(M,N) = M) with zgerqf;
*     on exit the top-right M-by-M block A(0:M-1, N-M:N-1) holds R (row i carries
*     R in columns j >= N-M+i) and, strictly left of the RQ diagonal, the
*     essential Householder rows;
*   - SNAPSHOT the M-by-M upper-triangular R block before forming Q;
*   - zungr2 overwrites A's M rows with the unitary Q (M-by-N, orthonormal rows);
*   - PROPERTY (a) orthonormal rows: Q·Qᴴ = I_M (unitarity of Qᴴ), and (b)
*     reconstruction: A0 = R·Q with R the M-by-M trailing triangle (the leading
*     N-M columns of the trapezoidal R are structurally zero, so only the trailing
*     M-by-M block multiplies the last M rows Q of the full unitary). For complex
*     RQ, Q = H(1)ᴴ…H(k)ᴴ and A = R·Q holds directly — no extra conjugation is
*     needed in the reconstruction because zungr2 forms exactly this Q.
*
* Both are EXACT algebraic identities for any general A, so plain random A
* suffices. zungr2 is always unblocked; the (M,N) sweep still straddles NB=32.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, ref, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgerqf from './../../zgerqf/lib/ndarray.js';
import zungr2 from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'zungr2';
var NB = 32; // block size of the zgerqf factor (zungr2 itself is unblocked)
var TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// Generous WORK for the (blocked) zgerqf factor: it stores its NB-by-NB block-
// reflector T factor INSIDE WORK after the M*NB main scratch, so M*NB + NB*NB.
function gerqfWork( M ) {
	return Math.max( 1, ( M * NB ) + ( NB * NB ) );
}

// WORK the unblocked zungr2 consumes: zlarf's C-scratch has one entry per row of
// the trailing block (at most M-1 rows), so max(1,M) is exact.
function orgWork( M ) {
	return Math.max( 1, M );
}

// (M,N) sweep with M <= N: squares (from SIZES, incl. LARGE) + wide rectangles +
// zero corners.
var PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 1, 5 ], [ 3, 7 ], [ 5, 8 ], [ 8, 16 ], [ 16, 33 ], [ 33, 48 ], [ 40, 65 ], [ 48, 64 ], [ 33, 100 ], [ 64, 100 ], [ 65, 100 ], [ 0, 4 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the M-by-M upper-triangular RQ factor R: R(i,jj) sits at physical column
// N-M+jj of factored row i, referenced only for jj >= i (RQ diagonal p_i=N-M+i).
function readR( store, M, N ) {
	var R = new LogicalMatrix( sc, M, M );
	var i;
	var jj;
	for ( jj = 0; jj < M; jj++ ) {
		for ( i = 0; i < M; i++ ) {
			R.set( i, jj, ( jj >= i ) ? store.read( i, N - M + jj ) : sc.zero );
		}
	}
	return R;
}

function readFull( store, M, N ) {
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, store.read( i, j ) );
		}
	}
	return F;
}

// Conjugate transpose T (N x M): T(j,i) = conj(Q(i,j)); columns of T are rows of
// Q, so assertOrthonormal(T) checks T^H T = Q Q^H = I_M.
function conjT( Q ) {
	var T = new LogicalMatrix( sc, Q.cols, Q.rows );
	var i;
	var j;
	for ( i = 0; i < Q.rows; i++ ) {
		for ( j = 0; j < Q.cols; j++ ) {
			T.set( j, i, sc.conj( Q.get( i, j ) ) );
		}
	}
	return T;
}

function factorAndForm( M, N, layout, owlen, poison ) {
	var K = M; // K = min(M,N) = M for M <= N
	var rng = new RNG( 0x100 + ( M * 100 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var TAU = schemes.realizeVector( sc, new Array( K ).fill( sc.zero ), TIGHT );
	var GW = schemes.realizeVector( sc, new Array( gerqfWork( M ) ).fill( sc.zero ), TIGHT );
	zgerqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );

	var Rm = readR( R, M, N );

	var OW = ( poison ) ? poisonedWork( sc, owlen ) : schemes.realizeVector( sc, new Array( owlen ).fill( sc.zero ), TIGHT ).data;
	zungr2( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW, 1, 0 );

	return { 'A0': A0, 'R': Rm, 'Q': readFull( R, M, N ) };
}


// TESTS //

// Steps 2-3 (L2): orthonormal ROWS of Q AND reconstruction A0 = R*Q across the
// (M,N) sweep and every dense storage layout.
test( 'zungr2: orthonormal rows (Q·Qᴴ=I) and A=R*Q ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			var f = factorAndForm( M, N, layout, orgWork( M ), false );
			var lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, conjT( f.Q ), { 'label': lbl + ' Q rows orthonormal' } );
			});
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, ref.matmul( sc, f.R, f.Q ), f.A0, { 'label': lbl + ' A=R*Q' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz. FREEZE the zgerqf factorization once, then
// re-realize the fixed reflectors + tau at each org-layout variant and run ONLY
// zungr2. Within a storage-order family the formed Q must be bit-exact; the
// col<->row flip legitimately reorders the zlarf->zgemv accumulation, so
// cross-order agreement is certified by the reconstruction property above.
var VLAYOUTS = schemes.vectorLayouts();
var TAULAYOUTS = VLAYOUTS.filter( function pos( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
var WLAYOUTS = VLAYOUTS.filter( function unit( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
});
var colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

function freezeFactor( M, N ) {
	var K = M;
	var rng = new RNG( 0xF00D + ( M * 17 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var TAU = schemes.realizeVector( sc, new Array( K ).fill( sc.zero ), TIGHT );
	var GW = schemes.realizeVector( sc, new Array( gerqfWork( M ) ).fill( sc.zero ), TIGHT );
	zgerqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );
	var taus = [];
	var i;
	for ( i = 0; i < K; i++ ) {
		taus.push( TAU.read( i ) );
	}
	return { 'F': readFull( R, M, N ), 'taus': taus };
}

function runInvariance( variants, fam, M, N, fr ) {
	var K = M;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var R = schemes.dense.realize( sc, fr.F, { 'part': 'full' }, layout );
			var TAU = schemes.realizeVector( sc, fr.taus, TAULAYOUTS[ i % TAULAYOUTS.length ] );
			var OW = schemes.realizeVector( sc, new Array( orgWork( M ) ).fill( sc.zero ), WLAYOUTS[ i % WLAYOUTS.length ] );
			zungr2( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW.data, OW.args[ 0 ], OW.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

test( 'zungr2: bit-exact Q within storage-order family (col / row)', function t() {
	[ [ 5, 8 ], [ 12, 20 ], [ 16, 16 ], [ 33, 48 ] ].forEach( function eachSize( sz ) {
		var fr = freezeFactor( sz[ 0 ], sz[ 1 ] );
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ], fr );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ], fr );
	});
});

// Step 4c: workspace conformance. zungr2 is unblocked and genuinely needs only
// max(1,M) WORK; the advertised minimum should suffice trivially. Probe the throw
// boundary, then run at exactly that length with a POISONED buffer and require
// finite Q + orthonormality + reconstruction.
test( 'zungr2: advertised WORK minimum suffices (poisoned)', function t() {
	[ [ 40, 40 ], [ 33, 80 ], [ 64, 100 ] ].forEach( function eachCase( c ) {
		var M = c[ 0 ];
		var N = c[ 1 ];
		var label = ROUTINE + ' WORK-sufficiency ' + M + 'x' + N;
		var min = assertWorkspaceSufficient( function run( wlen ) {
			var f = factorAndForm( M, N, null, wlen, true );
			return check.flattenLogical( sc, f.Q );
		}, {}, label );

		var f = factorAndForm( M, N, null, min, true );
		check.assertOrthonormal( sc, conjT( f.Q ), { 'label': label + ' Q rows orthonormal @ WORK=' + min } );
		check.assertReconstruct( sc, ref.matmul( sc, f.R, f.Q ), f.A0, { 'label': label + ' A=R*Q @ WORK=' + min } );
	});
});
