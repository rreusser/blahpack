/**
* Property-based validation for dorgtr, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `or`/`gtr` -> formation of the
* orthogonal factor Q (N x N) from the N-1 Householder reflectors that `dsytrd`
* leaves in one triangle of A (with tau in TAU) when it reduces a real symmetric
* matrix to tridiagonal form (`Qᵀ·A·Q = T`). dorgtr CONSUMES that factorization:
* on input A holds the reflectors, on output A is overwritten with the N x N
* orthogonal Q. Internally it shifts the reflectors one column and calls the
* BLOCKED dorgql (uplo='upper') or dorgqr (uplo='lower') on the (N-1)x(N-1)
* leading/trailing submatrix.
*
* Oracles (INDEPENDENT of the reflector algebra): (a) the columns of Q are
* orthonormal (QᵀQ = I), and (b) the reduction reconstructs, A0 = Q·T·Qᵀ, where
* T is the real symmetric tridiagonal built from the d/e that dsytrd returned.
* Both hold exactly for any symmetric A0, so a plain random symmetric A suffices
* at every N; the N sweep straddles the sub-kernel's NB=32 block threshold
* (33/64/100) so both the unblocked and blocked paths of dorgql/dorgqr run.
*
* WORK is caller-owned: the blocked sub-kernel stores the block-reflector T factor
* (leading dim N-1) + dlarfb scratch in it, so Step 4c probes that the wrapper's
* advertised minimum actually suffices under a poisoned buffer.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dorgtr from './../lib/ndarray.js';
import dsytrd from '../../dsytrd/lib/ndarray.js';

const sc = S.real; // d-routine
const RE = S.real; // d, e, TAU are real for a d-routine
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32; // hardcoded block size in the dorgql/dorgqr sub-kernels

const UPLO = [ 'upper', 'lower' ];
const SWEEP = SIZES_SMALL.concat( [ 100 ] ); // 33/64/100 exercise the blocked path
const ALL_LAYOUTS = schemes.dense.layouts();
const VEC_LAYOUTS = schemes.vectorLayouts();
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

function poisonReal( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

// Generous WORK superset covering the blocked sub-kernel ((N-1)*NB) and the
// unblocked tail; used everywhere except the Step-4c minimum probe.
function workLen( N ) {
	return Math.max( 1, ( N - 1 ) * NB );
}

// Read the full N x N matrix out of physical storage into a LogicalMatrix.
function readFull( Ard, N ) {
	const F = new LogicalMatrix( sc, N, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

// Capture the referenced triangle of a dsytrd-factored A (reflectors + diag) into
// a LogicalMatrix, opposite triangle zeroed, so it can be re-realized per layout.
function freezeFactor( Ard, N, uplo ) {
	const F = new LogicalMatrix( sc, N, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, Ard.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

function buildT( dvals, evals, N ) {
	const T = new LogicalMatrix( sc, N, N );
	let i;
	for ( i = 0; i < N; i++ ) {
		T.set( i, i, sc.fromReal( dvals[ i ] ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		T.set( i + 1, i, sc.fromReal( evals[ i ] ) );
		T.set( i, i + 1, sc.fromReal( evals[ i ] ) );
	}
	return T;
}

// Factor a symmetric A (realized as Ar, {part:uplo}) with dsytrd. Returns the
// d/e/tau it produced (Ar is left holding the reflectors). dsytrd allocates its
// own WORK internally (no caller WORK argument).
function factor( uplo, N, Ar, dR, eR, tauR ) {
	dsytrd(
		uplo, N,
		Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ],
		dR.data, dR.args[ 0 ], dR.args[ 1 ],
		eR.data, eR.args[ 0 ], eR.args[ 1 ],
		tauR.data, tauR.args[ 0 ], tauR.args[ 1 ]
	);
	const dvals = [];
	const evals = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		dvals.push( dR.read( i ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		evals.push( eR.read( i ) );
	}
	return { 'dvals': dvals, 'evals': evals };
}


// Steps 2/3/5: orthonormality (QᵀQ = I) AND reduction reconstruction
// (A0 = Q·T·Qᵀ) across uplo x N (SIZES_SMALL + 100, straddling the sub-kernel's
// NB=32) x every dense storage layout, at backward-error tolerance. dsytrd factors
// then dorgtr forms Q in place; d/e/TAU vector layouts are fuzzed in parallel.
test( 'dorgtr: QᵀQ = I and A0 = Q·T·Qᵀ (uplo x N x all layouts, blocked+unblocked)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SWEEP.forEach( function eachN( N ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				const rng = new RNG( 0x100 + ( N * 10 ) + ( uplo === 'upper' ? 1 : 2 ) );
				const A0 = logical.symmetric( sc, rng, N );
				const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				const dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ li % VEC_LAYOUTS.length ] );
				const eR = schemes.realizeVector( RE, poisonReal( Math.max( N - 1, 0 ) ), VEC_LAYOUTS[ ( li + 1 ) % VEC_LAYOUTS.length ] );
				const tauR = schemes.realizeVector( RE, poisonReal( Math.max( N - 1, 0 ) ), VEC_LAYOUTS[ ( li + 2 ) % VEC_LAYOUTS.length ] );

				const out = factor( uplo, N, Ar, dR, eR, tauR );

				// Form Q in place: A <- Q (N x N).
				const Wo = schemes.realizeVector( RE, poisonReal( workLen( N ) ), TIGHT_VEC );
				dorgtr( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], tauR.data, tauR.args[ 0 ], tauR.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );

				const Q = readFull( Ar, N );
				const label = 'dorgtr ' + uplo + ' N=' + N + ' layout=' + li;

				checked( 'dorgtr', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				} );

				const T = buildT( out.dvals, out.evals, N );
				const recon = ref.matmul( sc, ref.matmul( sc, Q, T ), Q, { 'transb': 't' } );
				checked( 'dorgtr', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'factor': 100, 'label': label } );
				} );
			} );
		} );
	} );
} );


// Step 3: layout invariance. Freeze the dsytrd factor (reflectors + tau) ONCE at a
// tight layout, then re-realize those FIXED reflectors + tau per storage layout and
// run ONLY dorgtr; assert BIT-EXACT output WITHIN a storage-order family (col /
// row). The blocked sub-kernel's dlarfb (dgemm/dtrmm) picks its summation form from
// operand strides, so cross-order equality is not expected (it is certified by the
// property sweep over all layouts above).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'dorgtr: bit-exact within storage-order family (col / row)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( colLayouts, 'col', uplo );
		runInvariance( rowLayouts, 'row', uplo );
	} );
} );

function runInvariance( variants, fam, uplo ) {
	const N = 48; // N-1 = 47 > NB=32 -> BLOCKED sub-kernel
	const SEED = 0xF00D;

	// Freeze the factorization once (tight col-major).
	const rng = new RNG( SEED );
	const A0 = logical.symmetric( sc, rng, N );
	const Af = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
	const dF = schemes.realizeVector( RE, poisonReal( N ), TIGHT_VEC );
	const eF = schemes.realizeVector( RE, poisonReal( N - 1 ), TIGHT_VEC );
	const tF = schemes.realizeVector( RE, poisonReal( N - 1 ), TIGHT_VEC );
	factor( uplo, N, Af, dF, eF, tF );
	const Frozen = freezeFactor( Af, N, uplo );
	const taus = [];
	let ti;
	for ( ti = 0; ti < N - 1; ti++ ) {
		taus.push( tF.read( ti ) );
	}

	checked( 'dorgtr', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const Ar = schemes.dense.realize( sc, Frozen, { 'part': uplo }, layout );
			const Tr = schemes.realizeVector( RE, taus, VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
			const Wo = schemes.realizeVector( RE, poisonReal( workLen( N ) ), TIGHT_VEC );
			dorgtr( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, N ) );
		}, { 'label': 'dorgtr ' + uplo + ' layout invariance ' + fam + '-major (N=' + N + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). dorgtr forwards
// the caller WORK straight to the BLOCKED dorgql/dorgqr, which store the
// block-reflector T factor (leading dim N-1) + dlarfb scratch in it — far more than
// the unblocked `max(1, N-1)`. Derive the advertised minimum from the wrapper's own
// throw boundary, then run at exactly that length with a POISONED WORK on the
// blocked path (N=64, N-1=63 > NB) and require finite Q (no NaN leak) AND
// orthonormality.
test( 'dorgtr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		const N = 64; // N-1 = 63 > NB=32 -> blocked
		const SEED = 0xB10C;
		const label = 'dorgtr WORK-min ' + uplo + ' N=' + N;

		// Freeze one deterministic factorization; dorgtr is then run per WORK length.
		const rng = new RNG( SEED );
		const A0 = logical.symmetric( sc, rng, N );
		const Af = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
		const dF = schemes.realizeVector( RE, poisonReal( N ), TIGHT_VEC );
		const eF = schemes.realizeVector( RE, poisonReal( N - 1 ), TIGHT_VEC );
		const tF = schemes.realizeVector( RE, poisonReal( N - 1 ), TIGHT_VEC );
		factor( uplo, N, Af, dF, eF, tF );
		const Frozen = freezeFactor( Af, N, uplo );
		const taus = [];
		let ti;
		for ( ti = 0; ti < N - 1; ti++ ) {
			taus.push( tF.read( ti ) );
		}

		// `run(len)`: form Q with a poisoned WORK of `len`, return flat Q components.
		// Throws the wrapper RangeError below its advertised minimum.
		function run( len ) {
			const Ar = schemes.dense.realize( sc, Frozen, { 'part': uplo }, null );
			const Tr = schemes.realizeVector( RE, taus, TIGHT_VEC );
			const Wo = poisonedWork( sc, len );
			dorgtr( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, N ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		// Orthonormality must still hold at exactly that advertised minimum.
		const Ar = schemes.dense.realize( sc, Frozen, { 'part': uplo }, null );
		const Tr = schemes.realizeVector( RE, taus, TIGHT_VEC );
		const Wo = poisonedWork( sc, minLen );
		dorgtr( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
		check.assertOrthonormal( sc, readFull( Ar, N ), { 'label': label + ' (WORK=' + minLen + ') Q' } );
	} );
} );
