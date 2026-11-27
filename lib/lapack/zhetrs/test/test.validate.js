/**
* Property-based validation for zhetrs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian dense
* (schemes.dense, logical.hermitian); `trs` (Bunch-Kaufman LDL^H solve, multiple
* RHS) -> RESIDUAL: the solve consumes a factorization (produced here by the
* already-validated zhetrf), then we check `A0*X = B0` against the ORIGINAL
* Hermitian matrix. The residual is therefore independent of zhetrf's
* correctness — a wrong factorization would still have to yield an X that
* reproduces B0 through A0.
*/

import test from 'node:test';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhetrs from './../lib/ndarray.js';
import zhetrf from '../../zhetrf/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];
const NB = 32;

function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

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

// Read the factored triangle back into a LogicalMatrix (other triangle is not
// referenced by zhetrs, so it is left zero and never realized).
function readFac( R, n, uplo ) {
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

// Steps 2-3-5: solve residual across uplo, the size sweep, and nrhs. A single
// dense layout is used here; every layout is fuzzed by the invariance test.
test( 'zhetrs: Bunch-Kaufman solve residual (uplo x N x nrhs)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( uplo, N, nrhs );
			});
		});
	});
});

function runResidual( uplo, N, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.hermitian( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	const layout = schemes.dense.layouts()[ 0 ];
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	const ipiv = new Int32Array( Math.max( N, 1 ) );
	const lwork = Math.max( N, 1 ) * NB;
	const work = new Complex128Array( lwork );

	zhetrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, work, 1, 0, lwork );
	zhetrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'zhetrs', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zhetrs '+uplo+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. zhetrs consumes an already-computed
// factorization (no pivot search of its own), so this test PRE-FACTORS once at a
// tight col-major layout and then re-realizes those FIXED factor values (+
// pivots) at every storage layout, running only zhetrs. This isolates zhetrs's
// addressing from zhetrf's pivoting family. zhetrs's inner zgemv/zgeru
// accumulation order can differ on a col<->row storage flip, so bit-exactness is
// asserted only WITHIN a storage-order family (col / row); cross-order
// correctness is covered by the residual property above.
const allLayouts = schemes.dense.layouts();
const colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zhetrs: bit-exact within storage-order family (col / row, solve isolated)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	const N = 13;
	const nrhs = 3;
	const SEED = 0xBEEF;

	// Factor ONCE at the tight col-major layout to obtain fixed factors + pivots
	// shared by every layout variant below:
	const rng = new RNG( SEED );
	const A0 = logical.hermitian( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );
	const tight = schemes.dense.layouts()[ 0 ];
	const Af = schemes.dense.realize( sc, A0, { 'part': uplo }, tight );
	const ipiv = new Int32Array( N );
	const lwork = N * NB;
	const work = new Complex128Array( lwork );
	zhetrf( uplo, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0, work, 1, 0, lwork );
	const Afac = readFac( Af, N, uplo );

	checked( 'zhetrs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const Ar = schemes.dense.realize( sc, Afac, { 'part': uplo }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			zhetrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zhetrs '+uplo+' '+fam+'-major layout invariance' } );
	});
}
