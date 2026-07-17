/**
* Property-based validation for dsytrs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense
* (schemes.dense, logical.symmetric — dsytrf is COMPLEX-SYMMETRIC, so the real
* analogue is a plain symmetric matrix, NOT Hermitian); `trs` (Bunch-Kaufman
* L*D*L^T / U*D*U^T solve, multiple RHS) -> RESIDUAL: the solve consumes a
* factorization (produced here by dsytrf), then we check `A0*X = B0` against the
* ORIGINAL symmetric matrix A0. The residual is therefore independent of the
* factorization's internal correctness — a wrong factorization would still have
* to yield an X that reproduces B0 through A0, so this one property certifies the
* dsytrf/dsytrs PAIR against A0.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsytrs from './../lib/ndarray.js';
import dsytrf from '../../dsytrf/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var NRHS = [ 1, 2, 3 ];

// Read column j of the solution X out of physical B storage as an array of
// scalar values.
function readCol( R, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs solution back into a LogicalMatrix (for bit-exact
// layout comparison).
function readB( R, n, nrhs ) {
	var X = new LogicalMatrix( sc, n, nrhs );
	var i;
	var j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Read a factored triangle (the dsytrf output) back into a full LogicalMatrix
// (opposite triangle zeroed) so it can be re-realized at another layout.
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

// Steps 2-3-5: residual property over uplo x N x nrhs x every pivot-valid storage
// layout (factor and solve share the layout; dsytrf's pivot search restricts to
// positive-row-stride pivotLayouts). Sweeping col AND row order at backward-error
// tolerance certifies the solve's cross-storage-order addressing (bit-exactness
// across orders is not expected — see the invariance test below). Factor A0 with
// dsytrf, solve with dsytrs, then verify A0*X = B0 per RHS column against the
// ORIGINAL symmetric matrix.
test( 'dsytrs: Bunch-Kaufman solve residual (uplo x N x nrhs x layout)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				schemes.dense.pivotLayouts().forEach( function eachLayout( layout ) {
					runResidual( uplo, N, nrhs, layout );
				});
			});
		});
	});
});

function runResidual( uplo, N, nrhs, layout ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.symmetric( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	var ipiv = new Int32Array( N );

	dsytrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );
	dsytrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'dsytrs', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dsytrs '+uplo+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. dsytrs consumes an already-computed
// factorization, so this test PRE-FACTORS once at a tight layout and then
// re-realizes those FIXED factor values (+ pivots) at each storage layout,
// running only dsytrs. This isolates dsytrs's OWN addressing from the pivoting
// factor: dsytrf does an idamax pivot search that is out of contract for a
// negative first-dimension stride, but dsytrs has NO pivot search. Its inner
// optimized dgemv/dger reorder the summation on a col<->row storage FLIP
// (~1 ULP, not a defect — cross-order agreement is certified by the residual
// property above), so bit-exactness is asserted only WITHIN a storage-order
// family (col / row); offset, leading-dim padding, gap, and stride sign are all
// fuzzed inside each family. See the dpotf2 / dgels LEARNINGS entries.
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dsytrs: bit-exact within storage-order family (solve isolated from factor)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	var N = 9;
	var nrhs = 3;
	var SEED = 0xBEEF;

	// Factor ONCE at the tight col-major layout to obtain a fixed factor +
	// pivots shared by every layout variant below:
	var rng = new RNG( SEED );
	var A0 = logical.symmetric( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var tight = schemes.dense.pivotLayouts()[ 0 ];
	var Af = schemes.dense.realize( sc, A0, { 'part': uplo }, tight );
	var ipiv = new Int32Array( N );
	dsytrf( uplo, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
	var Afac = readTri( Af, N, uplo );

	checked( 'dsytrs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var Ar = schemes.dense.realize( sc, Afac, { 'part': uplo }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			dsytrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'dsytrs '+uplo+' layout invariance '+fam+'-major' } );
	});
}
