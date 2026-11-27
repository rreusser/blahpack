/**
* Property-based validation for dpotrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `po` -> SPD dense (schemes.dense,
* logical.positiveDefinite); `trf` (Cholesky) -> reconstruction A = UᴴU / LLᴴ.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpotrf from './../lib/ndarray.js';

const sc = S.real; // d-routine
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
test( 'dpotrf: Cholesky reconstruction (size sweep x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			const rng = new RNG( 0x100 + n ); // reproducible; log on failure
			const A = logical.positiveDefinite( sc, rng, n );
			const R = schemes.dense.realize( sc, A, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			dpotrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			const F = readTri( R, n, uplo );
			const recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			checked( 'dpotrf', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A, { 'label': 'dpotrf '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — factor must be bit-exact across storage layouts.
test( 'dpotrf: bit-exact across storage layouts', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const n = 12;
		const SEED = 0xF00D;
		checked( 'dpotrf', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.layouts(), function build( layout ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A = logical.positiveDefinite( sc, rng, n );
				const R = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
				dpotrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readTri( R, n, uplo ) );
			}, { 'label': 'dpotrf '+uplo+' layout invariance' } );
		});
	});
});
