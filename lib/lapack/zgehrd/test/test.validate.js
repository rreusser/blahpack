/**
* Property-based validation for zgehrd, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `hrd` (BLOCKED reduction to upper Hessenberg
* by Householder reflections) -> reconstruction A0 = Q*H*Qᴴ AND orthonormality
* (unitarity) QᴴQ = I.
*
* zgehrd reduces a general N×N matrix A to upper Hessenberg form H by a unitary
* similarity transformation Qᴴ·A·Q = H, i.e. A = Q·H·Qᴴ. It stores EXACTLY the same
* result as the unblocked dgehd2: the upper triangle + first subdiagonal of A is H;
* below the first subdiagonal, together with TAU, encodes Q as a product of
* elementary reflectors H(ilo)…H(ihi-1). ilo/ihi are 1-BASED. We validate the full
* reduction ilo=1, ihi=N.
*
* Reflector t (0-based, t = 0 … N-2) is stored in column t: v[0..t] = 0,
* v[t+1] = 1 (implicit), v[t+2..N-1] = A(t+2:N-1, t); tau = TAU(t). H_t = I −
* tau_t·v_t·v_tᴴ and Q = H_0·…·H_{N-2}. The reconstruction and orthonormality
* oracles are IDENTICAL to dgehd2's — only the internal path differs (dlahr2 panel
* + dgemm/dtrmm/dlarfb block update). A = Q·H·Qᴴ is an EXACT algebraic identity for
* ANY general A.
*
* The block size is ILAENV's NB = 32 (shrunk to fit WORK, as in the reference) with
* the block reflector T stored in the TSIZE part of WORK at LDT = 65; given the
* optimal WORK, the blocked path is taken once the loop bound `ihi-1-NX >= ilo` holds,
* with ILAENV's crossover NX = 128 (full reduction: N >= 130). The sweep includes
* 33/64/100 (unblocked) and 140 (blocked) to straddle and clear that threshold.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgehrd from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32; // ILAENV( 1, 'ZGEHRD', ... )
const NX = 128; // ILAENV( 3, 'ZGEHRD', ... ): the crossover point
const TSIZE = 4160; // LDT*NBMAX = 65*64, the T part of WORK (lib/base.js)

const SIZES = SIZES_SMALL.concat( [ 100, 140 ] ); // 1,2,3,5,8,16,17,33,64,100,140

const ALL_LAYOUTS = schemes.dense.layouts();
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// The reference's optimal WORK length (LWKOPT = N*NB + TSIZE), which keeps
// zgehrd on the blocked path for full reductions with NH = N > NX + 1.
function workLen( N ) {
	return ( N * NB ) + TSIZE;
}

function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Upper Hessenberg part of the factored A as N×N matrix H (i <= j+1 copied, below
// the subdiagonal zero).
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

// k = N-1 Householder vectors (length N), full reduction.
function readVecs( Ard, N ) {
	const vs = [];
	let v, t, r;
	for ( t = 0; t < N - 1; t++ ) {
		v = new Array( N );
		for ( r = 0; r < N; r++ ) {
			if ( r <= t ) {
				v[ r ] = sc.zero;
			} else if ( r === t + 1 ) {
				v[ r ] = sc.one;
			} else {
				v[ r ] = Ard.read( r, t );
			}
		}
		vs.push( v );
	}
	return vs;
}

// Mtx := H·Mtx where H = I − tau·v·vᴴ.
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

// Q (N×N) = H_0·…·H_{N-2}.
function formQ( Ard, taus, N ) {
	const Q = new LogicalMatrix( sc, N, N );
	const vs = readVecs( Ard, N );
	let t, i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	for ( t = N - 2; t >= 0; t-- ) {
		applyH( Q, vs[ t ], taus[ t ] );
	}
	return Q;
}

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

function readTaus( Tr, k ) {
	const taus = [];
	let ti;
	for ( ti = 0; ti < k; ti++ ) {
		taus.push( Tr.read( ti ) );
	}
	return taus;
}


// Steps 2/3/5: reconstruction (A0 = Q·H·Qᴴ) AND orthonormality (QᴴQ = I) across
// the N sweep (blocked and unblocked) and every dense layout, at backward-error
// tolerance.
test( 'zgehrd: A = Q*H*Qᴴ and QᴴQ = I (N sweep x all layouts)', function t() {
	SIZES.forEach( function eachN( N ) {
		const k = Math.max( 0, N - 1 );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			const rng = new RNG( 0x100 + N );
			const A0 = logical.general( sc, rng, N, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			const Wr = schemes.realizeVector( sc, poison( workLen( N ) ), schemes.unitStride( TIGHT_VEC ) );

			zgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			const taus = readTaus( Tr, k );
			const label = 'zgehrd N=' + N + ' layout=' + li;

			const Hm = readH( Ar, N );
			const Q = formQ( Ar, taus, N );

			checked( 'zgehrd', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );

			const recon = ref.matmul( sc, ref.matmul( sc, Q, Hm ), Q, { 'transb': 'c' } );
			checked( 'zgehrd', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz on the BLOCKED path (N=140 > NX + 1, so
// dlahr2/dgemm/dtrmm/dlarfb are all reached). dgemm/dgemv/dger reorder across the
// col<->row storage flip, so assert BIT-EXACTNESS only WITHIN a storage-order
// family. TAU vector layout is fuzzed in parallel; WORK stays tight (the blocked
// scratch uses a hardcoded internal leading dim, so only its base offset is a free
// knob — stride must be 1) and positive-offset.
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

test( 'zgehrd: bit-exact within storage-order family (col / row), blocked', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	const N = 140; // > NX + 1 -> blocked path (dlahr2/dgemm/dtrmm/dlarfb reached)
	const k = N - 1;
	const SEED = 0xF00D;
	checked( 'zgehrd', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, N, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = schemes.realizeVector( sc, poison( k ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			const Wr = schemes.realizeVector( sc, poison( workLen( N ) ), schemes.unitStride( WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] ) );

			zgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			const flat = check.flattenLogical( sc, readFull( Ar, N ) );
			let ti;
			for ( ti = 0; ti < k; ti++ ) {
				flat.push.apply( flat, sc.components( Tr.read( ti ) ) );
			}
			return flat;
		}, { 'label': 'zgehrd layout invariance ' + fam + '-major (blocked N=' + N + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE. base.js sizes its block from the WORK it is
// given (shrinking NB, or falling back to zgehd2, as ZGEHRD does), so the
// reference minimum max(1,N) must suffice past the blocking threshold. Derive
// the advertised minimum from the wrapper's own throw boundary, run at exactly
// that length with a POISONED WORK, and require finite output (no NaN leak from
// reading past WORK) AND reconstruction.
test( 'zgehrd: advertised WORK minimum suffices past the blocking threshold (Step 4c)', function t() {
	[ 140, 160 ].forEach( function eachN( N ) {
		const k = N - 1;
		const SEED = 0xB10C + N;
		const label = 'zgehrd WORK-min N=' + N;

		function run( len ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, N, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			const Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			const Wr = poisonedWork( sc, len );
			zgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, N ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		// The case must be past the blocking threshold.
		if ( N <= NX + 1 ) {
			throw new Error( label + ': case is below the blocking threshold (N<=NX+1); pick larger N' );
		}

		// Reconstruction must still hold at exactly the advertised minimum.
		const rng = new RNG( SEED );
		const A0 = logical.general( sc, rng, N, N );
		const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
		const Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
		const Wr = poisonedWork( sc, minLen );
		zgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr, 1, 0 );
		const taus = readTaus( Tr, k );
		const Hm = readH( Ar, N );
		const Q = formQ( Ar, taus, N );
		const recon = ref.matmul( sc, ref.matmul( sc, Q, Hm ), Q, { 'transb': 'c' } );
		check.assertReconstruct( sc, recon, A0, { 'label': label + ' (WORK=' + minLen + ')', 'factor': 100 } );
	} );
} );
