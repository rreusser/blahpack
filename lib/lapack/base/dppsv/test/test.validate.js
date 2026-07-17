/**
* Property-based validation for dppsv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pp` -> SPD packed (schemes.packed,
* logical.positiveDefinite); `sv` (factor + solve) -> residual property
* `‖A*x - b‖` per RHS column, oracle over the FULL logical A.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dppsv from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var NRHS = [ 1, 2, 3 ];

// Steps 2-3-5: residual across the size sweep, both uplo flags, and nrhs. Solve
// A*X = B for SPD A stored packed; assert each solved column x satisfies A*x = b.
test( 'dppsv: SPD packed solve residual (size sweep x uplo x nrhs)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				var rng = new RNG( 0x100 + ( n * 10 ) + nrhs ); // reproducible; log on failure
				var A0 = logical.positiveDefinite( sc, rng, n );
				var B0 = logical.general( sc, rng, n, nrhs );
				var AP = schemes.packed.realize( sc, A0, { 'part': uplo }, schemes.packed.layouts()[ 0 ] );
				var B = schemes.dense.realize( sc, B0, {}, schemes.dense.layouts()[ 0 ] );
				var info = dppsv( uplo, n, nrhs, AP.data, AP.args[ 0 ], AP.args[ 1 ], B.data, B.args[ 0 ], B.args[ 1 ], B.args[ 2 ] );
				checked( 'dppsv', 'residual', function run() {
					if ( info !== 0 ) {
						throw new Error( 'dppsv '+uplo+' n='+n+' nrhs='+nrhs+': unexpected info='+info+' (matrix is SPD)' );
					}
					var j;
					var i;
					for ( j = 0; j < nrhs; j++ ) {
						var x = [];
						var b = [];
						for ( i = 0; i < n; i++ ) {
							x.push( B.read( i, j ) );
							b.push( B0.get( i, j ) );
						}
						check.assertResidual( sc, A0, x, b, { 'trans': 'n', 'factor': 100, 'label': 'dppsv '+uplo+' n='+n+' nrhs='+nrhs+' col='+j } );
					}
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — solution X must be bit-exact across packed AP
// layouts (incl. stride 2/3 and negative packed strides — the class that bit
// zpptri) and dense B layouts (row/col major, padding, negative strides).
test( 'dppsv: solution is bit-exact across storage layouts (packed AP + dense B)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 9;
		var nrhs = 3;
		var SEED = 0xF00D;
		var apLayouts = schemes.packed.layouts();
		var bLayouts = schemes.dense.layouts();
		var nVariants = Math.max( apLayouts.length, bLayouts.length );
		var variants = [];
		var k;
		for ( k = 0; k < nVariants; k++ ) {
			variants.push( k );
		}
		checked( 'dppsv', 'layout-invariance', function run() {
			layoutInvariant( variants, function build( idx ) {
				var rng = new RNG( SEED ); // fixed seed => identical values every variant
				var A0 = logical.positiveDefinite( sc, rng, n );
				var B0 = logical.general( sc, rng, n, nrhs );
				var AP = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayouts[ idx % apLayouts.length ] );
				var B = schemes.dense.realize( sc, B0, {}, bLayouts[ idx % bLayouts.length ] );
				dppsv( uplo, n, nrhs, AP.data, AP.args[ 0 ], AP.args[ 1 ], B.data, B.args[ 0 ], B.args[ 1 ], B.args[ 2 ] );
				var X = new LogicalMatrix( sc, n, nrhs );
				var i;
				var j;
				for ( j = 0; j < nrhs; j++ ) {
					for ( i = 0; i < n; i++ ) {
						X.set( i, j, B.read( i, j ) );
					}
				}
				return check.flattenLogical( sc, X );
			}, { 'label': 'dppsv '+uplo+' layout invariance' } );
		});
	});
});
