/**
* Property-based validation for zpotf2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `po` -> Hermitian PD dense
* (schemes.dense, logical.positiveDefinite); `tf2` (unblocked Cholesky) ->
* reconstruction A = UᴴU / LLᴴ.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpotf2 from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

// Read the Cholesky factor triangle back into a full LogicalMatrix (other
// triangle zeroed) for reconstruction.
function readTri( R, n, uplo ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
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
test( 'zpotf2: Cholesky reconstruction (size sweep x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			const rng = new RNG( 0x100 + n ); // reproducible; log on failure
			const A = logical.positiveDefinite( sc, rng, n );
			const R = schemes.dense.realize( sc, A, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			zpotf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			const F = readTri( R, n, uplo );
			const recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			checked( 'zpotf2', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A, { 'label': 'zpotf2 '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the factor must be bit-exact WITHIN a
// storage-order family. The col<->row flip reorders the optimized inner zgemv
// (its dot/axpy form is selected by the smaller-stride dimension, so swapping
// strideA1/strideA2 changes the summation order) → a benign ~1 ULP difference,
// not an indexing bug. The real analog dpotf2 exhibits the identical split; see
// the 2026-07-17 LEARNINGS entry. Each family still fuzzes offset, leading-dim
// padding, and negative strides — the invariants that actually catch indexing
// bugs — and a genuine row/col transpose bug would make the row-major result
// WRONG (caught by the reconstruction property above), not merely reordered.
const allLayouts = schemes.dense.layouts();
const colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zpotf2: bit-exact within storage-order family', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	const n = 12;
	const SEED = 0xF00D;
	checked( 'zpotf2', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A = logical.positiveDefinite( sc, rng, n );
			const R = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
			zpotf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'zpotf2 '+uplo+' layout invariance '+fam+'-major' } );
	});
}
