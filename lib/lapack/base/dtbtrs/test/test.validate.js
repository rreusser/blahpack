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

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var DIAG = [ 'non-unit', 'unit' ];
var NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];
var NRHS = [ 1, 2, 3 ];

// trans flag -> reference transpose code.
var TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// Unique half-bandwidths in {0,1,2, N-1} clamped to [0, N-1] (diagonal-only
// through near-full band).
function bands( n ) {
	var hi = Math.max( 0, n - 1 );
	var out = [];
	[ 0, 1, 2, hi ].forEach( function each( k ) {
		var v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

// Read the solution matrix X (overwrites B) back into a LogicalMatrix.
function readSolution( R, n, nrhs ) {
	var X = new LogicalMatrix( sc, n, nrhs );
	var i;
	var j;
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
			var trans = tr[ 0 ];
			var code = tr[ 1 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				NS.forEach( function eachN( N ) {
					bands( N ).forEach( function eachKd( kd ) {
						NRHS.forEach( function eachNrhs( nrhs ) {
							var rng = new RNG( 0x100 + ( N * 100 ) + ( kd * 10 ) + nrhs );
							var A0 = logical.triangularBanded( sc, rng, N, kd, { 'uplo': uplo, 'unit': unit } );
							var B0 = logical.general( sc, rng, N, nrhs );
							var R = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd, 'unit': unit }, schemes.banded.layouts()[ 0 ] );
							var BR = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
							dtbtrs( uplo, trans, diag, N, kd, nrhs, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], BR.data, BR.args[ 0 ], BR.args[ 1 ], BR.args[ 2 ] );
							var X = readSolution( BR, N, nrhs );
							checked( 'dtbtrs', 'residual', function run() {
								var j;
								var i;
								for ( j = 0; j < nrhs; j++ ) {
									var xj = [];
									var bj = [];
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
	var N = 11;
	var kd = 3;
	var nrhs = 2;
	var SEED = 0xF00D;
	var aLayouts = schemes.banded.layouts();
	var bLayouts = schemes.dense.layouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			var trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				checked( 'dtbtrs', 'layout-invariance', function run() {
					layoutInvariant( aLayouts, function build( aL, idx ) {
						var rng = new RNG( SEED ); // identical values every variant
						var A0 = logical.triangularBanded( sc, rng, N, kd, { 'uplo': uplo, 'unit': unit } );
						var B0 = logical.general( sc, rng, N, nrhs );
						var R = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd, 'unit': unit }, aL );
						var bL = bLayouts[ idx % bLayouts.length ];
						var BR = schemes.dense.realize( sc, B0, { 'part': 'full' }, bL );
						dtbtrs( uplo, trans, diag, N, kd, nrhs, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], BR.data, BR.args[ 0 ], BR.args[ 1 ], BR.args[ 2 ] );
						return check.flattenLogical( sc, readSolution( BR, N, nrhs ) );
					}, { 'label': 'dtbtrs '+uplo+' '+trans+' '+diag+' layout invariance' } );
				});
			});
		});
	});
});
