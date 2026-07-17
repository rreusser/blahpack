/**
* Property-based validation for dtrrfs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr` -> dense triangular
* (schemes.dense, logical.triangular); `rfs` (error bounds) -> three independent
* properties. Unlike po/ge-rfs, the TRIANGULAR variant does NOT refine X: dtrrfs
* takes the original triangular A, the RHS B, and a GIVEN approximate solution X
* of op(A)*X = B and returns only FERR (forward-error bound) and BERR
* (componentwise backward error). X is READ-ONLY (it is not modified). The
* approximate X is produced by the trusted dtrtrs. Because no higher-precision
* oracle exists, the independent "true" solution is also dtrtrs on fresh copies
* (identical values -> actual forward error ~0), which still certifies that FERR
* is a VALID, non-absurd upper bound. We assert, against the ORIGINAL triangular
* A0 with op() selected by `trans`:
*   (a) residual  ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* Only the uplo triangle of A is realized (and, for a unit diagonal, the diagonal
* stays implicit); the opposite triangle stays poisoned, so a read of the wrong
* triangle / a unit diagonal trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import dtrrfs from './../lib/ndarray.js';
import dtrtrs from '../../dtrtrs/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var DIAGS = [ 'non-unit', 'unit' ];
var NRHS = [ 1, 2 ];

// trans flag -> reference transpose code (dtrrfs supports N and T).
var TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ]
];

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

// Compute op(A0)*X = B0 with the trusted dtrtrs into fresh poisoned storage.
function solve( A0, B0, N, nrhs, uplo, trans, diag, unit ) {
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, TIGHT );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var info = dtrtrs( uplo, trans, diag, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dtrtrs failed (info='+info+'); A singular?' );
	}
	return Xr;
}

// Steps 2-3-5: three properties across uplo x trans x diag flags, a size sweep,
// and nrhs.
test( 'dtrrfs: solve residual + BERR + FERR bound (uplo x trans x diag x N x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			DIAGS.forEach( function eachDiag( diag ) {
				SIZES_SMALL.forEach( function eachN( N ) {
					NRHS.forEach( function eachNrhs( nrhs ) {
						runProperty( uplo, tr[ 0 ], tr[ 1 ], diag, N, nrhs );
					});
				});
			});
		});
	});
});

function runProperty( uplo, trans, code, diag, N, nrhs ) {
	var unit = ( diag === 'unit' );
	var seed = 0x100 + ( N * 40 ) + ( nrhs * 8 ) + ( uplo === 'upper' ? 0 : 4 ) + ( code === 'n' ? 0 : 2 ) + ( unit ? 1 : 0 );
	var rng = new RNG( seed ); // reproducible; log on failure
	var A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
	var B0 = logical.general( sc, rng, N, nrhs );

	// A (uplo triangle; opposite + any unit diagonal poisoned):
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, TIGHT );

	// X: the GIVEN approximate solution of op(A)*X = B via trusted dtrtrs:
	var Xsol = solve( A0, B0, N, nrhs, uplo, trans, diag, unit );

	// B (RHS, unchanged) realized separately:
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );

	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Float64Array( 3 * N );
	var IWORK = new Int32Array( N );
	dtrrfs( uplo, trans, diag, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xsol.data, Xsol.args[ 0 ], Xsol.args[ 1 ], Xsol.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );

	// Independent "true" solution (fresh copies; identical values -> actual err ~0):
	var Xtrue = solve( A0, B0, N, nrhs, uplo, trans, diag, unit );

	var tag = 'dtrrfs '+uplo+' '+trans+' '+diag+' N='+N+' nrhs='+nrhs;

	if ( N === 0 || nrhs === 0 ) {
		return;
	}

	// (a) residual: X is a valid solution of op(A0)*X = B0.
	checked( 'dtrrfs', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Xsol, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) backward error: BERR[j] tiny and >= 0; (c) forward-error bound valid.
	checked( 'dtrrfs', 'structural', function run() {
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

			// FERR bound validity vs the independent solution:
			if ( !Number.isFinite( FERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': FERR not finite ('+FERR[ j ]+')' );
			}
			if ( !( FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+FERR[ j ]+' is negative' );
			}
			if ( !( FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+FERR[ j ].toExponential( 3 )+' absurdly loose (>= 1) for well-conditioned input' );
			}
			xcol = readCol( Xsol, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual forward error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// Step 4: layout-invariance fuzz. The GIVEN X is produced ONCE (fixed values),
// then re-realized per layout together with the fixed A0 and B0; dtrrfs's
// internal kernels (dtrmv, dtrsv, daxpy, dlacn2) run over identical values, so
// only ADDRESSING changes and FERR + BERR (and the read-only X) must reproduce
// bit-for-bit. Column- and row-major storage are fuzzed as separate families (a
// storage-order flip can legitimately reorder the Level-2 BLAS dot/axpy fast
// paths; cross-order correctness is certified by the swept residual).
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dtrrfs: bit-exact within storage-order family (col / row)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			DIAGS.forEach( function eachDiag( diag ) {
				runInvariance( uplo, tr[ 0 ], diag, colLayouts, 'col' );
				runInvariance( uplo, tr[ 0 ], diag, rowLayouts, 'row' );
			});
		});
	});
});

function runInvariance( uplo, trans, diag, variants, fam ) {
	var N = 9;
	var nrhs = 2;
	var unit = ( diag === 'unit' );
	var SEED = 0xBEEF;
	var rng = new RNG( SEED );
	var A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
	var B0 = logical.general( sc, rng, N, nrhs );

	// Solve ONCE (tight) and read the fixed given X:
	var X0r = solve( A0, B0, N, nrhs, uplo, trans, diag, unit );
	var Xgiven = readMat( X0r, N, nrhs );

	checked( 'dtrrfs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			var Xr = schemes.dense.realize( sc, Xgiven, { 'part': 'full' }, layout );
			var FERR = new Float64Array( nrhs );
			var BERR = new Float64Array( nrhs );
			var WORK = new Float64Array( 3 * N );
			var IWORK = new Int32Array( N );
			dtrrfs( uplo, trans, diag, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
			var out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
			var k;
			for ( k = 0; k < nrhs; k++ ) {
				out.push( FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( BERR[ k ] );
			}
			return out;
		}, { 'label': 'dtrrfs '+uplo+' '+trans+' '+diag+' layout invariance '+fam+'-major' } );
	});
}
