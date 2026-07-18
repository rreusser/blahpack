/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dgeql2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `ql2` (UNBLOCKED QL factorization by
* Householder reflectors) -> reconstruction A = Q * L AND orthonormality of Q.
*
* QL reflector convention (from the reference dgeql2.f, k = min(M,N)):
*   Q = H(k) ... H(2) H(1),   H(i) = I - tau_i * v_i * v_iᵀ
* Reflector i (0-based i = 0..k-1) is stored in column `j = N-k+i` with its
* pivot at row `p = M-k+i`: the essential entries v_i(0:p-1) sit ABOVE the
* pivot in A(0:p-1, j), an IMPLICIT 1 at the pivot A(p, j), and zeros below.
* The factor L is the M-by-N lower trapezoid: L(i,j) = A(i,j) iff i-j >= M-N
* (for M >= N this is the bottom-right N-by-N lower triangle in A(M-N:M-1,:)).
*
* Because Q = H(k)...H(1) (reflectors stored ABOVE their pivots, applied from the
* LEFT), reconstruction folds them innermost-first: start from L and apply H(0),
* then H(1), ..., H(k-1) (loop i = 0..k-1). Each H(i) = I - tau v vᴴ is applied
* exactly as in QR (dgeqr2): M := M - tau v (vᴴ M) — tau used directly, v
* conjugated only in the dot (a no-op under the real trait). The explicit
* (economy) Q is the trailing N columns of I_M carried through the SAME reflector
* loop, and A = Q * L is an EXACT algebraic identity for any general A, so plain
* random general A suffices at every (M,N).
*
* Sweep uses M >= N (so k = N); dgeql2 is unblocked (dlarfg + dlarf), so its
* dlarf (dgemv/dger) reorders across storage order -> layout invariance is
* bit-exact only WITHIN a storage-order (col/row) family.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgeql2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'dgeql2';
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// (M,N) sweep with M >= N: squares from SIZES (straddling the unroll thresholds)
// + rectangular tall/wide-ish M > N + zero corners.
var PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 5, 3 ], [ 8, 4 ], [ 16, 7 ], [ 33, 17 ], [ 48, 20 ], [ 65, 40 ], [ 100, 33 ], [ 64, 33 ], [ 40, 16 ], [ 4, 1 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// A poisoned (NaN) vector of scalar values.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Read the k Householder vectors (each length M). Reflector i lives in column
// j = N-k+i with pivot row p = M-k+i: v_i(r) = A(r,j) for r < p, 1 at r = p,
// 0 below (r > p). Zeros before column region are implicit (r>p).
function readVecs( Ard, M, N, k ) {
	var vs = [];
	var v;
	var i;
	var j;
	var p;
	var r;
	for ( i = 0; i < k; i++ ) {
		j = ( N - k ) + i;
		p = ( M - k ) + i;
		v = new Array( M );
		for ( r = 0; r < M; r++ ) {
			if ( r < p ) {
				v[ r ] = Ard.read( r, j );
			} else if ( r === p ) {
				v[ r ] = sc.one;
			} else {
				v[ r ] = sc.zero;
			}
		}
		vs.push( v );
	}
	return vs;
}

// Read the M-by-N lower-trapezoidal factor L: L(i,j) = A(i,j) iff i-j >= M-N.
function readL( Ard, M, N ) {
	var L = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( ( i - j ) >= ( M - N ) ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// Mtx := H·Mtx where H = I - tau·v·vᴴ, i.e. Mtx -= tau·v·(vᴴ·Mtx). `v` has
// length Mtx.rows. tau is used directly; v conjugated only in the dot.
function applyH( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var w;
	var tw;
	var c;
	var r;
	for ( c = 0; c < cols; c++ ) {
		w = sc.zero;
		for ( r = 0; r < rows; r++ ) {
			w = sc.add( w, sc.mul( sc.conj( v[ r ] ), Mtx.get( r, c ) ) );
		}
		tw = sc.mul( tau, w );
		for ( r = 0; r < rows; r++ ) {
			Mtx.set( r, c, sc.sub( Mtx.get( r, c ), sc.mul( v[ r ], tw ) ) );
		}
	}
}

// Reconstruct A = Q·L = H(k)...H(1)·L by applying H(0) innermost then upward
// (loop i = 0..k-1), starting from L.
function reconstruct( Ard, taus, M, N, k ) {
	var Mtx = readL( Ard, M, N );
	var vs = readVecs( Ard, M, N, k );
	var i;
	for ( i = 0; i < k; i++ ) {
		applyH( Mtx, vs[ i ], taus[ i ] );
	}
	return Mtx;
}

// Form the economy Q (M x N) = trailing N columns of I_M carried through the SAME
// reflector loop (i = 0..k-1). For M >= N, k = N and Q's columns are orthonormal.
function formQ( Ard, taus, M, N, k ) {
	var Q = new LogicalMatrix( sc, M, N );
	var vs = readVecs( Ard, M, N, k );
	var i;
	var r;
	var c;
	for ( c = 0; c < N; c++ ) {
		for ( r = 0; r < M; r++ ) {
			Q.set( r, c, ( r === ( ( M - N ) + c ) ) ? sc.one : sc.zero );
		}
	}
	for ( i = 0; i < k; i++ ) {
		applyH( Q, vs[ i ], taus[ i ] );
	}
	return Q;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
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

function factor( M, N, layout ) {
	var k = Math.min( M, N );
	var rng = new RNG( 0x100 + ( M * 100 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
	var Wr = schemes.realizeVector( sc, poison( Math.max( 1, N ) ), TIGHT_VEC );
	dgeql2( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
	var taus = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		taus.push( Tr.read( i ) );
	}
	return { 'A': Ar, 'taus': taus, 'A0': A0, 'k': k };
}


// TESTS //

// Steps 2/3 (L2): reconstruction A = Q*L AND orthonormality of Q across the
// (M,N) sweep and every dense storage layout.
test( 'dgeql2: A = Q*L and QᴴQ = I ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			var f = factor( M, N, layout );
			var lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( f.A, f.taus, M, N, f.k ), f.A0, { 'label': lbl + ' A=Q*L' } );
			});
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, formQ( f.A, f.taus, M, N, f.k ), { 'label': lbl + ' Q' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz. dgeql2's dlarf (dgemv/dger) picks its
// summation form from operand strides, so the col<->row FLIP legitimately
// reorders arithmetic (~1 ULP) — certified correct by the reconstruction
// property above. Assert BIT-EXACTNESS only WITHIN a storage-order family (this
// still fuzzes offset, leading-dim padding, and stride SIGN). TAU/WORK vector
// layouts are fuzzed in parallel and must not perturb the factored A.
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

test( 'dgeql2: bit-exact within storage-order family (col / row)', function t() {
	[ [ 12, 8 ], [ 20, 20 ], [ 17, 10 ], [ 33, 20 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ] );
	});
});

function runInvariance( variants, fam, M, N ) {
	var k = Math.min( M, N );
	var SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, poison( k ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			var Wr = schemes.realizeVector( sc, poison( Math.max( 1, N ) ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			dgeql2( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}
