/**
* Property-based validation for ztrsv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tr` -> dense triangular
* (schemes.dense, logical.triangular); `sv` (solve) -> backward-error residual
* property `op(A)*x = b` against the independent oracle. Uses the backward-error
* normalization `‖op(A)x - b‖ / (‖A‖_F‖x‖ + ‖b‖)` (check.assertResidual), which
* is robust even for the unit-diagonal case that can be ill-conditioned at large
* N.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztrsv from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const DIAG = [ 'non-unit', 'unit' ];

// trans flag -> reference transpose code.
const TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// Steps 2b-5: backward-error residual over uplo x trans x diag x N sweep
// (incl N=0,1). A is diagonally dominant (well-conditioned non-unit solves).
test( 'ztrsv: triangular solve residual (uplo x trans x diag x N sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			const trans = tr[ 0 ];
			const code = tr[ 1 ];
			DIAG.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				SIZES.forEach( function eachN( N ) {
					const rng = new RNG( 0x100 + N );
					const A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
					const b = [];
					let i;
					for ( i = 0; i < N; i++ ) {
						b.push( sc.random( rng ) );
					}
					const R = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, schemes.dense.layouts()[ 0 ] );
					const X = schemes.realizeVector( sc, b, { 'stride': 1 } );
					ztrsv( uplo, trans, diag, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
					const got = [];
					for ( i = 0; i < N; i++ ) {
						got.push( X.read( i ) );
					}
					checked( 'ztrsv', 'residual', function run() {
						check.assertResidual( sc, A, got, b, { 'trans': code, 'factor': 100, 'label': 'ztrsv '+uplo+' '+trans+' '+diag+' N='+N } );
					});
				});
			});
		});
	});
});

// The optimized kernel picks a summation order by which folded stride is
// smaller (dot form when |sb2| <= |sb1|, else axpy) — the two forms reorder the
// accumulation, so output is bit-exact ONLY within one form. We split the dense
// layouts into kernel-form families.
function kernelForm( trans, layout ) {
	const R = schemes.dense.realize( sc, new LogicalMatrix( sc, 9, 9 ), { 'part': 'full' }, layout );
	const sA1 = R.args[ 0 ];
	const sA2 = R.args[ 1 ];
	const sb1 = ( trans === 'no-transpose' ) ? sA1 : sA2;
	const sb2 = ( trans === 'no-transpose' ) ? sA2 : sA1;
	return ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) ? 'dot' : 'axpy';
}

// Step 3: layout-invariance fuzz — output bit-exact across A layouts and
// strided/negative x vectors, within a kernel-form family.
test( 'ztrsv: output is bit-exact across storage layouts (per kernel form)', function t() {
	const N = 9;
	const SEED = 0xF44E;
	const vLayouts = schemes.vectorLayouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			const trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				[ 'dot', 'axpy' ].forEach( function eachForm( form ) {
					const aLayouts = schemes.dense.layouts().filter( function keep( L ) {
						return kernelForm( trans, L ) === form;
					});
					if ( aLayouts.length < 2 ) {
						return; // need >= 2 layouts to compare
					}
					checked( 'ztrsv', 'layout-invariance', function run() {
						layoutInvariant( aLayouts, function build( aL, idx ) {
							const rng = new RNG( SEED ); // identical values every variant
							const A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
							const b = [];
							let i;
							for ( i = 0; i < N; i++ ) {
								b.push( sc.random( rng ) );
							}
							const R = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, aL );
							const vL = vLayouts[ idx % vLayouts.length ];
							const X = schemes.realizeVector( sc, b, vL );
							ztrsv( uplo, trans, diag, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
							const out = new LogicalMatrix( sc, N, 1 );
							for ( i = 0; i < N; i++ ) {
								out.set( i, 0, X.read( i ) );
							}
							return check.flattenLogical( sc, out );
						}, { 'label': 'ztrsv '+uplo+' '+trans+' '+diag+' '+form+'-form layout invariance' } );
					});
				});
			});
		});
	});
});
