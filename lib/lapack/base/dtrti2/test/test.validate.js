/**
* Property-based validation for dtrti2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr` -> triangular dense
* (schemes.dense, logical.triangular); `ti2` (unblocked triangular inverse) ->
* RECONSTRUCTION: A0 * inv(A0) = I. The FULL logical triangular matrix (opposite
* triangle exact zero, unit diagonal = 1) is the independent oracle; the product
* of the original with the computed inverse must be the identity.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtrti2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var DIAGS = [ 'non-unit', 'unit' ];

// Read the computed inverse triangle back into a full LogicalMatrix. The
// opposite triangle is exact zero; for a unit diagonal the diagonal is NOT
// referenced by the routine (poisoned in storage), so it is filled with
// `unitFill` (1 for the math oracle, 0 for the layout-invariance flatten).
function readInv( R, n, uplo, unit, unitFill ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( i === j ) {
				F.set( i, j, unit ? unitFill : R.read( i, j ) );
			} else if ( uplo === 'upper' ? i < j : i > j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Backward-error residual for the inverse: ‖A0*inv(A0) - I‖ normalized by
// ‖A0‖·‖inv(A0)‖ + ‖I‖ (NOT ‖I‖ alone). A unit-diagonal triangle with O(1)
// off-diagonals is ill-conditioned, so its inverse is large and the forward
// residual A0*inv(A0)-I scales like cond(A0)·eps; normalizing by ‖A0‖·‖inv(A0)‖
// recovers the backward-stable ~n·eps quantity (cf. the dtrsm validation).
function assertInvResidual( A0, invA, P, n, label, factor ) {
	var R = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => out-of-bounds read into poisoned storage
	var scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: reconstruction A0 * inv(A0) = I across the size sweep, both uplo
// and diag flags, and EVERY storage layout. Sweeping all layouts here (at
// backward-error tolerance) certifies cross-storage-order correctness, since a
// genuine row/col transpose bug would make the row-major product WRONG (not just
// reordered) and trip this check — whereas the bit-exact family split below only
// catches addressing bugs within a fixed arithmetic order.
test( 'dtrti2: inverse reconstruction A*inv(A)=I (size sweep x uplo x diag x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		DIAGS.forEach( function eachDiag( diag ) {
			var unit = ( diag === 'unit' );
			SIZES_SMALL.forEach( function eachN( n ) {
				schemes.dense.layouts().forEach( function eachLayout( layout ) {
					var rng = new RNG( 0x100 + n ); // reproducible; log on failure
					var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': unit } );
					var R = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
					dtrti2( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
					var invA = readInv( R, n, uplo, unit, sc.one );
					var P = ref.matmul( sc, A0, invA );
					checked( 'dtrti2', 'reconstruct', function run() {
						assertInvResidual( A0, invA, P, n, 'dtrti2 '+uplo+' '+diag+' n='+n, 100 );
					});
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the inverse must be bit-exact across storage
// layouts WITHIN a single storage-order family. dtrti2's inner loop calls the
// optimized dtrmv, which reorders its summation on a col<->row storage-order
// flip (~1 ULP, not a defect — see the dpotf2 LEARNINGS entry), so bit-equality
// is asserted only within the col family and within the row family. Fuzzing
// offset, leading-dim padding, and stride SIGN (all present in each family)
// leaves the arithmetic order intact, so any addressing bug surfaces as a bit
// difference; cross-order correctness is covered by the reconstruction above.
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dtrti2: bit-exact within storage-order family (col / row)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		DIAGS.forEach( function eachDiag( diag ) {
			runInvariance( uplo, diag, colLayouts, 'col' );
			runInvariance( uplo, diag, rowLayouts, 'row' );
		});
	});
});

function runInvariance( uplo, diag, variants, fam ) {
	var n = 12;
	var unit = ( diag === 'unit' );
	var SEED = 0xF00D;
	checked( 'dtrti2', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': unit } );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
			dtrti2( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			return check.flattenLogical( sc, readInv( R, n, uplo, unit, sc.zero ) );
		}, { 'label': 'dtrti2 '+uplo+' '+diag+' layout invariance '+fam+'-major' } );
	});
}
