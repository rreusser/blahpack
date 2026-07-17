/**
* Property-based validation for zpotrf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `po` -> HPD dense (schemes.dense,
* logical.positiveDefinite -> Hermitian PD); `trf` (Cholesky) -> reconstruction
* A = UᴴU / LLᴴ. zpotrf is BLOCKED, so the size sweep crosses block thresholds
* (32/33/48/63/64/65/100) to exercise the panel/blocked path.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpotrf from './../lib/ndarray.js';

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
test( 'zpotrf: Cholesky reconstruction (size sweep x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( n ) {
			var rng = new RNG( 0x100 + n ); // reproducible; log on failure
			var A = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			zpotrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			var F = readTri( R, n, uplo );
			var recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			checked( 'zpotrf', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A, { 'label': 'zpotrf '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — factor must be bit-exact across storage
// layouts. n=33 crosses the block boundary so the blocked panel updates are
// exercised under layout fuzzing too.
test( 'zpotrf: bit-exact across storage layouts', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 33;
		var SEED = 0xF00D;
		checked( 'zpotrf', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.layouts(), function build( layout ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A = logical.positiveDefinite( sc, rng, n );
				var R = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
				zpotrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readTri( R, n, uplo ) );
			}, { 'label': 'zpotrf '+uplo+' layout invariance' } );
		});
	});
});
