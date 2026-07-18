/**
* Property-based validation for dtbtrs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tb` -> triangular BANDED
* (schemes.banded with half-bandwidth kd, logical.triangularBanded); `trs`
* (multi-RHS triangular solve, no factorization) -> backward-error residual
* property `op(A)*X = B` per RHS column against the independent matvec/residual
* oracle, sweeping uplo x trans x diag x N x kd x nrhs. Uses the backward-error
* normalization `‖op(A)X - B‖ / (‖A‖_F‖X‖ + ‖B‖)` (check.assertResidual), robust
* for the possibly ill-conditioned unit-diagonal case.
*
* dtbtrs applies dtbsv per RHS column; the tbsv kernel walks a FIXED element order
* per (uplo, trans) case, so band-array strides and the B strides change only
* addressing, never accumulation order — output is bit-exact across ALL banded
* layouts (single family) for AB and ALL dense layouts for B. Negative band
* strides (layouts 4-6) exercise the band-row-step class that bit dpbtf2 (see
* LEARNINGS.md, dpbtf2 entry).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtbtrs from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const DIAG = [ 'non-unit', 'unit' ];
const NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];
const NRHS = [ 1, 2, 3 ];

// trans flag -> reference transpose code.
const TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// Unique half-bandwidths in {0,1,2, N-1} clamped to [0, N-1] (diagonal-only
// through near-full band).
function bands( n ) {
	const hi = Math.max( 0, n - 1 );
	const out = [];
	[ 0, 1, 2, hi ].forEach( function each( k ) {
		const v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

// Read the solution matrix X (overwrites B) back into a LogicalMatrix.
function readSolution( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Steps 2-3-5: backward-error residual op(A)*X = B over uplo x trans x diag x N x
// kd x nrhs (incl diagonal kd=0 and near-full bands). A is diagonally dominant;
// the backward-error normalization keeps the unit-diagonal case honest.
test( 'dtbtrs: triangular-banded solve residual (uplo x trans x diag x N x kd x nrhs sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			const trans = tr[ 0 ];
			const code = tr[ 1 ];
			DIAG.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				NS.forEach( function eachN( N ) {
					bands( N ).forEach( function eachKd( kd ) {
						NRHS.forEach( function eachNrhs( nrhs ) {
							const rng = new RNG( 0x100 + ( N * 100 ) + ( kd * 10 ) + nrhs );
							const A0 = logical.triangularBanded( sc, rng, N, kd, { 'uplo': uplo, 'unit': unit } );
							const B0 = logical.general( sc, rng, N, nrhs );
							const R = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd, 'unit': unit }, schemes.banded.layouts()[ 0 ] );
							const BR = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
							dtbtrs( uplo, trans, diag, N, kd, nrhs, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], BR.data, BR.args[ 0 ], BR.args[ 1 ], BR.args[ 2 ] );
							const X = readSolution( BR, N, nrhs );
							checked( 'dtbtrs', 'residual', function run() {
								let j, i;
								for ( j = 0; j < nrhs; j++ ) {
									const xj = [];
									const bj = [];
									for ( i = 0; i < N; i++ ) {
										xj.push( X.get( i, j ) );
										bj.push( B0.get( i, j ) );
									}
									check.assertResidual( sc, A0, xj, bj, { 'trans': code, 'factor': 100, 'label': 'dtbtrs '+uplo+' '+trans+' '+diag+' N='+N+' kd='+kd+' nrhs='+nrhs+' col='+j } );
								}
							});
						});
					});
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. dtbtrs applies dtbsv per RHS column; the tbsv
// kernel walks a FIXED element order per (uplo, trans) case, so band-array and B
// strides change only addressing, never accumulation order — output is bit-exact
// across ALL banded layouts for AB (incl negative strides — the dpbtf2 band-step
// class) and ALL dense layouts for B (single family; no col/row split needed).
test( 'dtbtrs: solution is bit-exact across storage layouts', function t() {
	const N = 11;
	const kd = 3;
	const nrhs = 2;
	const SEED = 0xF00D;
	const aLayouts = schemes.banded.layouts();
	const bLayouts = schemes.dense.layouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			const trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				checked( 'dtbtrs', 'layout-invariance', function run() {
					layoutInvariant( aLayouts, function build( aL, idx ) {
						const rng = new RNG( SEED ); // identical values every variant
						const A0 = logical.triangularBanded( sc, rng, N, kd, { 'uplo': uplo, 'unit': unit } );
						const B0 = logical.general( sc, rng, N, nrhs );
						const R = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd, 'unit': unit }, aL );
						const bL = bLayouts[ idx % bLayouts.length ];
						const BR = schemes.dense.realize( sc, B0, { 'part': 'full' }, bL );
						dtbtrs( uplo, trans, diag, N, kd, nrhs, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], BR.data, BR.args[ 0 ], BR.args[ 1 ], BR.args[ 2 ] );
						return check.flattenLogical( sc, readSolution( BR, N, nrhs ) );
					}, { 'label': 'dtbtrs '+uplo+' '+trans+' '+diag+' layout invariance' } );
				});
			});
		});
	});
});
