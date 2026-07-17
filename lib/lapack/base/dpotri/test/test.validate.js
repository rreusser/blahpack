/**
* Property-based validation for dpotri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `po` -> SPD dense (schemes.dense,
* logical.positiveDefinite); `tri` (inverse from Cholesky factor) ->
* RECONSTRUCTION: A0 * inv(A0) = I. Input is the Cholesky factor (produced by
* calling dpotrf in place); output overwrites the uplo triangle with inv(A),
* which is symmetric — the opposite triangle is NOT referenced. The FULL
* positive-definite logical matrix A0 is the independent oracle; the product of
* the original with the computed inverse must be the identity.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpotri from './../lib/ndarray.js';
import dpotrf from '../../dpotrf/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];

// Read the computed inverse (stored in the uplo triangle) back into a FULL
// symmetric/Hermitian LogicalMatrix by mirroring the referenced triangle across
// the diagonal (conjugated for complex; the diagonal is its own mirror).
function readSymFull( R, n, uplo ) {
	var F = new LogicalMatrix( sc, n, n );
	var v;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			// (i,j) is in the lower triangle; its mirror (j,i) is in the upper.
			if ( i === j ) {
				v = R.read( i, i );
				F.set( i, i, v );
			} else if ( uplo === 'upper' ) {
				v = R.read( j, i ); // referenced upper element
				F.set( j, i, v );
				F.set( i, j, sc.conj( v ) );
			} else {
				v = R.read( i, j ); // referenced lower element
				F.set( i, j, v );
				F.set( j, i, sc.conj( v ) );
			}
		}
	}
	return F;
}

// Read only the referenced uplo triangle back (opposite triangle exact zero) for
// bit-exact layout-invariance flattening.
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

// Backward-error residual for the inverse: ‖A0*inv(A0) - I‖ normalized by
// ‖A0‖·‖inv(A0)‖ + ‖I‖ (NOT ‖I‖ alone), recovering the backward-stable ~n·eps
// quantity even when A0 is moderately ill-conditioned (cf. dtrti2 validation).
function assertInvResidual( A0, invA, P, n, label, factor ) {
	var R = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => OOB read into poisoned storage
	var scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: reconstruction A0 * inv(A0) = I across the size sweep, both uplo
// flags, and EVERY storage layout. Sizes include 33/64 to exercise the blocked
// lauum/trtri paths. Sweeping all layouts here (at backward-error tolerance)
// certifies cross-storage-order correctness: a genuine row/col transpose bug
// would make the row-major product WRONG (not merely reordered) and trip this
// check, whereas the bit-exact family split below only catches addressing bugs
// within a fixed arithmetic order.
test( 'dpotri: inverse reconstruction A*inv(A)=I (size sweep x uplo x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.dense.layouts().forEach( function eachLayout( layout ) {
				var rng = new RNG( 0x100 + n ); // reproducible; log on failure
				var A0 = logical.positiveDefinite( sc, rng, n );
				var R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				dpotrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				dpotri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				var invA = readSymFull( R, n, uplo );
				var P = ref.matmul( sc, A0, invA );
				checked( 'dpotri', 'reconstruct', function run() {
					assertInvResidual( A0, invA, P, n, 'dpotri '+uplo+' n='+n, 100 );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the inverse must be bit-exact across storage
// layouts that change ONLY addressing while holding arithmetic order fixed.
// dpotri reaches BLOCKED Level-3 kernels (dtrmm/dsyrk in dlauum, dtrsm/dtrmv in
// dtrtri) whose real reference implementations have exact `incx==1` unit-stride
// fast paths and stride-dependent blocked reordering. As a result — unlike the
// UNBLOCKED dpotf2/dtrti2 — even a single col/row storage-order family is NOT
// bit-exact: the summation order shifts ~1 ULP with stride sign, inner-stride
// gap, storage order, AND uplo (empirically, e.g. negative-row-stride col-major
// forms its own class for uplo='lower'; see the dpotri/dpptri real-BLAS-reorder
// LEARNINGS entry). All such shifts are benign (the reconstruction sweep across
// ALL 7 layouts above certifies cross-order/sign/gap correctness). So bit-
// equality here is asserted across a PURE-ADDRESSING family: identical strides
// and signs (tight col-major, g=1, positive), varying only base offset, leading
// pad, and leading-dimension padding — which cannot change arithmetic order, so
// any residual difference is a genuine offset/stride-base addressing bug. N=40
// exercises the blocked path.
var PURE_ADDR = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 3, 'tail': 2 }
];

test( 'dpotri: bit-exact across pure-addressing layouts (offset / leading-dim)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		[ 12, 40 ].forEach( function eachN( n ) {
			runInvariance( uplo, n );
		});
	});
});

function runInvariance( uplo, n ) {
	var SEED = 0xF00D;
	checked( 'dpotri', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			dpotrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			dpotri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'dpotri '+uplo+' n='+n+' pure-addressing layout invariance' } );
	});
}
