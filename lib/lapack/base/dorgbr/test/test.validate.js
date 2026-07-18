/**
* Property-based validation for dorgbr, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `or`/`gbr` -> BLOCKED formation of the
* orthogonal factor Q or Pᵀ from a bidiagonal reduction (dgebrd). dgebrd reduces a
* general M0-by-N0 matrix A0 to bidiagonal B by Qᵀ·A0·P = B, i.e. A0 = Q·B·Pᵀ,
* leaving the Householder reflectors (H for Q, G for P) in A0 and their scalar
* factors in TAUQ/TAUP. dorgbr CONSUMES that factorization:
*   - VECT='Q' (from TAUQ): forms Q. The original was M0-by-K, K = N0 (its column
*     count). If M0 >= K it delegates to dorgqr(M,N,K); if M0 < K it shifts the
*     reflectors one column right, seeds row/col 0 of the identity, and forms
*     Q(2:m,2:m) via dorgqr(M-1,M-1,M-1) — Q is then M0-by-M0.
*   - VECT='P' (from TAUP): forms Pᵀ. The original was K-by-N0, K = M0 (its row
*     count). If K < N0 it delegates to dorglq(M,N,K); if K >= N0 it shifts one row
*     down and forms Pᵀ(2:n,2:n) via dorglq(N-1,N-1,N-1) — Pᵀ is N0-by-N0.
*
* K convention (confirmed from dorgbr.f): VECT='Q' -> K = N0; VECT='P' -> K = M0.
*
* Oracles (INDEPENDENT of the reflector algebra):
*   (a) orthonormality — the formed Q has orthonormal columns and the formed Pᵀ has
*       orthonormal rows/cols (it is unitary/orthogonal, up to the economy shape);
*   (b) reconstruction — with BOTH Q and Pᵀ formed from the SAME dgebrd factor plus
*       the bidiagonal B (from d,e), A0 = Q · B · Pᵀ. This cross-checks dorgbr
*       against the reduction it inverts (mirrors the dgebrd A=Q·B·Pᵀ validation but
*       with dorgbr-FORMED Q and Pᵀ instead of hand-rolled reflector products).
*
* Because dorgbr returns Pᵀ directly (real: Pᵀ == Pᴴ), the complex ZLACGV
* conjugation subtlety is handled INTERNALLY by the zunglq/zgebrd pair — the
* reconstruction uses Pᵀ with NO manual conjugation (real dgebrd is unaffected
* either way).
*
* Economy shapes used here (mn = min(M0,N0)):
*   upper (M0>=N0): Q is M0-by-N0 (dorgqr(M0,N0,N0)); Pᵀ is N0-by-N0
*                   (dorgbr('P',N0,N0,M0)); B core is N0-by-N0 UPPER bidiagonal.
*   lower (M0<N0):  Q is M0-by-M0 (dorgbr('Q',M0,M0,N0)); Pᵀ is M0-by-N0
*                   (dorglq(M0,N0,M0)); B core is M0-by-M0 LOWER bidiagonal.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { matmul as refMatmul } from '../../../../../test/harness/reference.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dorgbr from './../lib/ndarray.js';
import dgebrd from '../../dgebrd/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32; // hardcoded default block size in the org/gebrd kernels


// SIZE SWEEP (original M0,N0) //

// Squares from SIZES_SMALL (incl. the blocked 33, 64) + BOTH orientations of
// rectangulars (M0>=N0 -> upper bidiagonal; M0<N0 -> lower).
const PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 8, 3 ], [ 17, 8 ], [ 33, 17 ], [ 64, 20 ], [ 40, 33 ],
	[ 3, 8 ], [ 8, 17 ], [ 17, 33 ], [ 20, 64 ], [ 33, 40 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );

const ALL_LAYOUTS = schemes.dense.layouts();
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
const VEC_LAYOUTS = schemes.vectorLayouts();
const WORK_LAYOUTS = [ { 'stride': 1, 'lead': 0, 'tail': 0 }, { 'stride': 1, 'lead': 3, 'tail': 2 }, { 'stride': 1, 'lead': 1, 'tail': 0 }, { 'stride': 1, 'lead': 5, 'tail': 4 } ];


// HELPERS //

// dgebrd WORK (blocked path needs (M+N)*NB; unblocked needs max(M,N)).
function workLenBrd( M, N ) {
	return Math.max( 1, ( M + N ) * NB, M, N );
}

// A generously-sized WORK for a dorgbr call of shape (Mo,No): the internal blocked
// dorgqr/dorglq needs at most max(Mo,No)*NB, so (Mo+No)*NB never under-counts.
function workLenOrg( Mo, No ) {
	return Math.max( 1, ( Mo + No ) * NB );
}

// Poisoned (NaN) vector of `sc` scalars (reflectors / tauq / taup).
function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Poisoned REAL vector (d / e are always real).
function poisonR( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

// Read a Mr-by-Nr sub-block out of physical storage into a LogicalMatrix.
function readBlock( Ar, Mr, Nr ) {
	const F = new LogicalMatrix( sc, Mr, Nr );
	let i, j;
	for ( j = 0; j < Nr; j++ ) {
		for ( i = 0; i < Mr; i++ ) {
			F.set( i, j, Ar.read( i, j ) );
		}
	}
	return F;
}

// Conjugate-transpose of a LogicalMatrix (for row-orthonormality of a wide factor).
function ctranspose( Mtx ) {
	const T = new LogicalMatrix( sc, Mtx.cols, Mtx.rows );
	let i, j;
	for ( i = 0; i < Mtx.rows; i++ ) {
		for ( j = 0; j < Mtx.cols; j++ ) {
			T.set( j, i, sc.conj( Mtx.get( i, j ) ) );
		}
	}
	return T;
}

// Build the mn-by-mn bidiagonal core: diag = d; upper -> super-diag = e, lower ->
// sub-diag = e.
function buildB( dvals, evals, mn, upper ) {
	const B = new LogicalMatrix( sc, mn, mn );
	let i;
	for ( i = 0; i < mn; i++ ) {
		B.set( i, i, sc.fromReal( dvals[ i ] ) );
	}
	for ( i = 0; i < mn - 1; i++ ) {
		if ( upper ) {
			B.set( i, i + 1, sc.fromReal( evals[ i ] ) );
		} else {
			B.set( i + 1, i, sc.fromReal( evals[ i ] ) );
		}
	}
	return B;
}

// Assert a (possibly rectangular) factor is semi-orthonormal: check the side whose
// vectors are independent (columns if tall/square, rows if wide).
function assertOrtho( Mtx, label ) {
	if ( Mtx.rows >= Mtx.cols ) {
		check.assertOrthonormal( sc, Mtx, { 'label': label } );
	} else {
		check.assertOrthonormal( sc, ctranspose( Mtx ), { 'label': label + ' (rows)' } );
	}
}

// dorgbr call-shape (Mo,No,Ko) for forming Q from an (M0,N0) dgebrd factor.
function qShape( M0, N0 ) {
	if ( M0 >= N0 ) {
		return { 'Mo': M0, 'No': N0, 'Ko': N0 }; // economy Q (M0-by-N0)
	}
	return { 'Mo': M0, 'No': M0, 'Ko': N0 }; // square Q (M0-by-M0)
}

// dorgbr call-shape (Mo,No,Ko) for forming Pᵀ from an (M0,N0) dgebrd factor.
function pShape( M0, N0 ) {
	if ( M0 >= N0 ) {
		return { 'Mo': N0, 'No': N0, 'Ko': M0 }; // Pᵀ (N0-by-N0)
	}
	return { 'Mo': M0, 'No': N0, 'Ko': M0 }; // economy Pᵀ (M0-by-N0)
}


// DRIVER: freeze one dgebrd factorization at tight col-major. //

function freezeFactor( M0, N0, seed ) {
	const mn = Math.min( M0, N0 );
	const rng = new RNG( seed );
	const A0 = logical.general( sc, rng, M0, N0 );
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	const Dr = schemes.realizeVector( S.real, poisonR( mn ), TIGHT_VEC );
	const Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), TIGHT_VEC );
	const Qr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	const Pr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	const Wr = schemes.realizeVector( sc, poison( workLenBrd( M0, N0 ) ), TIGHT_VEC );

	dgebrd( M0, N0, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

	const dvals = [];
	const evals = [];
	const tauq = [];
	const taup = [];
	let i;
	for ( i = 0; i < mn; i++ ) {
		dvals.push( Dr.read( i ) );
		tauq.push( Qr.read( i ) );
		taup.push( Pr.read( i ) );
	}
	for ( i = 0; i < mn - 1; i++ ) {
		evals.push( Er.read( i ) );
	}
	return {
		'A0': A0,
		'Frozen': readBlock( Ar, M0, N0 ),
		'dvals': dvals,
		'evals': evals,
		'tauq': tauq,
		'taup': taup,
		'mn': mn
	};
}

// Form Q (or Pᵀ) by re-realizing the frozen reflectors + tau at the given layout
// and running ONLY dorgbr.
function formFactor( vect, F, M0, N0, layout, tauLayout, workLayout ) {
	const sh = ( vect === 'apply-Q' ) ? qShape( M0, N0 ) : pShape( M0, N0 );
	const tau = ( vect === 'apply-Q' ) ? F.tauq : F.taup;
	const Ar = schemes.dense.realize( sc, F.Frozen, { 'part': 'full' }, layout );
	const Tr = schemes.realizeVector( sc, tau, tauLayout || TIGHT_VEC );
	const Wr = schemes.realizeVector( sc, poison( workLenOrg( sh.Mo, sh.No ) ), workLayout || TIGHT_VEC );
	dorgbr( vect, sh.Mo, sh.No, sh.Ko, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
	return readBlock( Ar, sh.Mo, sh.No );
}


// Steps 2/3/5: orthonormality of Q and Pᵀ + reconstruction A0 = Q·B·Pᵀ across the
// (M0,N0) sweep (upper + lower) and every dense storage layout.
test( 'dorgbr: Q,Pᵀ orthonormal and A0 = Q·B·Pᵀ ((M0,N0) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M0 = pr[ 0 ];
		const N0 = pr[ 1 ];
		const upper = ( M0 >= N0 );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			const F = freezeFactor( M0, N0, 0x100 + ( M0 * 100 ) + N0 );
			const label = 'dorgbr M0=' + M0 + ' N0=' + N0 + ' (' + ( upper ? 'upper' : 'lower' ) + ') layout=' + li;

			const Q = formFactor( 'apply-Q', F, M0, N0, layout, null, null );
			const Pt = formFactor( 'apply-P', F, M0, N0, layout, null, null );

			checked( 'dorgbr', 'orthonormal', function run() {
				assertOrtho( Q, label + ' Q' );
			} );
			checked( 'dorgbr', 'orthonormal', function run() {
				assertOrtho( Pt, label + ' Pᵀ' );
			} );

			const B = buildB( F.dvals, F.evals, F.mn, upper );
			const recon = refMatmul( sc, refMatmul( sc, Q, B, {} ), Pt, {} );
			checked( 'dorgbr', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, F.A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 4 (L3): layout invariance on the BLOCKED path. Freeze the factor ONCE, then
// re-realize the frozen reflectors + tau at each storage layout and run ONLY
// dorgbr. dlarft/dlarfb -> dgemm/dtrmm pick their summation form from operand
// strides, so assert BIT-EXACTNESS only WITHIN a storage-order family (col / row);
// offset, leading-dim padding, and stride sign are still fuzzed. tau layouts vary
// in parallel; WORK is generously sized (the kernels hardcode NB and do not adapt,
// so WORK size never changes arithmetic).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'dorgbr: bit-exact within storage-order family (col / row), Q + Pᵀ, upper + lower', function t() {
	// 40x36 (upper) and 36x40 (lower): every sub-call lands on the blocked path
	// (its effective K > NB=32).
	[ [ 40, 36 ], [ 36, 40 ] ].forEach( function eachShape( pr ) {
		const M0 = pr[ 0 ];
		const N0 = pr[ 1 ];
		const tag = ( M0 >= N0 ) ? 'upper' : 'lower';
		const F = freezeFactor( M0, N0, 0xF00D + M0 + N0 );
		[ 'apply-Q', 'apply-P' ].forEach( function eachVect( vect ) {
			runFamily( colLayouts, 'col', F, M0, N0, vect, tag );
			runFamily( rowLayouts, 'row', F, M0, N0, vect, tag );
		} );
	} );

	function runFamily( variants, fam, F, M0, N0, vect, tag ) {
		const vlab = ( vect === 'apply-Q' ) ? 'Q' : 'Pᵀ';
		checked( 'dorgbr', 'layout-invariance', function run() {
			layoutInvariant( variants, function build( layout, i ) {
				const G = formFactor( vect, F, M0, N0, layout, VEC_LAYOUTS[ i % VEC_LAYOUTS.length ], WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );
				return check.flattenLogical( sc, G );
			}, { 'label': 'dorgbr layout invariance ' + fam + '-major ' + vlab + ' ' + tag + ' (M0=' + M0 + ' N0=' + N0 + ')' } );
		} );
	}
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). dorgbr's wrapper
// advertises a WORK minimum, but it delegates to the BLOCKED dorgqr/dorglq, which
// store the block-reflector T factor + dlarfb scratch in WORK (need ~dim*NB). If
// the guard under-advertises, a poisoned buffer at the advertised minimum leaks NaN
// into the formed factor. Derive the advertised minimum from the wrapper's own
// throw boundary, run at exactly that length with a poisoned buffer on the BLOCKED
// path, and require finite output AND orthonormality.
test( 'dorgbr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	// Each case forces its sub-call onto the blocked path (effective K > NB=32).
	[
		{ 'M0': 80, 'N0': 64, 'vect': 'apply-Q' }, // upper Q -> dorgqr(80,64,64)
		{ 'M0': 64, 'N0': 80, 'vect': 'apply-Q' }, // lower Q -> dorgqr(63,63,63)
		{ 'M0': 64, 'N0': 80, 'vect': 'apply-P' }, // lower Pᵀ -> dorglq(64,80,64)
		{ 'M0': 80, 'N0': 64, 'vect': 'apply-P' }  // upper Pᵀ -> dorglq(63,63,63)
	].forEach( function eachCase( cs ) {
		const M0 = cs.M0;
		const N0 = cs.N0;
		const vect = cs.vect;
		const vlab = ( vect === 'apply-Q' ) ? 'Q' : 'Pᵀ';
		const label = 'dorgbr WORK-min ' + vlab + ' M0=' + M0 + ' N0=' + N0;
		const sh = ( vect === 'apply-Q' ) ? qShape( M0, N0 ) : pShape( M0, N0 );
		const F = freezeFactor( M0, N0, 0xB10C + ( M0 * 7 ) + N0 );

		function run( len ) {
			const Ar = schemes.dense.realize( sc, F.Frozen, { 'part': 'full' }, null );
			const Tr = schemes.realizeVector( sc, ( vect === 'apply-Q' ) ? F.tauq : F.taup, TIGHT_VEC );
			const Wo = poisonedWork( sc, len );
			dorgbr( vect, sh.Mo, sh.No, sh.Ko, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readBlock( Ar, sh.Mo, sh.No ) );
		}
		const minLen = assertWorkspaceSufficient( run, {}, label );

		// Orthonormality must still hold at exactly the advertised minimum.
		const Ar = schemes.dense.realize( sc, F.Frozen, { 'part': 'full' }, null );
		const Tr = schemes.realizeVector( sc, ( vect === 'apply-Q' ) ? F.tauq : F.taup, TIGHT_VEC );
		const Wo = poisonedWork( sc, minLen );
		dorgbr( vect, sh.Mo, sh.No, sh.Ko, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
		assertOrtho( readBlock( Ar, sh.Mo, sh.No ), label + ' (WORK=' + minLen + ')' );
	} );
} );
