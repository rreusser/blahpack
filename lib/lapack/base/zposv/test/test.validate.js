/**
* Property-based validation for zposv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `po` -> HPD dense
* (schemes.dense, logical.positiveDefinite); `sv` (Cholesky linear-solve DRIVER:
* factor + solve in one call) -> RESIDUAL: zposv factors the referenced triangle
* in place and overwrites B with the solution X; we then check `A0*X = B0`
* against the ORIGINAL, full Hermitian matrix A0. The residual is an independent
* oracle (it never consults the factor zposv produced). Only the referenced
* triangle (uplo) is realized; the opposite triangle stays poisoned, so a read
* of the wrong triangle trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zposv from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
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

// Steps 2-3-5: residual property across uplo flags, a size sweep, and nrhs.
// One zposv call factors the referenced triangle AND solves in place (B <- X);
// then verify A0*X = B0 per RHS column against the ORIGINAL full Hermitian
// matrix (trans 'n' — A is Hermitian so op is identity).
test( 'zposv: Cholesky solve residual (uplo x N x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( uplo, N, nrhs );
			});
		});
	});
});

function runResidual( uplo, N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.positiveDefinite( sc, rng, N ); // full Hermitian/HPD oracle
	var B0 = logical.general( sc, rng, N, nrhs );

	var layout = schemes.dense.layouts()[ 0 ];
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );

	// Driver: factor + solve in one call, both in place (A <- factor, B <- X):
	zposv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'zposv', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zposv '+uplo+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz within a storage-order family (see dgetrs for
// the col<->row family-split rationale; the composed Cholesky factor + BLAS
// solves reorder ~1 ULP on a storage-order flip, so cross-order agreement is
// certified by the residual property above, not by bit-equality here).
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zposv: bit-exact within storage-order family (col / row)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	var N = 9;
	var nrhs = 3;
	var SEED = 0xBEEF;
	checked( 'zposv', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.positiveDefinite( sc, rng, N );
			var B0 = logical.general( sc, rng, N, nrhs );
			var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			zposv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zposv '+uplo+' layout invariance '+fam+'-major' } );
	});
}
