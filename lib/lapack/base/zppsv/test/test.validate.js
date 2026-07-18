/**
* Property-based validation for zppsv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pp` -> HPD packed
* (schemes.packed, logical.positiveDefinite); `sv` (factor + solve) -> residual
* property `‖A*x - b‖` per RHS column, oracle over the FULL logical Hermitian A.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zppsv from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const NRHS = [ 1, 2, 3 ];

// Steps 2-3-5: residual across the size sweep, both uplo flags, and nrhs. Solve
// A*X = B for HPD A stored packed; assert each solved column x satisfies A*x = b.
test( 'zppsv: HPD packed solve residual (size sweep x uplo x nrhs)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				const rng = new RNG( 0x100 + ( n * 10 ) + nrhs ); // reproducible; log on failure
				const A0 = logical.positiveDefinite( sc, rng, n );
				const B0 = logical.general( sc, rng, n, nrhs );
				const AP = schemes.packed.realize( sc, A0, { 'part': uplo }, schemes.packed.layouts()[ 0 ] );
				const B = schemes.dense.realize( sc, B0, {}, schemes.dense.layouts()[ 0 ] );
				const info = zppsv( uplo, n, nrhs, AP.data, AP.args[ 0 ], AP.args[ 1 ], B.data, B.args[ 0 ], B.args[ 1 ], B.args[ 2 ] );
				checked( 'zppsv', 'residual', function run() {
					if ( info !== 0 ) {
						throw new Error( 'zppsv '+uplo+' n='+n+' nrhs='+nrhs+': unexpected info='+info+' (matrix is HPD)' );
					}
					let j, i;
					for ( j = 0; j < nrhs; j++ ) {
						const x = [];
						const b = [];
						for ( i = 0; i < n; i++ ) {
							x.push( B.read( i, j ) );
							b.push( B0.get( i, j ) );
						}
						check.assertResidual( sc, A0, x, b, { 'trans': 'n', 'factor': 100, 'label': 'zppsv '+uplo+' n='+n+' nrhs='+nrhs+' col='+j } );
					}
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — solution X must be bit-exact across packed AP
// layouts (incl. stride 2/3 and negative packed strides — the class that bit
// zpptri) and dense B layouts (row/col major, padding, negative strides).
test( 'zppsv: solution is bit-exact across storage layouts (packed AP + dense B)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const n = 9;
		const nrhs = 3;
		const SEED = 0xF00D;
		const apLayouts = schemes.packed.layouts();
		const bLayouts = schemes.dense.layouts();
		const nVariants = Math.max( apLayouts.length, bLayouts.length );
		const variants = [];
		let k;
		for ( k = 0; k < nVariants; k++ ) {
			variants.push( k );
		}
		checked( 'zppsv', 'layout-invariance', function run() {
			layoutInvariant( variants, function build( idx ) {
				const rng = new RNG( SEED ); // fixed seed => identical values every variant
				const A0 = logical.positiveDefinite( sc, rng, n );
				const B0 = logical.general( sc, rng, n, nrhs );
				const AP = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayouts[ idx % apLayouts.length ] );
				const B = schemes.dense.realize( sc, B0, {}, bLayouts[ idx % bLayouts.length ] );
				zppsv( uplo, n, nrhs, AP.data, AP.args[ 0 ], AP.args[ 1 ], B.data, B.args[ 0 ], B.args[ 1 ], B.args[ 2 ] );
				const X = new LogicalMatrix( sc, n, nrhs );
				let i, j;
				for ( j = 0; j < nrhs; j++ ) {
					for ( i = 0; i < n; i++ ) {
						X.set( i, j, B.read( i, j ) );
					}
				}
				return check.flattenLogical( sc, X );
			}, { 'label': 'zppsv '+uplo+' layout invariance' } );
		});
	});
});
