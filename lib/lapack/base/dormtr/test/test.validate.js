/**
* Property-based validation for dormtr, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ormtr` (apply-Q) -> overwrite the
* M-by-N matrix C with op(Q)*C (side='left') or C*op(Q) (side='right'), where Q is
* the orthogonal factor of order NQ (NQ=M for left, NQ=N for right) produced by
* `dsytrd`'s tridiagonal reduction of a symmetric matrix (reflectors + TAU), and
* op(Q) is Q (trans='no-transpose') or Qᵀ (trans='transpose'). Internally it
* reduces to a BLOCKED dormql (uplo='upper') or dormqr (uplo='lower') on the
* (NQ-1) reflectors.
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct'): form the
* EXPLICIT orthogonal Q from the SAME reflectors via `dorgtr` (a separately
* validated routine), then compute op(Q)*C0 / C0*op(Q) with the harness's naive
* `ref.matmul` and compare to dormtr's in-place output. Because dorgtr forms Q by
* an independent code path, a systematic reflector/side/trans/uplo error in dormtr
* would disagree with the oracle.
*
* dormtr's sub-kernel (dormql/dormqr) is BLOCKED (dlarft + dlarfb) whenever
* NQ-1 > NB=32, storing the block reflector T in a trailing WORK segment. Step 4c
* probes the advertised WORK minimum on the BLOCKED path with a poisoned buffer.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dormtr from './../lib/ndarray.js';
import dsytrd from '../../dsytrd/lib/ndarray.js';
import dorgtr from '../../dorgtr/lib/ndarray.js';

var sc = S.real; // d-routine
var RE = S.real; // d, e, TAU real for a d-routine
var NAME = 'dormtr';
var TRANS_T = 'transpose'; // op(Q) = Qᵀ for a real routine
var TCODE_T = 't';
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32;

// (M,N) pairs. NQ = M (left) or N (right); the explicit Q is NQ x NQ. Small/medium
// + one blocked (NQ-1 > NB); zero corners handled via the `active` flag.
var PAIRS = [
	[ 1, 1 ], [ 2, 2 ], [ 3, 2 ], [ 2, 3 ], [ 4, 4 ], [ 5, 4 ], [ 3, 5 ],
	[ 7, 7 ], [ 8, 5 ], [ 5, 8 ], [ 16, 16 ], [ 17, 12 ], [ 12, 17 ],
	[ 33, 33 ], [ 17, 33 ], [ 33, 17 ], [ 48, 40 ], [ 40, 48 ],
	[ 0, 3 ], [ 3, 0 ], [ 4, 4 ]
];

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
var VEC_LAYOUTS = schemes.vectorLayouts();


// HELPERS //

function poisonReal( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

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

// Capture the referenced triangle of a dsytrd-factored A into a LogicalMatrix
// (opposite triangle zeroed) so it can be re-realized for the dorgtr oracle.
function freezeFactor( Ard, N, uplo ) {
	var F = new LogicalMatrix( sc, N, N );
	var i;
	var j;
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

// Generous WORK superset for dormtr (covers the blocked nw*NB + (NB+1)*NB).
function ormWork( side, M, N ) {
	var nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
}

// Form the EXPLICIT NQ x NQ orthogonal Q from a dsytrd-factored triangle (Flog)
// + tau, via the independent dorgtr. Returns Q as a LogicalMatrix.
function formQ( Flog, tauVals, nq, uplo ) {
	var Qr = schemes.dense.realize( sc, Flog, { 'part': uplo }, null );
	var Tr = schemes.realizeVector( RE, tauVals, TIGHT_VEC );
	var Wr = poisonedWork( sc, Math.max( 1, ( nq - 1 ) * NB ) );
	dorgtr( uplo, nq, Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Qr.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr, 1, 0 );
	return readFull( Qr, nq, nq );
}

function seedFor( M, N, side ) {
	return ( 0x100 + ( M * 1000 ) + ( N * 10 ) + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Factor an nq x nq symmetric matrix with dsytrd; returns the frozen reflector
// triangle + tau values (dsytrd auto-allocates its own WORK).
function reduce( uplo, nq, rng ) {
	var A0 = logical.symmetric( sc, rng, nq );
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
	var dR = schemes.realizeVector( RE, poisonReal( nq ), TIGHT_VEC );
	var eR = schemes.realizeVector( RE, poisonReal( Math.max( nq - 1, 0 ) ), TIGHT_VEC );
	var tR = schemes.realizeVector( RE, poisonReal( Math.max( nq - 1, 0 ) ), TIGHT_VEC );
	dsytrd( uplo, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], dR.data, dR.args[ 0 ], dR.args[ 1 ], eR.data, eR.args[ 0 ], eR.args[ 1 ], tR.data, tR.args[ 0 ], tR.args[ 1 ] );
	var taus = [];
	var i;
	for ( i = 0; i < nq - 1; i++ ) {
		taus.push( tR.read( i ) );
	}
	return { 'F': freezeFactor( Ar, nq, uplo ), 'taus': taus };
}

// Drive one property case: apply op(Q) to C0 with dormtr, compare to the
// explicit-Q (dorgtr) oracle. Returns { got, expected, label }.
function runCase( M, N, side, uplo, trans, tcode, layout ) {
	var nq = ( side === 'left' ) ? M : N;
	var active = ( M > 0 && N > 0 && nq > 1 );
	var rng = new RNG( seedFor( M, N, side ) + ( uplo === 'upper' ? 0 : 3 ) );
	var red = active ? reduce( uplo, nq, rng ) : { 'F': new LogicalMatrix( sc, Math.max( nq, 0 ), Math.max( nq, 0 ) ), 'taus': [] };

	// Realize the reflector storage (A) for dormtr from the frozen factor.
	var Ar = schemes.dense.realize( sc, red.F, { 'part': uplo }, layout );
	var Tr = schemes.realizeVector( RE, ( red.taus.length ? red.taus : poisonReal( 1 ) ), TIGHT_VEC );

	var C0 = logical.general( sc, rng, M, N );
	var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
	var Wo = poisonedWork( sc, ormWork( side, M, N ) );

	dormtr( side, uplo, trans, M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );

	var expected;
	if ( active ) {
		var Q = formQ( red.F, red.taus, nq, uplo );
		expected = ( side === 'left' ) ? ref.matmul( sc, Q, C0, { 'transa': tcode } ) : ref.matmul( sc, C0, Q, { 'transb': tcode } );
	} else {
		expected = C0; // op(Q) = I (nq<=1) or empty (M=0/N=0)
	}
	return {
		'got': readFull( Cr, M, N ),
		'expected': expected,
		'label': NAME + ' side=' + side + ' uplo=' + uplo + ' trans=' + trans + ' M=' + M + ' N=' + N
	};
}


// Step 2/5: PROPERTY. op(Q) applied by dormtr == explicit-Q (dorgtr) oracle, swept
// over side × uplo × trans × (M,N) × dense layouts (all layouts for small/medium
// dims, tight only for large).
test( 'dormtr: op(Q)·C matches explicit-Q (dorgtr) oracle (side × uplo × trans × dims × layouts)', function t() {
	PAIRS.forEach( function eachP( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var layouts = ( Math.max( M, N ) <= 33 ) ? ALL_LAYOUTS : [ null ];
		[ 'left', 'right' ].forEach( function eachSide( side ) {
			[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
				[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
					layouts.forEach( function eachLayout( layout, li ) {
						var r = runCase( M, N, side, uplo, tc[ 0 ], tc[ 1 ], layout );
						checked( NAME, 'reconstruct', function run() {
							check.assertReconstruct( sc, r.got, r.expected, { 'factor': 100, 'label': r.label + ' layout=' + li } );
						} );
					} );
				} );
			} );
		} );
	} );
} );


// Step 3: LAYOUT INVARIANCE. Freeze the reflectors + tau + C0, then re-realize A
// and C per layout and run ONLY dormtr; assert bit-exact output WITHIN a
// storage-order family (col / row). The blocked dgemm/dtrmm inside dlarfb reorders
// across the col<->row flip, so cross-family equality is not expected (covered by
// the property above).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'dormtr: bit-exact within storage-order family (col / row)', function t() {
	var M = 48;
	var N = 40; // left: NQ=48 -> NQ-1=47 > NB; right: NQ=40 -> 39 > NB. blocked both sides.
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
				var nq = ( side === 'left' ) ? M : N;
				var red = reduce( uplo, nq, new RNG( seedFor( M, N, side ) + ( uplo === 'upper' ? 0 : 3 ) ) );
				var C0 = logical.general( sc, new RNG( 0xC0 + ( side === 'left' ? 1 : 2 ) ), M, N );
				[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
					checked( NAME, 'layout-invariance', function run() {
						layoutInvariant( fam[ 0 ], function build( layout, i ) {
							var Ar = schemes.dense.realize( sc, red.F, { 'part': uplo }, layout );
							var Tr = schemes.realizeVector( RE, red.taus, VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
							var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
							var Wo = poisonedWork( sc, ormWork( side, M, N ) );
							dormtr( side, uplo, tc[ 0 ], M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
							return check.flattenLogical( sc, readFull( Cr, M, N ) );
						}, { 'label': NAME + ' side=' + side + ' uplo=' + uplo + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major invariance' } );
					} );
				} );
			} );
		} );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). The blocked
// sub-kernel (dormql/dormqr, NQ-1>NB) stores the block reflector T in a trailing
// WORK segment, so the real consumption is nw*NB + (NB+1)*NB (nw = N for left, M
// for right) — far more than the unblocked nw the wrapper may advertise. Derive the
// advertised minimum from the wrapper's throw boundary, run at exactly that length
// with a POISONED WORK on the BLOCKED path, and require finite output AND agreement
// with the oracle. Cover both sides.
test( 'dormtr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 'left', 80, 50 ], [ 'right', 50, 80 ] ].forEach( function eachCase( cfg ) {
		var side = cfg[ 0 ];
		var M = cfg[ 1 ];
		var N = cfg[ 2 ];
		var uplo = 'lower';
		var nq = ( side === 'left' ) ? M : N; // 80 -> NQ-1=79 > NB -> blocked
		var trans = 'no-transpose';
		var label = NAME + ' WORK-min side=' + side + ' M=' + M + ' N=' + N;

		var red = reduce( uplo, nq, new RNG( seedFor( M, N, side ) + 3 ) );
		var C0 = logical.general( sc, new RNG( 0xB0 + ( side === 'left' ? 1 : 2 ) ), M, N );

		function run( len ) {
			var Ar = schemes.dense.realize( sc, red.F, { 'part': uplo }, null );
			var Tr = schemes.realizeVector( RE, red.taus, TIGHT_VEC );
			var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
			var Wo = poisonedWork( sc, len );
			dormtr( side, uplo, trans, M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		// The apply must still match the oracle at exactly that minimum.
		var Ar = schemes.dense.realize( sc, red.F, { 'part': uplo }, null );
		var Tr = schemes.realizeVector( RE, red.taus, TIGHT_VEC );
		var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
		dormtr( side, uplo, trans, M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, minLen ), 1, 0 );
		var Q = formQ( red.F, red.taus, nq, uplo );
		var expected = ( side === 'left' ) ? ref.matmul( sc, Q, C0, {} ) : ref.matmul( sc, C0, Q, {} );
		check.assertReconstruct( sc, readFull( Cr, M, N ), expected, { 'factor': 100, 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
