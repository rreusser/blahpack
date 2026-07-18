/**
* Property-based validation for ztbsv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tb` -> triangular BANDED
* (schemes.banded with half-bandwidth k, logical.triangularBanded); `sv` (solve)
* -> backward-error residual property `op(A)*x = b` against the independent
* oracle. `op` includes the conjugate transpose ('c'), exercised by the harness's
* complex-aware oracle. Uses the backward-error normalization
* `‖op(A)x - b‖ / (‖A‖_F‖x‖ + ‖b‖)` (check.assertResidual), robust even for the
* unit-diagonal case that can be ill-conditioned at large N.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztbsv from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const DIAG = [ 'non-unit', 'unit' ];
const NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];

// trans flag -> reference transpose code.
const TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// Unique half-bandwidths in {0,1,2, N-1} clamped to [0, N-1] (diagonal-only
// through full band).
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

// Steps 2b-5: backward-error residual over uplo x trans x diag x N x K sweep.
// A is diagonally dominant (well-conditioned for the non-unit case); the
// backward-error normalization keeps the unit-diagonal case honest too.
test( 'ztbsv: triangular-banded solve residual (uplo x trans x diag x N x K sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			const trans = tr[ 0 ];
			const code = tr[ 1 ];
			DIAG.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				NS.forEach( function eachN( N ) {
					bands( N ).forEach( function eachK( K ) {
						const rng = new RNG( 0x100 + ( N * 10 ) + K );
						const A = logical.triangularBanded( sc, rng, N, K, { 'uplo': uplo, 'unit': unit } );
						const b = [];
						let i;
						for ( i = 0; i < N; i++ ) {
							b.push( sc.random( rng ) );
						}
						const R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': K, 'unit': unit }, schemes.banded.layouts()[ 0 ] );
						const X = schemes.realizeVector( sc, b, { 'stride': 1 } );
						ztbsv( uplo, trans, diag, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
						const got = [];
						for ( i = 0; i < N; i++ ) {
							got.push( X.read( i ) );
						}
						checked( 'ztbsv', 'residual', function run() {
							check.assertResidual( sc, A, got, b, { 'trans': code, 'factor': 100, 'label': 'ztbsv '+uplo+' '+trans+' '+diag+' N='+N+' K='+K } );
						});
					});
				});
			});
		});
	});
});

// Step 3: layout-invariance fuzz. The tbsv kernel walks a FIXED element order
// per (uplo, trans) case; the band-array strides (sa1, sa2) and the x stride
// change only addressing, never the accumulation order. So output is bit-exact
// across ALL band-array layouts and strided/negative x vectors for a fixed
// (uplo, trans, diag) — no col/row kernel-form family split required (unlike
// the dense ztrsv, whose kernel selects dot-vs-axpy by stride).
test( 'ztbsv: output is bit-exact across storage layouts', function t() {
	const N = 11;
	const K = 3;
	const SEED = 0xF22E;
	const vLayouts = schemes.vectorLayouts();
	const aLayouts = schemes.banded.layouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			const trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				checked( 'ztbsv', 'layout-invariance', function run() {
					layoutInvariant( aLayouts, function build( aL, idx ) {
						const rng = new RNG( SEED ); // identical values every variant
						const A = logical.triangularBanded( sc, rng, N, K, { 'uplo': uplo, 'unit': unit } );
						const b = [];
						let i;
						for ( i = 0; i < N; i++ ) {
							b.push( sc.random( rng ) );
						}
						const R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': K, 'unit': unit }, aL );
						const vL = vLayouts[ idx % vLayouts.length ];
						const X = schemes.realizeVector( sc, b, vL );
						ztbsv( uplo, trans, diag, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
						const out = new LogicalMatrix( sc, N, 1 );
						for ( i = 0; i < N; i++ ) {
							out.set( i, 0, X.read( i ) );
						}
						return check.flattenLogical( sc, out );
					}, { 'label': 'ztbsv '+uplo+' '+trans+' '+diag+' layout invariance' } );
				});
			});
		});
	});
});
