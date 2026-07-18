/**
* Property-based validation for zunmtr, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `unmtr` (apply-Q) -> overwrite the
* M-by-N matrix C with op(Q)*C (side='left') or C*op(Q) (side='right'), where Q is
* the unitary factor of order NQ (NQ=M for left, NQ=N for right) produced by
* `zhetrd`'s tridiagonal reduction of a Hermitian matrix (reflectors + TAU), and
* op(Q) is Q (trans='no-transpose') or Qᴴ (trans='conjugate-transpose').
* Internally it reduces to a BLOCKED zunmql (uplo='upper') or zunmqr (uplo='lower')
* on the (NQ-1) reflectors.
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct'): form the
* EXPLICIT unitary Q from the SAME reflectors via `zungtr` (a separately validated
* routine), then compute op(Q)*C0 / C0*op(Q) with the harness's naive `ref.matmul`
* and compare to zunmtr's in-place output.
*
* zunmtr's sub-kernel (zunmql/zunmqr) is BLOCKED (zlarft + zlarfb) whenever
* NQ-1 > NB=32, storing the block reflector T in a trailing WORK segment. Step 4c
* probes the advertised WORK minimum on the BLOCKED path with a poisoned buffer.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zunmtr from './../lib/ndarray.js';
import zhetrd from '../../zhetrd/lib/ndarray.js';
import zungtr from '../../zungtr/lib/ndarray.js';

const sc = S.complex; // z-routine
const RE = S.real; // d, e real
const NAME = 'zunmtr';
const TRANS_C = 'conjugate-transpose'; // op(Q) = Qᴴ for a complex routine
const TCODE_C = 'c';
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32;

const PAIRS = [
	[ 1, 1 ], [ 2, 2 ], [ 3, 2 ], [ 2, 3 ], [ 4, 4 ], [ 5, 4 ], [ 3, 5 ],
	[ 7, 7 ], [ 8, 5 ], [ 5, 8 ], [ 16, 16 ], [ 17, 12 ], [ 12, 17 ],
	[ 33, 33 ], [ 17, 33 ], [ 33, 17 ], [ 48, 40 ], [ 40, 48 ],
	[ 0, 3 ], [ 3, 0 ], [ 4, 4 ]
];

const ALL_LAYOUTS = schemes.dense.layouts();
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
const VEC_LAYOUTS = schemes.vectorLayouts();


// HELPERS //

function poisonReal( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( { 're': NaN, 'im': NaN } );
	}
	return a;
}

function readFull( Ard, rows, cols ) {
	const F = new LogicalMatrix( sc, rows, cols );
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

function freezeFactor( Ard, N, uplo ) {
	const F = new LogicalMatrix( sc, N, N );
	let i, j;
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

// Generous WORK superset for zunmtr (covers the blocked nw*NB + (NB+1)*NB).
function ormWork( side, M, N ) {
	const nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
}

// Form the EXPLICIT NQ x NQ unitary Q from a zhetrd-factored triangle + tau, via
// the independent zungtr.
function formQ( Flog, tauVals, nq, uplo ) {
	const Qr = schemes.dense.realize( sc, Flog, { 'part': uplo }, null );
	const Tr = schemes.realizeVector( sc, tauVals, TIGHT_VEC );
	const Wr = poisonedWork( sc, Math.max( 1, ( nq - 1 ) * NB ) );
	zungtr( uplo, nq, Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Qr.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr, 1, 0 );
	return readFull( Qr, nq, nq );
}

function seedFor( M, N, side ) {
	return ( 0x100 + ( M * 1000 ) + ( N * 10 ) + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

function reduce( uplo, nq, rng ) {
	const A0 = logical.hermitian( sc, rng, nq );
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
	const dR = schemes.realizeVector( RE, poisonReal( nq ), TIGHT_VEC );
	const eR = schemes.realizeVector( RE, poisonReal( Math.max( nq - 1, 0 ) ), TIGHT_VEC );
	const tR = schemes.realizeVector( sc, poison( Math.max( nq - 1, 0 ) ), TIGHT_VEC );
	zhetrd( uplo, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], dR.data, dR.args[ 0 ], dR.args[ 1 ], eR.data, eR.args[ 0 ], eR.args[ 1 ], tR.data, tR.args[ 0 ], tR.args[ 1 ] );
	const taus = [];
	let i;
	for ( i = 0; i < nq - 1; i++ ) {
		taus.push( tR.read( i ) );
	}
	return { 'F': freezeFactor( Ar, nq, uplo ), 'taus': taus };
}

function runCase( M, N, side, uplo, trans, tcode, layout ) {
	const nq = ( side === 'left' ) ? M : N;
	const active = ( M > 0 && N > 0 && nq > 1 );
	const rng = new RNG( seedFor( M, N, side ) + ( uplo === 'upper' ? 0 : 3 ) );
	const red = active ? reduce( uplo, nq, rng ) : { 'F': new LogicalMatrix( sc, Math.max( nq, 0 ), Math.max( nq, 0 ) ), 'taus': [] };

	const Ar = schemes.dense.realize( sc, red.F, { 'part': uplo }, layout );
	const Tr = schemes.realizeVector( sc, ( red.taus.length ? red.taus : poison( 1 ) ), TIGHT_VEC );

	const C0 = logical.general( sc, rng, M, N );
	const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
	const Wo = poisonedWork( sc, ormWork( side, M, N ) );

	zunmtr( side, uplo, trans, M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );

	let expected;
	if ( active ) {
		const Q = formQ( red.F, red.taus, nq, uplo );
		expected = ( side === 'left' ) ? ref.matmul( sc, Q, C0, { 'transa': tcode } ) : ref.matmul( sc, C0, Q, { 'transb': tcode } );
	} else {
		expected = C0;
	}
	return {
		'got': readFull( Cr, M, N ),
		'expected': expected,
		'label': NAME + ' side=' + side + ' uplo=' + uplo + ' trans=' + trans + ' M=' + M + ' N=' + N
	};
}


// Step 2/5: PROPERTY. op(Q) applied by zunmtr == explicit-Q (zungtr) oracle, swept
// over side × uplo × trans × (M,N) × dense layouts (all layouts for small/medium
// dims, tight only for large).
test( 'zunmtr: op(Q)·C matches explicit-Q (zungtr) oracle (side × uplo × trans × dims × layouts)', function t() {
	PAIRS.forEach( function eachP( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const layouts = ( Math.max( M, N ) <= 33 ) ? ALL_LAYOUTS : [ null ];
		[ 'left', 'right' ].forEach( function eachSide( side ) {
			[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
				[ [ 'no-transpose', 'n' ], [ TRANS_C, TCODE_C ] ].forEach( function eachTrans( tc ) {
					layouts.forEach( function eachLayout( layout, li ) {
						const r = runCase( M, N, side, uplo, tc[ 0 ], tc[ 1 ], layout );
						checked( NAME, 'reconstruct', function run() {
							check.assertReconstruct( sc, r.got, r.expected, { 'factor': 100, 'label': r.label + ' layout=' + li } );
						} );
					} );
				} );
			} );
		} );
	} );
} );


// Step 3: LAYOUT INVARIANCE within a storage-order family (col / row).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'zunmtr: bit-exact within storage-order family (col / row)', function t() {
	const M = 48;
	const N = 40;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			[ [ 'no-transpose', 'n' ], [ TRANS_C, TCODE_C ] ].forEach( function eachTrans( tc ) {
				const nq = ( side === 'left' ) ? M : N;
				const red = reduce( uplo, nq, new RNG( seedFor( M, N, side ) + ( uplo === 'upper' ? 0 : 3 ) ) );
				const C0 = logical.general( sc, new RNG( 0xC0 + ( side === 'left' ? 1 : 2 ) ), M, N );
				[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
					checked( NAME, 'layout-invariance', function run() {
						layoutInvariant( fam[ 0 ], function build( layout, i ) {
							const Ar = schemes.dense.realize( sc, red.F, { 'part': uplo }, layout );
							const Tr = schemes.realizeVector( sc, red.taus, VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
							const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
							const Wo = poisonedWork( sc, ormWork( side, M, N ) );
							zunmtr( side, uplo, tc[ 0 ], M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
							return check.flattenLogical( sc, readFull( Cr, M, N ) );
						}, { 'label': NAME + ' side=' + side + ' uplo=' + uplo + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major invariance' } );
					} );
				} );
			} );
		} );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). The blocked
// sub-kernel (zunmql/zunmqr, NQ-1>NB) stores the block reflector T in a trailing
// WORK segment, so the real consumption is nw*NB + (NB+1)*NB (nw = N for left, M
// for right). Derive the advertised minimum from the wrapper's throw boundary, run
// at exactly that length with a POISONED WORK on the BLOCKED path, and require
// finite output AND agreement with the oracle. Cover both sides.
test( 'zunmtr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 'left', 80, 50 ], [ 'right', 50, 80 ] ].forEach( function eachCase( cfg ) {
		const side = cfg[ 0 ];
		const M = cfg[ 1 ];
		const N = cfg[ 2 ];
		const uplo = 'lower';
		const nq = ( side === 'left' ) ? M : N;
		const trans = 'no-transpose';
		const label = NAME + ' WORK-min side=' + side + ' M=' + M + ' N=' + N;

		const red = reduce( uplo, nq, new RNG( seedFor( M, N, side ) + 3 ) );
		const C0 = logical.general( sc, new RNG( 0xB0 + ( side === 'left' ? 1 : 2 ) ), M, N );

		function run( len ) {
			const Ar = schemes.dense.realize( sc, red.F, { 'part': uplo }, null );
			const Tr = schemes.realizeVector( sc, red.taus, TIGHT_VEC );
			const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
			const Wo = poisonedWork( sc, len );
			zunmtr( side, uplo, trans, M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		const Ar = schemes.dense.realize( sc, red.F, { 'part': uplo }, null );
		const Tr = schemes.realizeVector( sc, red.taus, TIGHT_VEC );
		const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
		zunmtr( side, uplo, trans, M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, minLen ), 1, 0 );
		const Q = formQ( red.F, red.taus, nq, uplo );
		const expected = ( side === 'left' ) ? ref.matmul( sc, Q, C0, {} ) : ref.matmul( sc, C0, Q, {} );
		check.assertReconstruct( sc, readFull( Cr, M, N ), expected, { 'factor': 100, 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
