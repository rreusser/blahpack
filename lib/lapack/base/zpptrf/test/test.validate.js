/**
* Property-based validation for zpptrf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pp` -> HPD packed
* (schemes.packed, logical.positiveDefinite yields Hermitian PD); `trf`
* (Cholesky) -> reconstruction A = UᴴU (upper) / LLᴴ (lower).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpptrf from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

// Read the Cholesky factor triangle back into a full LogicalMatrix (other
// triangle zeroed) for reconstruction.
function readTri( R, n, uplo ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Steps 2-3-5: reconstruction across the size sweep and both uplo flags.
test( 'zpptrf: Cholesky reconstruction (size sweep x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			var rng = new RNG( 0x100 + n ); // reproducible; log on failure
			var A = logical.positiveDefinite( sc, rng, n );
			var R = schemes.packed.realize( sc, A, { 'part': uplo }, schemes.packed.layouts()[ 0 ] );
			zpptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
			var F = readTri( R, n, uplo );
			var recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			checked( 'zpptrf', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A, { 'label': 'zpptrf '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — factor must be bit-exact across packed AP
// layouts (incl. strided and negative packed strides).
test( 'zpptrf: bit-exact across storage layouts', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 12;
		var SEED = 0xF00D;
		checked( 'zpptrf', 'layout-invariance', function run() {
			layoutInvariant( schemes.packed.layouts(), function build( layout ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A = logical.positiveDefinite( sc, rng, n );
				var R = schemes.packed.realize( sc, A, { 'part': uplo }, layout );
				zpptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
				return check.flattenLogical( sc, readTri( R, n, uplo ) );
			}, { 'label': 'zpptrf '+uplo+' layout invariance' } );
		});
	});
});
