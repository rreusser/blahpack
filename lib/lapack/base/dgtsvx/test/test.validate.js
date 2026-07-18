/**
* Property-based validation for dgtsvx, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gt` -> general TRIDIAGONAL
* (logical.tridiagonal; storage = three strided vectors DL/D/DU); `svx` (EXPERT
* tridiagonal LU-solve driver) composes an LU factor (dgttrf) + solve (dgttrs) +
* iterative refinement (dgtrfs) + condition estimate (dgtcon). It therefore
* inherits the three independent properties of its parts, checked against the
* ORIGINAL A0/B0:
*   (a) residual   ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS  (valid solve)
*   (b) rcond      returned rcond ≈ 1/κ vs an INDEPENDENT true 1/κ within factor F
*   (c) ferr/berr  BERR tiny (>=0); actual fwd error ‖Xtrue-X‖inf/‖X‖inf <= FERR*C;
*                  FERR ∈ [0,1).
*
* API convention (confirmed from lib/base.js + lib/ndarray.js):
*   - fact='not-factored': the driver copies DL/D/DU into DLF/DF/DUF and factors,
*     so DLF/DF/DUF/DU2/IPIV are OUTPUTS (poisoned on entry). X solves the ORIGINAL
*     op(A0)*X = B0 (no equilibration on the gt path) — the residual oracle is A0/B0.
*   - `rcond` is a length-1 Float64Array OUTPUT argument (rcond[0]); `info` is the
*     RETURN value. base.js and ndarray.js AGREE on this arg (unlike the dposvx bug).
*   - trans in {no-transpose(one-norm), transpose/conjugate-transpose(inf-norm)};
*     for a real matrix transpose and conjugate-transpose coincide but both API paths
*     are exercised. dgtcon uses the same norm dgtsvx picks per trans.
*
* Storage is poisoned so any out-of-bounds read trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import dgtsvx from './../lib/ndarray.js';
import dgtsv from '../../dgtsv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
const NRHS = [ 1, 2 ];
const RCOND_FACTOR = 5; // rcond estimate vs independent truth: within this factor
const FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)
const TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };
const DTIGHT = schemes.dense.layouts()[ 0 ];

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

// Extract the three tridiagonal storage vectors from a full logical matrix.
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

// Column j of physical B/X storage as an array of scalar values.
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

// Read a fully-referenced dense buffer back into a LogicalMatrix.
function readMat( R, rows, cols ) {
	const M = new LogicalMatrix( sc, rows, cols );
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			M.set( i, j, R.read( i, j ) );
		}
	}
	return M;
}

function zeros( rows, cols ) {
	return new LogicalMatrix( sc, rows, cols ); // inits to sc.zero
}

function identity( n ) {
	const M = new LogicalMatrix( sc, n, n );
	let i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

// 1-norm (max abs col sum) or inf-norm (max abs row sum) of a LogicalMatrix.
function normOf( M, which ) {
	let best = 0.0;
	let s, i, j;
	if ( which === 'one' ) {
		for ( j = 0; j < M.cols; j++ ) {
			s = 0.0;
			for ( i = 0; i < M.rows; i++ ) {
				s += sc.abs( M.get( i, j ) );
			}
			if ( s > best ) {
				best = s;
			}
		}
		return best;
	}
	for ( i = 0; i < M.rows; i++ ) {
		s = 0.0;
		for ( j = 0; j < M.cols; j++ ) {
			s += sc.abs( M.get( i, j ) );
		}
		if ( s > best ) {
			best = s;
		}
	}
	return best;
}

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

// Build op(A0) as a full LogicalMatrix: 'n' -> A0, 't' -> A0^T, 'c' -> A0^H (=A0^T
// for a real matrix). op of a tridiagonal is tridiagonal (DL<->DU swapped).
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

// Solve op(A0)*Y = RHS with the trusted tridiagonal driver dgtsv (fresh copies).
// `Rhs` is a LogicalMatrix (N x k); returns the realized solution handle.
function dgtsvSolve( A0, N, k, code, Rhs ) {
	const Aop = opMatrix( A0, N, code );
	const DL = schemes.realizeVector( sc, subDiag( Aop, N ), TIGHT );
	const D = schemes.realizeVector( sc, mainDiag( Aop, N ), TIGHT );
	const DU = schemes.realizeVector( sc, superDiag( Aop, N ), TIGHT );
	const Br = schemes.dense.realize( sc, Rhs, { 'part': 'full' }, DTIGHT );
	const info = dgtsv( N, k, DL.data, DL.args[ 0 ], DL.args[ 1 ], D.data, D.args[ 0 ], D.args[ 1 ], DU.data, DU.args[ 0 ], DU.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dgtsv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Independent true inverse of op(A0): solve op(A0)*Y = I.
function opInverse( A0, N, code ) {
	const Ir = dgtsvSolve( A0, N, N, code, identity( N ) );
	return readMat( Ir, N, N );
}

// Drive dgtsvx (fact='not-factored') on realized copies; return output handles +
// info + rcond. DL/D/DU are inputs; DLF/DF/DUF/DU2/IPIV are poisoned outputs.
function callGtsvx( fact, trans, N, nrhs, A0, B0, vlayout, dlayout ) {
	const DL = schemes.realizeVector( sc, subDiag( A0, N ), vlayout );
	const D = schemes.realizeVector( sc, mainDiag( A0, N ), vlayout );
	const DU = schemes.realizeVector( sc, superDiag( A0, N ), vlayout );
	const DLF = schemes.realizeVector( sc, poisonVec( Math.max( 0, N - 1 ) ), vlayout );
	const DF = schemes.realizeVector( sc, poisonVec( N ), vlayout );
	const DUF = schemes.realizeVector( sc, poisonVec( Math.max( 0, N - 1 ) ), vlayout );
	const DU2 = schemes.realizeVector( sc, poisonVec( Math.max( 0, N - 2 ) ), vlayout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, dlayout );
	const Xr = schemes.dense.realize( sc, zeros( N, nrhs ), { 'part': 'full' }, dlayout );
	const ipiv = new Int32Array( N );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = poisonedWork( sc, Math.max( 1, 3 * N ) );
	const IWORK = new Int32Array( Math.max( 1, N ) );
	const info = dgtsvx( fact, trans, N, nrhs, DL.data, DL.args[ 0 ], DL.args[ 1 ], D.data, D.args[ 0 ], D.args[ 1 ], DU.data, DU.args[ 0 ], DU.args[ 1 ], DLF.data, DLF.args[ 0 ], DLF.args[ 1 ], DF.data, DF.args[ 0 ], DF.args[ 1 ], DUF.data, DUF.args[ 0 ], DUF.args[ 1 ], DU2.data, DU2.args[ 0 ], DU2.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	return {
		'X': Xr,
		'rcond': rcond[ 0 ],
		'FERR': FERR,
		'BERR': BERR,
		'info': info
	};
}

// A vector of the given length whose VALUES are irrelevant (output slot). We fill
// with zeros; the realized backing is separately poisoned by scalar.alloc for any
// slot the routine does not write, and every referenced slot IS written before read
// on the fact='not-factored' path.
function poisonVec( n ) {
	const v = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		v.push( sc.zero );
	}
	return v;
}


// TESTS //

// Steps 2-3-5: three properties across trans flags, a size sweep, and nrhs.
test( 'dgtsvx: residual + rcond + FERR/BERR bound (trans x N x nrhs)', function t() {
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
	const A0 = logical.tridiagonal( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );
	const code = transCode( trans );
	const which = ( code === 'n' ) ? 'one' : 'inf'; // gtsvx norm choice per trans

	const out = callGtsvx( 'not-factored', trans, N, nrhs, A0, B0, TIGHT, DTIGHT );
	const tag = 'dgtsvx '+trans+' N='+N+' nrhs='+nrhs;

	// (a) residual: X solves op(A0)*X = B0 against the ORIGINAL matrix.
	checked( 'dgtsvx', 'residual', function run() {
		if ( out.info !== 0 ) {
			throw new Error( tag+': info='+out.info+' (expected 0)' );
		}
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( out.X, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) rcond ≈ 1/κ vs an INDEPENDENT true 1/κ (anorm·‖A0⁻¹‖) within factor F.
	checked( 'dgtsvx', 'property', function run() {
		const anorm = normOf( A0, which );
		const Ainv = opInverse( A0, N, code );
		const invnorm = normOf( Ainv, which );
		const trueRcond = 1.0 / ( anorm * invnorm );
		const r = out.rcond;
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( tag+': rcond='+r+' not in (0,1]' );
		}
		if ( !( r <= RCOND_FACTOR * trueRcond && trueRcond <= RCOND_FACTOR * r ) ) {
			throw new Error( tag+': rcond='+r.toExponential( 4 )+' disagrees with true_rcond='+trueRcond.toExponential( 4 )+' beyond factor '+RCOND_FACTOR+' (ratio '+( r / trueRcond ).toExponential( 3 )+')' );
		}
	});

	// (c) BERR tiny (>=0); actual forward error <= FERR*C; FERR ∈ [0,1).
	checked( 'dgtsvx', 'structural', function run() {
		const Xtrue = dgtsvSolve( A0, N, nrhs, code, B0 );
		const berrCap = Math.max( 1e-8, 8.0 * ( N + 1 ) * EPS );
		let xcol, tcol, eActual, eBound, j;
		for ( j = 0; j < nrhs; j++ ) {
			if ( !Number.isFinite( out.BERR[ j ] ) || !( out.BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+out.BERR[ j ]+' not finite/nonnegative' );
			}
			if ( !( out.BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+out.BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}
			if ( !Number.isFinite( out.FERR[ j ] ) || !( out.FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+out.FERR[ j ]+' not finite/nonnegative' );
			}
			if ( !( out.FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+out.FERR[ j ].toExponential( 3 )+' absurdly loose (>=1) for well-conditioned input' );
			}
			xcol = readCol( out.X, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( out.FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual fwd error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+out.FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// Step 4: layout-invariance fuzz. The elimination/back-solve/refinement arithmetic
// order is independent of the physical layout of the tridiagonal vectors and of
// B/X (partial pivoting permutes VALUES, not the arithmetic sequence), so the whole
// output — X ++ [rcond] ++ FERR ++ BERR — is bit-exact across ALL vector/dense
// layouts (a single family). nrhs fixed (nrhs==1 is a distinct code path). NaN or a
// mismatch under strided vectors would be a real addressing bug -> LEARNINGS + fix.
const VL = schemes.vectorLayouts();
const DENSE = schemes.dense.layouts();

test( 'dgtsvx: bit-exact across strided vector + dense layouts (X ++ rcond ++ FERR ++ BERR)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans );
	});
});

function runInvariance( trans ) {
	const N = 12;
	const nrhs = 3;
	const SEED = 0xF00D;
	const rng = new RNG( SEED );
	const A0 = logical.tridiagonal( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	checked( 'dgtsvx', 'layout-invariance', function run() {
		layoutInvariant( VL, function build( vL, idx ) {
			const dL = DENSE[ idx % DENSE.length ];
			const out = callGtsvx( 'not-factored', trans, N, nrhs, A0, B0, vL, dL );
			const flat = check.flattenLogical( sc, readMat( out.X, N, nrhs ) );
			let k;
			flat.push( out.rcond );
			for ( k = 0; k < nrhs; k++ ) {
				flat.push( out.FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				flat.push( out.BERR[ k ] );
			}
			return flat;
		}, { 'label': 'dgtsvx '+trans+' layout invariance' } );
	});
}
