/**
* Property-based validation for dtrcon, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr` -> triangular dense
* (schemes.dense, logical.triangular); `con` (self-contained condition-number
* ESTIMATOR) -> PROPERTY: dtrcon returns `rcond ≈ 1/κ` with κ = ‖A‖·‖A⁻¹‖ in the
* chosen norm. dtrcon computes ‖A‖ itself (dlantr) and estimates ‖A⁻¹‖ (dlacn2 +
* dlatrs). We compute the TRUE value INDEPENDENTLY: anorm = exact 1-/inf-norm of
* A0; ‖A⁻¹‖ from A⁻¹ obtained by the already-validated dtrtri (independent of
* dtrcon's estimator). Assert agreement within a modest factor F and rcond ∈
* (0,1].
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtrcon from './../lib/ndarray.js';
import dtrtri from '../../dtrtri/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const NORMS = [
	{ 'api': 'one-norm', 'which': 'one' },
	{ 'api': 'inf-norm', 'which': 'inf' }
];
const UPLOS = [ 'upper', 'lower' ];
const DIAGS = [ 'non-unit', 'unit' ];

// The estimate is a lower bound on ‖A⁻¹‖ (=> upper bound on true_rcond). Unit
// triangular matrices with O(1) off-diagonals are more ill-conditioned, so the
// estimator's slack widens; F=5 comfortably covers the observed agreement while
// still catching an order-of-magnitude-wrong estimate.
const FACTOR = 5;
const TIGHT = schemes.dense.layouts()[ 0 ];

// 1-norm (max abs column sum) or inf-norm (max abs row sum) of a LogicalMatrix.
function normOf( M, which ) {
	let best = 0.0;
	let s, i, j;
	if ( which === 'one' ) {
		for ( j = 0; j < M.cols; j++ ) {
			s = 0.0;
			for ( i = 0; i < M.rows; i++ ) {
				s += sc.abs( M.get( i, j ) );
			}
			if ( s > best ) {
				best = s;
			}
		}
	} else {
		for ( i = 0; i < M.rows; i++ ) {
			s = 0.0;
			for ( j = 0; j < M.cols; j++ ) {
				s += sc.abs( M.get( i, j ) );
			}
			if ( s > best ) {
				best = s;
			}
		}
	}
	return best;
}

// Read the inverse triangle back into a full LogicalMatrix (opposite triangle
// exact zero; an unreferenced unit diagonal is filled with 1).
function readTri( R, n, uplo, unit ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( i === j ) {
				F.set( i, j, unit ? sc.one : R.read( i, j ) );
			} else if ( uplo === 'upper' ? i < j : i > j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// INDEPENDENT true inverse via dtrtri (in place on a fresh realized copy).
function triInverse( A0, n, uplo, diag, unit ) {
	const R = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, TIGHT );
	dtrtri( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
	return readTri( R, n, uplo, unit );
}

// Steps 2-3-5: estimate-vs-truth PROPERTY across norm x uplo x diag x N.
test( 'dtrcon: rcond ≈ 1/κ vs independent truth (norm x uplo x diag x N)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			DIAGS.forEach( function eachDiag( diag ) {
				SIZES_SMALL.forEach( function eachN( N ) {
					runProperty( nm, uplo, diag, N );
				});
			});
		});
	});
});

function runProperty( nm, uplo, diag, N ) {
	const unit = ( diag === 'unit' );
	const rng = new RNG( 0x100 + N ); // reproducible; log on failure
	const A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
	const anorm = normOf( A0, nm.which ); // A0 already holds the full math triangle

	// Estimator (self-contained; computes its own ‖A‖):
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, TIGHT );
	const RCOND = new Float64Array( 1 );
	const WORK = new Float64Array( 3 * N );
	const IWORK = new Int32Array( N );
	const info = dtrcon( nm.api, uplo, diag, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], RCOND, WORK, 1, 0, IWORK, 1, 0 );

	// Independent truth:
	const Ainv = triInverse( A0, N, uplo, diag, unit );
	const invnorm = normOf( Ainv, nm.which );
	const trueRcond = 1.0 / ( anorm * invnorm );

	const label = 'dtrcon ' + nm.api + ' ' + uplo + ' ' + diag + ' N=' + N;
	checked( 'dtrcon', 'property', function run() {
		if ( info !== 0 ) {
			throw new Error( label + ': info=' + info + ' (expected 0)' );
		}
		const r = RCOND[ 0 ];
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( label + ': rcond=' + r + ' not in (0,1]' );
		}
		if ( !( r <= FACTOR * trueRcond && trueRcond <= FACTOR * r ) ) {
			throw new Error( label + ': rcond=' + r.toExponential( 4 ) + ' disagrees with true_rcond=' + trueRcond.toExponential( 4 ) + ' beyond factor ' + FACTOR + ' (ratio ' + ( r / trueRcond ).toExponential( 3 ) + ')' );
		}
	} );
}

// Step 4: layout-invariance. dtrcon is self-contained (no pivot search); its
// inner dlantr/dlatrs/dlacn2 read A(i,j) by value, so arithmetic order is fixed
// by the algorithm, not physical storage — the estimate is bit-exact across ALL
// 7 dense layouts (col AND row, incl. negative strides).
test( 'dtrcon: bit-exact across all storage layouts', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			DIAGS.forEach( function eachDiag( diag ) {
				runInvariance( nm, uplo, diag );
			});
		});
	});
});

function runInvariance( nm, uplo, diag ) {
	const N = 9;
	const unit = ( diag === 'unit' );
	const SEED = 0x100 + N;
	checked( 'dtrcon', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.layouts(), function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
			const RCOND = new Float64Array( 1 );
			const WORK = new Float64Array( 3 * N );
			const IWORK = new Int32Array( N );
			dtrcon( nm.api, uplo, diag, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], RCOND, WORK, 1, 0, IWORK, 1, 0 );
			return [ RCOND[ 0 ] ];
		}, { 'label': 'dtrcon ' + nm.api + ' ' + uplo + ' ' + diag + ' layout invariance' } );
	} );
}
