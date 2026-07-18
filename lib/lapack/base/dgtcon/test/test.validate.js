/**
* Property-based validation for dgtcon, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gt` -> general TRIDIAGONAL
* (logical.tridiagonal; storage = three strided vectors DL/D/DU, factor adds DU2);
* `con` (condition-number ESTIMATOR from an LU factor) -> PROPERTY: dgtcon returns
* `rcond ≈ 1/κ` where κ = ‖A‖·‖A⁻¹‖ in the chosen norm. It is a Hager/Higham
* estimate (a lower bound on ‖A⁻¹‖, hence an upper bound on true_rcond), guaranteed
* within a factor ~N and usually tight.
*
* TRUE value INDEPENDENTLY: anorm = exact 1-/inf-norm of the ORIGINAL full
* tridiagonal A0; ‖A0⁻¹‖ from A0⁻¹ obtained by solving A0·X = I with the already-
* validated dgtsv, independent of dgtcon's dlacn2/dgttrs estimator path.
*
* Storage vectors extracted from A0: DL(i)=A0(i+1,i), D(i)=A0(i,i), DU(i)=A0(i,i+1).
* The factor (DL/D/DU overwritten, plus DU2) is produced by dgttrf.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgtcon from './../lib/ndarray.js';
import dgttrf from '../../dgttrf/lib/ndarray.js';
import dgtsv from '../../dgtsv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const NORMS = [
	{ 'api': 'one-norm', 'fn': norms.oneNorm },
	{ 'api': 'inf-norm', 'fn': norms.infNorm }
];
const FACTOR = 3;
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
const TIGHT_DENSE = schemes.dense.layouts()[ 0 ];

// Extract the three tridiagonal storage vectors from the full logical A0.
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

function identity( n ) {
	const M = new LogicalMatrix( sc, n, n );
	let i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

function readFull( R, rows, cols ) {
	const M = new LogicalMatrix( sc, rows, cols );
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			M.set( i, j, R.read( i, j ) );
		}
	}
	return M;
}

// INDEPENDENT true inverse: solve A0·X = I with dgtsv (X = A0⁻¹). dgtsv consumes
// fresh copies of DL/D/DU (it factors in place) and does not touch dgtcon's path.
function tridiagInverse( A0, N ) {
	const DL = schemes.realizeVector( sc, subDiag( A0, N ), TIGHT_VEC );
	const D = schemes.realizeVector( sc, mainDiag( A0, N ), TIGHT_VEC );
	const DU = schemes.realizeVector( sc, superDiag( A0, N ), TIGHT_VEC );
	const Br = schemes.dense.realize( sc, identity( N ), { 'part': 'full' }, TIGHT_DENSE );
	dgtsv( N, N, DL.data, DL.args[ 0 ], DL.args[ 1 ], D.data, D.args[ 0 ], D.args[ 1 ], DU.data, DU.args[ 0 ], DU.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	return readFull( Br, N, N );
}

// Steps 2-3-5: estimate-vs-truth PROPERTY across norm x N.
test( 'dgtcon: rcond ≈ 1/κ vs independent truth (norm x N)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( nm, N );
		});
	});
});

function runProperty( nm, N ) {
	const rng = new RNG( 0x5000 + N ); // reproducible
	const A0 = logical.tridiagonal( sc, rng, N );
	const anorm = nm.fn( sc, A0 );

	// Estimator: factor fresh copies of the storage vectors with dgttrf.
	const DL = schemes.realizeVector( sc, subDiag( A0, N ), TIGHT_VEC );
	const D = schemes.realizeVector( sc, mainDiag( A0, N ), TIGHT_VEC );
	const DU = schemes.realizeVector( sc, superDiag( A0, N ), TIGHT_VEC );
	const DU2 = sc.alloc( Math.max( 1, N ) ); // second superdiagonal, length N-2
	const ipiv = new Int32Array( N );
	dgttrf( N, DL.data, DL.args[ 0 ], DL.args[ 1 ], D.data, D.args[ 0 ], D.args[ 1 ], DU.data, DU.args[ 0 ], DU.args[ 1 ], DU2, 1, 0, ipiv, 1, 0 );

	const rcond = new Float64Array( 1 );
	const WORK = new Float64Array( 2 * N );
	const IWORK = new Int32Array( N );
	const info = dgtcon( nm.api, N, DL.data, DL.args[ 0 ], DL.args[ 1 ], D.data, D.args[ 0 ], D.args[ 1 ], DU.data, DU.args[ 0 ], DU.args[ 1 ], DU2, 1, 0, ipiv, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );

	// Independent truth:
	const Ainv = tridiagInverse( A0, N );
	const invnorm = nm.fn( sc, Ainv );
	const trueRcond = 1.0 / ( anorm * invnorm );

	const label = 'dgtcon ' + nm.api + ' N=' + N;
	checked( 'dgtcon', 'property', function run() {
		if ( info !== 0 ) {
			throw new Error( label + ': info=' + info + ' (expected 0)' );
		}
		const r = rcond[ 0 ];
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( label + ': rcond=' + r + ' not in (0,1]' );
		}
		if ( !( r <= FACTOR * trueRcond && trueRcond <= FACTOR * r ) ) {
			throw new Error( label + ': rcond=' + r.toExponential( 4 ) + ' disagrees with true_rcond=' + trueRcond.toExponential( 4 ) + ' beyond factor ' + FACTOR + ' (ratio ' + ( r / trueRcond ).toExponential( 3 ) + ')' );
		}
	} );
}

// Step 4: layout-invariance. dgtcon CONSUMES a gttrf factor, so pre-factor ONCE at
// the tight vector layout, read the fixed factor vectors (DL/D/DU/DU2) back, then
// re-realize those FIXED values at every vector layout and run only dgtcon (fixed
// anorm). The dlacn2/dgttrs elimination + back-solve walk the vectors in a fixed
// index order regardless of physical stride/offset (partial pivoting permutes
// VALUES, not the arithmetic sequence) -> bit-exact across ALL vector layouts
// (single family).
const VL = schemes.vectorLayouts();

function readVec( R, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		v.push( R.read( i ) );
	}
	return v;
}

test( 'dgtcon: bit-exact across strided vector layouts (estimate isolated from factor)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		runInvariance( nm );
	});
});

function runInvariance( nm ) {
	const N = 12;
	const SEED = 0x5000 + N;
	const rng = new RNG( SEED );
	const A0 = logical.tridiagonal( sc, rng, N );
	const anorm = nm.fn( sc, A0 );

	// Factor ONCE at tight layout to obtain fixed factor vectors + pivots:
	const DL = schemes.realizeVector( sc, subDiag( A0, N ), TIGHT_VEC );
	const D = schemes.realizeVector( sc, mainDiag( A0, N ), TIGHT_VEC );
	const DU = schemes.realizeVector( sc, superDiag( A0, N ), TIGHT_VEC );
	const DU2buf = sc.alloc( Math.max( 1, N ) );
	const ipiv = new Int32Array( N );
	dgttrf( N, DL.data, DL.args[ 0 ], DL.args[ 1 ], D.data, D.args[ 0 ], D.args[ 1 ], DU.data, DU.args[ 0 ], DU.args[ 1 ], DU2buf, 1, 0, ipiv, 1, 0 );

	const DLf = readVec( DL, N - 1 );
	const Df = readVec( D, N );
	const DUf = readVec( DU, N - 1 );
	const DU2f = [];
	let i;
	for ( i = 0; i < N - 2; i++ ) {
		DU2f.push( sc.read( DU2buf, i ) );
	}

	checked( 'dgtcon', 'layout-invariance', function run() {
		layoutInvariant( VL, function build( vL, idx ) {
			const rDL = schemes.realizeVector( sc, DLf, vL );
			const rD = schemes.realizeVector( sc, Df, VL[ ( idx + 1 ) % VL.length ] );
			const rDU = schemes.realizeVector( sc, DUf, VL[ ( idx + 2 ) % VL.length ] );
			const rDU2 = schemes.realizeVector( sc, DU2f, VL[ ( idx + 3 ) % VL.length ] );
			const rcond = new Float64Array( 1 );
			const WORK = new Float64Array( 2 * N );
			const IWORK = new Int32Array( N );
			dgtcon( nm.api, N, rDL.data, rDL.args[ 0 ], rDL.args[ 1 ], rD.data, rD.args[ 0 ], rD.args[ 1 ], rDU.data, rDU.args[ 0 ], rDU.args[ 1 ], rDU2.data, rDU2.args[ 0 ], rDU2.args[ 1 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'dgtcon ' + nm.api + ' layout invariance' } );
	} );
}
