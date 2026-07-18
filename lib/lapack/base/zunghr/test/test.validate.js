/**
* Property-based validation for zunghr, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `un`/`ghr` -> BLOCKED formation of
* the unitary factor Q (N×N) from the Householder reflectors that `zgehrd` leaves
* below the first subdiagonal of A (with TAU). zunghr CONSUMES that factorization:
* on input A holds the reflectors as returned by zgehrd; on output A is overwritten
* with the N×N unitary Q = H(ilo)…H(ihi-1). The oracles are the SAME as zgehrd's:
* (a) the columns of Q are orthonormal/unitary (QᴴQ = I), and (b) the Hessenberg
* reconstruction A0 = Q·H·Qᴴ holds, where H is the upper-Hessenberg part zgehrd
* left in A. This is an exact algebraic identity for ANY general A0, so plain
* random A0 suffices at every N. ILO/IHI are 1-BASED; we validate the full
* reduction ilo=1, ihi=N.
*
* Internally zunghr shifts the reflectors one column right and calls the BLOCKED
* zungqr(nh,nh,nh) (nh = ihi-ilo) on the trailing submatrix; the storage col<->row
* flip legitimately reorders those zgemm/ztrmm sums, so layout invariance is
* asserted bit-exact only WITHIN a storage-order family and cross-order
* correctness is certified by the property sweep over all layouts. WORK is
* caller-owned; the wrapper advertises `nh*NB` (NB=32) — Step 4c probes that the
* advertised minimum actually suffices under a poisoned buffer on the blocked path.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zunghr from './../lib/ndarray.js';
import zgehrd from '../../zgehrd/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32; // hardcoded block size in the wrappers
const LDT = 65; // NBMAX+1 leading dim of the gehrd block reflector T

const SIZES = SIZES_SMALL; // 1,2,3,5,8,16,17,33,64 (33/64 straddle+clear the block threshold)

const ALL_LAYOUTS = schemes.dense.layouts();
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// WORK zgehrd needs (full reduction ilo=1,ihi=N): blocked N*NB + LDT*NB, else N.
function gehrdWork( N ) {
	return ( N > NB ) ? ( ( N * NB ) + ( LDT * NB ) ) : Math.max( 1, N );
}

// WORK zunghr advertises: nh*NB (nh = ihi-ilo = N-1 here), else 1.
function orghrWork( N ) {
	return Math.max( 1, ( N - 1 ) * NB );
}

function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Upper Hessenberg part of the factored A as an N×N matrix H (i <= j+1 copied,
// below the subdiagonal exact zero).
function readH( Ard, N ) {
	const Hm = new LogicalMatrix( sc, N, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Hm.set( i, j, ( i <= j + 1 ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return Hm;
}

function readFull( Ard, rows, cols ) {
	const F = new LogicalMatrix( sc, rows, cols );
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

function readTaus( Tr, k ) {
	const taus = [];
	let ti;
	for ( ti = 0; ti < k; ti++ ) {
		taus.push( Tr.read( ti ) );
	}
	return taus;
}


// Steps 2/3/5: unitarity (QᴴQ = I) AND Hessenberg reconstruction (A0 = Q·H·Qᴴ)
// across the N sweep (blocked and unblocked) and every dense layout, at
// backward-error tolerance.
test( 'zunghr: QᴴQ = I and A = Q*H*Qᴴ (N sweep x all layouts)', function t() {
	SIZES.forEach( function eachN( N ) {
		const k = Math.max( 0, N - 1 );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			const rng = new RNG( 0x100 + N );
			const A0 = logical.general( sc, rng, N, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			const Wf = schemes.realizeVector( sc, poison( gehrdWork( N ) ), TIGHT_VEC );

			// Factor: A <- reflectors + H.
			zgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );

			// Save H BEFORE zunghr overwrites A with Q.
			const Hm = readH( Ar, N );

			// Form Q in place: A <- Q (N x N).
			const Wo = schemes.realizeVector( sc, poison( orghrWork( N ) ), TIGHT_VEC );
			zunghr( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );

			const Q = readFull( Ar, N, N );
			const label = 'zunghr N=' + N + ' layout=' + li;

			checked( 'zunghr', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );

			const recon = ref.matmul( sc, ref.matmul( sc, Q, Hm ), Q, { 'transb': 'c' } );
			checked( 'zunghr', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 3: layout invariance. Freeze the zgehrd factor (reflectors + TAU) ONCE at
// a tight col-major layout, then re-realize those FIXED reflectors + TAU at each
// storage layout and run ONLY zunghr. The blocked zungqr(nh,nh,nh) inner
// zgemm/ztrmm reorders across the col<->row flip, so assert BIT-EXACTNESS only
// WITHIN a storage-order family (col / row); offset, leading-dim padding and
// stride sign are still fuzzed. TAU/WORK vector layouts vary in parallel (WORK
// stride 1: the block reflector T uses a hardcoded internal leading dim, so only
// its base offset is free).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const TAU_LAYOUTS = schemes.vectorLayouts();
const WORK_LAYOUTS = schemes.vectorLayouts().filter( function tight( L ) {
	return L.stride === 1;
} );

test( 'zunghr: bit-exact within storage-order family (col / row), blocked', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	const N = 64; // nh = 63 > NB=32 -> blocked (zlarft/zlarfb reached)
	const k = N - 1;
	const SEED = 0xF00D;

	// Freeze the factorization once (tight col-major).
	const rng = new RNG( SEED );
	const A0 = logical.general( sc, rng, N, N );
	const Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	const Tf = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
	const Wf = schemes.realizeVector( sc, poison( gehrdWork( N ) ), TIGHT_VEC );
	zgehrd( N, 1, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], Tf.data, Tf.args[ 0 ], Tf.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );
	const Frozen = readFull( Af, N, N );
	const taus = readTaus( Tf, k );

	checked( 'zunghr', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, layout );
			const Tr = schemes.realizeVector( sc, taus, TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			const Wo = schemes.realizeVector( sc, poison( orghrWork( N ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );
			zunghr( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, N, N ) );
		}, { 'label': 'zunghr layout invariance ' + fam + '-major (blocked N=' + N + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). zunghr forms Q
// via the blocked zungqr(nh,nh,nh), which stores the block-reflector T factor
// (leading dim nh) plus zlarfb scratch in the caller-provided WORK. Derive the
// advertised minimum from the wrapper's own throw boundary, then run at exactly
// that length with a POISONED WORK on the BLOCKED path (N=64, nh=63 > NB) and
// require finite Q (no NaN leak past WORK) AND unitarity.
test( 'zunghr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ 64, 100 ].forEach( function eachN( N ) {
		const k = N - 1;
		const SEED = 0xB10C + N;
		const label = 'zunghr WORK-min N=' + N;

		// Freeze one deterministic factorization; zunghr is then run per WORK length.
		const rng = new RNG( SEED );
		const A0 = logical.general( sc, rng, N, N );
		const Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
		const Tf = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
		const Wf = schemes.realizeVector( sc, poison( gehrdWork( N ) ), TIGHT_VEC );
		zgehrd( N, 1, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], Tf.data, Tf.args[ 0 ], Tf.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );
		const Frozen = readFull( Af, N, N );
		const taus = readTaus( Tf, k );

		function run( len ) {
			const Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, null );
			const Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
			const Wo = poisonedWork( sc, len );
			zunghr( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, N, N ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		// The blocked path must actually have been taken (nh > NB).
		if ( N - 1 <= NB ) {
			throw new Error( label + ': case is not on the blocked path (nh<=NB); pick larger N' );
		}

		// Unitarity must still hold at exactly the advertised minimum.
		const Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, null );
		const Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
		zunghr( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, minLen ), 1, 0 );
		check.assertOrthonormal( sc, readFull( Ar, N, N ), { 'label': label + ' (WORK=' + minLen + ') Q' } );
	} );
} );
