/**
* Property-based validation for zgerfs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `rfs` (iterative refinement + error bounds)
* -> three independent properties. zgerfs refines an approximate solution X to
* op(A)*X = B and returns FERR (forward-error bound) and BERR (componentwise
* backward error). The LU factor AF (+ pivots IPIV) is produced by the
* already-validated zgetrf; the un-refined initial X by zgetrs; the TRUE solution
* independently by the trusted zgesv applied to op(A0). We assert, against the
* ORIGINAL matrix A0 and op = trans:
*   (a) residual  ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (still a valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* trans sweeps {no-transpose, transpose, conjugate-transpose}; for
* conjugate-transpose the oracle solves A0^H, exercising the complex-conjugation
* seam. Storage is poisoned so any out-of-bounds read trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import zgerfs from './../lib/ndarray.js';
import zgetrf from '../../zgetrf/lib/ndarray.js';
import zgetrs from '../../zgetrs/lib/ndarray.js';
import zgesv from '../../zgesv/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
const NRHS = [ 1, 2 ];
const TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major (a valid pivot layout)
const FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Map an API transpose flag to a reference transpose code.
function transCode( trans ) {
	if ( trans === 'transpose' ) {
		return 't';
	}
	if ( trans === 'conjugate-transpose' ) {
		return 'c';
	}
	return 'n';
}

// Read column j out of physical storage as an array of scalar values.
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

// Read the full N x nrhs matrix out of physical storage into a LogicalMatrix.
function readMat( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Read the full N x N LU factor out of physical storage into a LogicalMatrix.
function readFac( R, n ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// inf-norm of a vector of scalar values (max modulus).
function infNormVec( a ) {
	let mx = 0.0;
	let m, i;
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
	let mx = 0.0;
	let m, i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( sc.sub( a[ i ], b[ i ] ) );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// Build op(A0) as a LogicalMatrix: 'n' -> A0, 't' -> A0^T, 'c' -> A0^H. This is
// the system matrix the independent oracle solves.
function opMatrix( A0, N, code ) {
	const M = new LogicalMatrix( sc, N, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( code === 'n' ) {
				M.set( i, j, A0.get( i, j ) );
			} else if ( code === 'c' ) {
				M.set( i, j, sc.conj( A0.get( j, i ) ) );
			} else {
				M.set( i, j, A0.get( j, i ) );
			}
		}
	}
	return M;
}

// Independent TRUE solution of op(A0)*X = B0 on fresh copies with trusted zgesv.
function trueSolution( A0, B0, N, nrhs, code ) {
	const Aop = opMatrix( A0, N, code );
	const Ar = schemes.dense.realize( sc, Aop, { 'part': 'full' }, TIGHT );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	const ipiv = new Int32Array( N );
	const info = zgesv( N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zgesv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Steps 2-3-5: three properties across trans flags, a size sweep, and nrhs.
test( 'zgerfs: refinement residual + BERR + FERR bound (trans x N x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runProperty( trans, N, nrhs );
			});
		});
	});
});

function runProperty( trans, N, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.general( sc, rng, N, N ); // general dense oracle
	const B0 = logical.general( sc, rng, N, nrhs );
	const code = transCode( trans );

	// A = original (untouched); AF = its LU factorization (+ pivots IPIV):
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	const AFr = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	const ipiv = new Int32Array( N );
	zgetrf( N, N, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], ipiv, 1, 0 );

	// B (RHS, unchanged) and X (initial un-refined solve of op(A)X=B, refined in place):
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	const Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	zgetrs( trans, N, nrhs, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], ipiv, 1, 0, Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );

	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = poisonedWork( sc, 2 * N ); // 2*N complex, poisoned: OOB read -> NaN
	const RWORK = new Float64Array( Math.max( N, 1 ) );
	RWORK.fill( NaN ); // poison: written before read each RHS
	zgerfs( trans, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	const Xtrue = trueSolution( A0, B0, N, nrhs, code );

	const tag = 'zgerfs '+trans+' N='+N+' nrhs='+nrhs;

	// (a) residual: refined X remains a valid solution of op(A0)*X = B0.
	checked( 'zgerfs', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) backward error: BERR[j] tiny and >= 0; (c) forward-error bound valid.
	checked( 'zgerfs', 'structural', function run() {
		let xcol, tcol, eActual, eBound, j;
		const berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
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

// Step 4: layout-invariance fuzz. zgerfs consumes an already-computed
// factorization (AF + IPIV) and refines a given initial X, so this test freezes
// A0, the LU factor AF, IPIV, and the initial X ONCE at the tight layout, then
// re-realizes those FIXED values at every storage layout and runs only zgerfs.
// Its inner residual kernel zgemv has a col<->row fast-path switch that
// legitimately reorders the accumulation on a storage-order flip (~1 ULP), so
// bit-exactness is asserted WITHIN each storage-order family (col / row); the
// swept residual above certifies cross-order correctness. IPIV is a plain
// Int32Array (layout-independent) and is shared unchanged across all variants.
const allLayouts = schemes.dense.layouts();
const colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zgerfs: bit-exact within storage-order family (col / row)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans, colLayouts, 'col' );
		runInvariance( trans, rowLayouts, 'row' );
	});
});

function runInvariance( trans, variants, fam ) {
	const N = 9;
	const nrhs = 2;
	const SEED = 0xBEEF;
	const rng = new RNG( SEED );
	const A0 = logical.general( sc, rng, N, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	// Factor ONCE at the tight layout to obtain fixed LU factor + pivots, and the
	// fixed initial X, shared by every layout variant below:
	const AF0 = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	const ipiv = new Int32Array( N );
	zgetrf( N, N, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], AF0.args[ 2 ], ipiv, 1, 0 );
	const Lfac = readFac( AF0, N );

	const X0r = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	zgetrs( trans, N, nrhs, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], AF0.args[ 2 ], ipiv, 1, 0, X0r.data, X0r.args[ 0 ], X0r.args[ 1 ], X0r.args[ 2 ] );
	const Xinit = readMat( X0r, N, nrhs );

	checked( 'zgerfs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const AFr = schemes.dense.realize( sc, Lfac, { 'part': 'full' }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			const Xr = schemes.dense.realize( sc, Xinit, { 'part': 'full' }, layout );
			const FERR = new Float64Array( nrhs );
			const BERR = new Float64Array( nrhs );
			const WORK = poisonedWork( sc, 2 * N );
			const RWORK = new Float64Array( N );
			RWORK.fill( NaN );
			zgerfs( trans, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
			const out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
			let k;
			for ( k = 0; k < nrhs; k++ ) {
				out.push( FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( BERR[ k ] );
			}
			return out;
		}, { 'label': 'zgerfs '+trans+' layout invariance '+fam+'-major' } );
	});
}
