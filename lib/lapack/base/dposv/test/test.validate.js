/**
* Property-based validation for dposv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `po` -> SPD dense (schemes.dense,
* logical.positiveDefinite); `sv` (Cholesky linear-solve DRIVER: factor + solve
* in one call) -> RESIDUAL: dposv factors the referenced triangle in place and
* overwrites B with the solution X; we then check `A0*X = B0` against the
* ORIGINAL, full symmetric matrix A0. The residual is an independent oracle (it
* never consults the factor dposv produced). Only the referenced triangle (uplo)
* is realized; the opposite triangle stays poisoned, so a read of the wrong
* triangle trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dposv from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];

// Read column j of the solution X out of physical B storage as an array of
// scalar values.
function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs solution back into a LogicalMatrix (for bit-exact
// layout comparison).
function readB( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Steps 2-3-5: residual property across uplo flags, a size sweep, and nrhs.
// One dposv call factors the referenced triangle AND solves in place (B <- X);
// then verify A0*X = B0 per RHS column against the ORIGINAL full symmetric
// matrix (trans 'n' — A is symmetric so op is identity).
test( 'dposv: Cholesky solve residual (uplo x N x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( uplo, N, nrhs );
			});
		});
	});
});

function runResidual( uplo, N, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.positiveDefinite( sc, rng, N ); // full symmetric/SPD oracle
	const B0 = logical.general( sc, rng, N, nrhs );

	const layout = schemes.dense.layouts()[ 0 ];
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );

	// Driver: factor + solve in one call, both in place (A <- factor, B <- X):
	dposv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'dposv', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dposv '+uplo+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz within a storage-order family (see dgetrs for
// the col<->row family-split rationale; the composed Cholesky factor + BLAS
// solves reorder ~1 ULP on a storage-order flip, so cross-order agreement is
// certified by the residual property above, not by bit-equality here).
const allLayouts = schemes.dense.layouts();
const colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dposv: bit-exact within storage-order family (col / row)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	const N = 9;
	const nrhs = 3;
	const SEED = 0xBEEF;
	checked( 'dposv', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.positiveDefinite( sc, rng, N );
			const B0 = logical.general( sc, rng, N, nrhs );
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			dposv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'dposv '+uplo+' layout invariance '+fam+'-major' } );
	});
}
