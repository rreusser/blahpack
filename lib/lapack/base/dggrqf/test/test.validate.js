/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params, max-lines-per-function, max-statements */

/**
* Property-based validation for dggrqf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gg` -> a pair of GENERAL dense
* matrices (schemes.dense, logical.general); `rqf` (generalized RQ) ->
* reconstruction of BOTH input matrices AND orthonormality of BOTH generated
* orthogonal factors.
*
* WHAT dggrqf COMPUTES (data/lapack-3.12.0/SRC/dggrqf.f):
*   `dggrqf(M, P, N, A, TAUA, B, TAUB, WORK)` factors an M-by-N matrix A and a
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
import dggrqf from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;
const ROUTINE = 'dggrqf';
const NB = 32; // hardcoded block size in the sub-kernels' base.js


// WORK //

// Safe blocked WORK length: max over the three sub-calls' blocked needs.
// dgerqf(M,N) needs (kA>NB)?(M*NB+NB*NB):M ; dormrq('R',P,N,kA) needs
// (kA>NB)?(P*NB+(NB+1)*NB):P ; dgeqrf(P,N) needs (kB>NB)?(N*NB+NB*NB):N.
function workLen( M, P, N ) {
	const kA = Math.min( M, N );
	const kB = Math.min( P, N );
	const rq = ( kA > NB ) ? ( ( M * NB ) + ( NB * NB ) ) : Math.max( 1, M );
	const or = ( kA > NB ) ? ( ( P * NB ) + ( ( NB + 1 ) * NB ) ) : Math.max( 1, P );
	const ge = ( kB > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
	return Math.max( 1, M, P, N, rq, or, ge );
}


// HELPERS (generic over the scalar trait `sc`) //

function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

function readMat( rd, m, n ) {
	const F = new LogicalMatrix( sc, m, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			F.set( i, j, rd.read( i, j ) );
		}
	}
	return F;
}


// --- QR (geqrf) reflector convention: columns, applied on the LEFT --- //

function readR_QR( rd, m, n ) {
	const R = new LogicalMatrix( sc, m, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			R.set( i, j, ( i <= j ) ? rd.read( i, j ) : sc.zero );
		}
	}
	return R;
}

function vecQR( rd, m, t ) {
	const v = new Array( m );
	let r;
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

// Full m-by-m QR factor Q = H_0..H_{k-1} (product of the k QR reflectors).
function fullQ_QR( rd, taus, m, k ) {
	const Q = new LogicalMatrix( sc, m, m );
	let t, i;
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
	const R = new LogicalMatrix( sc, rows, cols );
	const d = cols - rows;
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			R.set( i, j, ( ( j - i ) >= d ) ? rd.read( i, j ) : sc.zero );
		}
	}
	return R;
}

function vecRQ( rd, rows, cols, k, i ) {
	const r = rows - k + i;
	const p = cols - k + i;
	const v = [];
	let j;
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
	const rows = Mtx.rows;
	const cols = Mtx.cols;
	const ctau = sc.conj( tau );
	let coef, dot, r, j;
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
	let i;
	for ( i = 0; i < k; i++ ) {
		applyH_R( Mtx, vecRQ( rd, rows, cols, k, i ), taus[ i ] );
	}
}


// FACTOR //

function factor( M, P, N, layoutA, layoutB, wlen, doPoison ) {
	const kA = Math.min( M, N );
	const kB = Math.min( P, N );
	const rng = new RNG( 0x71 + ( M * 10000 ) + ( P * 100 ) + N );
	const A0 = logical.general( sc, rng, M, N );
	const B0 = logical.general( sc, rng, P, N );
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layoutA );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layoutB );
	const TAr = schemes.realizeVector( sc, poison( kA ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	const TBr = schemes.realizeVector( sc, poison( kB ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	const work = ( doPoison ) ? poisonedWork( sc, wlen ) : schemes.realizeVector( sc, new Array( wlen ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } ).data;

	dggrqf( M, P, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], TAr.data, TAr.args[ 0 ], TAr.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], TBr.data, TBr.args[ 0 ], TBr.args[ 1 ], work, 1, 0 );

	const tausA = [];
	const tausB = [];
	let i;
	for ( i = 0; i < kA; i++ ) {
		tausA.push( TAr.read( i ) );
	}
	for ( i = 0; i < kB; i++ ) {
		tausB.push( TBr.read( i ) );
	}
	return { 'Ar': Ar, 'Br': Br, 'A0': A0, 'B0': B0, 'tausA': tausA, 'tausB': tausB, 'kA': kA, 'kB': kB };
}

function assertGGRQF( f, M, P, N, label ) {
	const kA = f.kA;
	const kB = f.kB;

	// A = R*Q: right-fold the RQ reflectors of A onto R (M-by-N).
	const Arec = readR_RQ( f.Ar, M, N );
	rqApplyForward( f.Ar, f.tausA, M, N, kA, Arec );
	checked( ROUTINE, 'reconstruct', function run() {
		check.assertReconstruct( sc, Arec, f.A0, { 'label': label + ' A=R*Q' } );
	} );

	// Full N-by-N Q orthonormal (RQ factor of A: cols-by-cols).
	const Q = new LogicalMatrix( sc, N, N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	rqApplyForward( f.Ar, f.tausA, M, N, kA, Q );
	checked( ROUTINE, 'orthonormal', function run() {
		check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
	} );

	// B = Z*T*Q: T (P-by-N) QR-trapezoid of factored B, Z (P-by-P) QR factor.
	const T = readR_QR( f.Br, P, N );
	const Z = fullQ_QR( f.Br, f.tausB, P, kB );
	checked( ROUTINE, 'orthonormal', function run() {
		check.assertOrthonormal( sc, Z, { 'label': label + ' Z' } );
	} );
	const ZT = ref.matmul( sc, Z, T );
	const Brec = ref.matmul( sc, ZT, Q );
	checked( ROUTINE, 'reconstruct', function run() {
		check.assertReconstruct( sc, Brec, f.B0, { 'label': label + ' B=Z*T*Q', 'factor': 40 } );
	} );
}


// SWEEP //

const TRIPLES = [];
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

const ALL_LAYOUTS = schemes.dense.layouts();


test( 'dggrqf: A=R*Q, B=Z*T*Q, orthonormal Q & Z ((M,P,N) sweep x layouts)', function t() {
	TRIPLES.forEach( function eachTriple( tr ) {
		const M = tr[ 0 ];
		const P = tr[ 1 ];
		const N = tr[ 2 ];
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			const f = factor( M, P, N, layout, ALL_LAYOUTS[ ( li + 3 ) % ALL_LAYOUTS.length ], workLen( M, P, N ), false );
			assertGGRQF( f, M, P, N, ROUTINE + ' M=' + M + ' P=' + P + ' N=' + N + ' layout=' + li );
		} );
	} );
} );


// Step 4 (L3): layout-invariance.
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const VEC_POS = schemes.vectorLayouts().filter( function pos( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
} );
const VEC_UNIT = schemes.vectorLayouts().filter( function unit( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
} );

function flatFactored( f, M, P, N ) {
	let flat = check.flattenLogical( sc, readMat( f.Ar, M, N ) );
	flat = flat.concat( check.flattenLogical( sc, readMat( f.Br, P, N ) ) );
	let i;
	for ( i = 0; i < f.tausA.length; i++ ) {
		flat = flat.concat( sc.components( f.tausA[ i ] ) );
	}
	for ( i = 0; i < f.tausB.length; i++ ) {
		flat = flat.concat( sc.components( f.tausB[ i ] ) );
	}
	return flat;
}

function runInvariance( variants, fam, M, P, N ) {
	const kA = Math.min( M, N );
	const kB = Math.min( P, N );
	const wl = workLen( M, P, N );
	const SEED = 0xF00D + ( M * 131 ) + ( P * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, M, N );
			const B0 = logical.general( sc, rng, P, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			const TAr = schemes.realizeVector( sc, poison( kA ), VEC_POS[ i % VEC_POS.length ] );
			const TBr = schemes.realizeVector( sc, poison( kB ), VEC_POS[ ( i + 1 ) % VEC_POS.length ] );
			const W = schemes.realizeVector( sc, new Array( wl ).fill( sc.zero ), VEC_UNIT[ i % VEC_UNIT.length ] );
			dggrqf( M, P, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], TAr.data, TAr.args[ 0 ], TAr.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], TBr.data, TBr.args[ 0 ], TBr.args[ 1 ], W.data, W.args[ 0 ], W.args[ 1 ] );
			const tausA = [];
			const tausB = [];
			let j;
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

test( 'dggrqf: bit-exact within storage-order family (col / row), blocked', function t() {
	[ [ 40, 45, 50 ], [ 64, 64, 64 ], [ 48, 64, 40 ], [ 64, 40, 48 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ], sz[ 2 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ], sz[ 2 ] );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE (see dggqrf notes). Shared WORK forwarded to
// blocked dgerqf/dormrq/dgeqrf; the reference min max(1,M,P,N) UNDER-counts.
test( 'dggrqf: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 64, 64, 64 ], [ 40, 40, 64 ], [ 64, 64, 40 ] ].forEach( function eachCase( c ) {
		const M = c[ 0 ];
		const P = c[ 1 ];
		const N = c[ 2 ];
		const label = ROUTINE + ' WORK-min M=' + M + ' P=' + P + ' N=' + N;

		function run( len ) {
			const f = factor( M, P, N, null, null, len, true );
			let flat = check.flattenLogical( sc, readMat( f.Ar, M, N ) );
			flat = flat.concat( check.flattenLogical( sc, readMat( f.Br, P, N ) ) );
			return flat;
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		if ( Math.min( M, N ) <= NB && Math.min( P, N ) <= NB ) {
			throw new Error( label + ': not a blocked case' );
		}

		const f = factor( M, P, N, null, null, minLen, true );
		assertGGRQF( f, M, P, N, label + ' (WORK=' + minLen + ')' );
	} );
} );
