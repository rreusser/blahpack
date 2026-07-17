/**
* Property-based validation for zpotri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `po` -> SPD dense (schemes.dense,
* logical.positiveDefinite); `tri` (inverse from Cholesky factor) ->
* RECONSTRUCTION: A0 * inv(A0) = I. Input is the Cholesky factor (produced by
* calling zpotrf in place); output overwrites the uplo triangle with inv(A),
* which is symmetric — the opposite triangle is NOT referenced. The FULL
* positive-definite logical matrix A0 is the independent oracle; the product of
* the original with the computed inverse must be the identity.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpotri from './../lib/ndarray.js';
import zpotrf from '../../zpotrf/lib/ndarray.js';

var sc = S.complex; // z-routine
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
test( 'zpotri: inverse reconstruction A*inv(A)=I (size sweep x uplo x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.dense.layouts().forEach( function eachLayout( layout ) {
				var rng = new RNG( 0x100 + n ); // reproducible; log on failure
				var A0 = logical.positiveDefinite( sc, rng, n );
				var R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				zpotrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				zpotri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				var invA = readSymFull( R, n, uplo );
				var P = ref.matmul( sc, A0, invA );
				checked( 'zpotri', 'reconstruct', function run() {
					assertInvResidual( A0, invA, P, n, 'zpotri '+uplo+' n='+n, 100 );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the inverse must be bit-exact across storage
// layouts WITHIN a single storage-order family. zpotri reaches the optimized
// dtrmm/dsyrk (lauum) and dtrsm/dtrmv (trtri), which reorder their summation on a
// col<->row storage-order flip (~1 ULP, not a defect — see the dpotf2 LEARNINGS
// entry), so bit-equality is asserted only within the col family and within the
// row family. Fuzzing offset, leading-dim padding, and stride SIGN (all present
// in each family) leaves arithmetic order intact, so any addressing bug surfaces
// as a bit difference; cross-order correctness is covered by the reconstruction
// above. N=40 hits the blocked path.
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zpotri: bit-exact within storage-order family (col / row)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		[ 12, 40 ].forEach( function eachN( n ) {
			runInvariance( uplo, n, colLayouts, 'col' );
			runInvariance( uplo, n, rowLayouts, 'row' );
		});
	});
});

function runInvariance( uplo, n, variants, fam ) {
	var SEED = 0xF00D;
	checked( 'zpotri', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			zpotrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			zpotri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'zpotri '+uplo+' n='+n+' layout invariance '+fam+'-major' } );
	});
}
