/**
* Property-based validation for dlauu2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr`/`lauu` -> triangular dense
* (schemes.dense, logical.triangular); `lauu2` (UNBLOCKED triangular product
* T*Tᵀ in place) -> RECONSTRUCTION against an independent matmul oracle:
*
*   uplo='upper':  A := U * Uᵀ  (U = upper triangle incl. diagonal of A)
*   uplo='lower':  A := Lᵀ * L  (L = lower triangle incl. diagonal of A)
*
* The result is symmetric; only the `uplo` triangle is referenced/overwritten,
* the opposite triangle is left untouched (realized poisoned, never read). The
* oracle is the `uplo` triangle of the naive product of the FULL logical
* triangular factor with (the transpose of) itself.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dlauu2 from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];

// Read the referenced `uplo` triangle of A back out of poisoned storage into a
// full LogicalMatrix; the opposite triangle is NOT referenced by the routine
// (poisoned), so it is filled with sc.zero rather than read.
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

// The `uplo` triangle of the independent product oracle (opposite triangle
// zeroed to match readTri): upper -> U*Uᴴ = matmul(U,U,transb='c'); lower ->
// Lᴴ*L = matmul(L,L,transa='c'). For the real trait 'c' == 't'.
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

// Steps 2/3/5: reconstruction A := T*Tᵀ across the size sweep, both uplo, and
// EVERY dense storage layout (at tolerance). Sweeping all 7 layouts here
// certifies cross-storage-order correctness: a genuine row/col transpose bug
// would make the row-major product WRONG (not merely reordered) and trip this
// check.
test( 'dlauu2: product reconstruction T*Tᵀ (size sweep x uplo x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.dense.layouts().forEach( function eachLayout( layout ) {
				const rng = new RNG( 0x100 + n ); // reproducible; log on failure
				const U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
				const R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
				dlauu2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				const got = readTri( R, n, uplo );
				const expected = oracleTri( U0, n, uplo );
				checked( 'dlauu2', 'reconstruct', function run() {
					check.assertReconstruct( sc, got, expected, { 'label': 'dlauu2 '+uplo+' n='+n } );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. dlauu2 bottoms out in real ddot/dgemv/dscal,
// whose incx==1 fast paths reorder summation across gapped/negative/row-major
// layouts (empirically: col g1 vs row g1 vs row-gapped vs neg-row-stride each
// form distinct bit-exact classes, and the split differs by uplo). Bit-equality
// therefore holds only across a PURE-ADDRESSING family — identical strides AND
// signs (tight col-major, g=1, positive), varying only base offset, leading pad,
// and leading-dimension padding — which cannot change arithmetic order, so any
// residual diff is a real offset/stride-base addressing bug. Cross-order/sign/gap
// correctness is covered by the all-layout reconstruction above. (See
// test/harness/LEARNINGS.md, dpotri/dpptri entry.)
const PURE_ADDR = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 3, 'tail': 0 }
];

test( 'dlauu2: bit-exact across a pure-addressing family', function t() {
	const n = 12;
	const SEED = 0xF00D;
	UPLOS.forEach( function eachUplo( uplo ) {
		checked( 'dlauu2', 'layout-invariance', function run() {
			layoutInvariant( PURE_ADDR, function build( layout ) {
				const rng = new RNG( SEED ); // identical values every variant
				const U0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
				const R = schemes.dense.realize( sc, U0, { 'part': uplo }, layout );
				dlauu2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readTri( R, n, uplo ) );
			}, { 'label': 'dlauu2 '+uplo+' pure-addressing invariance' } );
		});
	});
});
