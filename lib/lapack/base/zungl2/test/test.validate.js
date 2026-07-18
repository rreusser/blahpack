/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zungl2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ungl2` FORMS the M-by-N unitary
* factor Q (orthonormal ROWS) from the elementary reflectors an LQ factorization
* (zgelqf/zgelq2) leaves in the first K rows of A. This is the UNBLOCKED former
* (zlarf per reflector). It CONSUMES a factorization, so it is validated as the
* second half of the composition zgelqf -> zungl2:
*
*   - factor a random general M-by-N A0 (M <= N) with zgelqf; on exit A holds the
*     M-by-M lower-triangular L (on/below the diagonal, cols 0..M-1; cols M..N-1
*     of the trapezoid are structurally zero) and, above the diagonal, the
*     essential Householder rows;
*   - SNAPSHOT L before forming Q;
*   - zungl2 overwrites A's M rows with Q (M-by-N);
*   - PROPERTY (a) orthonormal rows: Q·Qᴴ = I_M  (asserted as unitarity of Qᴴ),
*     and (b) reconstruction: A0 = L·Q.
*
* Both properties are EXACT algebraic identities for any general A (Q is exactly
* unitary and A = L·Q holds to backward error), so plain random A suffices and
* conditioning is irrelevant. The two checks are INDEPENDENT and non-redundant:
* orthonormality is insensitive to the complex conj(tau) reflector-conjugation
* subtlety (Q is unitary either way), so only reconstruction pins Q down — see
* test/harness/LEARNINGS.md (zgelq2 oracle). Here the reflector arithmetic lives
* entirely inside zgelqf+zungl2, so the oracle needs no reflector math at all.
*
* K = M throughout (K = min(M,N) = M for M <= N), so every row of A defines a
* reflector.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, ref, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgelqf from './../../zgelqf/lib/ndarray.js';
import zungl2 from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'zungl2';
var NB = 32; // zgelqf block size (for sizing the factor's WORK)
var TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// Generous WORK for the (blocked) zgelqf factor and for the unblocked zungl2
// former (dlarf scratch needs only M).
function gelqfWork( M ) {
	return Math.max( 1, ( M * NB ) + ( NB * NB ) );
}
function orgWork( M ) {
	return Math.max( 1, M );
}

// (M,N) sweep with M <= N: squares straddling the unblocked/blocked size
// crossovers (zungl2 is unblocked, but K=M spans the same thresholds) +
// rectangular wide (M < N) + zero corners.
var PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 1, 5 ], [ 2, 5 ], [ 3, 7 ], [ 5, 8 ], [ 8, 16 ], [ 16, 33 ], [ 33, 48 ], [ 40, 65 ], [ 48, 64 ], [ 33, 100 ], [ 64, 100 ], [ 0, 4 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the M-by-M lower-triangular factor L (on/below diagonal; zero above). The
// M-by-N lower trapezoid has structurally-zero columns M..N-1, so L is M-by-M.
function readL( R, M ) {
	var L = new LogicalMatrix( sc, M, M );
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( i >= j ) ? R.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// Read the full M-by-N matrix currently in storage.
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

// Conjugate transpose: T (N x M) with T(j,i) = conj(Q(i,j)); columns of T are the
// rows of Q, so assertOrthonormal(T) checks T^H T = Q Q^H = I_M (row orthonormality).
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

// Factor A0 with zgelqf at `layout`, snapshot L, then form Q in place with zungl2.
// Returns { A0, L, Q }. When `poison`, zungl2's WORK is a poisoned buffer of
// exactly `owlen` elements (for the workspace probe).
function factorAndForm( M, N, layout, owlen, poison ) {
	var K = M; // K = min(M,N) = M for M <= N
	var rng = new RNG( 0x100 + ( M * 100 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var TAU = schemes.realizeVector( sc, new Array( K ).fill( sc.zero ), TIGHT );
	var GW = schemes.realizeVector( sc, new Array( gelqfWork( M ) ).fill( sc.zero ), TIGHT );
	zgelqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );

	var L = readL( R, M );

	var OW = ( poison ) ? poisonedWork( sc, owlen ) : schemes.realizeVector( sc, new Array( owlen ).fill( sc.zero ), TIGHT ).data;
	zungl2( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW, 1, 0 );

	return { 'A0': A0, 'L': L, 'Q': readFull( R, M, N ) };
}


// TESTS //

// Steps 2-3 (L2): orthonormal ROWS of Q AND reconstruction A0 = L*Q across the
// (M,N) sweep and every dense storage layout. zungl2 does no pivot search
// (dlarf/dscal only), so all seven layouts (incl. negative row stride) are in
// contract; bit-exactness across the col<->row flip is deferred to the
// layout-invariance test below.
test( 'zungl2: orthonormal rows (Q·Qᴴ=I) and A=L*Q ((M,N) sweep x all layouts)', function t() {
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
				check.assertReconstruct( sc, ref.matmul( sc, f.L, f.Q ), f.A0, { 'label': lbl + ' A=L*Q' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz. FREEZE the zgelqf factorization once, then
// re-realize the fixed reflectors + tau at each org-layout variant and run ONLY
// zungl2, so the observed differences are attributable to zungl2's addressing
// alone. Within a single storage-order family the formed Q must be bit-exact
// across offset, leading-dim padding, and stride SIGN; the col<->row FLIP
// legitimately reorders the optimized dlarf->dgemv accumulation (~1 ULP), so
// cross-order agreement is certified by the reconstruction property above, not
// bit-equality. TAU is fuzzed over positive-stride layouts (honored end-to-end);
// WORK is pure dlarf scratch and never affects Q, so it is fuzzed over
// positive-stride layouts too (offset/lead varied).
var VLAYOUTS = schemes.vectorLayouts();
var TAULAYOUTS = VLAYOUTS.filter( function pos( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
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
	var GW = schemes.realizeVector( sc, new Array( gelqfWork( M ) ).fill( sc.zero ), TIGHT );
	zgelqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );
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
			var OW = schemes.realizeVector( sc, new Array( orgWork( M ) ).fill( sc.zero ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			zungl2( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW.data, OW.args[ 0 ], OW.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

test( 'zungl2: bit-exact Q within storage-order family (col / row)', function t() {
	[ [ 8, 12 ], [ 16, 20 ], [ 17, 33 ], [ 5, 5 ] ].forEach( function eachSize( sz ) {
		var fr = freezeFactor( sz[ 0 ], sz[ 1 ] );
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ], fr );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ], fr );
	});
});

// Step 4c: workspace conformance. zungl2 is UNBLOCKED — its dlarf scratch needs
// only M. Probe the wrapper's advertised minimum from its throw boundary, then run
// at exactly that length with a POISONED buffer and require finite output + intact
// reconstruction (a too-small claim over-reads poisoned padding -> NaN).
test( 'zungl2: advertised WORK minimum suffices (poisoned)', function t() {
	[ [ 8, 12 ], [ 40, 60 ] ].forEach( function eachCase( c ) {
		var M = c[ 0 ];
		var N = c[ 1 ];
		var label = ROUTINE + ' WORK-sufficiency ' + M + 'x' + N;
		var min = assertWorkspaceSufficient( function run( wlen ) {
			var f = factorAndForm( M, N, null, wlen, true );
			return check.flattenLogical( sc, f.Q );
		}, {}, label );

		var f = factorAndForm( M, N, null, min, true );
		check.assertReconstruct( sc, ref.matmul( sc, f.L, f.Q ), f.A0, { 'label': label + ' A=L*Q @ WORK=' + min } );
	});
});
