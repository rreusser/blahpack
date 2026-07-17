/**
* Property-based validation for zherfs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> HERMITIAN INDEFINITE
* dense (schemes.dense, logical.hermitian — conjugate symmetry, real diagonal);
* `rfs` (iterative refinement + error bounds) -> three independent properties.
* zherfs refines an approximate solution X to A*X = B and returns FERR
* (forward-error bound) and BERR (componentwise backward error). The Bunch-Kaufman
* factor AF + IPIV are produced by the already-validated zhetrf; the un-refined
* initial X by zhetrs; the TRUE solution independently by the trusted zhesv on
* fresh copies. We assert, against the ORIGINAL full Hermitian A0:
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (still a valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* NOTE the complex signature: WORK is a Complex128Array of 2N elements and the
* final workspace is a real RWORK of N (not IWORK). Only the uplo triangle of A /
* AF is realized; the opposite stays poisoned, so a wrong-triangle read trips NaN.
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import zherfs from './../lib/ndarray.js';
import zhetrf from '../../zhetrf/lib/ndarray.js';
import zhetrs from '../../zhetrs/lib/ndarray.js';
import zhesv from '../../zhesv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var NRHS = [ 1, 2 ];
var TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major
var FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Read column j out of physical storage as an array of scalar values.
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

// Read the full N x nrhs matrix out of physical storage into a LogicalMatrix.
function readMat( R, n, nrhs ) {
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

// inf-norm of a vector of scalar values (max modulus).
function infNormVec( a ) {
	var mx = 0.0;
	var m;
	var i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( a[ i ] );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// inf-norm of the difference of two scalar-value vectors.
function diffInfNorm( a, b ) {
	var mx = 0.0;
	var m;
	var i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( sc.sub( a[ i ], b[ i ] ) );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted zhesv
// (Bunch-Kaufman factor + solve; needs an N-length complex caller-owned WORK).
function trueSolution( A0, B0, N, nrhs, uplo ) {
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var IPIV = new Int32Array( N );
	var WORK = new Complex128Array( Math.max( N, 1 ) );
	var info = zhesv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], IPIV, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], WORK, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'oracle zhesv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Steps 2-3-5: three properties across uplo flags, a size sweep, and nrhs.
test( 'zherfs: refinement residual + BERR + FERR bound (uplo x N x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runProperty( uplo, N, nrhs );
			});
		});
	});
});

function runProperty( uplo, N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.hermitian( sc, rng, N ); // full Hermitian (indefinite) oracle
	var B0 = logical.general( sc, rng, N, nrhs );

	// A = original Hermitian (uplo triangle); AF/IPIV = its Bunch-Kaufman factor:
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var AFr = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var IPIV = new Int32Array( N );
	zhetrf( uplo, N, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], IPIV, 1, 0 );

	// B (RHS, unchanged) and X (initial un-refined solve, refined in place):
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	zhetrs( uplo, N, nrhs, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], IPIV, 1, 0, Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );

	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Complex128Array( Math.max( 2 * N, 1 ) );
	var RWORK = new Float64Array( Math.max( N, 1 ) );
	zherfs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], IPIV, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	var Xtrue = trueSolution( A0, B0, N, nrhs, uplo );

	var tag = 'zherfs '+uplo+' N='+N+' nrhs='+nrhs;

	// (a) residual: refined X remains a valid solution of A0*X = B0.
	checked( 'zherfs', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) backward error: BERR[j] tiny and >= 0; (c) forward-error bound valid.
	checked( 'zherfs', 'structural', function run() {
		var xcol;
		var tcol;
		var berrCap;
		var eActual;
		var eBound;
		var j;
		berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
		for ( j = 0; j < nrhs; j++ ) {
			// BERR:
			if ( !Number.isFinite( BERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': BERR not finite ('+BERR[ j ]+')' );
			}
			if ( !( BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+BERR[ j ]+' is negative' );
			}
			if ( !( BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}

			// FERR bound validity vs the independent true solution:
			if ( !Number.isFinite( FERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': FERR not finite ('+FERR[ j ]+')' );
			}
			if ( !( FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+FERR[ j ]+' is negative' );
			}
			if ( !( FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+FERR[ j ].toExponential( 3 )+' absurdly loose (>= 1) for well-conditioned input' );
			}
			xcol = readCol( Xr, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual forward error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// Step 4: layout-invariance fuzz. The Bunch-Kaufman factor AF + IPIV and the
// initial X are produced ONCE (fixed values) at a tight layout, then re-realized
// per layout together with the fixed A0 and B0; zherfs's internal kernels (zhemv,
// zhetrs, zaxpy, zlacn2) run over identical values, so only ADDRESSING changes
// and the refined X + FERR + BERR must reproduce bit-for-bit. The fixed IPIV is
// consumed by zhetrs (no pivot search of its own), so the full col/row families
// apply. Column- and row-major storage are fuzzed as separate families (a
// storage-order flip can legitimately reorder the Level-2 BLAS fast paths;
// cross-order correctness is certified by the swept residual).
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zherfs: bit-exact within storage-order family (col / row)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	var N = 9;
	var nrhs = 2;
	var SEED = 0xBEEF;
	var rng = new RNG( SEED );
	var A0 = logical.hermitian( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	// Factor ONCE (tight) and read the fixed factor triangle + fixed IPIV + X:
	var AF0 = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var IPIV0 = new Int32Array( N );
	zhetrf( uplo, N, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], AF0.args[ 2 ], IPIV0, 1, 0 );
	var Lfac = new LogicalMatrix( sc, N, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				Lfac.set( i, j, AF0.read( i, j ) );
			}
		}
	}
	var X0r = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	zhetrs( uplo, N, nrhs, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], AF0.args[ 2 ], IPIV0, 1, 0, X0r.data, X0r.args[ 0 ], X0r.args[ 1 ], X0r.args[ 2 ] );
	var Xinit = readMat( X0r, N, nrhs );

	checked( 'zherfs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			var AFr = schemes.dense.realize( sc, Lfac, { 'part': uplo }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			var Xr = schemes.dense.realize( sc, Xinit, { 'part': 'full' }, layout );
			var FERR = new Float64Array( nrhs );
			var BERR = new Float64Array( nrhs );
			var WORK = new Complex128Array( 2 * N );
			var RWORK = new Float64Array( N );
			zherfs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], IPIV0, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
			var out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
			var k;
			for ( k = 0; k < nrhs; k++ ) {
				out.push( FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( BERR[ k ] );
			}
			return out;
		}, { 'label': 'zherfs '+uplo+' layout invariance '+fam+'-major' } );
	});
}
