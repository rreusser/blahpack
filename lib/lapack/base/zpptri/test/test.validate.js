/**
* Property-based validation for zpptri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pp` -> SPD PACKED (schemes.packed,
* logical.positiveDefinite); `tri` (inverse from Cholesky factor) ->
* RECONSTRUCTION: A0 * inv(A0) = I. Input is the packed Cholesky factor (produced
* by calling zpptrf in place); output overwrites the packed uplo triangle with
* inv(A), which is symmetric — the opposite triangle is not stored. The FULL
* positive-definite logical matrix A0 is the independent oracle; the product of
* the original with the computed inverse must be the identity.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpptri from './../lib/ndarray.js';
import zpptrf from '../../zpptrf/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];

// Read the computed inverse (packed uplo triangle) back into a FULL
// symmetric/Hermitian LogicalMatrix by mirroring across the diagonal (conjugated
// for complex; the diagonal is its own mirror).
function readSymFull( R, n, uplo ) {
	var F = new LogicalMatrix( sc, n, n );
	var v;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			if ( i === j ) {
				F.set( i, i, R.read( i, i ) );
			} else if ( uplo === 'upper' ) {
				v = R.read( j, i );
				F.set( j, i, v );
				F.set( i, j, sc.conj( v ) );
			} else {
				v = R.read( i, j );
				F.set( i, j, v );
				F.set( j, i, sc.conj( v ) );
			}
		}
	}
	return F;
}

// Read only the referenced packed uplo triangle back (opposite triangle exact
// zero) for bit-exact layout-invariance flattening.
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

// Backward-error residual: ‖A0*inv(A0) - I‖ normalized by ‖A0‖·‖inv(A0)‖ + ‖I‖.
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
// flags, and EVERY packed storage layout (non-unit strides, negative strides,
// leading/trailing pads). Backward-error tolerance certifies cross-layout
// correctness.
test( 'zpptri: inverse reconstruction A*inv(A)=I (size sweep x uplo x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.packed.layouts().forEach( function eachLayout( layout ) {
				var rng = new RNG( 0x100 + n ); // reproducible; log on failure
				var A0 = logical.positiveDefinite( sc, rng, n );
				var R = schemes.packed.realize( sc, A0, { 'part': uplo }, layout );
				zpptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
				zpptri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
				var invA = readSymFull( R, n, uplo );
				var P = ref.matmul( sc, A0, invA );
				checked( 'zpptri', 'reconstruct', function run() {
					assertInvResidual( A0, invA, P, n, 'zpptri '+uplo+' n='+n, 100 );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the packed inverse must be bit-exact across
// ALL packed storage layouts. Packed storage has a single addressing family (no
// col/row distinction), so a single family covers every layout; any addressing
// bug surfaces as a bit difference.
test( 'zpptri: bit-exact across packed storage layouts', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, 9 );
	});
});

function runInvariance( uplo, n ) {
	var SEED = 0xF00D;
	var variants = schemes.packed.layouts();
	checked( 'zpptri', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.packed.realize( sc, A0, { 'part': uplo }, layout );
			zpptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
			zpptri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'zpptri '+uplo+' n='+n+' packed layout invariance' } );
	});
}
