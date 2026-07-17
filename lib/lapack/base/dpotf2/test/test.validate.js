/**
* Property-based validation for dpotf2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `po` -> SPD dense (schemes.dense,
* logical.positiveDefinite); `tf2` (unblocked Cholesky) -> reconstruction
* A = UᴴU / LLᴴ.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpotf2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
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

// Steps 2-3-5: reconstruction across the size sweep, both uplo flags, and EVERY
// storage layout. dpotf2 factors the trailing panel with the optimized dgemv,
// whose summation order depends on col- vs row-major strides; sweeping all
// layouts here (at backward-error tolerance) is what certifies cross-storage-
// order correctness, since bit-exactness across orders is not expected (see the
// layout-invariance test below and the dgels LEARNINGS entry).
test( 'dpotf2: Cholesky reconstruction (size sweep x uplo x all layouts)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.dense.layouts().forEach( function eachLayout( layout ) {
				var rng = new RNG( 0x100 + n ); // reproducible; log on failure
				var A = logical.positiveDefinite( sc, rng, n );
				var R = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
				dpotf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				var F = readTri( R, n, uplo );
				var recon = ( uplo === 'upper' )
					? ref.matmul( sc, F, F, { 'transa': 'c' } )
					: ref.matmul( sc, F, F, { 'transb': 'c' } );
				checked( 'dpotf2', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A, { 'label': 'dpotf2 '+uplo+' n='+n } );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the factor must be bit-exact across storage
// layouts WITHIN a single storage-order family. Fuzzing offset, leading-dim
// padding, and stride SIGN (all present in each family) leaves the arithmetic
// order intact, so any addressing bug surfaces as a bit difference. A col<->row
// storage-order FLIP legitimately reorders dpotf2's inner optimized dgemv/ddot
// (~1e-16 rounding, not a defect), so cross-order agreement is verified by the
// reconstruction property above, not by bit-equality here. See the dgels
// LEARNINGS entry ("optimized inner kernel reorders on col<->row flip").
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dpotf2: bit-exact within storage-order family (col / row)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	var n = 12;
	var SEED = 0xF00D;
	checked( 'dpotf2', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
			dpotf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'dpotf2 '+uplo+' layout invariance '+fam+'-major' } );
	});
}
