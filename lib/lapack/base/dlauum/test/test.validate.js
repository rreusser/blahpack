/**
* Property-based validation for dlauum, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr`/`lauu` -> triangular dense
* (schemes.dense, logical.triangular); `lauum` (BLOCKED triangular product T*Tᵀ
* in place, NB=32) -> RECONSTRUCTION against an independent matmul oracle:
*
*   uplo='upper':  A := U * Uᵀ  (U = upper triangle incl. diagonal of A)
*   uplo='lower':  A := Lᵀ * L  (L = lower triangle incl. diagonal of A)
*
* The result is symmetric; only the `uplo` triangle is referenced/overwritten,
* the opposite triangle is left untouched (realized poisoned, never read). The
* size sweep crosses the NB=32 block-size threshold (33, 64, 65, 100) so both the
* unblocked bottom (dlauu2) and the blocked dtrmm/dsyrk/dgemm path are exercised.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dlauum from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];

// SIZES_SMALL tops out at 64; add sizes straddling the NB=32 block boundary so
// the blocked path and its remainder block are exercised.
var SIZES = SIZES_SMALL.concat( [ 65, 100 ] );

// Read the referenced `uplo` triangle of A back out of poisoned storage into a
// full LogicalMatrix; the opposite triangle is NOT referenced by the routine.
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
// matmul(U,U,transb='c'); lower -> Lᴴ*L = matmul(L,L,transa='c'). Real: 'c'=='t'.
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

// Steps 2/3/5: reconstruction A := T*Tᵀ across the size sweep, both uplo, and
// EVERY dense storage layout (at tolerance). Certifies cross-storage-order
// correctness through the blocked path: a row/col transpose bug would make the
// row-major product WRONG (not merely reordered) and trip this check.
test( 'dlauum: product reconstruction T*Tᵀ (size sweep x uplo x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( n ) {
			schemes.dense.layouts().forEach( function eachLayout( layout ) {
				var rng = new RNG( 0x100 + n ); // reproducible; log on failure
				var U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
				var R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
				dlauum( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				var got = readTri( R, n, uplo );
				var expected = oracleTri( U0, n, uplo );
				checked( 'dlauum', 'reconstruct', function run() {
					check.assertReconstruct( sc, got, expected, { 'label': 'dlauum '+uplo+' n='+n } );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. dlauum reaches BLOCKED Level-3 real BLAS
// (dtrmm/dsyrk/dgemm) plus the unblocked dlauu2 (ddot/dgemv) bottom — all of
// which reorder summation across gap/stride-sign/order/uplo via their incx==1
// and cache-blocked fast paths (empirically col/row split alone is NOT
// bit-exact). Bit-equality holds only across a PURE-ADDRESSING family (identical
// strides+signs, varying only offset/pad), which cannot change arithmetic order,
// so any residual diff is a real offset/stride-base addressing bug. Cross-order
// correctness is covered by the all-layout reconstruction above. (See
// test/harness/LEARNINGS.md, dpotri/dpptri entry, which names dlauum explicitly.)
var PURE_ADDR = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 3, 'tail': 0 }
];

test( 'dlauum: bit-exact across a pure-addressing family (blocked path)', function t() {
	var n = 40; // > NB=32: exercises the blocked path
	var SEED = 0xF00D;
	UPLOS.forEach( function eachUplo( uplo ) {
		checked( 'dlauum', 'layout-invariance', function run() {
			layoutInvariant( PURE_ADDR, function build( layout ) {
				var rng = new RNG( SEED ); // identical values every variant
				var U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
				var R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
				dlauum( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readTri( R, n, uplo ) );
			}, { 'label': 'dlauum '+uplo+' pure-addressing invariance' } );
		});
	});
});
