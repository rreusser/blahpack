/**
* Property-based validation for ztptri, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tp` -> triangular PACKED
* (schemes.packed, logical.triangular); `tri` (packed triangular inverse) ->
* RECONSTRUCTION: A0 * inv(A0) = I. The FULL logical triangular matrix (opposite
* triangle exact zero, unit diagonal = 1) is the independent oracle.
*
* This is the routine whose OWN inverse the zpptri/ztptri packed stride-mapping
* bug lived in (a dropped `*stride` conflating linear packed indices with element
* offsets → NaN / garbage for any strideAP != 1). The reconstruction property is
* swept over EVERY packed layout, INCLUDING strideAP in {2,3,-1,-2}, so the fix
* is exercised end-to-end; see test/harness/LEARNINGS.md.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztptri from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const DIAGS = [ 'non-unit', 'unit' ];

// Read the computed inverse triangle back into a full LogicalMatrix. The
// opposite triangle is exact zero; for a unit diagonal the diagonal is NOT
// referenced by the routine (poisoned in packed storage), so it is filled with
// `unitFill` (1 for the math oracle, 0 for the layout-invariance flatten).
function readInv( R, n, uplo, unit, unitFill ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
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
// ‖A0‖·‖inv(A0)‖ + ‖I‖ (recovers the backward-stable ~n·eps quantity for an
// ill-conditioned unit-diagonal triangle).
function assertInvResidual( A0, invA, P, n, label, factor ) {
	const R = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => out-of-bounds read into poisoned storage
	const scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: reconstruction A0 * inv(A0) = I across the size sweep, both uplo
// and diag flags, and EVERY packed storage layout (incl. strideAP in
// {2,3,-1,-2} — the exact axis that surfaced the packed stride-mapping bug). The
// assertFinite guard turns any dropped `*stride` (out-of-bounds read into
// poisoned padding) into a loud NaN failure.
test( 'ztptri: packed inverse reconstruction A*inv(A)=I (size sweep x uplo x diag x all packed layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		DIAGS.forEach( function eachDiag( diag ) {
			const unit = ( diag === 'unit' );
			SIZES_SMALL.forEach( function eachN( n ) {
				schemes.packed.layouts().forEach( function eachLayout( layout ) {
					const rng = new RNG( 0x100 + n ); // reproducible; log on failure
					const A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': unit } );
					const R = schemes.packed.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
					ztptri( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ] );
					const invA = readInv( R, n, uplo, unit, sc.one );
					const P = ref.matmul( sc, A0, invA );
					checked( 'ztptri', 'reconstruct', function run() {
						assertInvResidual( A0, invA, P, n, 'ztptri '+uplo+' '+diag+' n='+n+' stride='+R.args[ 0 ], 100 );
					});
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the inverse must be bit-exact across packed
// layouts. The complex ztpmv kernel has no incx==1 fast path (see the
// dpotri/dpptri LEARNINGS entry: only the REAL kernels split on unit stride), so
// bit-equality is asserted across the FULL packed family — unit-stride AND
// non-unit/negative packed strides {2,3,-1,-2} together. This is the strongest
// form of the check for the stride-mapping bug class: a mis-scaled packed
// pointer would make different strides disagree.
test( 'ztptri: bit-exact across all packed layouts (incl. strides 2,3,-1,-2)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		DIAGS.forEach( function eachDiag( diag ) {
			runInvariance( uplo, diag, schemes.packed.layouts(), 'all' );
		});
	});
});

function runInvariance( uplo, diag, variants, fam ) {
	const n = 12;
	const unit = ( diag === 'unit' );
	const SEED = 0xF00D;
	checked( 'ztptri', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': unit } );
			const R = schemes.packed.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
			ztptri( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ] );
			return check.flattenLogical( sc, readInv( R, n, uplo, unit, sc.zero ) );
		}, { 'label': 'ztptri '+uplo+' '+diag+' layout invariance '+fam } );
	});
}
