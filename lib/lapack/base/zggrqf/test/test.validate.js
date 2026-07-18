/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params, max-lines-per-function, max-statements */

/**
* Property-based validation for zggrqf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gg` -> a pair of GENERAL dense
* matrices (schemes.dense, logical.general); `rqf` (generalized RQ) ->
* reconstruction of BOTH input matrices AND orthonormality of BOTH generated
* orthogonal factors.
*
* WHAT dggrqf COMPUTES (data/lapack-3.12.0/SRC/dggrqf.f):
*   `zggrqf(M, P, N, A, TAUA, B, TAUB, WORK)` factors an M-by-N matrix A and a
*   P-by-N matrix B as
*
*       A = R * Q,        B = Z * T * Q,
*
*   where Q is N-by-N orthogonal, Z is P-by-P orthogonal, R is M-by-N upper
*   trapezoidal, and T is P-by-N upper trapezoidal. Internally (base.js, matching
*   the reference):
*     1. dgerqf(M,N,A,TAUA)   -> A = R*Q      (RQ of A; Q from TAUA, RQ convention)
*     2. dormrq('R','T',...)  -> B := B * Q**T
*     3. dgeqrf(P,N,B,TAUB)   -> (B Q**T) = Z*T  (QR of the updated B; Z from TAUB)
*   Step 3 gives B0 * Q**T = Z*T, i.e. B0 = Z*T*Q. So:
*     - Q, R come from the RQ factorization of A (gerqf reflector convention: rows,
*       right-applied; Q is N-by-N, kA = min(M,N) reflectors).
*     - T is the upper-trapezoidal part of the factored B (QR "R"), and Z is the QR
*       "Q" (geqrf reflector convention, Z is P-by-P, kB = min(P,N) reflectors).
*
* VALIDATION (kinds 'reconstruct' + 'orthonormal'):
*   - A relation:  reconstruct A = R*Q by right-folding the RQ reflectors of A onto R;
*     assert == A0. Orthonormality of the full N-by-N Q via assertOrthonormal.
*   - B relation:  T = QR-upper-trapezoid of factored B, Z = QR-Q(factored B, P-by-P);
*     assert orthonormal Z; assert B0 = (Z * T) * Q using NESTED ref.matmul.
*
* Both relations are EXACT algebraic identities for ANY general A, B. NB = 32 is
* hardcoded, so a sub-factorization takes its blocked path when its min dim > 32.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, ref, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zggrqf from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'zggrqf';
var NB = 32; // hardcoded block size in the sub-kernels' base.js


// WORK //

// Safe blocked WORK length: max over the three sub-calls' blocked needs.
// dgerqf(M,N) needs (kA>NB)?(M*NB+NB*NB):M ; dormrq('R',P,N,kA) needs
// (kA>NB)?(P*NB+(NB+1)*NB):P ; dgeqrf(P,N) needs (kB>NB)?(N*NB+NB*NB):N.
function workLen( M, P, N ) {
	var kA = Math.min( M, N );
	var kB = Math.min( P, N );
	var rq = ( kA > NB ) ? ( ( M * NB ) + ( NB * NB ) ) : Math.max( 1, M );
	var or = ( kA > NB ) ? ( ( P * NB ) + ( ( NB + 1 ) * NB ) ) : Math.max( 1, P );
	var ge = ( kB > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
	return Math.max( 1, M, P, N, rq, or, ge );
}


// HELPERS (generic over the scalar trait `sc`) //

function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

function readMat( rd, m, n ) {
	var F = new LogicalMatrix( sc, m, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			F.set( i, j, rd.read( i, j ) );
		}
	}
	return F;
}


// --- QR (geqrf) reflector convention: columns, applied on the LEFT --- //

function readR_QR( rd, m, n ) {
	var R = new LogicalMatrix( sc, m, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			R.set( i, j, ( i <= j ) ? rd.read( i, j ) : sc.zero );
		}
	}
	return R;
}

function vecQR( rd, m, t ) {
	var v = new Array( m );
	var r;
	for ( r = 0; r < m; r++ ) {
		if ( r < t ) {
			v[ r ] = sc.zero;
		} else if ( r === t ) {
			v[ r ] = sc.one;
		} else {
			v[ r ] = rd.read( r, t );
		}
	}
	return v;
}

function applyH_L( Mtx, v, tau ) {
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

// Full m-by-m QR factor Q = H_0..H_{k-1} (product of the k QR reflectors).
function fullQ_QR( rd, taus, m, k ) {
	var Q = new LogicalMatrix( sc, m, m );
	var t;
	var i;
	for ( i = 0; i < m; i++ ) {
		Q.set( i, i, sc.one );
	}
	for ( t = k - 1; t >= 0; t-- ) {
		applyH_L( Q, vecQR( rd, m, t ), taus[ t ] );
	}
	return Q;
}


// --- RQ (gerqf) reflector convention: rows, applied on the RIGHT --- //
// General over orientation: k=min(rows,cols), reflector i in row (rows-k+i),
// pivot column p_i=(cols-k+i).

function readR_RQ( rd, rows, cols ) {
	var R = new LogicalMatrix( sc, rows, cols );
	var d = cols - rows;
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			R.set( i, j, ( ( j - i ) >= d ) ? rd.read( i, j ) : sc.zero );
		}
	}
	return R;
}

function vecRQ( rd, rows, cols, k, i ) {
	var r = rows - k + i;
	var p = cols - k + i;
	var v = [];
	var j;
	for ( j = 0; j < cols; j++ ) {
		if ( j < p ) {
			v.push( rd.read( r, j ) );
		} else if ( j === p ) {
			v.push( sc.one );
		} else {
			v.push( sc.zero );
		}
	}
	return v;
}

function applyH_R( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var ctau = sc.conj( tau );
	var coef;
	var dot;
	var r;
	var j;
	for ( r = 0; r < rows; r++ ) {
		dot = sc.zero;
		for ( j = 0; j < cols; j++ ) {
			dot = sc.add( dot, sc.mul( Mtx.get( r, j ), sc.conj( v[ j ] ) ) );
		}
		coef = sc.mul( ctau, dot );
		for ( j = 0; j < cols; j++ ) {
			Mtx.set( r, j, sc.sub( Mtx.get( r, j ), sc.mul( coef, v[ j ] ) ) );
		}
	}
}

// Right-apply the k RQ reflectors of the rows-by-cols factored `rd` to Mtx
// (Mtx.cols must equal cols) FORWARD i=0..k-1.
function rqApplyForward( rd, taus, rows, cols, k, Mtx ) {
	var i;
	for ( i = 0; i < k; i++ ) {
		applyH_R( Mtx, vecRQ( rd, rows, cols, k, i ), taus[ i ] );
	}
}


// FACTOR //

function factor( M, P, N, layoutA, layoutB, wlen, doPoison ) {
	var kA = Math.min( M, N );
	var kB = Math.min( P, N );
	var rng = new RNG( 0x71 + ( M * 10000 ) + ( P * 100 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var B0 = logical.general( sc, rng, P, N );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layoutA );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layoutB );
	var TAr = schemes.realizeVector( sc, poison( kA ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	var TBr = schemes.realizeVector( sc, poison( kB ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	var work = ( doPoison ) ? poisonedWork( sc, wlen ) : schemes.realizeVector( sc, new Array( wlen ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } ).data;

	zggrqf( M, P, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], TAr.data, TAr.args[ 0 ], TAr.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], TBr.data, TBr.args[ 0 ], TBr.args[ 1 ], work, 1, 0 );

	var tausA = [];
	var tausB = [];
	var i;
	for ( i = 0; i < kA; i++ ) {
		tausA.push( TAr.read( i ) );
	}
	for ( i = 0; i < kB; i++ ) {
		tausB.push( TBr.read( i ) );
	}
	return { 'Ar': Ar, 'Br': Br, 'A0': A0, 'B0': B0, 'tausA': tausA, 'tausB': tausB, 'kA': kA, 'kB': kB };
}

function assertGGRQF( f, M, P, N, label ) {
	var kA = f.kA;
	var kB = f.kB;

	// A = R*Q: right-fold the RQ reflectors of A onto R (M-by-N).
	var Arec = readR_RQ( f.Ar, M, N );
	rqApplyForward( f.Ar, f.tausA, M, N, kA, Arec );
	checked( ROUTINE, 'reconstruct', function run() {
		check.assertReconstruct( sc, Arec, f.A0, { 'label': label + ' A=R*Q' } );
	} );

	// Full N-by-N Q orthonormal (RQ factor of A: cols-by-cols).
	var Q = new LogicalMatrix( sc, N, N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	rqApplyForward( f.Ar, f.tausA, M, N, kA, Q );
	checked( ROUTINE, 'orthonormal', function run() {
		check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
	} );

	// B = Z*T*Q: T (P-by-N) QR-trapezoid of factored B, Z (P-by-P) QR factor.
	var T = readR_QR( f.Br, P, N );
	var Z = fullQ_QR( f.Br, f.tausB, P, kB );
	checked( ROUTINE, 'orthonormal', function run() {
		check.assertOrthonormal( sc, Z, { 'label': label + ' Z' } );
	} );
	var ZT = ref.matmul( sc, Z, T );
	var Brec = ref.matmul( sc, ZT, Q );
	checked( ROUTINE, 'reconstruct', function run() {
		check.assertReconstruct( sc, Brec, f.B0, { 'label': label + ' B=Z*T*Q', 'factor': 40 } );
	} );
}


// SWEEP //

var TRIPLES = [];
SIZES_SMALL.forEach( function sq( n ) {
	TRIPLES.push( [ n, n, n ] );
} );
[
	[ 5, 4, 3 ], [ 3, 4, 5 ], [ 8, 6, 4 ], [ 4, 6, 8 ], [ 16, 10, 7 ], [ 7, 12, 16 ],
	[ 33, 20, 17 ], [ 17, 40, 33 ], [ 40, 64, 20 ], [ 64, 48, 33 ], [ 33, 50, 64 ],
	[ 48, 40, 64 ], [ 64, 64, 40 ], [ 64, 40, 64 ], [ 40, 64, 64 ],
	[ 1, 2, 4 ], [ 4, 3, 1 ], [ 0, 0, 0 ], [ 0, 2, 3 ], [ 3, 2, 0 ], [ 2, 0, 3 ]
].forEach( function rect( p ) {
	TRIPLES.push( p );
} );

var ALL_LAYOUTS = schemes.dense.layouts();


test( 'zggrqf: A=R*Q, B=Z*T*Q, orthonormal Q & Z ((M,P,N) sweep x layouts)', function t() {
	TRIPLES.forEach( function eachTriple( tr ) {
		var M = tr[ 0 ];
		var P = tr[ 1 ];
		var N = tr[ 2 ];
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var f = factor( M, P, N, layout, ALL_LAYOUTS[ ( li + 3 ) % ALL_LAYOUTS.length ], workLen( M, P, N ), false );
			assertGGRQF( f, M, P, N, ROUTINE + ' M=' + M + ' P=' + P + ' N=' + N + ' layout=' + li );
		} );
	} );
} );


// Step 4 (L3): layout-invariance.
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var VEC_POS = schemes.vectorLayouts().filter( function pos( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
} );
var VEC_UNIT = schemes.vectorLayouts().filter( function unit( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
} );

function flatFactored( f, M, P, N ) {
	var flat = check.flattenLogical( sc, readMat( f.Ar, M, N ) );
	flat = flat.concat( check.flattenLogical( sc, readMat( f.Br, P, N ) ) );
	var i;
	for ( i = 0; i < f.tausA.length; i++ ) {
		flat = flat.concat( sc.components( f.tausA[ i ] ) );
	}
	for ( i = 0; i < f.tausB.length; i++ ) {
		flat = flat.concat( sc.components( f.tausB[ i ] ) );
	}
	return flat;
}

function runInvariance( variants, fam, M, P, N ) {
	var kA = Math.min( M, N );
	var kB = Math.min( P, N );
	var wl = workLen( M, P, N );
	var SEED = 0xF00D + ( M * 131 ) + ( P * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, M, N );
			var B0 = logical.general( sc, rng, P, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			var TAr = schemes.realizeVector( sc, poison( kA ), VEC_POS[ i % VEC_POS.length ] );
			var TBr = schemes.realizeVector( sc, poison( kB ), VEC_POS[ ( i + 1 ) % VEC_POS.length ] );
			var W = schemes.realizeVector( sc, new Array( wl ).fill( sc.zero ), VEC_UNIT[ i % VEC_UNIT.length ] );
			zggrqf( M, P, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], TAr.data, TAr.args[ 0 ], TAr.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], TBr.data, TBr.args[ 0 ], TBr.args[ 1 ], W.data, W.args[ 0 ], W.args[ 1 ] );
			var tausA = [];
			var tausB = [];
			var j;
			for ( j = 0; j < kA; j++ ) {
				tausA.push( TAr.read( j ) );
			}
			for ( j = 0; j < kB; j++ ) {
				tausB.push( TBr.read( j ) );
			}
			return flatFactored( { 'Ar': Ar, 'Br': Br, 'tausA': tausA, 'tausB': tausB }, M, P, N );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major M=' + M + ' P=' + P + ' N=' + N } );
	} );
}

test( 'zggrqf: bit-exact within storage-order family (col / row), blocked', function t() {
	[ [ 40, 45, 50 ], [ 64, 64, 64 ], [ 48, 64, 40 ], [ 64, 40, 48 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ], sz[ 2 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ], sz[ 2 ] );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE (see dggqrf notes). Shared WORK forwarded to
// blocked dgerqf/dormrq/dgeqrf; the reference min max(1,M,P,N) UNDER-counts.
test( 'zggrqf: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 64, 64, 64 ], [ 40, 40, 64 ], [ 64, 64, 40 ] ].forEach( function eachCase( c ) {
		var M = c[ 0 ];
		var P = c[ 1 ];
		var N = c[ 2 ];
		var label = ROUTINE + ' WORK-min M=' + M + ' P=' + P + ' N=' + N;

		function run( len ) {
			var f = factor( M, P, N, null, null, len, true );
			var flat = check.flattenLogical( sc, readMat( f.Ar, M, N ) );
			flat = flat.concat( check.flattenLogical( sc, readMat( f.Br, P, N ) ) );
			return flat;
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		if ( Math.min( M, N ) <= NB && Math.min( P, N ) <= NB ) {
			throw new Error( label + ': not a blocked case' );
		}

		var f = factor( M, P, N, null, null, minLen, true );
		assertGGRQF( f, M, P, N, label + ' (WORK=' + minLen + ')' );
	} );
} );
