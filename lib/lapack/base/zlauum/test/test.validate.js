/**
* Property-based validation for zlauum, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tr`/`lauu` -> triangular dense
* (schemes.dense, logical.triangular); `lauum` (BLOCKED triangular product T*Tᴴ
* in place, NB=2) -> RECONSTRUCTION against an independent matmul oracle:
*
*   uplo='upper':  A := U * Uᴴ  (U = upper triangle incl. diagonal of A)
*   uplo='lower':  A := Lᴴ * L  (L = lower triangle incl. diagonal of A)
*
* The result is Hermitian (real diagonal); only the `uplo` triangle is
* referenced/overwritten, the opposite triangle is left untouched (realized
* poisoned, never read). NB=2, so every n>=3 exercises the blocked
* ztrmm/zherk/zgemm path (with the unblocked zlauu2 as the block bottom).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zlauum from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];

// Read the referenced `uplo` triangle of A back out of poisoned storage; the
// opposite triangle is NOT referenced by the routine (poisoned).
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

// The `uplo` triangle of the independent product oracle: upper -> U*Uᴴ =
// matmul(U,U,transb='c'); lower -> Lᴴ*L = matmul(L,L,transa='c').
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
// correctness through the blocked path.
test( 'zlauum: product reconstruction T*Tᴴ (size sweep x uplo x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.dense.layouts().forEach( function eachLayout( layout ) {
				var rng = new RNG( 0x100 + n ); // reproducible; log on failure
				var U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
				var R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
				zlauum( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				var got = readTri( R, n, uplo );
				var expected = oracleTri( U0, n, uplo );
				checked( 'zlauum', 'reconstruct', function run() {
					check.assertReconstruct( sc, got, expected, { 'label': 'zlauum '+uplo+' n='+n } );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. zlauum's complex BLAS (ztrmm/zherk/zgemm/
// zlauu2) have no incx==1 fast path and do not switch summation form on the
// col<->row flip, so — unlike the real dlauum, which needs a pure-addressing
// family — output is bit-exact across the FULL dense layout set (col/row-major,
// padding, gaps, negative strides). Empirically verified: all 7 layouts form a
// single bit-exact class for both uplo at n=40.
test( 'zlauum: bit-exact across all dense storage layouts (blocked path)', function t() {
	var n = 40; // >> NB=2: exercises many blocked iterations
	var SEED = 0xF00D;
	var layouts = schemes.dense.layouts();
	UPLOS.forEach( function eachUplo( uplo ) {
		checked( 'zlauum', 'layout-invariance', function run() {
			layoutInvariant( layouts, function build( layout ) {
				var rng = new RNG( SEED ); // identical values every variant
				var U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
				var R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
				zlauum( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readTri( R, n, uplo ) );
			}, { 'label': 'zlauum '+uplo+' layout invariance' } );
		});
	});
});
