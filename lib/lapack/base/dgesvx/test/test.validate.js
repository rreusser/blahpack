/**
* Property-based validation for dgesvx, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `svx` (EXPERT LU-solve driver) composes an
* equilibration + LU factor (dgetrf) + solve (dgetrs) + iterative refinement
* (dgerfs) + condition estimate (dgecon). It therefore inherits the three
* independent properties of its parts, checked against the ORIGINAL A0/B0:
*   (a) residual   ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS  (valid solve)
*   (b) rcond      returned rcond ≈ 1/κ vs an INDEPENDENT true 1/κ within factor F
*   (c) ferr/berr  BERR tiny (>=0); actual fwd error ‖Xtrue-X‖inf/‖X‖inf <= FERR*C;
*                  FERR ∈ [0,1).
*
* fact/equed/trans convention (confirmed from lib/base.js):
*   - fact='not-factored' forces equed='none' (rowequ=colequ=false): the
*     equilibration path is BYPASSED, so A/B are NOT scaled and X is the solution
*     of the ORIGINAL op(A0)*X = B0 directly — the residual oracle is A0/B0.
*   - rcond is returned in the result OBJECT (result.rcond), NOT via an array arg.
*   - trans in {no-transpose(one-norm), transpose/conjugate-transpose(inf-norm)};
*     for a real matrix transpose and conjugate-transpose coincide but both API
*     paths are exercised. gecon uses the same norm gesvx picks per trans.
*   - The equilibration path itself (fact='equilibrate') is exercised separately
*     below on a deliberately badly-scaled matrix, confirming that even when
*     equed != 'none' the returned X still solves the ORIGINAL system (the driver
*     un-scales X on exit, lib/base.js lines ~223-245).
*
* Storage is poisoned so any out-of-bounds read trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import dgesvx from './../lib/ndarray.js';
import dgesv from '../../dgesv/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
var NRHS = [ 1, 2 ];
var TIGHT = schemes.dense.pivotLayouts()[ 0 ]; // tight col-major (valid pivot layout)
var RCOND_FACTOR = 5; // rcond estimate vs independent truth: within this factor
var FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

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

// Read a fully-referenced dense buffer back into a LogicalMatrix.
function readMat( R, rows, cols ) {
	var M = new LogicalMatrix( sc, rows, cols );
	var i;
	var j;
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
	var M = new LogicalMatrix( sc, n, n );
	var i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

// 1-norm (max abs col sum) or inf-norm (max abs row sum) of a LogicalMatrix.
function normOf( M, which ) {
	var best = 0.0;
	var s;
	var i;
	var j;
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

// inf-norm of a scalar-value vector (max modulus).
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

// Build op(A0) as a LogicalMatrix: 'n' -> A0, 't' -> A0^T, 'c' -> A0^H (= A0^T
// for a real matrix). This is the system matrix the independent oracle solves.
function opMatrix( A0, N, code ) {
	var M = new LogicalMatrix( sc, N, N );
	var i;
	var j;
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

// Independent TRUE solution of op(A0)*X = B0 on fresh copies with trusted dgesv.
function trueSolution( A0, B0, N, nrhs, code ) {
	var Aop = opMatrix( A0, N, code );
	var Ar = schemes.dense.realize( sc, Aop, { 'part': 'full' }, TIGHT );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( N );
	var info = dgesv( N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dgesv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Independent true inverse of op(A0): solve op(A0)*Y = I with dgesv.
function opInverse( A0, N, code ) {
	var Aop = opMatrix( A0, N, code );
	var Ar = schemes.dense.realize( sc, Aop, { 'part': 'full' }, TIGHT );
	var Ir = schemes.dense.realize( sc, identity( N ), { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( N );
	dgesv( N, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Ir.data, Ir.args[ 0 ], Ir.args[ 1 ], Ir.args[ 2 ] );
	return readMat( Ir, N, N );
}

// Drive dgesvx (fact='not-factored') on realized copies; return the physical
// output handles + result object.
function callGesvx( fact, trans, N, nrhs, A0, B0, layout ) {
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var AFr = schemes.dense.realize( sc, zeros( N, N ), { 'part': 'full' }, layout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	var Xr = schemes.dense.realize( sc, zeros( N, nrhs ), { 'part': 'full' }, layout );
	var ipiv = new Int32Array( N );
	var r = new Float64Array( N );
	var c = new Float64Array( N );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = poisonedWork( sc, Math.max( 1, 4 * N ) );
	var IWORK = new Int32Array( N );
	var res = dgesvx( fact, trans, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], ipiv, 1, 0, 'none', r, 1, 0, c, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	return {
		'X': Xr,
		'FERR': FERR,
		'BERR': BERR,
		'res': res
	};
}


// TESTS //

// Steps 2-3-5: three properties across trans flags, a size sweep, and nrhs.
test( 'dgesvx: residual + rcond + FERR/BERR bound (trans x N x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runProperty( trans, N, nrhs );
			});
		});
	});
});

function runProperty( trans, N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.general( sc, rng, N, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var code = transCode( trans );
	var which = ( code === 'n' ) ? 'one' : 'inf'; // gesvx norm choice per trans

	var out = callGesvx( 'not-factored', trans, N, nrhs, A0, B0, TIGHT );
	var tag = 'dgesvx '+trans+' N='+N+' nrhs='+nrhs;

	// (a) residual: X solves op(A0)*X = B0 against the ORIGINAL matrix.
	checked( 'dgesvx', 'residual', function run() {
		if ( out.res.info !== 0 ) {
			throw new Error( tag+': info='+out.res.info+' (expected 0)' );
		}
		if ( out.res.equed !== 'none' ) {
			throw new Error( tag+': equed='+out.res.equed+' (expected none for fact=not-factored)' );
		}
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( out.X, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) rcond ≈ 1/κ vs an INDEPENDENT true 1/κ (anorm·‖A0⁻¹‖) within factor F.
	checked( 'dgesvx', 'property', function run() {
		var anorm = normOf( A0, which );
		var Ainv = opInverse( A0, N, code );
		var invnorm = normOf( Ainv, which );
		var trueRcond = 1.0 / ( anorm * invnorm );
		var r = out.res.rcond;
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( tag+': rcond='+r+' not in (0,1]' );
		}
		if ( !( r <= RCOND_FACTOR * trueRcond && trueRcond <= RCOND_FACTOR * r ) ) {
			throw new Error( tag+': rcond='+r.toExponential( 4 )+' disagrees with true_rcond='+trueRcond.toExponential( 4 )+' beyond factor '+RCOND_FACTOR+' (ratio '+( r / trueRcond ).toExponential( 3 )+')' );
		}
	});

	// (c) BERR tiny (>=0); actual forward error <= FERR*C; FERR ∈ [0,1).
	checked( 'dgesvx', 'structural', function run() {
		var Xtrue = trueSolution( A0, B0, N, nrhs, code );
		var berrCap = Math.max( 1e-8, 8.0 * ( N + 1 ) * EPS );
		var xcol;
		var tcol;
		var eActual;
		var eBound;
		var j;
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

// Equilibration path: fact='equilibrate' on a deliberately badly-scaled matrix
// forces dgeequ to equilibrate (equed != 'none'), yet the returned X must still
// solve the ORIGINAL op(A0)*X = B0 (the driver un-scales X on exit). This both
// exercises the equilibration branch AND confirms the residual oracle is A0/B0.
function badlyScaled( rng, N ) {
	var M = logical.general( sc, rng, N, N );
	var pr = [];
	var pc = [];
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		pr.push( Math.pow( 10, rng.int( -3, 3 ) ) );
		pc.push( Math.pow( 10, rng.int( -3, 3 ) ) );
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			M.set( i, j, sc.scale( M.get( i, j ), pr[ i ] * pc[ j ] ) );
		}
	}
	return M;
}

test( 'dgesvx: equilibration path un-scales X to the ORIGINAL system', function t() {
	var sawEquil = false;
	[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
		[ 5, 8, 16 ].forEach( function eachN( N ) {
			var rng = new RNG( 0xEC + N );
			var A0 = badlyScaled( rng, N );
			var B0 = logical.general( sc, rng, N, 2 );
			var code = transCode( trans );
			var out = callGesvx( 'equilibrate', trans, N, 2, A0, B0, TIGHT );
			if ( out.res.equed !== 'none' ) {
				sawEquil = true;
			}
			checked( 'dgesvx', 'residual', function run() {
				var tag = 'dgesvx EQUIL '+trans+' N='+N+' equed='+out.res.equed;
				if ( out.res.info !== 0 ) {
					throw new Error( tag+': info='+out.res.info );
				}
				var j;
				for ( j = 0; j < 2; j++ ) {
					check.assertResidual( sc, A0, readCol( out.X, N, j ), logicalCol( B0, N, j ), {
						'trans': code,
						'factor': 1000,
						'label': tag+' col='+j
					});
				}
			});
		});
	});
	if ( !sawEquil ) {
		throw new Error( 'equilibration never triggered — badly-scaled generator failed to exercise the equed path' );
	}
});

// Step 4: layout-invariance fuzz. dgesvx factors A from scratch (dgetrf: idamax
// pivot search => positive row stride required, schemes.dense.pivotLayouts) and
// composes dgecon/dgetrs/dgerfs whose inner dgemv/dlatrs kernels switch on a
// col<->row storage flip and legitimately reorder the accumulation (~1 ULP). So
// bit-exactness holds only WITHIN a storage-order family (col / row); cross-order
// correctness is certified by the swept residual property above. A/AF/B/X are all
// realized at the SAME layout per variant. Output vector = flatten(X) ++ [rcond]
// ++ FERR ++ BERR.
var PIVOT = schemes.dense.pivotLayouts();
var COL = PIVOT.filter( function isCol( L ) {
	return L.order !== 'row';
});
var ROW = PIVOT.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dgesvx: bit-exact within storage-order family (col / row)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans, COL, 'col' );
		runInvariance( trans, ROW, 'row' );
	});
});

function runInvariance( trans, variants, fam ) {
	var N = 9;
	var nrhs = 2;
	var SEED = 0xF00D;
	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, N, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	checked( 'dgesvx', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var out = callGesvx( 'not-factored', trans, N, nrhs, A0, B0, layout );
			var flat = check.flattenLogical( sc, readMat( out.X, N, nrhs ) );
			flat.push( out.res.rcond );
			var k;
			for ( k = 0; k < nrhs; k++ ) {
				flat.push( out.FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				flat.push( out.BERR[ k ] );
			}
			return flat;
		}, { 'label': 'dgesvx '+trans+' layout invariance '+fam+'-major' } );
	});
}
