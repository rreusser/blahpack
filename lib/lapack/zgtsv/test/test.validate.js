/**
* Property-based validation for zgtsv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gt` -> general TRIDIAGONAL
* (logical.tridiagonal; storage = three strided Complex128 vectors DL/D/DU); `sv`
* (linear-solve driver: factor + solve in one call) -> RESIDUAL. zgtsv performs
* Gaussian elimination with partial pivoting (CABS1 comparison) on the tridiagonal
* A and solves A*X = B in place. We check `A0*X = B0` against the ORIGINAL full
* tridiagonal A0, independent of the factor the driver produced. A0 is diagonally
* dominant (a.s. nonsingular), so the residual is well-posed.
*
* Storage vectors extracted from the full logical A0 (Complex128):
*   DL(i) = A0.get(i+1,i)  (sub-diagonal,   length N-1)
*   D(i)  = A0.get(i,i)    (main diagonal,  length N)
*   DU(i) = A0.get(i,i+1)  (super-diagonal, length N-1)
* realized via schemes.realizeVector; B is dense via schemes.dense.
*
* Elimination/back-solve arithmetic order is independent of physical layout
* (pivoting permutes VALUES, not the arithmetic sequence), so output is bit-exact
* across ALL vector/dense layouts -- a single invariance family (fuzzed at fixed
* nrhs, since nrhs==1 selects a distinct code path).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgtsv from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const NRHS = [ 1, 2, 3 ];

function subDiag( A, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n - 1; i++ ) {
		v.push( A.get( i + 1, i ) );
	}
	return v;
}

function mainDiag( A, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		v.push( A.get( i, i ) );
	}
	return v;
}

function superDiag( A, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n - 1; i++ ) {
		v.push( A.get( i, i + 1 ) );
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
test( 'zgtsv: tridiagonal solve residual (N x nrhs)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		NRHS.forEach( function eachNrhs( nrhs ) {
			runResidual( N, nrhs );
		});
	});
});

function runResidual( N, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs );
	const A0 = logical.tridiagonal( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	const DL = schemes.realizeVector( sc, subDiag( A0, N ), { 'stride': 1 } );
	const D = schemes.realizeVector( sc, mainDiag( A0, N ), { 'stride': 1 } );
	const DU = schemes.realizeVector( sc, superDiag( A0, N ), { 'stride': 1 } );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );

	const info = zgtsv( N, nrhs, DL.data, DL.args[ 0 ], DL.args[ 1 ], D.data, D.args[ 0 ], D.args[ 1 ], DU.data, DU.args[ 0 ], DU.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'zgtsv reported singular (info='+info+') for well-conditioned N='+N+' nrhs='+nrhs );
	}

	checked( 'zgtsv', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zgtsv N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz (single family, bit-exact across all layouts).
const VL = schemes.vectorLayouts();
const DENSE = schemes.dense.layouts();

test( 'zgtsv: bit-exact across strided vector + dense-B layouts', function t() {
	const N = 12;
	const nrhs = 3;
	const SEED = 0xF00D;

	const rng = new RNG( SEED );
	const A0 = logical.tridiagonal( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	checked( 'zgtsv', 'layout-invariance', function run() {
		layoutInvariant( VL, function build( vL, idx ) {
			const DL = schemes.realizeVector( sc, subDiag( A0, N ), vL );
			const D = schemes.realizeVector( sc, mainDiag( A0, N ), VL[ ( idx + 1 ) % VL.length ] );
			const DU = schemes.realizeVector( sc, superDiag( A0, N ), VL[ ( idx + 2 ) % VL.length ] );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, DENSE[ idx % DENSE.length ] );
			zgtsv( N, nrhs, DL.data, DL.args[ 0 ], DL.args[ 1 ], D.data, D.args[ 0 ], D.args[ 1 ], DU.data, DU.args[ 0 ], DU.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zgtsv layout invariance' } );
	});
});
