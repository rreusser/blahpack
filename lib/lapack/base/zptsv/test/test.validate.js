/**
* Property-based validation for zptsv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pt` -> Hermitian POSITIVE DEFINITE
* TRIDIAGONAL (logical.tridiagonalPositiveDefinite); `sv` (linear-solve driver:
* factor + solve in one call) -> RESIDUAL. zptsv computes the L*D*L^H factorization
* (zpttrf) and solves A*X = B in place (zpttrs 'lower'). We check `A0*X = B0`
* against the ORIGINAL full Hermitian tridiagonal A0, independent of the factor
* produced. A0 is diagonally dominant HPD (a.s. nonsingular), residual well-posed.
*
* Storage vectors extracted from the full logical A0:
*   d(i) = A0.get(i,i)    (main diagonal, REAL Float64Array, length N)
*   e(i) = A0.get(i+1,i)  (SUB-diagonal,  COMPLEX, length N-1)
* CONFIRMED from base.js: `d` is a Float64Array (the HPD diagonal is real) for
* BOTH dptsv and zptsv; only `e` and `B` are Complex128. `d` is therefore realized
* with the REAL scalar trait; `e`/`B` use the complex trait.
*
* Factor/solve arithmetic order is independent of physical layout, so output is
* bit-exact across ALL vector/dense layouts -- a single invariance family.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zptsv from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var NRHS = [ 1, 2, 3 ];

// Real part of a scalar value (number for real, {re,im} for complex).
function realOf( v ) {
	return ( typeof v === 'number' ) ? v : v.re;
}

// Main diagonal as REAL numbers (d is Float64Array even for zptsv).
function mainDiagReal( A, n ) {
	var v = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		v.push( realOf( A.get( i, i ) ) );
	}
	return v;
}

// Sub-diagonal e(i) = A(i+1,i), length N-1 (complex).
function subDiag( A, n ) {
	var v = [];
	var i;
	for ( i = 0; i < n - 1; i++ ) {
		v.push( A.get( i + 1, i ) );
	}
	return v;
}

function readCol( R, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

function logicalCol( M, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

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

// Steps 2-3-5: residual property across a size sweep (incl. N=1,2) and nrhs.
test( 'zptsv: HPD tridiagonal solve residual (N x nrhs)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		NRHS.forEach( function eachNrhs( nrhs ) {
			runResidual( N, nrhs );
		});
	});
});

function runResidual( N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs );
	var A0 = logical.tridiagonalPositiveDefinite( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	var D = schemes.realizeVector( S.real, mainDiagReal( A0, N ), { 'stride': 1 } );
	var E = schemes.realizeVector( sc, subDiag( A0, N ), { 'stride': 1 } );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );

	var info = zptsv( N, nrhs, D.data, D.args[ 0 ], D.args[ 1 ], E.data, E.args[ 0 ], E.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'zptsv reported not-PD (info='+info+') for well-conditioned N='+N+' nrhs='+nrhs );
	}

	checked( 'zptsv', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zptsv N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz (single family, bit-exact across all layouts).
var VL = schemes.vectorLayouts();
var DENSE = schemes.dense.layouts();

test( 'zptsv: bit-exact across strided vector + dense-B layouts', function t() {
	var N = 12;
	var nrhs = 3;
	var SEED = 0xF00D;

	var rng = new RNG( SEED );
	var A0 = logical.tridiagonalPositiveDefinite( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	checked( 'zptsv', 'layout-invariance', function run() {
		layoutInvariant( VL, function build( vL, idx ) {
			var D = schemes.realizeVector( S.real, mainDiagReal( A0, N ), vL );
			var E = schemes.realizeVector( sc, subDiag( A0, N ), VL[ ( idx + 1 ) % VL.length ] );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, DENSE[ idx % DENSE.length ] );
			zptsv( N, nrhs, D.data, D.args[ 0 ], D.args[ 1 ], E.data, E.args[ 0 ], E.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zptsv layout invariance' } );
	});
});
