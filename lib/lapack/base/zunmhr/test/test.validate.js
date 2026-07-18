/**
* Property-based validation for zunmhr, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `unmhr` (BLOCKED apply-Q) ->
* overwrite the M-by-N matrix C with op(Q)*C (side='left') or C*op(Q)
* (side='right'), where Q = H(ilo)…H(ihi-1) is the unitary factor of a Hessenberg
* reduction (reflectors + TAU as returned by ZGEHRD), and op(Q) is Q
* (trans='no-transpose') or Qᴴ (trans='conjugate-transpose'). ILO/IHI are 1-BASED;
* Q has order nq = M (left) or N (right), and we validate the full reduction ilo=1,
* ihi=nq (nh = nq-1 reflectors).
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct'): form the
* EXPLICIT unitary Q from the SAME reflectors via `zunghr` (a separately validated
* routine), then compute op(Q)*C0 / C0*op(Q) with the harness's naive `ref.matmul`
* and compare to zunmhr's in-place output. Because zunghr forms Q by an independent
* code path, a systematic reflector/side/trans error in zunmhr would disagree.
*
* zunmhr delegates to the BLOCKED zunmqr (zlarft + zlarfb, whenever nh > NB=32),
* whose optimized zgemm/zgemv selects its summation form by comparing operand
* strides: therefore bit-exact layout invariance holds only WITHIN a storage-order
* family (col vs row), and cross-order correctness is certified by the property
* swept over ALL layouts. Step 4c probes the advertised WORK minimum on the BLOCKED
* path with a poisoned buffer (zunmhr forwards WORK straight to zunmqr, which stores
* the block reflector T in a trailing segment).
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zunmhr from './../lib/ndarray.js';
import zgehrd from '../../zgehrd/lib/ndarray.js';
import zunghr from '../../zunghr/lib/ndarray.js';

var sc = S.complex; // z-routine
var NAME = 'zunmhr';
var TRANS_T = 'conjugate-transpose'; // op(Q) = Qᴴ for a complex routine
var TCODE_T = 'c'; // matmul transpose code matching TRANS_T
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32;
var LDT = 65;

// (M,N) pairs; nq = M (left) / N (right) spans unblocked and blocked (nq>=34).
var PAIRS = [
	[ 1, 1 ], [ 2, 3 ], [ 3, 2 ], [ 4, 4 ], [ 5, 4 ], [ 8, 8 ], [ 16, 10 ],
	[ 17, 17 ], [ 33, 20 ], [ 20, 33 ], [ 40, 40 ], [ 48, 40 ], [ 40, 48 ],
	[ 64, 48 ], [ 48, 64 ], [ 0, 3 ], [ 3, 0 ], [ 0, 0 ]
];

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// WORK zgehrd needs (full reduction ilo=1,ihi=nq): blocked nq*NB + LDT*NB, else nq.
function gehrdWork( nq ) {
	return ( nq > NB ) ? ( ( nq * NB ) + ( LDT * NB ) ) : Math.max( 1, nq );
}

// WORK zunghr advertises: nh*NB (nh = nq-1), else 1.
function orghrWork( nq ) {
	return Math.max( 1, ( nq - 1 ) * NB );
}

// Generous WORK superset for the zunmhr apply (covers the blocked zunmqr need
// nw*NB + (NB+1)*NB, nw = N for left / M for right).
function ormWork( side, M, N ) {
	var nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
}

function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
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

function tauValues( Tvec, k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( Tvec.read( i ) );
	}
	return a;
}

// Factor an nq×nq matrix with zgehrd. Returns { Fac (LogicalMatrix of the
// reflectors + H), taus }.
function factor( nq, seed ) {
	var k = Math.max( 0, nq - 1 );
	var rng = new RNG( seed );
	var A0 = logical.general( sc, rng, nq, nq );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
	zgehrd( nq, 1, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, gehrdWork( nq ) ), 1, 0 );
	return {
		'Fac': readFull( Ar, nq, nq ),
		'taus': tauValues( Tr, k )
	};
}

// Form the EXPLICIT nq×nq unitary Q from a zgehrd factor via the independent
// zunghr. Returns Q as a LogicalMatrix.
function formQ( Fac, taus, nq ) {
	var Qr = schemes.dense.realize( sc, Fac, { 'part': 'full' }, null );
	var Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
	zunghr( nq, 1, nq, Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Qr.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, orghrWork( nq ) ), 1, 0 );
	return readFull( Qr, nq, nq );
}

function seedFor( M, N, side ) {
	return ( 0x100 + ( M * 1000 ) + ( N * 10 ) + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Drive one property case: apply op(Q) to C0 with zunmhr and compare to the
// explicit-Q oracle. Returns { got, expected, label }.
function runCase( M, N, side, trans, tcode, layout ) {
	var nq = ( side === 'left' ) ? M : N;
	var active = ( M > 0 && N > 0 && nq > 1 ); // nq<=1 -> nh=0 -> Q = I
	var rng = new RNG( seedFor( M, N, side ) );
	var f;
	var Ar;
	var Tr;
	var C0;
	var Cr;
	var expected;
	var Q;

	if ( active ) {
		f = factor( nq, seedFor( M, N, side ) );
	} else {
		f = { 'Fac': logical.general( sc, rng, Math.max( nq, 0 ), Math.max( nq, 0 ) ), 'taus': poison( Math.max( 0, nq - 1 ) ) };
	}
	Ar = schemes.dense.realize( sc, f.Fac, { 'part': 'full' }, layout );
	Tr = schemes.realizeVector( sc, ( f.taus.length ? f.taus : poison( 0 ) ), TIGHT_VEC );

	C0 = logical.general( sc, rng, M, N );
	Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );

	zunmhr( side, trans, M, N, 1, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, ormWork( side, M, N ) ), 1, 0 );

	if ( active ) {
		Q = formQ( f.Fac, f.taus, nq );
		expected = ( side === 'left' ) ? ref.matmul( sc, Q, C0, { 'transa': tcode } ) : ref.matmul( sc, C0, Q, { 'transb': tcode } );
	} else {
		expected = C0; // op(Q) = I (nh=0) or empty (M=0/N=0)
	}
	return {
		'got': readFull( Cr, M, N ),
		'expected': expected,
		'label': NAME + ' side=' + side + ' trans=' + trans + ' M=' + M + ' N=' + N + ' nq=' + nq
	};
}


// Step 2/5: PROPERTY. op(Q) applied by zunmhr == explicit-Q (zunghr) oracle,
// swept over side × trans × (M,N) × dense layouts (all layouts for small/medium
// dims, tight only for large).
test( 'zunmhr: op(Q)·C matches explicit-Q oracle (side × trans × dims × layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var layouts = ( Math.max( M, N ) <= 33 ) ? ALL_LAYOUTS : [ null ];
		[ 'left', 'right' ].forEach( function eachSide( side ) {
			[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
				layouts.forEach( function eachLayout( layout, li ) {
					var r = runCase( M, N, side, tc[ 0 ], tc[ 1 ], layout );
					checked( NAME, 'reconstruct', function run() {
						check.assertReconstruct( sc, r.got, r.expected, { 'factor': 100, 'label': r.label + ' layout=' + li } );
					} );
				} );
			} );
		} );
	} );
} );


// Step 3: LAYOUT INVARIANCE. Freeze the reflectors + TAU + C0 (factor ONCE,
// tight), then re-realize A and C per layout and run ONLY zunmhr; assert bit-exact
// output WITHIN a storage-order family (col / row). The optimized zgemv/zgemm
// inside zlarfb reorders across the col<->row flip, so cross-family equality is
// NOT expected (covered by the property above). Blocked case (nq=48 -> nh=47>NB).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var VEC_LAYOUTS = schemes.vectorLayouts();

test( 'zunmhr: bit-exact within storage-order family (col / row), blocked', function t() {
	[ [ 'left', 48, 40 ], [ 'right', 40, 48 ] ].forEach( function eachCase( cfg ) {
		var side = cfg[ 0 ];
		var M = cfg[ 1 ];
		var N = cfg[ 2 ];
		var nq = ( side === 'left' ) ? M : N; // 48 -> nh=47 > NB=32 -> blocked
		var f = factor( nq, seedFor( M, N, side ) );
		var rng = new RNG( seedFor( M, N, side ) + 1 );
		var C0 = logical.general( sc, rng, M, N );

		[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
			[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( famv ) {
				checked( NAME, 'layout-invariance', function run() {
					layoutInvariant( famv[ 0 ], function build( layout, i ) {
						var Ar = schemes.dense.realize( sc, f.Fac, { 'part': 'full' }, layout );
						var Tr = schemes.realizeVector( sc, f.taus, VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
						var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
						zunmhr( side, tc[ 0 ], M, N, 1, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, ormWork( side, M, N ) ), 1, 0 );
						return check.flattenLogical( sc, readFull( Cr, M, N ) );
					}, { 'label': NAME + ' side=' + side + ' trans=' + tc[ 0 ] + ' ' + famv[ 1 ] + '-major invariance' } );
				} );
			} );
		} );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). zunmhr forwards
// WORK straight to the BLOCKED zunmqr, which stores the block reflector T in a
// SEPARATE trailing WORK segment, so the real consumption is nw*NB + (NB+1)*NB
// (nw = N for left, M for right) — far more than the unblocked nw. Derive the
// advertised minimum from the wrapper's own throw boundary, then run at exactly
// that length with a POISONED WORK on the BLOCKED path (nq=48 -> nh=47>NB) and
// require finite output (no NaN leak past WORK) AND that op(Q) still matches the
// explicit-Q oracle. Cover both sides (left -> WORK ~N, right -> WORK ~M).
test( 'zunmhr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 'left', 48, 40 ], [ 'right', 40, 48 ] ].forEach( function eachCase( cfg ) {
		var side = cfg[ 0 ];
		var M = cfg[ 1 ];
		var N = cfg[ 2 ];
		var nq = ( side === 'left' ) ? M : N; // nh = nq-1 = 47 > NB -> blocked
		var trans = 'no-transpose';
		var label = NAME + ' WORK-min side=' + side + ' M=' + M + ' N=' + N;

		var f = factor( nq, seedFor( M, N, side ) );
		var rng = new RNG( seedFor( M, N, side ) + 1 );
		var C0 = logical.general( sc, rng, M, N );

		function run( len ) {
			var Ar = schemes.dense.realize( sc, f.Fac, { 'part': 'full' }, null );
			var Tr = schemes.realizeVector( sc, f.taus, TIGHT_VEC );
			var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
			zunmhr( side, trans, M, N, 1, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, len ), 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		// The blocked path must actually have been taken.
		if ( nq - 1 <= NB ) {
			throw new Error( label + ': case is not on the blocked path (nh<=NB); pick larger dims' );
		}

		// And the apply must still match the oracle at exactly that minimum.
		var Ar = schemes.dense.realize( sc, f.Fac, { 'part': 'full' }, null );
		var Tr = schemes.realizeVector( sc, f.taus, TIGHT_VEC );
		var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
		zunmhr( side, trans, M, N, 1, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, minLen ), 1, 0 );
		var Q = formQ( f.Fac, f.taus, nq );
		var expected = ( side === 'left' ) ? ref.matmul( sc, Q, C0, {} ) : ref.matmul( sc, C0, Q, {} );
		check.assertReconstruct( sc, readFull( Cr, M, N ), expected, { 'factor': 100, 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
