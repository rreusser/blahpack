/**
* Property-based validation for dpbtf2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pb` -> SPD banded (schemes.banded,
* logical.positiveDefiniteBanded); `tf2` (unblocked Cholesky) -> reconstruction
* A = UᵀU (upper) / LLᵀ (lower) over the referenced band triangle.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpbtf2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

// Read the Cholesky factor back into a full LogicalMatrix, taking only the
// referenced band triangle and zeroing everything else.
function readBandTri( R, n, k, uplo ) {
	var U = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			U.set( i, j, sc.zero );
		}
	}
	for ( j = 0; j < n; j++ ) {
		if ( uplo === 'upper' ) {
			for ( i = Math.max( 0, j - k ); i <= j; i++ ) {
				U.set( i, j, R.read( i, j ) );
			}
		} else {
			for ( i = j; i <= Math.min( n - 1, j + k ); i++ ) {
				U.set( i, j, R.read( i, j ) );
			}
		}
	}
	return U;
}

// Steps 2-3-5: reconstruction across the size/bandwidth sweep and both uplo flags.
test( 'dpbtf2: banded Cholesky reconstruction (size x bandwidth x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		[ 1, 2, 3, 5, 8, 16, 33 ].forEach( function eachN( n ) {
			[ 0, 1, 3 ].forEach( function eachK( kraw ) {
				var k = Math.min( kraw, Math.max( 0, n - 1 ) );
				var rng = new RNG( 0x200 + ( n * 31 ) + k ); // reproducible; log on failure
				var A = logical.positiveDefiniteBanded( sc, rng, n, k );
				var R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': k }, schemes.banded.layouts()[ 0 ] );
				dpbtf2( uplo, n, k, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				var F = readBandTri( R, n, k, uplo );
				var recon = ( uplo === 'upper' )
					? ref.matmul( sc, F, F, { 'transa': 'c' } )
					: ref.matmul( sc, F, F, { 'transb': 'c' } );
				checked( 'dpbtf2', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A, { 'label': 'dpbtf2 '+uplo+' n='+n+' k='+k } );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — factor must be bit-exact across storage layouts.
test( 'dpbtf2: bit-exact across storage layouts', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 12;
		var k = 3;
		var SEED = 0xF00D;
		checked( 'dpbtf2', 'layout-invariance', function run() {
			layoutInvariant( schemes.banded.layouts(), function build( layout ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A = logical.positiveDefiniteBanded( sc, rng, n, k );
				var R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': k }, layout );
				dpbtf2( uplo, n, k, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readBandTri( R, n, k, uplo ) );
			}, { 'label': 'dpbtf2 '+uplo+' layout invariance' } );
		});
	});
});
