/**
* Property-based validation for dgeqrt3, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense; `qrt3`
* (RECURSIVE compact-WY QR (Elmroth-Gustavson)) -> reconstruction A = Q*R AND orthonormality of Q.
*
* dgeqrt3 computes, for a general M-by-N matrix A (M >= N), the compact-WY QR
* factorization as a SINGLE block: on exit the upper triangle of A holds the
* N-by-N R, the strict-lower part of column i holds v_i(i+1:M-1) with implicit
* v_i(i) = 1, and the SEPARATE N-by-N array T holds the (upper triangular) block
* reflector factor. The block reflector is H = I - V T Vᴴ (V = the N unit-lower
* Householder columns), and Q = H, with A = Q*R. We reconstruct A and form the
* economy Q DIRECTLY from V and the full N-by-N T (diagonal T(i,i) = tau_i,
* strict-upper = the WY coupling terms) — validating the whole compact-WY T.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgeqrt3 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var ALL_LAYOUTS = schemes.dense.layouts();

// (M,N) sweep with M >= N: squares from SIZES_SMALL + tall rectangles.
var PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 5, 3 ], [ 8, 3 ], [ 8, 5 ], [ 16, 5 ], [ 17, 8 ], [ 33, 16 ], [ 64, 17 ], [ 8, 1 ], [ 64, 33 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );


// HELPERS //

function allocT( n, layout ) {
	var A = schemes.denseAlloc( sc, n, n, layout );
	return {
		'data': A.data,
		'args': [ A.s1, A.s2, A.offset ],
		'read': function read( i, j ) {
			return sc.read( A.data, A.addr( i, j ) );
		}
	};
}

function readV( Ard, M, K ) {
	var V = new LogicalMatrix( sc, M, K );
	var i;
	var j;
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			V.set( i, j, ( i < j ) ? sc.zero : ( i === j ? sc.one : Ard.read( i, j ) ) );
		}
	}
	return V;
}

function readR( Ard, M, N ) {
	var R = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			R.set( i, j, ( i <= j ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return R;
}

// X := Q * X in place, Q = I - V T Vᴴ (single block, T upper triangular NxN).
function applyQ( X, V, Tread, K ) {
	var M = X.rows;
	var p = X.cols;
	var W;
	var TW;
	var s;
	var a;
	var b;
	var c;
	var r;
	for ( c = 0; c < p; c++ ) {
		W = new Array( K );
		for ( a = 0; a < K; a++ ) {
			s = sc.zero;
			for ( r = a; r < M; r++ ) {
				s = sc.add( s, sc.mul( sc.conj( V.get( r, a ) ), X.get( r, c ) ) );
			}
			W[ a ] = s;
		}
		TW = new Array( K );
		for ( a = 0; a < K; a++ ) {
			s = sc.zero;
			for ( b = a; b < K; b++ ) {
				s = sc.add( s, sc.mul( Tread( a, b ), W[ b ] ) );
			}
			TW[ a ] = s;
		}
		for ( r = 0; r < M; r++ ) {
			s = X.get( r, c );
			for ( a = 0; a < K; a++ ) {
				s = sc.sub( s, sc.mul( V.get( r, a ), TW[ a ] ) );
			}
			X.set( r, c, s );
		}
	}
}

function reconstruct( Ard, Tread, M, N, K ) {
	var R = readR( Ard, M, N );
	var V = readV( Ard, M, K );
	applyQ( R, V, Tread, K );
	return R;
}

function formQ( Ard, Tread, M, K ) {
	var Q = new LogicalMatrix( sc, M, K );
	var V = readV( Ard, M, K );
	var i;
	var j;
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	applyQ( Q, V, Tread, K );
	return Q;
}

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

// Flatten upper triangle of the NxN T (meaningful part), fixed order.
function flattenT( Tread, K ) {
	var out = [];
	var comp;
	var a;
	var b;
	var k;
	for ( b = 0; b < K; b++ ) {
		for ( a = 0; a <= b; a++ ) {
			comp = sc.components( Tread( a, b ) );
			for ( k = 0; k < comp.length; k++ ) {
				out.push( comp[ k ] );
			}
		}
	}
	return out;
}


test( 'dgeqrt3: A = Q*R and QᴴQ = I ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var K = Math.min( M, N );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var rng = new RNG( 0x300 + ( M * 1000 ) + N );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = allocT( N, layout );

			dgeqrt3( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ] );

			var label = 'dgeqrt3 M=' + M + ' N=' + N + ' layout=' + li;

			var recon = reconstruct( Ar, Tr.read, M, N, K );
			checked( 'dgeqrt3', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A0, { 'label': label, 'factor': 100 } );
			} );

			var Q = formQ( Ar, Tr.read, M, K );
			checked( 'dgeqrt3', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );
		} );
	} );
} );


// Step 4: layout invariance (bit-exact within storage-order family; the
// dgemv/dger/dtrmv inside dgeqrt3 reorder across the col<->row flip).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'dgeqrt3: bit-exact within storage-order family (col / row)', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	var M = 33;
	var N = 20;
	var K = Math.min( M, N );
	var SEED = 0xF00D;
	checked( 'dgeqrt3', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = allocT( N, variants[ ( i + 1 ) % variants.length ] );

			dgeqrt3( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ] );

			return check.flattenLogical( sc, readFull( Ar, M, N ) ).concat( flattenT( Tr.read, K ) );
		}, { 'label': 'dgeqrt3 layout invariance ' + fam + '-major (M=' + M + ' N=' + N + ')' } );
	} );
}
