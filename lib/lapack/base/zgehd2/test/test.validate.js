/**
* Property-based validation for zgehd2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `hd2` (UNBLOCKED reduction to upper Hessenberg
* by Householder reflections) -> reconstruction A0 = Q*H*Qᴴ AND orthonormality
* (unitarity) QᴴQ = I.
*
* zgehd2 reduces a general N×N matrix A to upper Hessenberg form H by a unitary
* similarity transformation Qᴴ·A·Q = H, i.e. A = Q·H·Qᴴ. On exit the upper
* triangle and first subdiagonal of A hold H; the elements below the first
* subdiagonal, together with TAU, encode Q as a product of elementary reflectors
* H(ilo)…H(ihi-1). ilo/ihi are 1-BASED (LAPACK convention; base.js loops
* `i = ilo-1 … ihi-2`). We validate the full reduction ilo=1, ihi=N.
*
* Reflector t (0-based, t = 0 … N-2) is stored in column t of the factored A:
* v[0..t] = 0, v[t+1] = 1 (implicit), v[t+2..N-1] = A(t+2:N-1, t); tau = TAU(t).
* H_t = I − tau_t·v_t·v_tᴴ and Q = H_0·H_1·…·H_{N-2}. Passing reconstruction
* proves the reflectors were read from the correct sub-subdiagonal storage.
*
* The exact algebraic identity A = Q·H·Qᴴ holds for ANY general A, so plain random
* general A suffices at every N.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgehd2 from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var SIZES = SIZES_SMALL; // 1,2,3,5,8,16,17,33,64

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// A poisoned (NaN) vector of scalar values, so an output slot the routine fails
// to write reads back as NaN and trips assertFinite.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Read the upper Hessenberg part of the factored A as the N×N matrix H: entries
// on/above the first subdiagonal (i <= j+1) are copied from A; strictly below the
// subdiagonal is exact zero.
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

// Extract the k = N-1 Householder vectors (each length N), full reduction:
// v_t(t+1) = 1 (implicit), v_t(t+2:N-1) = column t of A below the subdiagonal,
// v_t(0:t) = 0.
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

// Mtx := H·Mtx where H = I − tau·v·vᴴ, i.e. Mtx -= tau·v·(vᴴ·Mtx).
function applyH( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var w;
	var tw;
	var c;
	var r;
	for ( c = 0; c < cols; c++ ) {
		w = sc.zero; // w = vᴴ·Mtx[:,c]
		for ( r = 0; r < rows; r++ ) {
			w = sc.add( w, sc.mul( sc.conj( v[ r ] ), Mtx.get( r, c ) ) );
		}
		tw = sc.mul( tau, w );
		for ( r = 0; r < rows; r++ ) {
			Mtx.set( r, c, sc.sub( Mtx.get( r, c ), sc.mul( v[ r ], tw ) ) );
		}
	}
}

// Form Q (N×N) = H_0·H_1·…·H_{N-2} by folding the reflectors right-to-left onto
// the identity.
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

// Read the full factored A (N×N) back into a LogicalMatrix (H on/above the
// subdiagonal, reflector essentials below).
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


// Steps 2/3/5: reconstruction (A0 = Q·H·Qᴴ) AND unitarity (QᴴQ = I) across the N
// sweep and every dense storage layout, at backward-error tolerance (dlarf's
// dgemv/dger reorder across storage order, so bit-exactness is deferred to the
// layout-invariance test below).
test( 'zgehd2: A = Q*H*Qᴴ and QᴴQ = I (N sweep x all layouts)', function t() {
	SIZES.forEach( function eachN( N ) {
		var k = Math.max( 0, N - 1 );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var rng = new RNG( 0x100 + N );
			var A0 = logical.general( sc, rng, N, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			var Wr = schemes.realizeVector( sc, poison( Math.max( 1, N ) ), TIGHT_VEC );

			zgehd2( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			var taus = readTaus( Tr, k );
			var label = 'zgehd2 N=' + N + ' layout=' + li;

			var Hm = readH( Ar, N );
			var Q = formQ( Ar, taus, N );

			checked( 'zgehd2', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );

			// A0 = Q·H·Qᴴ
			var recon = ref.matmul( sc, ref.matmul( sc, Q, Hm ), Q, { 'transb': 'c' } );
			checked( 'zgehd2', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. dlarf bottoms out in dgemv/dger, whose real
// incx==1 fast paths reorder the summation on the col<->row storage flip, so
// assert BIT-EXACTNESS only WITHIN a storage-order family (col vs row); this still
// fuzzes offset, leading-dim padding, gaps, and stride SIGN. TAU/WORK vector
// layouts are fuzzed in parallel; they must not perturb the factored A. (WORK
// stays positive-stride: the ndarray WORK-length guard measures `length - offset`,
// which a negative stride would spuriously fail.)
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var TAU_LAYOUTS = schemes.vectorLayouts();
var WORK_LAYOUTS = schemes.vectorLayouts().filter( function pos( L ) {
	return L.stride > 0;
} );

test( 'zgehd2: bit-exact within storage-order family (col / row)', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	var N = 17;
	var k = N - 1;
	var SEED = 0xF00D;
	checked( 'zgehd2', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, N, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, poison( k ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			var Wr = schemes.realizeVector( sc, poison( Math.max( 1, N ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );

			zgehd2( N, 1, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			var flat = check.flattenLogical( sc, readFull( Ar, N ) );
			var ti;
			for ( ti = 0; ti < k; ti++ ) {
				flat.push.apply( flat, sc.components( Tr.read( ti ) ) );
			}
			return flat;
		}, { 'label': 'zgehd2 layout invariance ' + fam + '-major (N=' + N + ')' } );
	} );
}
