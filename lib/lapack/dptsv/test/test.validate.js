/**
* Property-based validation for dptsv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pt` -> symmetric/Hermitian POSITIVE
* DEFINITE TRIDIAGONAL (logical.tridiagonalPositiveDefinite); `sv` (linear-solve
* driver: factor + solve in one call) -> RESIDUAL. dptsv computes the L*D*L^T
* factorization (dpttrf) and solves A*X = B in place (dpttrs). We check `A0*X = B0`
* against the ORIGINAL full tridiagonal A0, independent of the factor produced.
* A0 is diagonally dominant PD (a.s. nonsingular), so the residual is well-posed.
*
* Storage vectors extracted from the full logical A0:
*   d(i) = A0.get(i,i)    (main diagonal, REAL, Float64Array, length N)
*   e(i) = A0.get(i+1,i)  (SUB-diagonal,  length N-1)
* `d` is realized with the REAL scalar trait (the PD diagonal is real even for the
* complex sibling zptsv); `e` and `B` use the routine scalar trait.
*
* The factor/solve arithmetic order is independent of the physical layout of d/e/B,
* so the output is bit-exact across ALL vector/dense layouts -- a single invariance
* family.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dptsv from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const NRHS = [ 1, 2, 3 ];

// Real part of a scalar value (number for real, {re,im} for complex).
function realOf( v ) {
	return ( typeof v === 'number' ) ? v : v.re;
}

// Main diagonal as REAL numbers (d is Float64Array for both dptsv and zptsv).
function mainDiagReal( A, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		v.push( realOf( A.get( i, i ) ) );
	}
	return v;
}

// Sub-diagonal e(i) = A(i+1,i), length N-1 (routine scalar trait).
function subDiag( A, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n - 1; i++ ) {
		v.push( A.get( i + 1, i ) );
	}
	return v;
}

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

// Steps 2-3-5: residual property across a size sweep (incl. N=1,2) and nrhs.
test( 'dptsv: SPD tridiagonal solve residual (N x nrhs)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		NRHS.forEach( function eachNrhs( nrhs ) {
			runResidual( N, nrhs );
		});
	});
});

function runResidual( N, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs );
	const A0 = logical.tridiagonalPositiveDefinite( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	const D = schemes.realizeVector( S.real, mainDiagReal( A0, N ), { 'stride': 1 } );
	const E = schemes.realizeVector( sc, subDiag( A0, N ), { 'stride': 1 } );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );

	const info = dptsv( N, nrhs, D.data, D.args[ 0 ], D.args[ 1 ], E.data, E.args[ 0 ], E.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'dptsv reported not-PD (info='+info+') for well-conditioned N='+N+' nrhs='+nrhs );
	}

	checked( 'dptsv', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dptsv N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz (single family, bit-exact across all layouts).
const VL = schemes.vectorLayouts();
const DENSE = schemes.dense.layouts();

test( 'dptsv: bit-exact across strided vector + dense-B layouts', function t() {
	const N = 12;
	const nrhs = 3;
	const SEED = 0xF00D;

	const rng = new RNG( SEED );
	const A0 = logical.tridiagonalPositiveDefinite( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	checked( 'dptsv', 'layout-invariance', function run() {
		layoutInvariant( VL, function build( vL, idx ) {
			const D = schemes.realizeVector( S.real, mainDiagReal( A0, N ), vL );
			const E = schemes.realizeVector( sc, subDiag( A0, N ), VL[ ( idx + 1 ) % VL.length ] );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, DENSE[ idx % DENSE.length ] );
			dptsv( N, nrhs, D.data, D.args[ 0 ], D.args[ 1 ], E.data, E.args[ 0 ], E.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'dptsv layout invariance' } );
	});
});
