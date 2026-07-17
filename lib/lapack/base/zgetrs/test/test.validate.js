/**
* Property-based validation for zgetrs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `trs` (LU solve, multiple RHS) -> RESIDUAL:
* the solve consumes an LU factorization (produced here by the already-validated
* zgetrf), then we check `op(A0)*X = B0` against the ORIGINAL matrix A0. For
* trans='conjugate-transpose' the oracle uses op(A0) = A0^H, so the complex
* conjugation seam is exercised. The residual is independent of zgetrf's
* correctness.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgetrs from './../lib/ndarray.js';
import zgetrf from '../../zgetrf/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
var NRHS = [ 1, 2, 3 ];

// Map an API transpose flag to a reference transpose code.
function transCode( trans ) {
	if ( trans === 'transpose' ) {
		return 't';
	}
	if ( trans === 'conjugate-transpose' ) {
		return 'c';
	}
	return 'n';
}

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

// Steps 2-3-5: residual property across trans flags, a size sweep, and nrhs.
test( 'zgetrs: LU solve residual (trans x N x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( trans, N, nrhs );
			});
		});
	});
});

function runResidual( trans, N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.general( sc, rng, N, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	var layout = schemes.dense.layouts()[ 0 ];
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	var ipiv = new Int32Array( N ); // 0-based pivots from zgetrf

	// Factor A (copy realized above) in place, then solve in place (B <- X):
	zgetrf( N, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );
	zgetrs( trans, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	var code = transCode( trans );
	checked( 'zgetrs', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': 'zgetrs '+trans+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. zgetrs consumes an already-computed
// factorization, so this test PRE-FACTORS once at a tight layout and then
// re-realizes those FIXED factor values (+ pivots) at every storage layout,
// running only zgetrs. This isolates zgetrs's own addressing from the factor
// routine: composing zgetrf per layout would re-run the pivoting factor, and
// the getrf/getf2 pivoting family is out of contract for a negative first-
// dimension stride (its izamax pivot search returns -1 -> IPIV=-1 -> NaN; see
// test/harness/LEARNINGS.md 2026-07-17, "getrf/getf2 pivoting family: negative
// FIRST-dimension stride ... idamax/izamax ... return -1"). zgetrs has NO pivot
// search, so isolated it is bit-exact across ALL 7 layouts (col AND row, incl.
// negative strides), and no col/row split is needed.
function readFac( R, n ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

test( 'zgetrs: bit-exact across all storage layouts (solve isolated from factor)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans );
	});
});

function runInvariance( trans ) {
	var N = 9;
	var nrhs = 3;
	var SEED = 0xBEEF;

	// Factor ONCE at the tight col-major layout to obtain fixed LU factors +
	// pivots shared by every layout variant below:
	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, N, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var tight = schemes.dense.layouts()[ 0 ];
	var Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, tight );
	var ipiv = new Int32Array( N );
	zgetrf( N, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
	var Afac = readFac( Af, N );

	checked( 'zgetrs', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.layouts(), function build( layout ) {
			var Ar = schemes.dense.realize( sc, Afac, { 'part': 'full' }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			zgetrs( trans, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zgetrs '+trans+' layout invariance' } );
	});
}
