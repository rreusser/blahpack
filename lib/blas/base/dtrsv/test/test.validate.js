/**
* Property-based validation for dtrsv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr` -> dense triangular
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
import dtrsv from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var DIAG = [ 'non-unit', 'unit' ];

// trans flag -> reference transpose code.
var TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// Steps 2b-5: backward-error residual over uplo x trans x diag x N sweep
// (incl N=0,1). A is diagonally dominant (well-conditioned non-unit solves).
test( 'dtrsv: triangular solve residual (uplo x trans x diag x N sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			var trans = tr[ 0 ];
			var code = tr[ 1 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				SIZES.forEach( function eachN( N ) {
					var rng = new RNG( 0x100 + N );
					var A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
					var b = [];
					var i;
					for ( i = 0; i < N; i++ ) {
						b.push( sc.random( rng ) );
					}
					var R = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, schemes.dense.layouts()[ 0 ] );
					var X = schemes.realizeVector( sc, b, { 'stride': 1 } );
					dtrsv( uplo, trans, diag, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
					var got = [];
					for ( i = 0; i < N; i++ ) {
						got.push( X.read( i ) );
					}
					checked( 'dtrsv', 'residual', function run() {
						check.assertResidual( sc, A, got, b, { 'trans': code, 'factor': 100, 'label': 'dtrsv '+uplo+' '+trans+' '+diag+' N='+N } );
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
	var R = schemes.dense.realize( sc, new LogicalMatrix( sc, 9, 9 ), { 'part': 'full' }, layout );
	var sA1 = R.args[ 0 ];
	var sA2 = R.args[ 1 ];
	var sb1 = ( trans === 'no-transpose' ) ? sA1 : sA2;
	var sb2 = ( trans === 'no-transpose' ) ? sA2 : sA1;
	return ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) ? 'dot' : 'axpy';
}

// Step 3: layout-invariance fuzz — output bit-exact across A layouts and
// strided/negative x vectors, within a kernel-form family.
test( 'dtrsv: output is bit-exact across storage layouts (per kernel form)', function t() {
	var N = 9;
	var SEED = 0xF22E;
	var vLayouts = schemes.vectorLayouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			var trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				[ 'dot', 'axpy' ].forEach( function eachForm( form ) {
					var aLayouts = schemes.dense.layouts().filter( function keep( L ) {
						return kernelForm( trans, L ) === form;
					});
					if ( aLayouts.length < 2 ) {
						return; // need >= 2 layouts to compare
					}
					checked( 'dtrsv', 'layout-invariance', function run() {
						layoutInvariant( aLayouts, function build( aL, idx ) {
							var rng = new RNG( SEED ); // identical values every variant
							var A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
							var b = [];
							var i;
							for ( i = 0; i < N; i++ ) {
								b.push( sc.random( rng ) );
							}
							var R = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, aL );
							var vL = vLayouts[ idx % vLayouts.length ];
							var X = schemes.realizeVector( sc, b, vL );
							dtrsv( uplo, trans, diag, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
							var out = new LogicalMatrix( sc, N, 1 );
							for ( i = 0; i < N; i++ ) {
								out.set( i, 0, X.read( i ) );
							}
							return check.flattenLogical( sc, out );
						}, { 'label': 'dtrsv '+uplo+' '+trans+' '+diag+' '+form+'-form layout invariance' } );
					});
				});
			});
		});
	});
});
