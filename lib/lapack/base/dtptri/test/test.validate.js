/**
* Property-based validation for dtptri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tp` -> triangular PACKED
* (schemes.packed, logical.triangular); `tri` (packed triangular inverse) ->
* RECONSTRUCTION: A0 * inv(A0) = I. The FULL logical triangular matrix (opposite
* triangle exact zero, unit diagonal = 1) is the independent oracle; the product
* of the original with the computed inverse must be the identity. The property is
* swept over EVERY packed layout (incl. non-unit and negative packed strides),
* the class that surfaced the zpptri/ztptri packed stride-mapping bug (a dropped
* `*stride` returns NaN / garbage for any strideAP != 1); see
* test/harness/LEARNINGS.md.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtptri from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var DIAGS = [ 'non-unit', 'unit' ];

// Read the computed inverse triangle back into a full LogicalMatrix. The
// opposite triangle is exact zero; for a unit diagonal the diagonal is NOT
// referenced by the routine (poisoned in packed storage), so it is filled with
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
// ‖A0‖·‖inv(A0)‖ + ‖I‖. A unit-diagonal triangle with O(1) off-diagonals is
// ill-conditioned, so its inverse is large and the forward residual
// A0*inv(A0)-I scales like cond(A0)·eps; normalizing by ‖A0‖·‖inv(A0)‖ recovers
// the backward-stable ~n·eps quantity (cf. dtrti2 / dtrsm validation).
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
// and diag flags, and EVERY packed storage layout (incl. strideAP in
// {2,3,-1,-2}). Sweeping all layouts here (at backward-error tolerance)
// certifies cross-storage correctness AND is the NaN guard for the packed
// stride-mapping bug class: a dropped `*stride` reads poisoned padding and trips
// assertFinite.
test( 'dtptri: packed inverse reconstruction A*inv(A)=I (size sweep x uplo x diag x all packed layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		DIAGS.forEach( function eachDiag( diag ) {
			var unit = ( diag === 'unit' );
			SIZES_SMALL.forEach( function eachN( n ) {
				schemes.packed.layouts().forEach( function eachLayout( layout ) {
					var rng = new RNG( 0x100 + n ); // reproducible; log on failure
					var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': unit } );
					var R = schemes.packed.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
					dtptri( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ] );
					var invA = readInv( R, n, uplo, unit, sc.one );
					var P = ref.matmul( sc, A0, invA );
					checked( 'dtptri', 'reconstruct', function run() {
						assertInvResidual( A0, invA, P, n, 'dtptri '+uplo+' '+diag+' n='+n+' stride='+R.args[ 0 ], 100 );
					});
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the inverse must be bit-exact across packed
// layouts that share an arithmetic order. dtptri bottoms out in dtpmv, whose
// real reference kernel special-cases incx==1, so the unit-stride layouts and
// the non-unit/negative-stride layouts choose different (equally valid)
// summation orders (~1 ULP; see the dpotri/dpptri LEARNINGS entry). Bit-equality
// is therefore asserted within two pure-arithmetic-order families: stride==1
// (variants 0,1 — vary only lead/tail/offset) and stride!=1 (variants
// {2,3,-1,-2} — the class that bit zpptri/ztptri; must AGREE with each other and
// be finite). Cross-order correctness is covered by the reconstruction above.
var packedLayouts = schemes.packed.layouts();
var unitFam = packedLayouts.filter( function isUnit( L ) {
	return L.stride === 1;
});
var stridedFam = packedLayouts.filter( function isStrided( L ) {
	return L.stride !== 1;
});

test( 'dtptri: bit-exact within packed arithmetic-order family (unit-stride / strided)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		DIAGS.forEach( function eachDiag( diag ) {
			runInvariance( uplo, diag, unitFam, 'unit-stride' );
			runInvariance( uplo, diag, stridedFam, 'strided(2,3,-1,-2)' );
		});
	});
});

function runInvariance( uplo, diag, variants, fam ) {
	var n = 12;
	var unit = ( diag === 'unit' );
	var SEED = 0xF00D;
	checked( 'dtptri', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': unit } );
			var R = schemes.packed.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
			dtptri( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ] );
			return check.flattenLogical( sc, readInv( R, n, uplo, unit, sc.zero ) );
		}, { 'label': 'dtptri '+uplo+' '+diag+' layout invariance '+fam } );
	});
}
