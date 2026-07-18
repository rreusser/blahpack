/**
* Property-based validation for dgehrd, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `hrd` (BLOCKED reduction to upper Hessenberg
* by Householder reflections) -> reconstruction A0 = Q*H*Qᴴ AND orthonormality
* (unitarity) QᴴQ = I.
*
* dgehrd reduces a general N×N matrix A to upper Hessenberg form H by an orthogonal
* similarity transformation Qᵀ·A·Q = H, i.e. A = Q·H·Qᵀ. It stores EXACTLY the same
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
* The block size is hardcoded NB = 32 with the block reflector T stored at
* LDT = 65; the blocked path is taken once the loop bound `ihi-1-NX >= ilo` holds
* (full reduction: N >= 34). The sweep includes 33/64/100 to straddle and clear
* that threshold.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgehrd from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32; // hardcoded block size in lib/base.js
var LDT = 65; // NBMAX+1 leading dim of the block reflector T (lib/base.js)

var SIZES = SIZES_SMALL.concat( [ 100 ] ); // 1,2,3,5,8,16,17,33,64,100

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// The WORK length dgehrd actually needs (full reduction ilo=1,ihi=N): on the
// blocked path (NH = N > NB) it uses the N-by-NB panel (N*NB) plus the LDT-by-NB
// block reflector T (LDT*NB); otherwise the unblocked dgehd2 remainder needs N.
// Mirrors the zgehrd wrapper's own guard.
function workLen( N ) {
	return ( N > NB ) ? ( ( N * NB ) + ( LDT * NB ) ) : Math.max( 1, N );
}

function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Upper Hessenberg part of the factored A as N×N matrix H (i <= j+1 copied, below
// the subdiagonal zero).
function readH( Ard, N ) {
	var Hm = new LogicalMatrix( sc, N, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Hm.set( i, j, ( i <= j + 1 ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return Hm;
}

// k = N-1 Householder vectors (length N), full reduction.
function readVecs( Ard, N ) {
	var vs = [];
	var v;
	var t;
	var r;
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

// Q (N×N) = H_0·…·H_{N-2}.
function formQ( Ard, taus, N ) {
	var Q = new LogicalMatrix( sc, N, N );
	var vs = readVecs( Ard, N );
	var t;
	var i;
	var j;
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
	var F = new LogicalMatrix( sc, N, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

function readTaus( Tr, k ) {
	var taus = [];
	var ti;
	for ( ti = 0; ti < k; ti++ ) {
		taus.push( Tr.read( ti ) );
	}
	return taus;
}


// Steps 2/3/5: reconstruction (A0 = Q·H·Qᴴ) AND orthonormality (QᴴQ = I) across
// the N sweep (blocked and unblocked) and every dense layout, at backward-error
// tolerance.
test( 'dgehrd: A = Q*H*Qᴴ and QᴴQ = I (N sweep x all layouts)', function t() {
	SIZES.forEach( function eachN( N ) {
		var k = Math.max( 0, N - 1 );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var rng = new RNG( 0x100 + N );
			var A0 = logical.general( sc, rng, N, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			var Wr = schemes.realizeVector( sc, poison( workLen( N ) ), TIGHT_VEC );

			dgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			var taus = readTaus( Tr, k );
			var label = 'dgehrd N=' + N + ' layout=' + li;

			var Hm = readH( Ar, N );
			var Q = formQ( Ar, taus, N );

			checked( 'dgehrd', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );

			var recon = ref.matmul( sc, ref.matmul( sc, Q, Hm ), Q, { 'transb': 'c' } );
			checked( 'dgehrd', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz on the BLOCKED path (N=64 > threshold, so
// dlahr2/dgemm/dtrmm/dlarfb are all reached). dgemm/dgemv/dger reorder across the
// col<->row storage flip, so assert BIT-EXACTNESS only WITHIN a storage-order
// family. TAU vector layout is fuzzed in parallel; WORK stays tight (the blocked
// scratch uses a hardcoded internal leading dim, so only its base offset is a free
// knob — stride must be 1) and positive-offset.
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var TAU_LAYOUTS = schemes.vectorLayouts();
var WORK_LAYOUTS = schemes.vectorLayouts().filter( function tight( L ) {
	return L.stride === 1;
} );

test( 'dgehrd: bit-exact within storage-order family (col / row), blocked', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	var N = 64; // > threshold -> blocked path (dlahr2/dgemm/dtrmm/dlarfb reached)
	var k = N - 1;
	var SEED = 0xF00D;
	checked( 'dgehrd', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, N, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, poison( k ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			var Wr = schemes.realizeVector( sc, poison( workLen( N ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );

			dgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			var flat = check.flattenLogical( sc, readFull( Ar, N ) );
			var ti;
			for ( ti = 0; ti < k; ti++ ) {
				flat.push.apply( flat, sc.components( Tr.read( ti ) ) );
			}
			return flat;
		}, { 'label': 'dgehrd layout invariance ' + fam + '-major (blocked N=' + N + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE. Our JS hardcodes NB and stores the block
// reflector T in a trailing WORK segment (N*NB main scratch + LDT*NB for T), so a
// wrapper guard copied from the reference unblocked LWORK lower bound (max(1,N))
// UNDER-counts on the blocked path. Derive the advertised minimum from the
// wrapper's own throw boundary, run at exactly that length with a POISONED WORK on
// the BLOCKED path, and require finite output (no NaN leak from reading past WORK)
// AND reconstruction.
test( 'dgehrd: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ 64, 100 ].forEach( function eachN( N ) {
		var k = N - 1;
		var SEED = 0xB10C + N;
		var label = 'dgehrd WORK-min N=' + N;

		function run( len ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, N, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			var Wr = poisonedWork( sc, len );
			dgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, N ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		// The blocked path must actually have been taken.
		if ( N <= NB ) {
			throw new Error( label + ': case is not on the blocked path (N<=NB); pick larger N' );
		}

		// Reconstruction must still hold at exactly the advertised minimum.
		var rng = new RNG( SEED );
		var A0 = logical.general( sc, rng, N, N );
		var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
		var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
		var Wr = poisonedWork( sc, minLen );
		dgehrd( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr, 1, 0 );
		var taus = readTaus( Tr, k );
		var Hm = readH( Ar, N );
		var Q = formQ( Ar, taus, N );
		var recon = ref.matmul( sc, ref.matmul( sc, Q, Hm ), Q, { 'transb': 'c' } );
		check.assertReconstruct( sc, recon, A0, { 'label': label + ' (WORK=' + minLen + ')', 'factor': 100 } );
	} );
} );
