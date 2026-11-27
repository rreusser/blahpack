/**
* Property-based validation for dgecon, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `con` (condition-number ESTIMATOR from an LU
* factor) -> PROPERTY: dgecon returns `rcond ≈ 1/κ` where κ = ‖A‖·‖A⁻¹‖ in the
* chosen norm. It is a Hager/Higham estimate (a lower bound on ‖A⁻¹‖, hence an
* upper bound on true_rcond), guaranteed within a factor ~N and usually much
* tighter. We compute the TRUE value INDEPENDENTLY: anorm = exact 1-/inf-norm of
* A0; ‖A⁻¹‖ from A⁻¹ obtained by solving A0·X = I with the already-validated
* dgesv (independent of dgecon's dlacn2 estimator). Assert the estimate agrees
* with true_rcond within a modest factor F, and rcond ∈ (0,1].
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgecon from './../lib/ndarray.js';
import dgetrf from '../../dgetrf/lib/ndarray.js';
import dgesv from '../../dgesv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

// norm sweep: API flag paired with the matching independent norm.
const NORMS = [
	{ 'api': 'one-norm', 'which': 'one' },
	{ 'api': 'inf-norm', 'which': 'inf' }
];

// The estimate is a lower bound on ‖A⁻¹‖ (=> upper bound on true_rcond), tight
// for well-conditioned random matrices; F=3 leaves generous slack over the
// observed agreement while still catching a wildly-wrong estimate.
const FACTOR = 3;
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

function identity( n ) {
	const M = new LogicalMatrix( sc, n, n ); // inits to sc.zero
	let i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

// Read a fully-referenced dense-realized buffer back into a LogicalMatrix.
function readFull( R, rows, cols ) {
	const M = new LogicalMatrix( sc, rows, cols );
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			M.set( i, j, R.read( i, j ) );
		}
	}
	return M;
}

// INDEPENDENT true inverse: solve A0·X = I with dgesv (X = A0⁻¹). dgesv factors
// its own copy and does not touch dgecon's estimator path.
function generalInverse( A0, n ) {
	const Ac = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	const Bc = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT );
	const ipiv = new Int32Array( n );
	dgesv( n, n, Ac.data, Ac.args[ 0 ], Ac.args[ 1 ], Ac.args[ 2 ], ipiv, 1, 0, Bc.data, Bc.args[ 0 ], Bc.args[ 1 ], Bc.args[ 2 ] );
	return readFull( Bc, n, n );
}

// Steps 2-3-5: estimate-vs-truth PROPERTY across norm x N. Factor a copy of A0
// with dgetrf, call dgecon(norm, ..., anorm, rcond), and compare rcond to
// true_rcond = 1/(anorm·‖A0⁻¹‖) within a factor F.
test( 'dgecon: rcond ≈ 1/κ vs independent truth (norm x N)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( nm, N );
		});
	});
});

function runProperty( nm, N ) {
	const rng = new RNG( 0x100 + N ); // reproducible; log on failure
	const A0 = logical.general( sc, rng, N, N );
	const anorm = normOf( A0, nm.which );

	// Estimator: factor a fresh realized copy of A0, then estimate rcond.
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	const ipiv = new Int32Array( N );
	dgetrf( N, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );

	const rcond = new Float64Array( 1 );
	const WORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const info = dgecon( nm.api, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );

	// Independent truth:
	const Ainv = generalInverse( A0, N );
	const invnorm = normOf( Ainv, nm.which );
	const trueRcond = 1.0 / ( anorm * invnorm );

	const label = 'dgecon ' + nm.api + ' N=' + N;
	checked( 'dgecon', 'property', function run() {
		if ( info !== 0 ) {
			throw new Error( label + ': info=' + info + ' (expected 0)' );
		}
		const r = rcond[ 0 ];
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( label + ': rcond=' + r + ' not in (0,1]' );
		}
		if ( !( r <= FACTOR * trueRcond && trueRcond <= FACTOR * r ) ) {
			throw new Error( label + ': rcond=' + r.toExponential( 4 ) + ' disagrees with true_rcond=' + trueRcond.toExponential( 4 ) + ' beyond factor ' + FACTOR + ' (ratio ' + ( r / trueRcond ).toExponential( 3 ) + ')' );
		}
	} );
}

// Step 4: layout-invariance. dgecon CONSUMES an LU factor, so pre-factor ONCE at
// the tight col-major layout, then re-realize those FIXED factor values at every
// dense layout and run only dgecon (with a fixed anorm). dgecon has no pivot
// search of its own (its idamax is over the contiguous WORK vector, not A), and
// its inner dlatrs/dlacn2 read A(i,j) by value — arithmetic order is fixed by the
// algorithm, not by physical storage — so the estimate is bit-exact across ALL 7
// layouts (col AND row, incl. negative strides).
function readFac( R, n ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

test( 'dgecon: bit-exact across all storage layouts (estimate isolated from factor)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		runInvariance( nm );
	});
});

function runInvariance( nm ) {
	const N = 9;
	const SEED = 0x100 + N;
	const rng = new RNG( SEED );
	const A0 = logical.general( sc, rng, N, N );
	const anorm = normOf( A0, nm.which );

	// Factor ONCE to obtain fixed LU factors + pivots shared by every variant:
	const Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	const ipiv = new Int32Array( N );
	dgetrf( N, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
	const Afac = readFac( Af, N );

	checked( 'dgecon', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.layouts(), function build( layout ) {
			const Ar = schemes.dense.realize( sc, Afac, { 'part': 'full' }, layout );
			const rcond = new Float64Array( 1 );
			const WORK = new Float64Array( 4 * N );
			const IWORK = new Int32Array( N );
			dgecon( nm.api, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'dgecon ' + nm.api + ' layout invariance' } );
	} );
}
