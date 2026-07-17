/**
* Property-based validation for dgesv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `sv` (LU linear-solve driver: factor + solve
* in one call) -> RESIDUAL. dgesv factors A by LU with partial pivoting and solves
* A*X = B in place (A <- LU, B <- X, IPIV <- pivots). We check `A0*X = B0` against
* the ORIGINAL matrix A0, which is independent of the factorization the driver
* produced: a wrong factorization would still have to yield an X that reproduces
* B0 through A0. General A is a.s. nonsingular (Gaussian entries), so the residual
* is well-posed.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgesv from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

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

// Steps 2-3-5: residual property across a size sweep and nrhs. A single dense
// layout is used here (A must use a positive row stride: gesv->getrf does an
// idamax pivot search, out of contract for a negative first-dimension stride);
// every valid layout is exercised by the invariance test below. Factor+solve in
// one dgesv call, then verify A0*X = B0 per RHS column against the ORIGINAL
// matrix.
test( 'dgesv: LU solve residual (N x nrhs)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		NRHS.forEach( function eachNrhs( nrhs ) {
			runResidual( N, nrhs );
		});
	});
});

function runResidual( N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.general( sc, rng, N, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	// A layout must have a positive row stride (pivot search); use the tight
	// col-major layout for the residual sweep.
	var aLayout = schemes.dense.pivotLayouts()[ 0 ];
	var bLayout = schemes.dense.layouts()[ 0 ];
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, aLayout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bLayout );
	var ipiv = new Int32Array( N ); // 0-based pivots from getrf

	dgesv( N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'dgesv', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dgesv N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. dgesv factors A in place, so its output depends
// on the arithmetic order of the inner getrf kernels (optimized dgemm/dtrsm/dger).
// A col<->row FLIP of A legitimately reorders those inner loops (~1 ULP) while the
// residual A0*X=B0 still holds, so bit-exactness only holds WITHIN a storage-order
// family of A; cross-order agreement is certified by the residual property above.
// The SOLVE on B does not reorder under any B storage flip (its dlaswp/dtrsm walk
// B columns in the same order regardless of layout; see the dgetrs sibling), so B
// is fuzzed over ALL 7 dense layouts within each family. A uses pivotLayouts()
// (positive row stride) split by order; negative A COLUMN stride stays in-family
// because getf2's index-order dger/dscal do not reorder on a sign flip.
var A_PIVOT = schemes.dense.pivotLayouts();
var A_COL = A_PIVOT.filter( function isCol( L ) {
	return L.order !== 'row';
});
var A_ROW = A_PIVOT.filter( function isRow( L ) {
	return L.order === 'row';
});
var B_ALL = schemes.dense.layouts();

// Pair A-layouts (cycled within the family) with the full set of B-layouts, so A
// stays in one storage order (bit-exact factor) while B sweeps every layout.
function pairVariants( aFamily ) {
	var out = [];
	var i;
	for ( i = 0; i < B_ALL.length; i++ ) {
		out.push({
			'a': aFamily[ i % aFamily.length ],
			'b': B_ALL[ i ]
		});
	}
	return out;
}

test( 'dgesv: bit-exact within A storage-order family (col / row); B fuzzed over all layouts', function t() {
	runInvariance( A_COL, 'col' );
	runInvariance( A_ROW, 'row' );
});

function runInvariance( aFamily, fam ) {
	var N = 9;
	var nrhs = 3;
	var SEED = 0xF00D;

	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, N, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	checked( 'dgesv', 'layout-invariance', function run() {
		layoutInvariant( pairVariants( aFamily ), function build( v ) {
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, v.a );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, v.b );
			var ipiv = new Int32Array( N );
			dgesv( N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'dgesv '+fam+'-major (A) layout invariance' } );
	});
}
