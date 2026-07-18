/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params, max-lines-per-function, max-statements */

/**
* Property-based validation for zggqrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gg` -> a pair of GENERAL dense
* matrices (schemes.dense, logical.general); `qrf` (generalized QR) ->
* reconstruction of BOTH input matrices AND orthonormality of BOTH generated
* orthogonal factors.
*
* WHAT dggqrf COMPUTES (data/lapack-3.12.0/SRC/dggqrf.f):
*   `zggqrf(N, M, P, A, TAUA, B, TAUB, WORK)` factors an N-by-M matrix A and an
*   N-by-P matrix B as
*
*       A = Q * R,        B = Q * T * Z,
*
*   where Q is N-by-N orthogonal, Z is P-by-P orthogonal, R is N-by-M upper
*   trapezoidal, and T is N-by-P upper trapezoidal. Internally (base.js, matching
*   the reference):
*     1. dgeqrf(N,M,A,TAUA)   -> A = Q*R   (QR of A; Q from TAUA, QR convention)
*     2. dormqr('L','T',...)  -> B := Q**T * B
*     3. dgerqf(N,P,B,TAUB)   -> (Q**T B) = T*Z  (RQ of the updated B; Z from TAUB)
*   Step 3 gives Q**T * B0 = T*Z, i.e. B0 = Q*T*Z. So:
*     - Q, R come from the QR factorization of A (geqrf reflector convention:
*       H_i = I - taua*v*v**H, v below the diagonal of the factored A, Q = H_1..H_kA,
*       kA = min(N,M)).
*     - T is the upper-trapezoidal part of the factored B (RQ "R"), and Z is the RQ
*       "Q" (gerqf reflector convention, Z is P-by-P, kB = min(N,P) reflectors).
*
* VALIDATION (kinds 'reconstruct' + 'orthonormal'):
*   - A relation:  reconstruct A = Q*R by folding the QR reflectors of A onto R;
*     assert == A0. Orthonormality of the full N-by-N Q via assertOrthonormal.
*   - B relation:  T = RQ-upper-trapezoid of factored B, Z = RQ-Q(factored B);
*     assert orthonormal Z; assert B0 = Q * (T * Z) using NESTED ref.matmul.
*
* Both relations are EXACT algebraic identities for ANY general A, B, so plain
* random inputs suffice. NB = 32 is hardcoded, so a sub-factorization takes its
* blocked path whenever its min dimension > 32; the sweep straddles that.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, ref, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zggqrf from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'zggqrf';
var NB = 32; // hardcoded block size in the sub-kernels' base.js


// WORK //

// The safe blocked WORK length: the max over the three sub-calls' blocked needs.
// dgeqrf(N,M) needs (kA>NB)?(M*NB+NB*NB):M ; dormqr('L',N,P,kA) needs
// (kA>NB)?(P*NB+(NB+1)*NB):P ; dgerqf(N,P) needs (kB>NB)?(N*NB+NB*NB):N.
function workLen( N, M, P ) {
	var kA = Math.min( N, M );
	var kB = Math.min( N, P );
	var ge = ( kA > NB ) ? ( ( M * NB ) + ( NB * NB ) ) : Math.max( 1, M );
	var or = ( kA > NB ) ? ( ( P * NB ) + ( ( NB + 1 ) * NB ) ) : Math.max( 1, P );
	var rq = ( kB > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
	return Math.max( 1, N, M, P, ge, or, rq );
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

// R = upper trapezoid of the m-by-n factored matrix.
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

// Householder column v_t (length m): v_t(t)=1, v_t(t+1:)=strict-lower col t.
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

// Mtx := H*Mtx, H = I - tau*v*v**H (left apply).
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

// Q*Mtx-in-place fold: apply H_{k-1}..H_0 to Mtx (rows-by-anything). Reflectors
// are read from the m-by-* factored `rd` (m = Mtx.rows).
function foldQ_L( rd, taus, k, Mtx ) {
	var t;
	for ( t = k - 1; t >= 0; t-- ) {
		applyH_L( Mtx, vecQR( rd, Mtx.rows, t ), taus[ t ] );
	}
}

// Full m-by-m Q = H_0..H_{k-1} (product of the k QR reflectors).
function fullQ_QR( rd, taus, m, k ) {
	var Q = new LogicalMatrix( sc, m, m );
	var i;
	for ( i = 0; i < m; i++ ) {
		Q.set( i, i, sc.one );
	}
	foldQ_L( rd, taus, k, Q );
	return Q;
}


// --- RQ (gerqf) reflector convention: rows, applied on the RIGHT --- //
// General over orientation (rows<=cols and rows>cols): k=min(rows,cols),
// reflector i lives in row (rows-k+i), pivot column p_i=(cols-k+i).

// T = upper-trapezoidal RQ factor of the rows-by-cols factored matrix:
// referenced iff (j - i) >= (cols - rows).
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

// Essential Householder row v_i (length cols): row r=(rows-k+i), pivot p=(cols-k+i),
// essential in columns 0..p-1, implicit 1 at p, zeros after.
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

// Right-apply H(i)**H: Mtx := Mtx - conj(tau)*(Mtx*conj(v))*v.
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

// Full cols-by-cols RQ factor Z (= Q of an RQ), by right-applying reflectors to I.
function fullZ_RQ( rd, taus, rows, cols, k ) {
	var Z = new LogicalMatrix( sc, cols, cols );
	var i;
	for ( i = 0; i < cols; i++ ) {
		Z.set( i, i, sc.one );
	}
	for ( i = 0; i < k; i++ ) {
		applyH_R( Z, vecRQ( rd, rows, cols, k, i ), taus[ i ] );
	}
	return Z;
}


// FACTOR //

function factor( N, M, P, layoutA, layoutB, wlen, doPoison ) {
	var kA = Math.min( N, M );
	var kB = Math.min( N, P );
	var rng = new RNG( 0x51 + ( N * 10000 ) + ( M * 100 ) + P );
	var A0 = logical.general( sc, rng, N, M );
	var B0 = logical.general( sc, rng, N, P );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layoutA );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layoutB );
	var TAr = schemes.realizeVector( sc, poison( kA ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	var TBr = schemes.realizeVector( sc, poison( kB ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	var work = ( doPoison ) ? poisonedWork( sc, wlen ) : schemes.realizeVector( sc, new Array( wlen ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } ).data;

	zggqrf( N, M, P, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], TAr.data, TAr.args[ 0 ], TAr.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], TBr.data, TBr.args[ 0 ], TBr.args[ 1 ], work, 1, 0 );

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

// Assert both generalized-QR relations for a factored result.
function assertGGQRF( f, N, M, P, label ) {
	var kA = f.kA;
	var kB = f.kB;

	// A = Q*R: fold the QR reflectors of A onto R.
	var Arec = readR_QR( f.Ar, N, M );
	foldQ_L( f.Ar, f.tausA, kA, Arec );
	checked( ROUTINE, 'reconstruct', function run() {
		check.assertReconstruct( sc, Arec, f.A0, { 'label': label + ' A=Q*R' } );
	} );

	// Full N-by-N Q orthonormal.
	var Q = fullQ_QR( f.Ar, f.tausA, N, kA );
	checked( ROUTINE, 'orthonormal', function run() {
		check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
	} );

	// B = Q*T*Z: T (N-by-P) RQ-trapezoid of factored B, Z (P-by-P) RQ factor.
	var T = readR_RQ( f.Br, N, P );
	var Z = fullZ_RQ( f.Br, f.tausB, N, P, kB );
	checked( ROUTINE, 'orthonormal', function run() {
		check.assertOrthonormal( sc, Z, { 'label': label + ' Z' } );
	} );
	var TZ = ref.matmul( sc, T, Z );
	var Brec = ref.matmul( sc, Q, TZ );
	checked( ROUTINE, 'reconstruct', function run() {
		check.assertReconstruct( sc, Brec, f.B0, { 'label': label + ' B=Q*T*Z', 'factor': 40 } );
	} );
}


// SWEEP //

var TRIPLES = [];
SIZES_SMALL.forEach( function sq( n ) {
	TRIPLES.push( [ n, n, n ] );
} );
[
	[ 5, 3, 4 ], [ 3, 5, 4 ], [ 8, 4, 6 ], [ 4, 8, 6 ], [ 16, 7, 10 ], [ 7, 16, 12 ],
	[ 33, 17, 20 ], [ 17, 33, 40 ], [ 40, 20, 64 ], [ 64, 33, 48 ], [ 33, 64, 50 ],
	[ 48, 64, 40 ], [ 64, 40, 64 ], [ 64, 64, 40 ], [ 40, 64, 64 ],
	[ 1, 4, 2 ], [ 4, 1, 3 ], [ 0, 0, 0 ], [ 0, 3, 2 ], [ 3, 0, 2 ], [ 2, 3, 0 ]
].forEach( function rect( p ) {
	TRIPLES.push( p );
} );

var ALL_LAYOUTS = schemes.dense.layouts();


// Steps 2/3 (L2): both reconstructions + both orthonormalities across the
// (N,M,P) sweep and every dense storage layout (A and B share the layout index).
test( 'zggqrf: A=Q*R, B=Q*T*Z, orthonormal Q & Z ((N,M,P) sweep x layouts)', function t() {
	TRIPLES.forEach( function eachTriple( tr ) {
		var N = tr[ 0 ];
		var M = tr[ 1 ];
		var P = tr[ 2 ];
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var f = factor( N, M, P, layout, ALL_LAYOUTS[ ( li + 3 ) % ALL_LAYOUTS.length ], workLen( N, M, P ), false );
			assertGGQRF( f, N, M, P, ROUTINE + ' N=' + N + ' M=' + M + ' P=' + P + ' layout=' + li );
		} );
	} );
} );


// Step 4 (L3): layout-invariance. Within a storage-order family the factored
// (A + TAUA, B + TAUB) must be bit-exact across offset/leading-dim/stride-sign;
// the col<->row FLIP legitimately reorders the blocked dgemm accumulation
// (~1 ULP) and is certified instead by the reconstruction property above.
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

function flatFactored( f, N, M, P ) {
	var flat = check.flattenLogical( sc, readMat( f.Ar, N, M ) );
	flat = flat.concat( check.flattenLogical( sc, readMat( f.Br, N, P ) ) );
	var i;
	for ( i = 0; i < f.tausA.length; i++ ) {
		flat = flat.concat( sc.components( f.tausA[ i ] ) );
	}
	for ( i = 0; i < f.tausB.length; i++ ) {
		flat = flat.concat( sc.components( f.tausB[ i ] ) );
	}
	return flat;
}

function runInvariance( variants, fam, N, M, P ) {
	var kA = Math.min( N, M );
	var kB = Math.min( N, P );
	var wl = workLen( N, M, P );
	var SEED = 0xF00D + ( N * 131 ) + ( M * 17 ) + P;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, N, M );
			var B0 = logical.general( sc, rng, N, P );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			var TAr = schemes.realizeVector( sc, poison( kA ), VEC_POS[ i % VEC_POS.length ] );
			var TBr = schemes.realizeVector( sc, poison( kB ), VEC_POS[ ( i + 1 ) % VEC_POS.length ] );
			var W = schemes.realizeVector( sc, new Array( wl ).fill( sc.zero ), VEC_UNIT[ i % VEC_UNIT.length ] );
			zggqrf( N, M, P, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], TAr.data, TAr.args[ 0 ], TAr.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], TBr.data, TBr.args[ 0 ], TBr.args[ 1 ], W.data, W.args[ 0 ], W.args[ 1 ] );
			var tausA = [];
			var tausB = [];
			var j;
			for ( j = 0; j < kA; j++ ) {
				tausA.push( TAr.read( j ) );
			}
			for ( j = 0; j < kB; j++ ) {
				tausB.push( TBr.read( j ) );
			}
			return flatFactored( { 'Ar': Ar, 'Br': Br, 'tausA': tausA, 'tausB': tausB }, N, M, P );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major N=' + N + ' M=' + M + ' P=' + P } );
	} );
}

test( 'zggqrf: bit-exact within storage-order family (col / row), blocked', function t() {
	[ [ 40, 50, 45 ], [ 64, 64, 64 ], [ 48, 40, 64 ], [ 64, 48, 40 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ], sz[ 2 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ], sz[ 2 ] );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE. dggqrf forwards ONE shared WORK to blocked
// dgeqrf/dormqr/dgerqf, each of which stores a block-reflector T (or scratch) in
// a trailing WORK segment. The reference LWORK lower bound max(1,N,M,P) UNDER-counts
// our non-adaptive blocked consumption. Derive the wrapper's advertised minimum,
// then run at exactly that length with a POISONED WORK on a genuinely blocked case
// and require finite output AND both reconstructions.
test( 'zggqrf: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 64, 64, 64 ], [ 40, 64, 40 ], [ 64, 40, 64 ] ].forEach( function eachCase( c ) {
		var N = c[ 0 ];
		var M = c[ 1 ];
		var P = c[ 2 ];
		var label = ROUTINE + ' WORK-min N=' + N + ' M=' + M + ' P=' + P;

		function run( len ) {
			var f = factor( N, M, P, null, null, len, true );
			var flat = check.flattenLogical( sc, readMat( f.Ar, N, M ) );
			flat = flat.concat( check.flattenLogical( sc, readMat( f.Br, N, P ) ) );
			return flat;
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		// Must actually be on a blocked path (some sub-min > NB):
		if ( Math.min( N, M ) <= NB && Math.min( N, P ) <= NB ) {
			throw new Error( label + ': not a blocked case' );
		}

		var f = factor( N, M, P, null, null, minLen, true );
		assertGGQRF( f, N, M, P, label + ' (WORK=' + minLen + ')' );
	} );
} );
