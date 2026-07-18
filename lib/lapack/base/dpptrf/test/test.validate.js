/**
* Property-based validation for dpptrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pp` -> SPD packed (schemes.packed,
* logical.positiveDefinite); `trf` (Cholesky) -> reconstruction A = UᵀU / LLᵀ.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpptrf from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

// Read the Cholesky factor triangle back into a full LogicalMatrix (other
// triangle zeroed) for reconstruction. R.read(i,j) reads the packed element,
// valid for the referenced triangle.
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
test( 'dpptrf: Cholesky reconstruction (size sweep x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			const rng = new RNG( 0x100 + n ); // reproducible; log on failure
			const A = logical.positiveDefinite( sc, rng, n );
			const R = schemes.packed.realize( sc, A, { 'part': uplo }, schemes.packed.layouts()[ 0 ] );
			dpptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
			const F = readTri( R, n, uplo );
			const recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			checked( 'dpptrf', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A, { 'label': 'dpptrf '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — factor must be bit-exact across packed AP
// storage layouts (incl. stride 2/3 and negative packed strides).
test( 'dpptrf: bit-exact across storage layouts (packed AP incl. negative strides)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const n = 12;
		const SEED = 0xF00D;
		checked( 'dpptrf', 'layout-invariance', function run() {
			layoutInvariant( schemes.packed.layouts(), function build( layout ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A = logical.positiveDefinite( sc, rng, n );
				const R = schemes.packed.realize( sc, A, { 'part': uplo }, layout );
				dpptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
				return check.flattenLogical( sc, readTri( R, n, uplo ) );
			}, { 'label': 'dpptrf '+uplo+' layout invariance' } );
		});
	});
});
