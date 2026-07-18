/**
* Property-based validation for dptsvx, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pt` -> symmetric/Hermitian POSITIVE
* DEFINITE TRIDIAGONAL (logical.tridiagonalPositiveDefinite); `svx` (EXPERT
* tridiagonal-solve DRIVER: factor (dpttrf) + condition estimate (dptcon) + solve
* (dpttrs) + iterative refinement (dptrfs) + error bounds, all in one call) -> a
* COMPOSITE of the three properties already proven for its constituent routines.
* We drive dptsvx with fact='not-factored' (factor A into DF/EF, NO equilibration
* -> X solves the ORIGINAL A0*X=B0 directly) and assert, against the ORIGINAL full
* tridiagonal A0:
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (a valid solve).
*   (b) rcond estimates 1/κ₁(A0): within a small factor F of the INDEPENDENT true
*       reciprocal condition number (anorm from A0, ‖A0⁻¹‖₁ from a trusted dptsv
*       solve of A0*X=I), and in (0,1].
*   (c) BERR tiny and >= 0; the ACTUAL forward error ‖Xtrue-X‖inf/‖X‖inf <=
*       FERR*C; FERR in [0,1) (a valid, not-absurdly-loose bound), Xtrue from the
*       trusted dptsv.
*
* Storage vectors extracted from the full logical A0:
*   d(i) = A0.get(i,i)    (main diagonal, REAL, Float64Array, length N)
*   e(i) = A0.get(i+1,i)  (SUB-diagonal,  length N-1)
*
* rcond-arg class: rcond is a single-element out-array. This file also confirms
* base.js and ndarray.js write an IDENTICAL rcond[0] for the same inputs (they must
* agree bit-for-bit — the ndarray layer only adds offset addressing).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import dptsvx from './../lib/ndarray.js';
import dptsvxBase from './../lib/base.js';
import dptsv from '../../dptsv/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var NRHS = [ 1, 2 ];
var TIGHTV = { 'stride': 1, 'lead': 0, 'tail': 0 };
var TIGHTB = schemes.dense.layouts()[ 0 ]; // tight col-major
var F = 5; // rcond estimate must be within this factor of the true reciprocal cond.
var FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Real part of a scalar value (number for real).
function realOf( v ) {
	return ( typeof v === 'number' ) ? v : v.re;
}

// Main diagonal as REAL numbers (d is Float64Array for dptsvx).
function mainDiagReal( A, n ) {
	var v = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		v.push( realOf( A.get( i, i ) ) );
	}
	return v;
}

// Sub-diagonal e(i) = A(i+1,i), length N-1 (routine scalar trait).
function subDiag( A, n ) {
	var v = [];
	var i;
	for ( i = 0; i < n - 1; i++ ) {
		v.push( A.get( i + 1, i ) );
	}
	return v;
}

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

// 1-norm (max abs column sum) of the FULL tridiagonal logical matrix.
function norm1Full( M, n ) {
	var mx = 0.0;
	var s;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		s = 0.0;
		for ( i = 0; i < n; i++ ) {
			s += sc.abs( M.get( i, j ) );
		}
		if ( s > mx ) {
			mx = s;
		}
	}
	return mx;
}

// Identity logical matrix (n x n).
function identity( n ) {
	var I = new LogicalMatrix( sc, n, n );
	var i;
	for ( i = 0; i < n; i++ ) {
		I.set( i, i, sc.one );
	}
	return I;
}

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted dptsv on fresh d/e; X =
// A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n ) {
	var D = schemes.realizeVector( S.real, mainDiagReal( A0, n ), TIGHTV );
	var E = schemes.realizeVector( sc, subDiag( A0, n ), TIGHTV );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHTB );
	var info = dptsv( n, n, D.data, D.args[ 0 ], D.args[ 1 ], E.data, E.args[ 0 ], E.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dptsv failed (info='+info+'); matrix not PD?' );
	}
	var mx = 0.0;
	var s;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		s = 0.0;
		for ( i = 0; i < n; i++ ) {
			s += sc.abs( Br.read( i, j ) );
		}
		if ( s > mx ) {
			mx = s;
		}
	}
	return mx;
}

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted dptsv.
function trueSolution( A0, B0, N, nrhs ) {
	var D = schemes.realizeVector( S.real, mainDiagReal( A0, N ), TIGHTV );
	var E = schemes.realizeVector( sc, subDiag( A0, N ), TIGHTV );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHTB );
	var info = dptsv( N, nrhs, D.data, D.args[ 0 ], D.args[ 1 ], E.data, E.args[ 0 ], E.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dptsv failed (info='+info+'); matrix not PD?' );
	}
	return Br;
}

function assertRcond( rcond, trueRcond, label ) {
	if ( !Number.isFinite( rcond ) ) {
		throw new Error( label+': rcond is not finite ('+rcond+')' );
	}
	if ( !( rcond > 0.0 && rcond <= 1.0 + 1e-9 ) ) {
		throw new Error( label+': rcond '+rcond+' not in (0,1]' );
	}
	if ( !( rcond <= F * trueRcond && rcond >= trueRcond / F ) ) {
		throw new Error( label+': rcond '+rcond.toExponential( 6 )+' not within factor '+F+' of true '+trueRcond.toExponential( 6 ) );
	}
}

// Drive dptsvx (fact='not-factored') and return the physical X reader plus the
// rcond/FERR/BERR outputs. `impl` selects ndarray (default) or base.
function drive( N, nrhs, A0, B0, layout, impl ) {
	var fn = impl || dptsvx;
	var D = schemes.realizeVector( S.real, mainDiagReal( A0, N ), layout.d );
	var E = schemes.realizeVector( sc, subDiag( A0, N ), layout.e );
	var DF = new Float64Array( Math.max( N, 1 ) );
	var EF = new Float64Array( Math.max( N - 1, 1 ) );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout.b );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout.x );
	var rcond = new Float64Array( 1 );
	var FERR = new Float64Array( Math.max( nrhs, 1 ) );
	var BERR = new Float64Array( Math.max( nrhs, 1 ) );
	var WORK = new Float64Array( Math.max( 2 * N, 1 ) );
	var info = fn( 'not-factored', N, nrhs, D.data, D.args[ 0 ], D.args[ 1 ], E.data, E.args[ 0 ], E.args[ 1 ], DF, 1, 0, EF, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0 );
	return {
		'Xr': Xr,
		'rcond': rcond,
		'FERR': FERR,
		'BERR': BERR,
		'info': info
	};
}

// tight layout bundle for the swept property check.
var TIGHT = {
	'd': TIGHTV,
	'e': TIGHTV,
	'b': TIGHTB,
	'x': TIGHTB
};

// Steps 2-3-5: the three composite properties across a size sweep and nrhs.
test( 'dptsvx: expert-driver residual + rcond + FERR/BERR (N x nrhs)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		NRHS.forEach( function eachNrhs( nrhs ) {
			runProperty( N, nrhs );
		});
	});
});

function runProperty( N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.tridiagonalPositiveDefinite( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var anorm = norm1Full( A0, N );

	var d = drive( N, nrhs, A0, B0, TIGHT );
	var tag = 'dptsvx N='+N+' nrhs='+nrhs;

	if ( d.info !== 0 ) {
		throw new Error( tag+': dptsvx returned info='+d.info+' (expected 0 for well-conditioned PD input)' );
	}

	// (a) residual: X solves the ORIGINAL A0*X = B0.
	checked( 'dptsvx', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( d.Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) rcond estimates 1/κ₁(A0) within factor F, in (0,1]; and base.js agrees.
	checked( 'dptsvx', 'property', function run() {
		var trueRcond = 1.0 / ( anorm * invNorm1( A0, N ) );
		assertRcond( d.rcond[ 0 ], trueRcond, tag );

		// rcond-arg class: base.js and ndarray.js must write an identical rcond[0].
		var db = drive( N, nrhs, A0, B0, TIGHT, dptsvxBase );
		if ( !Object.is( db.rcond[ 0 ], d.rcond[ 0 ] ) ) {
			throw new Error( tag+': base.js rcond '+db.rcond[ 0 ]+' disagrees with ndarray.js rcond '+d.rcond[ 0 ] );
		}
	});

	// (c) BERR tiny and >= 0; FERR a valid, not-absurdly-loose forward-error bound.
	checked( 'dptsvx', 'structural', function run() {
		var Xtrue = trueSolution( A0, B0, N, nrhs );
		var xcol;
		var tcol;
		var berrCap;
		var eActual;
		var eBound;
		var j;
		berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
		for ( j = 0; j < nrhs; j++ ) {
			if ( !Number.isFinite( d.BERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': BERR not finite ('+d.BERR[ j ]+')' );
			}
			if ( !( d.BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+d.BERR[ j ]+' is negative' );
			}
			if ( !( d.BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+d.BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}
			if ( !Number.isFinite( d.FERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': FERR not finite ('+d.FERR[ j ]+')' );
			}
			if ( !( d.FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+d.FERR[ j ]+' is negative' );
			}
			if ( !( d.FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+d.FERR[ j ].toExponential( 3 )+' absurdly loose (>= 1) for well-conditioned input' );
			}
			xcol = readCol( d.Xr, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( d.FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual forward error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+d.FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// Step 4: layout-invariance fuzz. The tridiagonal factor/solve/refine arithmetic
// is a sequential recurrence indexed by i, independent of the physical layout of
// d/e/B/X, so the output is bit-exact across ALL vector/dense layouts -- a single
// invariance family (as for dptsv). Only ADDRESSING changes: the flattened
// X ++ rcond ++ FERR ++ BERR must reproduce bit-for-bit.
var VL = schemes.vectorLayouts();
var DENSE = schemes.dense.layouts();

test( 'dptsvx: bit-exact across strided vector + dense layouts (single family)', function t() {
	var N = 12;
	var nrhs = 2;
	var SEED = 0xF00D;
	checked( 'dptsvx', 'layout-invariance', function run() {
		layoutInvariant( VL, function build( vL, idx ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.tridiagonalPositiveDefinite( sc, rng, N );
			var B0 = logical.general( sc, rng, N, nrhs );
			var layout = {
				'd': vL,
				'e': VL[ ( idx + 1 ) % VL.length ],
				'b': DENSE[ idx % DENSE.length ],
				'x': DENSE[ ( idx + 2 ) % DENSE.length ]
			};
			var d = drive( N, nrhs, A0, B0, layout );
			var out = check.flattenLogical( sc, readMat( d.Xr, N, nrhs ) );
			var k;
			out.push( d.rcond[ 0 ] );
			for ( k = 0; k < nrhs; k++ ) {
				out.push( d.FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( d.BERR[ k ] );
			}
			return out;
		}, { 'label': 'dptsvx layout invariance' } );
	});
});
