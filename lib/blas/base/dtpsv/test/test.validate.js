/**
* Property-based validation for dtpsv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tp` -> triangular PACKED
* (schemes.packed, logical.triangular); `sv` (solve) -> backward-error residual
* property `op(A)*x = b` against the independent oracle. Uses the backward-error
* normalization `‖op(A)x - b‖ / (‖A‖_F‖x‖ + ‖b‖)` (check.assertResidual), which
* is robust even for the unit-diagonal case that can be ill-conditioned at
* large N.
*
* The packed solve has a SINGLE accumulation order fixed by the algorithm
* (forward/backward substitution) — it does not branch on stride sign the way
* the dense dtrsv kernel does — so layout invariance holds across ALL packed AP
* layouts and vector layouts with NO kernel-form family split.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtpsv from './../lib/ndarray.js';

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
test( 'dtpsv: triangular packed solve residual (uplo x trans x diag x N sweep)', function t() {
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
					var AP = schemes.packed.realize( sc, A, { 'part': uplo, 'unit': unit }, schemes.packed.layouts()[ 0 ] );
					var X = schemes.realizeVector( sc, b, { 'stride': 1 } );
					dtpsv( uplo, trans, diag, N, AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ] );
					var got = [];
					for ( i = 0; i < N; i++ ) {
						got.push( X.read( i ) );
					}
					checked( 'dtpsv', 'residual', function run() {
						check.assertResidual( sc, A, got, b, { 'trans': code, 'factor': 100, 'label': 'dtpsv '+uplo+' '+trans+' '+diag+' N='+N } );
					});
				});
			});
		});
	});
});

// Step 3: layout-invariance fuzz — output bit-exact across packed AP layouts
// (incl. negative packed strides) and strided/negative x vectors. No
// kernel-form split needed for the packed solve.
test( 'dtpsv: output is bit-exact across storage layouts (packed AP + strided/negative vectors)', function t() {
	var N = 9;
	var SEED = 0xF33E;
	var apLayouts = schemes.packed.layouts();
	var vLayouts = schemes.vectorLayouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			var trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				checked( 'dtpsv', 'layout-invariance', function run() {
					layoutInvariant( apLayouts, function build( apL, idx ) {
						var rng = new RNG( SEED ); // identical values every variant
						var A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
						var b = [];
						var i;
						for ( i = 0; i < N; i++ ) {
							b.push( sc.random( rng ) );
						}
						var AP = schemes.packed.realize( sc, A, { 'part': uplo, 'unit': unit }, apL );
						var vL = vLayouts[ idx % vLayouts.length ];
						var X = schemes.realizeVector( sc, b, vL );
						dtpsv( uplo, trans, diag, N, AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ] );
						var out = new LogicalMatrix( sc, N, 1 );
						for ( i = 0; i < N; i++ ) {
							out.set( i, 0, X.read( i ) );
						}
						return check.flattenLogical( sc, out );
					}, { 'label': 'dtpsv '+uplo+' '+trans+' '+diag+' layout invariance' } );
				});
			});
		});
	});
});
