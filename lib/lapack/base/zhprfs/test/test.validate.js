/**
* Property-based validation for zhprfs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `hp` -> complex HERMITIAN
* INDEFINITE PACKED (schemes.packed, logical.hermitian); `rfs` (iterative
* refinement + error bounds) -> three independent properties. zhprfs refines an
* approximate solution X to A*X = B for a Hermitian indefinite A held in PACKED
* storage, returning FERR (forward-error bound) and BERR (componentwise backward
* error). The Bunch-Kaufman packed factor AFP + IPIV are produced by the
* already-validated zhptrf; the un-refined initial X by zhptrs; the TRUE solution
* independently by the trusted zhpsv on fresh copies. We assert, against the
* ORIGINAL full Hermitian A0:
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (still a valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* NOTE the complex signature: WORK is a Complex128Array of 2N and the final
* workspace is a real RWORK of N (not IWORK). AP / AFP are PACKED (only the uplo
* triangle exists, with a real diagonal for Hermitian); B / X are dense. The packed
* opposite triangle and all unreferenced slots stay poisoned, so a stride/offset
* addressing bug (the zpptri/zlatps storage-mapping bug class) trips a NaN.
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import zhprfs from './../lib/ndarray.js';
import zhptrf from '../../zhptrf/lib/ndarray.js';
import zhptrs from '../../zhptrs/lib/ndarray.js';
import zhpsv from '../../zhpsv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var NRHS = [ 1, 2 ];
var TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major (dense B / X)
var TIGHTP = schemes.packed.layouts()[ 0 ]; // tight packed (AP / AFP)
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

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted zhpsv
// (packed Bunch-Kaufman factor + solve; owns its own IPIV).
function trueSolution( A0, B0, N, nrhs, uplo ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var IPIV = new Int32Array( N );
	var info = zhpsv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], IPIV, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zhpsv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Steps 2-3-5: three properties across uplo flags, a size sweep, and nrhs.
test( 'zhprfs: refinement residual + BERR + FERR bound (uplo x N x nrhs)', function t() {
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

	// AP = original Hermitian (uplo triangle, packed); AFP/IPIV = Bunch-Kaufman:
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var AFr = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var IPIV = new Int32Array( N );
	zhptrf( uplo, N, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], IPIV, 1, 0 );

	// B (RHS, unchanged) and X (initial un-refined solve, refined in place):
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	zhptrs( uplo, N, nrhs, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], IPIV, 1, 0, Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );

	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Complex128Array( 2 * N );
	var RWORK = new Float64Array( N );
	zhprfs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], IPIV, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	var Xtrue = trueSolution( A0, B0, N, nrhs, uplo );

	var tag = 'zhprfs '+uplo+' N='+N+' nrhs='+nrhs;

	// (a) residual: refined X remains a valid solution of A0*X = B0.
	checked( 'zhprfs', 'residual', function run() {
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
	checked( 'zhprfs', 'structural', function run() {
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

// Step 4: PACKED layout-invariance fuzz. The Bunch-Kaufman packed factor AFP +
// IPIV and the initial X are produced ONCE (fixed values), then AP / AFP are
// re-realized per PACKED layout (strides 1/2/3/-1/-2 + offset/pad) together with
// the fixed A0 and the fixed initial X (dense, tight); zhprfs's internal kernels
// (zhpmv, zhptrs, zaxpy, zlacn2) run over identical values, so ONLY packed
// ADDRESSING changes and the refined X + FERR + BERR must reproduce bit-for-bit.
// The fixed IPIV is consumed by zhptrs (no pivot search of its own), so all packed
// layouts apply. Packed storage is a SINGLE addressing family (unlike dense
// col/row, the packed loops do not switch summation form on stride), so all packed
// layouts must agree exactly — a divergence on a non-unit / negative packed stride
// is a genuine storage-mapping bug (the zpptri / zlatps class this fuzz targets).
var packedLayouts = schemes.packed.layouts();

test( 'zhprfs: bit-exact across the packed layout family', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 9;
	var nrhs = 2;
	var SEED = 0xBEEF;
	var rng = new RNG( SEED );
	var A0 = logical.hermitian( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	// Factor ONCE and read the fixed packed factor triangle + fixed IPIV + X:
	var AF0 = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var IPIV0 = new Int32Array( N );
	zhptrf( uplo, N, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], IPIV0, 1, 0 );
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
	zhptrs( uplo, N, nrhs, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], IPIV0, 1, 0, X0r.data, X0r.args[ 0 ], X0r.args[ 1 ], X0r.args[ 2 ] );
	var Xinit = readMat( X0r, N, nrhs );

	checked( 'zhprfs', 'layout-invariance', function run() {
		layoutInvariant( packedLayouts, function build( layout ) {
			var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, layout );
			var AFr = schemes.packed.realize( sc, Lfac, { 'part': uplo }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
			var Xr = schemes.dense.realize( sc, Xinit, { 'part': 'full' }, TIGHT );
			var FERR = new Float64Array( nrhs );
			var BERR = new Float64Array( nrhs );
			var WORK = new Complex128Array( 2 * N );
			var RWORK = new Float64Array( N );
			zhprfs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], IPIV0, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
			var out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
			var k;
			for ( k = 0; k < nrhs; k++ ) {
				out.push( FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( BERR[ k ] );
			}
			return out;
		}, { 'label': 'zhprfs '+uplo+' packed layout invariance' } );
	});
}
