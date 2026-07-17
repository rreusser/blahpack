/**
* Property-based validation for zlauu2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tr`/`lauu` -> triangular dense
* (schemes.dense, logical.triangular); `lauu2` (UNBLOCKED triangular product
* T*Tᴴ in place) -> RECONSTRUCTION against an independent matmul oracle:
*
*   uplo='upper':  A := U * Uᴴ  (U = upper triangle incl. diagonal of A)
*   uplo='lower':  A := Lᴴ * L  (L = lower triangle incl. diagonal of A)
*
* The result is Hermitian (real diagonal); only the `uplo` triangle is
* referenced/overwritten, the opposite triangle is left untouched (realized
* poisoned, never read). The oracle is the `uplo` triangle of the naive product
* of the FULL logical triangular factor with its conjugate transpose.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zlauu2 from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];

// Read the referenced `uplo` triangle of A back out of poisoned storage; the
// opposite triangle is NOT referenced by the routine (poisoned), so it is filled
// with sc.zero rather than read.
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

// The `uplo` triangle of the independent product oracle (opposite triangle
// zeroed): upper -> U*Uᴴ = matmul(U,U,transb='c'); lower -> Lᴴ*L =
// matmul(L,L,transa='c').
function oracleTri( U0, n, uplo ) {
	var P = ( uplo === 'upper' )
		? ref.matmul( sc, U0, U0, { 'transb': 'c' } )
		: ref.matmul( sc, U0, U0, { 'transa': 'c' } );
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, P.get( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Steps 2/3/5: reconstruction A := T*Tᴴ across the size sweep, both uplo, and
// EVERY dense storage layout (at tolerance). Certifies cross-storage-order
// correctness: a genuine row/col conjugate-transpose bug would make the
// row-major product WRONG (not merely reordered) and trip this check.
test( 'zlauu2: product reconstruction T*Tᴴ (size sweep x uplo x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.dense.layouts().forEach( function eachLayout( layout ) {
				var rng = new RNG( 0x100 + n ); // reproducible; log on failure
				var U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
				var R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
				zlauu2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				var got = readTri( R, n, uplo );
				var expected = oracleTri( U0, n, uplo );
				checked( 'zlauu2', 'reconstruct', function run() {
					check.assertReconstruct( sc, got, expected, { 'label': 'zlauu2 '+uplo+' n='+n } );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. zlauu2's complex kernels (zdotc/zgemv/zdscal/
// zlacgv) have no incx==1 fast path, so — unlike the real dlauu2 — output is
// bit-exact across the FULL col family and the FULL row family; the summation
// reorders only across the col<->row storage-order flip (the optimized zgemv
// switches summation form). So bit-equality is asserted within each storage-order
// family (empirically verified: col {tight,padded,neg-row,neg-col} and row
// {tight,gapped,both-neg} each form a single bit-exact class). Cross-order
// correctness is covered by the all-layout reconstruction above.
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zlauu2: bit-exact within storage-order family (col / row)', function t() {
	var n = 12;
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col', n );
		runInvariance( uplo, rowLayouts, 'row', n );
	});
});

function runInvariance( uplo, variants, fam, n ) {
	var SEED = 0xF00D;
	checked( 'zlauu2', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
			var R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
			zlauu2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'zlauu2 '+uplo+' layout invariance '+fam+'-major' } );
	});
}
