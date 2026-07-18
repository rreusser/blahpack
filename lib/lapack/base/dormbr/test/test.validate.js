/**
* Property-based validation for dormbr, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ormbr` applies the orthogonal factor
* Q (from tauq) or P (from taup) of a bidiagonal reduction (dgebrd: A = Q·B·Pᵀ) to
* a general M×N matrix C. VECT selects which factor, SIDE which side, TRANS whether
* to apply the (transpose of the) factor:
*
*                   SIDE='L'      SIDE='R'
*   VECT='Q' N :      Q·C           C·Q
*   VECT='Q' T :      Qᵀ·C          C·Qᵀ
*   VECT='P' N :      P·C           C·P
*   VECT='P' T :      Pᵀ·C          C·Pᵀ
*
* (see dormbr.f). Internally dormbr dispatches to dormqr (VECT='Q') or dormlq with
* the transpose FLIPPED (VECT='P': TRANST='T' when TRANS='N'); the net effect on C
* is nonetheless the table above, which is what we validate.
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct'): factor a random
* m0×n0 matrix with dgebrd, then form the EXPLICIT Q (m0×m0) and P (n0×n0) by naive
* right-to-left folding of the elementary reflectors read straight out of the
* factored A + tauq/taup (the SAME reflector-expansion oracle whose reconstruction
* A = Q·B·Pᵀ is certified by dgebrd's own validation — no library apply/form routine
* is trusted). We then compute op(Q or P)·C0 / C0·op(...) with the harness's naive
* ref.matmul and compare to dormbr's in-place output. A systematic reflector /
* side / trans / vect error in dormbr disagrees with this oracle.
*
* dormbr is BLOCKED via dormqr/dormlq (dlarft + dlarfb) whenever the reflector count
* exceeds NB=32, whose optimized dgemm/dtrsm/dgemv kernels select summation form by
* operand strides -> bit-exact layout invariance holds only WITHIN a storage-order
* family (col vs row); cross-order correctness is certified by the property swept
* over ALL layouts. Step 4c probes the advertised WORK minimum on the BLOCKED path
* with a poisoned buffer (both sides, both vects).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dormbr from './../lib/ndarray.js';
import dgebrd from '../../dgebrd/lib/ndarray.js';

var sc = S.real; // d-routine
var NAME = 'dormbr';
var TRANS_T = 'transpose'; // op = Fᵀ for a real routine
var TCODE_T = 't'; // ref.matmul transpose code matching TRANS_T
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32; // hardcoded block size in dormqr/dormlq base.js


// SIZE SWEEP //

// Original (m0,n0) reduced by dgebrd, spanning upper (m0>=n0 -> exercises VECT='Q'
// primary nq>=K and VECT='P' secondary nq<=K) and lower (m0<n0 -> VECT='Q'
// secondary and VECT='P' primary) plus square, tiny and zero corners.
var PAIRS = [
	[ 1, 1 ], [ 2, 2 ], [ 3, 2 ], [ 2, 3 ], [ 4, 4 ], [ 5, 3 ], [ 3, 5 ],
	[ 7, 7 ], [ 8, 5 ], [ 5, 8 ], [ 16, 16 ], [ 17, 10 ], [ 10, 17 ],
	[ 33, 33 ], [ 33, 17 ], [ 17, 33 ], [ 0, 0 ]
];

// C's "free" dimension (the side not pinned to the factor order).
var FREE = [ 1, 6 ];

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
var VEC_LAYOUTS = schemes.vectorLayouts();


// HELPERS //

// A poisoned (NaN) vector of `sc` scalar values.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// A poisoned (NaN) REAL vector (d / e are always real).
function poisonR( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

// WORK for the blocked dgebrd factorization.
function gebrdWork( m0, n0 ) {
	return Math.max( 1, ( m0 + n0 ) * NB, m0, n0 );
}

// Generous WORK superset for the ormbr apply: nw*NB + (NB+1)*NB, nw = N (left) or
// M (right) — the exact blocked need, always >= the unblocked nw.
function ormWork( side, M, N ) {
	var nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
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

// Q reflector vector v_t (length M), per the dgebrd upper/lower convention.
function readVQ( reader, M, upper, t ) {
	var v = new Array( M );
	var r;
	for ( r = 0; r < M; r++ ) {
		if ( upper ) {
			v[ r ] = ( r < t ) ? sc.zero : ( ( r === t ) ? sc.one : reader( r, t ) );
		} else {
			v[ r ] = ( r <= t ) ? sc.zero : ( ( r === t + 1 ) ? sc.one : reader( r, t ) );
		}
	}
	return v;
}

// P reflector vector u_t (length N), per the dgebrd upper/lower convention. The
// complex ZLACGV subtlety (read conj(stored)) is a no-op for the real routine.
function readUP( reader, N, upper, t ) {
	var u = new Array( N );
	var c;
	for ( c = 0; c < N; c++ ) {
		if ( upper ) {
			u[ c ] = ( c <= t ) ? sc.zero : ( ( c === t + 1 ) ? sc.one : sc.conj( reader( t, c ) ) );
		} else {
			u[ c ] = ( c < t ) ? sc.zero : ( ( c === t ) ? sc.one : sc.conj( reader( t, c ) ) );
		}
	}
	return u;
}

// Form an orthonormal matrix (dim×dim) = R(0)·R(1)···R(count-1), folding right to
// left, where R(t) = I − tau_t·vec_t·vec_tᴴ.
function buildOrtho( dim, count, readVec, taus ) {
	var Q = new LogicalMatrix( sc, dim, dim );
	var t;
	var i;
	var j;
	for ( j = 0; j < dim; j++ ) {
		for ( i = 0; i < dim; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	for ( t = count - 1; t >= 0; t-- ) {
		applyH( Q, readVec( t ), taus[ t ] );
	}
	return Q;
}

// Read a realized dense matrix (with .read(i,j)) into a LogicalMatrix.
function readFull( Ard, rows, cols ) {
	var F = new LogicalMatrix( sc, rows, cols );
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

// Factor a random m0×n0 matrix with dgebrd and form the explicit Q (m0×m0) and P
// (n0×n0). Returns { Alog (frozen factored A), tauq, taup, Q, P, upper }.
function factor( m0, n0, seed ) {
	var rng = new RNG( seed );
	var A0 = logical.general( sc, rng, m0, n0 );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var mn = Math.min( m0, n0 );
	var Dr = schemes.realizeVector( S.real, poisonR( mn ), TIGHT_VEC );
	var Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), TIGHT_VEC );
	var Qr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	var Pr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	var Wr = schemes.realizeVector( sc, poison( gebrdWork( m0, n0 ) ), TIGHT_VEC );
	var upper = ( m0 >= n0 );
	var nQ = upper ? mn : Math.max( 0, mn - 1 );
	var nP = upper ? Math.max( 0, mn - 1 ) : mn;
	var tauq = [];
	var taup = [];
	var Alog;
	var reader;
	var Q;
	var P;
	var i;

	if ( m0 > 0 && n0 > 0 ) {
		dgebrd( m0, n0, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
	}
	Alog = readFull( Ar, m0, n0 );
	for ( i = 0; i < mn; i++ ) {
		tauq.push( Qr.read( i ) );
		taup.push( Pr.read( i ) );
	}
	reader = function reader2( i2, j2 ) {
		return Alog.get( i2, j2 );
	};
	Q = buildOrtho( m0, nQ, function rv( tt ) {
		return readVQ( reader, m0, upper, tt );
	}, tauq );
	P = buildOrtho( n0, nP, function ru( tt ) {
		return readUP( reader, n0, upper, tt );
	}, taup );
	return { 'Alog': Alog, 'tauq': tauq, 'taup': taup, 'Q': Q, 'P': P, 'upper': upper };
}

// Drive one property case against the explicit-factor oracle.
function runCase( f, m0, n0, freeN, vect, side, trans, tcode, layout, tvi, seed ) {
	var applyq = ( vect === 'apply-Q' );
	var Fmat = applyq ? f.Q : f.P;
	var ord = applyq ? m0 : n0; // order of the applied factor
	var K = applyq ? n0 : m0;
	var tau = applyq ? f.tauq : f.taup;
	var M = ( side === 'left' ) ? ord : freeN;
	var N = ( side === 'left' ) ? freeN : ord;
	var Ar = schemes.dense.realize( sc, f.Alog, { 'part': 'full' }, layout );
	var Tr = schemes.realizeVector( sc, tau, VEC_LAYOUTS[ tvi % VEC_LAYOUTS.length ] );
	var rng = new RNG( seed );
	var C0 = logical.general( sc, rng, M, N );
	var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
	var Wo = poisonedWork( sc, ormWork( side, M, N ) );
	var expected;

	dormbr( vect, side, trans, M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );

	expected = ( side === 'left' ) ? ref.matmul( sc, Fmat, C0, { 'transa': tcode } ) : ref.matmul( sc, C0, Fmat, { 'transb': tcode } );
	return {
		'got': readFull( Cr, M, N ),
		'expected': expected,
		'label': NAME + ' vect=' + vect + ' side=' + side + ' trans=' + trans + ' m0=' + m0 + ' n0=' + n0 + ' M=' + M + ' N=' + N + ' K=' + K
	};
}


// Step 2/5: PROPERTY. op(F)·C by dormbr == explicit-factor oracle, swept over
// vect × side × trans × (m0,n0) × free × dense layouts (all layouts for
// small/medium dims, tight only for large).
test( 'dormbr: op(Q/P)·C matches explicit-factor oracle (vect × side × trans × dims × layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var m0 = pr[ 0 ];
		var n0 = pr[ 1 ];
		var f = factor( m0, n0, ( 0x5000 + ( m0 * 100 ) + n0 ) >>> 0 );
		var layouts = ( Math.max( m0, n0 ) <= 17 ) ? ALL_LAYOUTS : [ null ];
		[ 'apply-Q', 'apply-P' ].forEach( function eachVect( vect ) {
			[ 'left', 'right' ].forEach( function eachSide( side ) {
				[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
					FREE.forEach( function eachFree( freeN, fi ) {
						layouts.forEach( function eachLayout( layout, li ) {
							var seed = ( 0x9000 + ( m0 * 977 ) + ( n0 * 41 ) + ( vect === 'apply-Q' ? 0 : 13 ) + ( side === 'left' ? 0 : 7 ) + ( freeN * 3 ) ) >>> 0;
							var r = runCase( f, m0, n0, freeN, vect, side, tc[ 0 ], tc[ 1 ], layout, fi + li, seed );
							checked( NAME, 'reconstruct', function run() {
								check.assertReconstruct( sc, r.got, r.expected, { 'factor': 100, 'label': r.label + ' layout=' + li } );
							} );
						} );
					} );
				} );
			} );
		} );
	} );
} );


// Blocked property: original dims > NB so dormqr/dormlq reach dlarft/dlarfb, in
// BOTH orientations (upper exercises VECT='Q' primary + VECT='P' secondary; lower
// the reverse). Tight layout, larger free dim.
test( 'dormbr: blocked path (reflector count > NB) matches oracle', function t() {
	[ [ 40, 36 ], [ 36, 40 ], [ 48, 40 ], [ 40, 48 ] ].forEach( function eachShape( pr ) {
		var m0 = pr[ 0 ];
		var n0 = pr[ 1 ];
		var f = factor( m0, n0, ( 0x6000 + ( m0 * 100 ) + n0 ) >>> 0 );
		[ 'apply-Q', 'apply-P' ].forEach( function eachVect( vect ) {
			[ 'left', 'right' ].forEach( function eachSide( side ) {
				[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
					var seed = ( 0x7000 + ( m0 * 977 ) + ( n0 * 41 ) + ( vect === 'apply-Q' ? 0 : 13 ) + ( side === 'left' ? 0 : 7 ) ) >>> 0;
					var r = runCase( f, m0, n0, 30, vect, side, tc[ 0 ], tc[ 1 ], null, 0, seed );
					checked( NAME, 'reconstruct', function run() {
						check.assertReconstruct( sc, r.got, r.expected, { 'factor': 100, 'label': r.label + ' (blocked)' } );
					} );
				} );
			} );
		} );
	} );
} );


// Step 3/4: LAYOUT INVARIANCE. Freeze the factored reflectors + tau + C0, then
// re-realize A and C per layout and run ONLY dormbr; assert bit-exact output WITHIN
// a storage-order family (col / row). The optimized dgemv/dger/dgemm inside
// dlarfb reorder across the col<->row flip, so cross-family equality is NOT
// expected (and is covered by the property above).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'dormbr: bit-exact within storage-order family (col / row)', function t() {
	[ [ 40, 36 ], [ 36, 40 ] ].forEach( function eachShape( pr ) {
		var m0 = pr[ 0 ];
		var n0 = pr[ 1 ];
		var tag = ( m0 >= n0 ) ? 'upper' : 'lower';
		var f = factor( m0, n0, ( 0x6000 + ( m0 * 100 ) + n0 ) >>> 0 );
		[ 'apply-Q', 'apply-P' ].forEach( function eachVect( vect ) {
			[ 'left', 'right' ].forEach( function eachSide( side ) {
				[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
					var applyq = ( vect === 'apply-Q' );
					var ord = applyq ? m0 : n0;
					var K = applyq ? n0 : m0;
					var tau = applyq ? f.tauq : f.taup;
					var M = ( side === 'left' ) ? ord : 30;
					var N = ( side === 'left' ) ? 30 : ord;
					var C0 = logical.general( sc, new RNG( ( 0x7700 + ( m0 * 13 ) + ( n0 * 7 ) + ( applyq ? 0 : 5 ) + ( side === 'left' ? 0 : 3 ) ) >>> 0 ), M, N );
					[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
						checked( NAME, 'layout-invariance', function run() {
							layoutInvariant( fam[ 0 ], function build( layout, i ) {
								var Ar = schemes.dense.realize( sc, f.Alog, { 'part': 'full' }, layout );
								var Tr = schemes.realizeVector( sc, tau, VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
								var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
								var Wo = poisonedWork( sc, ormWork( side, M, N ) );
								dormbr( vect, side, tc[ 0 ], M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
								return check.flattenLogical( sc, readFull( Cr, M, N ) );
							}, { 'label': NAME + ' vect=' + vect + ' side=' + side + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major ' + tag } );
						} );
					} );
				} );
			} );
		} );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). dormbr dispatches
// to the BLOCKED dormqr/dormlq (reflector count > NB), which store the block
// reflector T in a SEPARATE trailing WORK segment -> real consumption is
// nw*NB + (NB+1)*NB (nw = N for left, M for right), NOT the unblocked nw. Derive the
// advertised minimum from the wrapper's own throw boundary, run at exactly that
// length with a POISONED buffer on the BLOCKED path, and require finite output (no
// NaN leak from reading past WORK) AND that the apply still matches the oracle.
// Cover both sides and both vects.
test( 'dormbr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	// [ vect, side, m0, n0, freeN ]; reflector count (n0 for Q, m0 for P) > NB.
	[ [ 'apply-Q', 'left', 40, 40, 50 ],
		[ 'apply-Q', 'right', 40, 40, 50 ],
		[ 'apply-P', 'left', 40, 40, 50 ],
		[ 'apply-P', 'right', 40, 40, 50 ] ].forEach( function eachCase( cfg ) {
		var vect = cfg[ 0 ];
		var side = cfg[ 1 ];
		var m0 = cfg[ 2 ];
		var n0 = cfg[ 3 ];
		var freeN = cfg[ 4 ];
		var applyq = ( vect === 'apply-Q' );
		var ord = applyq ? m0 : n0;
		var K = applyq ? n0 : m0;
		var M = ( side === 'left' ) ? ord : freeN;
		var N = ( side === 'left' ) ? freeN : ord;
		var f = factor( m0, n0, ( 0xB000 + ( m0 * 100 ) + n0 ) >>> 0 );
		var tau = applyq ? f.tauq : f.taup;
		var Fmat = applyq ? f.Q : f.P;
		var label = NAME + ' WORK-min vect=' + vect + ' side=' + side + ' M=' + M + ' N=' + N + ' K=' + K;
		var cseed = ( 0xC000 + ( m0 * 7 ) + n0 + ( applyq ? 0 : 3 ) + ( side === 'left' ? 0 : 1 ) ) >>> 0;
		var minLen;
		var Cr;
		var expected;

		// The blocked path must actually be taken (reflector count > NB).
		if ( K <= NB ) {
			throw new Error( label + ': not on the blocked path (K<=NB); pick larger dims' );
		}

		// run(len): apply with a poisoned WORK of `len`; returns flat C. MUST throw
		// the wrapper's RangeError when WORK is too small.
		function run( len ) {
			var Ar = schemes.dense.realize( sc, f.Alog, { 'part': 'full' }, null );
			var Tr = schemes.realizeVector( sc, tau, TIGHT_VEC );
			var C0 = logical.general( sc, new RNG( cseed ), M, N );
			var Crun = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
			var Wo = poisonedWork( sc, len );
			dormbr( vect, side, 'no-transpose', M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Crun.data, Crun.args[ 0 ], Crun.args[ 1 ], Crun.args[ 2 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Crun, M, N ) );
		}

		minLen = assertWorkspaceSufficient( run, {}, label );

		// And the apply must still match the oracle at exactly that minimum.
		Cr = schemes.dense.realize( sc, logical.general( sc, new RNG( cseed ), M, N ), { 'part': 'full' }, null );
		expected = ( side === 'left' ) ? ref.matmul( sc, Fmat, logical.general( sc, new RNG( cseed ), M, N ), {} ) : ref.matmul( sc, logical.general( sc, new RNG( cseed ), M, N ), Fmat, {} );
		( function applyAtMin() {
			var Ar = schemes.dense.realize( sc, f.Alog, { 'part': 'full' }, null );
			var Tr = schemes.realizeVector( sc, tau, TIGHT_VEC );
			dormbr( vect, side, 'no-transpose', M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, minLen ), 1, 0 );
		} )();
		check.assertReconstruct( sc, readFull( Cr, M, N ), expected, { 'factor': 100, 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
