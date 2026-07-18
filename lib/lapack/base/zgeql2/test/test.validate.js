/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zgeql2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `ql2` (UNBLOCKED QL factorization by
* Householder reflectors) -> reconstruction A = Q * L AND unitarity of Q.
*
* QL reflector convention (from the reference zgeql2.f, k = min(M,N)):
*   Q = H(k) ... H(2) H(1),   H(i) = I - tau_i * v_i * v_iᴴ
* Reflector i (0-based i = 0..k-1) is stored in column `j = N-k+i` with its
* pivot at row `p = M-k+i`: the essential entries v_i(0:p-1) sit ABOVE the
* pivot in A(0:p-1, j), an IMPLICIT 1 at the pivot A(p, j), zeros below. The
* stored entries are the reflector v itself (a column vector) — NOT conjugated;
* zgeql2.f applies H(i)ᴴ during factorization (passing DCONJG(TAU) to ZLARF to
* form L = Qᴴ A), but the STORED tau is tau and Q = H(k)...H(1), so
* reconstruction applies H(i) = I - tau v vᴴ DIRECTLY (tau, not conj(tau)) —
* identical to zgeqr2. The factor L is the M-by-N lower trapezoid:
* L(i,j) = A(i,j) iff i-j >= M-N (for M >= N, the bottom N-by-N lower triangle).
*
* Reconstruction folds reflectors innermost-first (start from L, apply H(0), then
* H(1), ..., H(k-1); loop i = 0..k-1) via M := M - tau v (vᴴ M) — v conjugated
* only in the dot. The explicit (economy) Q is the trailing N columns of I_M
* carried through the SAME loop. A = Q * L is an EXACT identity for any general A.
*
* Sweep uses M >= N (k = N); zgeql2 is unblocked (zlarfg + zlarf), whose zlarf
* (zgemv/zgerc) reorders across storage order -> layout invariance is bit-exact
* only WITHIN a storage-order (col/row) family.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgeql2 from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const ROUTINE = 'zgeql2';
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

const PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 5, 3 ], [ 8, 4 ], [ 16, 7 ], [ 33, 17 ], [ 48, 20 ], [ 65, 40 ], [ 100, 33 ], [ 64, 33 ], [ 40, 16 ], [ 4, 1 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Reflector i in column j = N-k+i, pivot row p = M-k+i: v(r)=A(r,j) for r<p,
// 1 at r=p, 0 below.
function readVecs( Ard, M, N, k ) {
	const vs = [];
	let v, i, j, p, r;
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

// L(i,j) = A(i,j) iff i-j >= M-N.
function readL( Ard, M, N ) {
	const L = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( ( i - j ) >= ( M - N ) ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// Mtx := H·Mtx, H = I - tau·v·vᴴ: Mtx -= tau·v·(vᴴ·Mtx).
function applyH( Mtx, v, tau ) {
	const rows = Mtx.rows;
	const cols = Mtx.cols;
	let w, tw, c, r;
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

// Arec = Q·L = H(k)...H(1)·L: apply H(0) innermost then upward (i = 0..k-1).
function reconstruct( Ard, taus, M, N, k ) {
	const Mtx = readL( Ard, M, N );
	const vs = readVecs( Ard, M, N, k );
	let i;
	for ( i = 0; i < k; i++ ) {
		applyH( Mtx, vs[ i ], taus[ i ] );
	}
	return Mtx;
}

// Economy Q (M x N) = trailing N columns of I_M carried through the reflector loop.
function formQ( Ard, taus, M, N, k ) {
	const Q = new LogicalMatrix( sc, M, N );
	const vs = readVecs( Ard, M, N, k );
	let i, r, c;
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

function factor( M, N, layout ) {
	const k = Math.min( M, N );
	const rng = new RNG( 0x100 + ( M * 100 ) + N );
	const A0 = logical.general( sc, rng, M, N );
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	const Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
	const Wr = schemes.realizeVector( sc, poison( Math.max( 1, N ) ), TIGHT_VEC );
	zgeql2( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
	const taus = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		taus.push( Tr.read( i ) );
	}
	return { 'A': Ar, 'taus': taus, 'A0': A0, 'k': k };
}


// TESTS //

test( 'zgeql2: A = Q*L and QᴴQ = I ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			const f = factor( M, N, layout );
			const lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( f.A, f.taus, M, N, f.k ), f.A0, { 'label': lbl + ' A=Q*L' } );
			});
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, formQ( f.A, f.taus, M, N, f.k ), { 'label': lbl + ' Q' } );
			});
		});
	});
});

const VLAYOUTS = schemes.vectorLayouts();
const TAULAYOUTS = VLAYOUTS.filter( function pos( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
const colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zgeql2: bit-exact within storage-order family (col / row)', function t() {
	[ [ 12, 8 ], [ 20, 20 ], [ 17, 10 ], [ 33, 20 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ] );
	});
});

function runInvariance( variants, fam, M, N ) {
	const k = Math.min( M, N );
	const SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = schemes.realizeVector( sc, poison( k ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			const Wr = schemes.realizeVector( sc, poison( Math.max( 1, N ) ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			zgeql2( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}
