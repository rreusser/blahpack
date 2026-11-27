/**
* Property-based validation for dpptri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pp` -> SPD PACKED (schemes.packed,
* logical.positiveDefinite); `tri` (inverse from Cholesky factor) ->
* RECONSTRUCTION: A0 * inv(A0) = I. Input is the packed Cholesky factor (produced
* by calling dpptrf in place); output overwrites the packed uplo triangle with
* inv(A), which is symmetric — the opposite triangle is not stored. The FULL
* positive-definite logical matrix A0 is the independent oracle; the product of
* the original with the computed inverse must be the identity.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpptri from './../lib/ndarray.js';
import dpptrf from '../../dpptrf/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];

// Read the computed inverse (packed uplo triangle) back into a FULL
// symmetric/Hermitian LogicalMatrix by mirroring across the diagonal (conjugated
// for complex; the diagonal is its own mirror).
function readSymFull( R, n, uplo ) {
	const F = new LogicalMatrix( sc, n, n );
	let v, i, j;
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

// Backward-error residual: ‖A0*inv(A0) - I‖ normalized by ‖A0‖·‖inv(A0)‖ + ‖I‖.
function assertInvResidual( A0, invA, P, n, label, factor ) {
	const R = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => OOB read into poisoned storage
	const scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: reconstruction A0 * inv(A0) = I across the size sweep, both uplo
// flags, and EVERY packed storage layout (non-unit strides, negative strides,
// leading/trailing pads). Backward-error tolerance certifies cross-layout
// correctness.
test( 'dpptri: inverse reconstruction A*inv(A)=I (size sweep x uplo x all layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.packed.layouts().forEach( function eachLayout( layout ) {
				const rng = new RNG( 0x100 + n ); // reproducible; log on failure
				const A0 = logical.positiveDefinite( sc, rng, n );
				const R = schemes.packed.realize( sc, A0, { 'part': uplo }, layout );
				dpptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
				dpptri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
				const invA = readSymFull( R, n, uplo );
				const P = ref.matmul( sc, A0, invA );
				checked( 'dpptri', 'reconstruct', function run() {
					assertInvResidual( A0, invA, P, n, 'dpptri '+uplo+' n='+n, 100 );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the packed inverse must be bit-exact across
// layouts that change ONLY addressing. dpptri's real kernels (ddot/dtpmv/dspr in
// dtptri + the inv(L)^T·inv(L) / inv(U)·inv(U)^T assembly) take exact `incx==1`
// unit-stride fast paths, so a non-unit or negative packed stride legitimately
// reorders the summation ~1 ULP (empirically the uplo='lower' assembly splits
// stride-1 vs stride≠1; see the dpotri/dpptri real-BLAS-reorder LEARNINGS entry).
// These shifts are benign — cross-stride correctness is certified by the
// reconstruction sweep across ALL 6 packed layouts above. So bit-equality here is
// asserted across a PURE-ADDRESSING family: fixed unit stride, varying only base
// offset / leading / trailing pad, which cannot change arithmetic order; any
// residual difference is a genuine offset/stride-base addressing bug.
const PURE_ADDR = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 7, 'tail': 4 },
	{ 'stride': 1, 'lead': 1, 'tail': 5 }
];

test( 'dpptri: bit-exact across pure-addressing packed layouts (offset)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		[ 9, 40 ].forEach( function eachN( n ) {
			runInvariance( uplo, n );
		});
	});
});

function runInvariance( uplo, n ) {
	const SEED = 0xF00D;
	checked( 'dpptri', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.positiveDefinite( sc, rng, n );
			const R = schemes.packed.realize( sc, A0, { 'part': uplo }, layout );
			dpptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
			dpptri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ] );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'dpptri '+uplo+' n='+n+' pure-addressing packed layout invariance' } );
	});
}
