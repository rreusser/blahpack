/**
* Property-based validation for dgbcon, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gb` -> GENERAL BANDED (schemes.banded
* with sub/super-bandwidths kl/ku, logical.banded); `con` (condition-number
* ESTIMATOR from an LU factor) -> PROPERTY: dgbcon returns `rcond ≈ 1/κ` where
* κ = ‖A‖·‖A⁻¹‖ in the chosen norm. It is a Hager/Higham estimate (a lower bound
* on ‖A⁻¹‖, hence an upper bound on true_rcond), guaranteed within a factor ~N and
* usually much tighter.
*
* We compute the TRUE value INDEPENDENTLY: anorm = exact 1-/inf-norm of the
* ORIGINAL full band matrix A0; ‖A0⁻¹‖ from A0⁻¹ obtained by solving A0·X = I with
* the already-validated dgbsv (full band factor+solve, independent of dgbcon's
* dlacn2/dlatbs estimator path). Assert the estimate agrees with true_rcond within
* a modest factor F, and rcond ∈ (0,1].
*
* The LU factor is produced by dgbtrf into `schemes.banded {kl,ku,luFill}` storage
* (ldab = 2*kl+ku+1, KL fill rows poisoned on entry). Factor storage uses
* positive-first-dim-stride banded layouts (dgbtrf's idamax pivot search is out of
* contract for a negative first-dim stride — see LEARNINGS.md getrf/getf2 family).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, norms, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgbcon from './../lib/ndarray.js';
import dgbtrf from '../../dgbtrf/lib/ndarray.js';
import dgbsv from '../../dgbsv/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var NS = [ 2, 3, 5, 8, 16, 17, 33 ];
var NORMS = [
	{ 'api': 'one-norm', 'fn': norms.oneNorm },
	{ 'api': 'inf-norm', 'fn': norms.infNorm }
];

// The Hager estimate is a lower bound on ‖A⁻¹‖ (=> upper bound on true_rcond),
// tight for well-conditioned random band matrices. F=3 leaves generous slack over
// the observed agreement while still catching a wildly-wrong estimate (theory
// guarantees agreement within ~N).
var FACTOR = 3;

// Positive-first-dim-stride banded layouts only (dgbtrf/dgbsv idamax pivot search).
var BANDED_POS = schemes.banded.layouts().filter( function pos( L ) {
	return L.sgn1 !== -1;
});
var TIGHT_BANDED = BANDED_POS[ 0 ];
var TIGHT_DENSE = schemes.dense.layouts()[ 0 ];

// (kl,ku) pairs clamped to [0,N-1], deduped.
function bands( N ) {
	var hi = Math.max( 0, N - 1 );
	var raw = [ [ 1, 1 ], [ 2, 3 ], [ 0, 2 ] ];
	var seen = {};
	var out = [];
	raw.forEach( function each( p ) {
		var kl = Math.min( p[ 0 ], hi );
		var ku = Math.min( p[ 1 ], hi );
		var key = kl + ':' + ku;
		if ( !seen[ key ] ) {
			seen[ key ] = true;
			out.push( [ kl, ku ] );
		}
	});
	return out;
}

function identity( n ) {
	var M = new LogicalMatrix( sc, n, n ); // inits to sc.zero
	var i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

// Read a fully-referenced dense-realized buffer back into a LogicalMatrix.
function readFull( R, rows, cols ) {
	var M = new LogicalMatrix( sc, rows, cols );
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			M.set( i, j, R.read( i, j ) );
		}
	}
	return M;
}

// INDEPENDENT true inverse: solve A0·X = I with dgbsv (X = A0⁻¹). dgbsv factors its
// own fresh copy of A0 and does not touch dgbcon's estimator path.
function bandedInverse( A0, N, kl, ku ) {
	var Ar = schemes.banded.realize( sc, A0.copy(), { 'kl': kl, 'ku': ku, 'luFill': true }, TIGHT_BANDED );
	var Br = schemes.dense.realize( sc, identity( N ), { 'part': 'full' }, TIGHT_DENSE );
	var ipiv = new Int32Array( N );
	dgbsv( N, kl, ku, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	return readFull( Br, N, N );
}

// Steps 2-3-5: estimate-vs-truth PROPERTY across norm x N x (kl,ku).
test( 'dgbcon: rcond ≈ 1/κ vs independent truth (norm x N x band)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		NS.forEach( function eachN( N ) {
			bands( N ).forEach( function eachBand( b ) {
				runProperty( nm, N, b[ 0 ], b[ 1 ] );
			});
		});
	});
});

function runProperty( nm, N, kl, ku ) {
	var rng = new RNG( 0x4000 + ( N * 100 ) + ( kl * 10 ) + ku ); // reproducible
	var A0 = logical.banded( sc, rng, N, N, kl, ku );
	var anorm = nm.fn( sc, A0 );

	// Estimator: factor a fresh realized copy of A0, then estimate rcond.
	var Af = schemes.banded.realize( sc, A0.copy(), { 'kl': kl, 'ku': ku, 'luFill': true }, TIGHT_BANDED );
	var ipiv = new Int32Array( N );
	dgbtrf( N, N, kl, ku, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );

	var rcond = new Float64Array( 1 );
	var WORK = new Float64Array( 3 * N );
	var IWORK = new Int32Array( N );
	var info = dgbcon( nm.api, N, kl, ku, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );

	// Independent truth:
	var Ainv = bandedInverse( A0, N, kl, ku );
	var invnorm = nm.fn( sc, Ainv );
	var trueRcond = 1.0 / ( anorm * invnorm );

	var label = 'dgbcon ' + nm.api + ' N=' + N + ' kl=' + kl + ' ku=' + ku;
	checked( 'dgbcon', 'property', function run() {
		if ( info !== 0 ) {
			throw new Error( label + ': info=' + info + ' (expected 0)' );
		}
		var r = rcond[ 0 ];
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( label + ': rcond=' + r + ' not in (0,1]' );
		}
		if ( !( r <= FACTOR * trueRcond && trueRcond <= FACTOR * r ) ) {
			throw new Error( label + ': rcond=' + r.toExponential( 4 ) + ' disagrees with true_rcond=' + trueRcond.toExponential( 4 ) + ' beyond factor ' + FACTOR + ' (ratio ' + ( r / trueRcond ).toExponential( 3 ) + ')' );
		}
	} );
}

// Step 4: layout-invariance. dgbcon CONSUMES an LU factor, so pre-factor ONCE at
// the tight banded layout, read the fixed factor band back, then re-realize those
// FIXED factor values at every positive-sgn1 banded layout and run only dgbcon
// (fixed anorm). dgbcon has no pivot search of its own (its idamax is over the
// contiguous WORK vector, not AB); its inner daxpy/ddot/dlatbs read AB(i,j) by
// value in an order fixed by the algorithm, not by physical storage — so the
// estimate is bit-exact across the whole positive-sgn1 banded family (col AND row,
// padded, gapped, negative COLUMN stride).
//
// The dgbtrf factor occupies band rows 0..2*kl+ku of the ldab=2*kl+ku+1 array: U
// (fill-extended to kl+ku superdiagonals) above, L multipliers (kl subdiagonals)
// below. Represented as a plain banded matrix (kl, ku_f=kl+ku), its
// schemes.banded realize (spec {kl, ku:kl+ku}, no luFill) reproduces byte-identical
// AB storage (same ldab, same bandrow = kl+ku+i-j) that dgbcon reads.
function readFactorBand( Ar, N, kl, ku ) {
	var kuF = kl + ku;
	var F = new LogicalMatrix( sc, N, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - kuF ); i <= Math.min( N - 1, j + kl ); i++ ) {
			F.set( i, j, Ar.read( i, j ) );
		}
	}
	return F;
}

test( 'dgbcon: bit-exact across positive-sgn1 banded layouts (estimate isolated from factor)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		runInvariance( nm );
	});
});

function runInvariance( nm ) {
	var N = 9;
	var kl = 2;
	var ku = 3;
	var kuF = kl + ku;
	var SEED = 0x4000 + N;
	var rng = new RNG( SEED );
	var A0 = logical.banded( sc, rng, N, N, kl, ku );
	var anorm = nm.fn( sc, A0 );

	// Factor ONCE to obtain fixed LU factors + pivots shared by every variant:
	var Af = schemes.banded.realize( sc, A0.copy(), { 'kl': kl, 'ku': ku, 'luFill': true }, TIGHT_BANDED );
	var ipiv = new Int32Array( N );
	dgbtrf( N, N, kl, ku, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
	var Fac = readFactorBand( Af, N, kl, ku );

	checked( 'dgbcon', 'layout-invariance', function run() {
		layoutInvariant( BANDED_POS, function build( layout ) {
			var Ar = schemes.banded.realize( sc, Fac, { 'kl': kl, 'ku': kuF }, layout );
			var rcond = new Float64Array( 1 );
			var WORK = new Float64Array( 3 * N );
			var IWORK = new Int32Array( N );
			dgbcon( nm.api, N, kl, ku, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'dgbcon ' + nm.api + ' layout invariance' } );
	} );
}
