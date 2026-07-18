/**
* Property-based validation for zgtrfs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gt` -> general TRIDIAGONAL (storage
* = three strided vectors DL/D/DU for the ORIGINAL matrix, plus the zgttrf factor
* DLF/DF/DUF/DU2 + IPIV); `rfs` (iterative refinement + error bounds) -> three
* independent properties. zgtrfs refines an approximate solution X to op(A)*X = B
* and returns FERR (forward-error bound) and BERR (componentwise backward error).
* The LU factor (DLF/DF/DUF/DU2 + IPIV) is produced by the already-validated
* zgttrf; the un-refined initial X by zgttrs; the TRUE solution independently by
* the trusted combined zgtsv applied to op(A0). We assert, against the ORIGINAL
* tridiagonal A0 and op = trans:
*   (a) residual  ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (still a valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* trans sweeps {no-transpose (A), transpose (A^T), conjugate-transpose (A^H)} —
* distinct code paths for a complex matrix. Storage is poisoned so any
* out-of-bounds read trips a NaN+NaNi.
*
* ALL complex operand strides/offsets are in COMPLEX-ELEMENT units (the fixed
* library convention after the zgtts2/zgttrs B-stride fix; see LEARNINGS.md
* 2026-07-17) — the dense/vector schemes emit element-unit args, passed straight
* through (no ×2). WORK is 2*N complex elements; RWORK is N real. zgtrfs' kernels
* (zlagtm, zgttrs counted solve, zaxpy, zlacn2) are counted with no pivot search,
* so X/FERR/BERR are bit-exact across ALL vector AND dense layouts (single family).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import zgtrfs from './../lib/ndarray.js';
import zgttrf from '../../zgttrf/lib/ndarray.js';
import zgttrs from '../../zgttrs/lib/ndarray.js';
import zgtsv from '../../zgtsv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
var NRHS = [ 1, 2 ];
var TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major
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

// Extract the three tridiagonal storage vectors from a full logical matrix.
function extractDiags( A, N ) {
	var DL = [];
	var D = [];
	var DU = [];
	var i;
	for ( i = 0; i < N; i++ ) {
		D.push( A.get( i, i ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		DL.push( A.get( i + 1, i ) );
		DU.push( A.get( i, i + 1 ) );
	}
	return { 'DL': DL, 'D': D, 'DU': DU };
}

// Build op(A0) as a LogicalMatrix: 'n' -> A0, 't' -> A0^T, 'c' -> A0^H. Still
// tridiagonal; drives the independent oracle.
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

// Column j of physical dense storage as an array of scalar values.
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

// Integer (IPIV) realization at a vector layout with poisoned padding.
function realizeInt( values, layout ) {
	var L = layout || {};
	var stride = ( L.stride === void 0 ) ? 1 : L.stride;
	var lead = ( L.lead === void 0 ) ? 0 : L.lead;
	var tail = ( L.tail === void 0 ) ? 0 : L.tail;
	var n = values.length;
	var span = ( n > 0 ) ? ( n - 1 ) * Math.abs( stride ) : 0;
	var offset = ( stride < 0 ) ? ( lead + span ) : lead;
	var len = lead + span + tail + 1;
	var data = new Int32Array( len ).fill( -999999 );
	var i;
	for ( i = 0; i < n; i++ ) {
		data[ offset + ( i * stride ) ] = values[ i ];
	}
	return { 'data': data, 'stride': stride, 'offset': offset };
}

// Factor A0 (tight vectors) and return the FROZEN factored vectors + pivots as
// plain value arrays (for re-realization at fuzzed layouts).
function factorFrozen( A0, N ) {
	var diags = extractDiags( A0, N );
	var DLFr = schemes.realizeVector( sc, diags.DL, { 'stride': 1 } );
	var DFr = schemes.realizeVector( sc, diags.D, { 'stride': 1 } );
	var DUFr = schemes.realizeVector( sc, diags.DU, { 'stride': 1 } );
	var DU2r = schemes.realizeVector( sc, new Array( Math.max( N - 2, 0 ) ).fill( sc.zero ), { 'stride': 1 } );
	var ipiv = new Int32Array( N );
	zgttrf( N, DLFr.data, DLFr.args[ 0 ], DLFr.args[ 1 ], DFr.data, DFr.args[ 0 ], DFr.args[ 1 ], DUFr.data, DUFr.args[ 0 ], DUFr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv, 1, 0 );

	var DLF = [];
	var DF = [];
	var DUF = [];
	var DU2 = [];
	var IP = [];
	var i;
	for ( i = 0; i < N - 1; i++ ) { DLF.push( DLFr.read( i ) ); }
	for ( i = 0; i < N; i++ ) { DF.push( DFr.read( i ) ); }
	for ( i = 0; i < N - 1; i++ ) { DUF.push( DUFr.read( i ) ); }
	for ( i = 0; i < N - 2; i++ ) { DU2.push( DU2r.read( i ) ); }
	for ( i = 0; i < N; i++ ) { IP.push( ipiv[ i ] ); }
	return { 'DLF': DLF, 'DF': DF, 'DUF': DUF, 'DU2': DU2, 'IP': IP };
}

// Independent TRUE solution of op(A0)*X = B0 via the trusted combined zgtsv (a
// different factor+solve path than zgttrf/zgttrs). Operates on fresh copies.
function trueSolution( A0, B0, N, nrhs, code ) {
	var op = opMatrix( A0, N, code );
	var diags = extractDiags( op, N );
	var DLr = schemes.realizeVector( sc, diags.DL, { 'stride': 1 } );
	var Dr = schemes.realizeVector( sc, diags.D, { 'stride': 1 } );
	var DUr = schemes.realizeVector( sc, diags.DU, { 'stride': 1 } );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var info = zgtsv( N, nrhs, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zgtsv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Steps 2-3-5: three properties across trans flags, a size sweep, and nrhs.
test( 'zgtrfs: refinement residual + BERR + FERR bound (trans x N x nrhs)', function t() {
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
	var A0 = logical.tridiagonal( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var code = transCode( trans );
	var diags = extractDiags( A0, N );

	// Originals (untouched by zgtrfs): DL/d/DU of A0.
	var DLr = schemes.realizeVector( sc, diags.DL, { 'stride': 1 } );
	var Dr = schemes.realizeVector( sc, diags.D, { 'stride': 1 } );
	var DUr = schemes.realizeVector( sc, diags.DU, { 'stride': 1 } );

	// Factor (DLF/DF/DUF/DU2 + IPIV) via the sibling zgttrf:
	var fac = factorFrozen( A0, N );
	var DLFr = schemes.realizeVector( sc, fac.DLF, { 'stride': 1 } );
	var DFr = schemes.realizeVector( sc, fac.DF, { 'stride': 1 } );
	var DUFr = schemes.realizeVector( sc, fac.DUF, { 'stride': 1 } );
	var DU2r = schemes.realizeVector( sc, fac.DU2, { 'stride': 1 } );
	var ipiv = realizeInt( fac.IP, { 'stride': 1 } );

	// B (RHS, unchanged) and X (initial un-refined solve, refined in place):
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	zgttrs( trans, N, nrhs, DLFr.data, DLFr.args[ 0 ], DLFr.args[ 1 ], DFr.data, DFr.args[ 0 ], DFr.args[ 1 ], DUFr.data, DUFr.args[ 0 ], DUFr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset, Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );

	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = poisonedWork( sc, 2 * N ); // 2*N complex elements, poisoned
	var RWORK = new Float64Array( N );
	zgtrfs( trans, N, nrhs, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DLFr.data, DLFr.args[ 0 ], DLFr.args[ 1 ], DFr.data, DFr.args[ 0 ], DFr.args[ 1 ], DUFr.data, DUFr.args[ 0 ], DUFr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	var Xtrue = trueSolution( A0, B0, N, nrhs, code );

	var tag = 'zgtrfs '+trans+' N='+N+' nrhs='+nrhs;

	// (a) residual: refined X remains a valid solution of op(A0)*X = B0.
	checked( 'zgtrfs', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) backward error BERR tiny + >= 0; (c) forward-error bound valid.
	checked( 'zgtrfs', 'structural', function run() {
		var berrCap;
		var eActual;
		var eBound;
		var xcol;
		var tcol;
		var j;
		berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
		for ( j = 0; j < nrhs; j++ ) {
			if ( !Number.isFinite( BERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': BERR not finite ('+BERR[ j ]+')' );
			}
			if ( !( BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+BERR[ j ]+' is negative' );
			}
			if ( !( BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}
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

// Step 4: layout-invariance fuzz. zgtrfs consumes fixed ORIGINAL vectors + a fixed
// factor + IPIV and refines a fixed initial X, so this freezes all of them ONCE at
// the tight layout, then re-realizes those FIXED values at every vector layout
// (incl. negative strides) with B/X at the matching dense layout and runs ONLY
// zgtrfs. Its kernels are counted (no pivot search, no dot/axpy form switch), so
// X, FERR, and BERR are bit-exact across ALL layouts (single family).
var VL = schemes.vectorLayouts();
var DENSE = schemes.dense.layouts();

test( 'zgtrfs: bit-exact across strided vector + dense layouts (trans)', function t() {
	var N = 12;
	var nrhs = 2;
	var SEED = 0xBEEF;
	var rng = new RNG( SEED );
	var A0 = logical.tridiagonal( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var diags = extractDiags( A0, N );
	var fac = factorFrozen( A0, N );

	TRANS.forEach( function eachTrans( trans ) {
		// Freeze the initial X once (tight), shared by every layout variant:
		var DLF0 = schemes.realizeVector( sc, fac.DLF, { 'stride': 1 } );
		var DF0 = schemes.realizeVector( sc, fac.DF, { 'stride': 1 } );
		var DUF0 = schemes.realizeVector( sc, fac.DUF, { 'stride': 1 } );
		var DU20 = schemes.realizeVector( sc, fac.DU2, { 'stride': 1 } );
		var ip0 = realizeInt( fac.IP, { 'stride': 1 } );
		var X0r = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
		zgttrs( trans, N, nrhs, DLF0.data, DLF0.args[ 0 ], DLF0.args[ 1 ], DF0.data, DF0.args[ 0 ], DF0.args[ 1 ], DUF0.data, DUF0.args[ 0 ], DUF0.args[ 1 ], DU20.data, DU20.args[ 0 ], DU20.args[ 1 ], ip0.data, ip0.stride, ip0.offset, X0r.data, X0r.args[ 0 ], X0r.args[ 1 ], X0r.args[ 2 ] );
		var Xinit = readMat( X0r, N, nrhs );

		checked( 'zgtrfs', 'layout-invariance', function run() {
			layoutInvariant( VL, function build( vl, idx ) {
				var bl = DENSE[ idx % DENSE.length ];
				var DLr = schemes.realizeVector( sc, diags.DL, vl );
				var Dr = schemes.realizeVector( sc, diags.D, vl );
				var DUr = schemes.realizeVector( sc, diags.DU, vl );
				var DLFr = schemes.realizeVector( sc, fac.DLF, vl );
				var DFr = schemes.realizeVector( sc, fac.DF, vl );
				var DUFr = schemes.realizeVector( sc, fac.DUF, vl );
				var DU2r = schemes.realizeVector( sc, fac.DU2, vl );
				var ipiv = realizeInt( fac.IP, vl );
				var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bl );
				var Xr = schemes.dense.realize( sc, Xinit, { 'part': 'full' }, bl );
				var FERR = new Float64Array( nrhs );
				var BERR = new Float64Array( nrhs );
				var WORK = poisonedWork( sc, 2 * N );
				var RWORK = new Float64Array( N );
				zgtrfs( trans, N, nrhs, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DLFr.data, DLFr.args[ 0 ], DLFr.args[ 1 ], DFr.data, DFr.args[ 0 ], DFr.args[ 1 ], DUFr.data, DUFr.args[ 0 ], DUFr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
				var out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
				var k;
				for ( k = 0; k < nrhs; k++ ) {
					out.push( FERR[ k ] );
				}
				for ( k = 0; k < nrhs; k++ ) {
					out.push( BERR[ k ] );
				}
				return out;
			}, { 'label': 'zgtrfs '+trans+' layout invariance' } );
		});
	});
});
