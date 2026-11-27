/**
* Property-based validation for zlauum, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tr`/`lauu` -> triangular dense
* (schemes.dense, logical.triangular); `lauum` (BLOCKED triangular product T*Tᴴ
* in place, NB = ILAENV = 64) -> RECONSTRUCTION against an independent matmul oracle:
*
*   uplo='upper':  A := U * Uᴴ  (U = upper triangle incl. diagonal of A)
*   uplo='lower':  A := Lᴴ * L  (L = lower triangle incl. diagonal of A)
*
* The result is Hermitian (real diagonal); only the `uplo` triangle is
* referenced/overwritten, the opposite triangle is left untouched (realized
* poisoned, never read). The size sweep reaches past NB=64 (65, 100), so both
* the unblocked zlauu2 and the blocked ztrmm/zherk/zgemm path are exercised.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../test/harness/index.js';
import { checked } from '../../../../test/harness/ledger.js';
import zlauum from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];

// SIZES_SMALL tops out at 64 = NB; add sizes past it so the blocked path and
// its remainder block are exercised.
const SIZES = SIZES_SMALL.concat( [ 65, 100 ] );

// Read the referenced `uplo` triangle of A back out of poisoned storage; the
// opposite triangle is NOT referenced by the routine (poisoned).
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

// The `uplo` triangle of the independent product oracle: upper -> U*Uᴴ =
// matmul(U,U,transb='c'); lower -> Lᴴ*L = matmul(L,L,transa='c').
function oracleTri( U0, n, uplo ) {
	const P = ( uplo === 'upper' )
		? ref.matmul( sc, U0, U0, { 'transb': 'c' } )
		: ref.matmul( sc, U0, U0, { 'transa': 'c' } );
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
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
		SIZES.forEach( function eachN( n ) {
			schemes.dense.layouts().forEach( function eachLayout( layout ) {
				const rng = new RNG( 0x100 + n ); // reproducible; log on failure
				const U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
				const R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
				zlauum( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				const got = readTri( R, n, uplo );
				const expected = oracleTri( U0, n, uplo );
				checked( 'zlauum', 'reconstruct', function run() {
					check.assertReconstruct( sc, got, expected, { 'label': 'zlauum '+uplo+' n='+n } );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz at n=70 (past NB=64, so the blocked path runs,
// with a 64-by-64 zlauu2 block bottom). zlauu2 calls the optimized zgemv, which
// switches between its dot and axpy forms on the col<->row storage-order flip
// (~1 ULP, not a defect; see the zpotf2/dpotf2 LEARNINGS entry), so bit-equality
// is asserted within the col family and within the row family. Offset, padding,
// gaps and stride sign (present in each family) leave the arithmetic order
// intact, so any addressing bug surfaces as a bit difference; cross-order
// correctness is covered by the reconstruction above.
const allLayouts = schemes.dense.layouts();
const FAMILIES = [
	[ 'col', allLayouts.filter( function isCol( L ) {
		return L.order !== 'row';
	}) ],
	[ 'row', allLayouts.filter( function isRow( L ) {
		return L.order === 'row';
	}) ]
];

test( 'zlauum: bit-exact within storage-order family (col / row, blocked path)', function t() {
	const n = 70;
	const SEED = 0xF00D;
	UPLOS.forEach( function eachUplo( uplo ) {
		FAMILIES.forEach( function eachFamily( fam ) {
			checked( 'zlauum', 'layout-invariance', function run() {
				layoutInvariant( fam[ 1 ], function build( layout ) {
					const rng = new RNG( SEED ); // identical values every variant
					const U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
					const R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
					zlauum( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
					return check.flattenLogical( sc, readTri( R, n, uplo ) );
				}, { 'label': 'zlauum '+uplo+' layout invariance '+fam[ 0 ]+'-major' } );
			});
		});
	});
});
