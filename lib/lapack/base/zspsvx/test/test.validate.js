/**
* Property-based validation for zspsvx, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `sp` -> COMPLEX-SYMMETRIC
* (A = Aᵀ, NO conjugation) INDEFINITE PACKED (schemes.packed,
* logical.symmetric); `svx` (EXPERT diagonal-pivoting solve DRIVER: factor +
* condition estimate + solve + iterative refinement + error bounds, all in one
* call — NO equilibration, NO trans param) -> a COMPOSITE of the three
* properties already proven for its constituent routines (zspsv/zsprfs residual,
* zspcon rcond, zsprfs FERR/BERR). We drive zspsvx with fact='not-factored'
* (factor A in place) and assert, against the ORIGINAL full complex-symmetric A0:
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (a valid solve).
*       trans='n' because A0 is symmetric (Aᵀ = A).
*   (b) rcond estimates 1/κ₁(A0): within a small factor F of the INDEPENDENT true
*       reciprocal condition number (anorm = 1-norm of A0, ‖A0⁻¹‖₁ from a trusted
*       packed zspsv solve of A0*X=I), and in (0,1]. Additionally, base.js and
*       ndarray.js must agree on rcond BIT-FOR-BIT (Object.is).
*   (c) BERR tiny and >= 0; the ACTUAL forward error ‖Xtrue-X‖inf/‖X‖inf <=
*       FERR*C; FERR in [0,1) (a valid, not-absurdly-loose bound), Xtrue from the
*       trusted zspsv.
* NOTE the complex signature: WORK is a Complex128Array of 2N elements and the
* final workspace is a real RWORK of N (not IWORK). base returns a plain integer
* `info` and writes rcond[0] into the caller's Float64Array; there is NO equed / S
* (unlike the *ppsvx equilibrating drivers). AP / AFP are PACKED (only the uplo
* triangle exists); B / X are dense; IPIV is an Int32Array of N. Poisoned
* unreferenced slots (opposite triangle, padding) trip a NaN on any stride/offset
* addressing bug (the zpptri class).
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import zspsvx from './../lib/ndarray.js';
import zspsvxBase from './../lib/base.js';
import zspsv from '../../zspsv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var NRHS = [ 1, 2 ];
var TIGHTP = schemes.packed.layouts()[ 0 ]; // tight packed (AP / AFP)
var TIGHTD = schemes.dense.layouts()[ 0 ];   // tight col-major (B / X)
var F = 5; // rcond estimate must be within this factor of the true reciprocal cond.
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

// 1-norm (max abs column sum) of the FULL complex-symmetric logical matrix.
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

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted packed zspsv on a fresh
// copy; X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHTD );
	var ipiv = new Int32Array( Math.max( n, 1 ) );
	var info = zspsv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zspsv failed (info='+info+'); matrix singular?' );
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

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted zspsv.
function trueSolution( A0, B0, N, nrhs, uplo ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHTD );
	var ipiv = new Int32Array( Math.max( N, 1 ) );
	var info = zspsv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zspsv failed (info='+info+'); matrix singular?' );
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

// Drive zspsvx (fact='not-factored') and return the physical X reader plus the
// rcond/FERR/BERR outputs and integer info. `impl` selects ndarray vs base — both
// take the identical argument list (base performs no validation), so the same
// invocation exercises either.
function drive( impl, uplo, N, nrhs, A0, B0, apLayout, bLayout ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayout );
	var AFr = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayout ); // overwritten by zcopy+zsptrf
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bLayout );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, bLayout ); // overwritten by zlacpy+zsptrs
	var IPIV = new Int32Array( Math.max( N, 1 ) );
	var rcond = new Float64Array( 1 );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Complex128Array( Math.max( 2 * N, 1 ) );
	var RWORK = new Float64Array( Math.max( N, 1 ) );
	var info = impl( 'not-factored', uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], IPIV, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	return {
		'Xr': Xr,
		'rcond': rcond,
		'FERR': FERR,
		'BERR': BERR,
		'info': info
	};
}

// Steps 2-3-5: the three composite properties across uplo flags, a size sweep,
// and nrhs.
test( 'zspsvx: expert-driver residual + rcond + FERR/BERR (uplo x N x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runProperty( uplo, N, nrhs );
			});
		});
	});
});

function runProperty( uplo, N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.symmetric( sc, rng, N ); // full complex-symmetric (indefinite) oracle
	var B0 = logical.general( sc, rng, N, nrhs );
	var anorm = norm1Full( A0, N );

	var d = drive( zspsvx, uplo, N, nrhs, A0, B0, TIGHTP, TIGHTD );
	var tag = 'zspsvx '+uplo+' N='+N+' nrhs='+nrhs;

	if ( d.info !== 0 ) {
		throw new Error( tag+': zspsvx returned info='+d.info+' (expected 0 for well-conditioned complex-symmetric input)' );
	}

	// (a) residual: X solves the ORIGINAL A0*X = B0 (trans='n' since A0 symmetric).
	checked( 'zspsvx', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( d.Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) rcond estimates 1/κ₁(A0) within factor F, in (0,1]; and base agrees with
	// ndarray bit-for-bit.
	checked( 'zspsvx', 'property', function run() {
		var trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
		assertRcond( d.rcond[ 0 ], trueRcond, tag );

		var db = drive( zspsvxBase, uplo, N, nrhs, A0, B0, TIGHTP, TIGHTD );
		if ( !Object.is( db.rcond[ 0 ], d.rcond[ 0 ] ) ) {
			throw new Error( tag+': base rcond '+db.rcond[ 0 ]+' != ndarray rcond '+d.rcond[ 0 ]+' (Object.is mismatch)' );
		}
	});

	// (c) BERR tiny and >= 0; FERR a valid, not-absurdly-loose forward-error bound.
	checked( 'zspsvx', 'structural', function run() {
		var Xtrue = trueSolution( A0, B0, N, nrhs, uplo );
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

// Cross-layout correctness: X must SOLVE A0*X=B0 to tolerance across POSITIVE
// packed AP strides (1,2,3 — zsptrf's izamax factor contract; negative excluded)
// crossed with EVERY dense B/X layout (col AND row order, padding, negative
// strides — the packed solve/refine has no pivot search over B, so any dense
// addressing is in contract). This certifies the non-unit-packed and row-major /
// negative-dense paths that pure-addressing bit-exactness deliberately omits.
var POSITIVE_PACKED = schemes.packed.layouts().filter( function positive( L ) {
	return L.stride > 0;
});
var ALL_DENSE = schemes.dense.layouts();

test( 'zspsvx: cross-layout residual (positive packed AP x every dense B/X)', function t() {
	var N = 7;
	var nrhs = 2;
	UPLOS.forEach( function eachUplo( uplo ) {
		POSITIVE_PACKED.forEach( function eachAP( apL ) {
			ALL_DENSE.forEach( function eachB( bL ) {
				var rng = new RNG( 0x2A00 + N );
				var A0 = logical.symmetric( sc, rng, N );
				var B0 = logical.general( sc, rng, N, nrhs );
				var d = drive( zspsvx, uplo, N, nrhs, A0, B0, apL, bL );
				var tag = 'zspsvx cross-layout '+uplo+' apStride='+apL.stride+' bOrder='+bL.order+' sgn1='+bL.sgn1;
				if ( d.info !== 0 ) {
					throw new Error( tag+': info='+d.info+' (expected 0)' );
				}
				checked( 'zspsvx', 'residual', function run() {
					var j;
					for ( j = 0; j < nrhs; j++ ) {
						check.assertResidual( sc, A0, readCol( d.Xr, N, j ), logicalCol( B0, N, j ), {
							'trans': 'n',
							'factor': 100,
							'label': tag+' col='+j
						});
					}
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz across a PURE-ADDRESSING family — fixed UNIT
// positive strides, varying ONLY the base offset (packed lead/tail; dense
// lead/tail/leading-dim padding). Bit-exactness is asserted only here, NOT across
// the full layouts() set, for three reasons rooted in this driver's kernels:
//
//   1. NEGATIVE packed stride is OUT OF CONTRACT for the factor: zsptrf's pivot
//      search (izamax over the packed column) faithfully returns -1 for
//      strideAP <= 0 (reference BLAS `INCX<=0 -> no index`), so a negative packed
//      AP stride corrupts the factorization (see zsptrf/zsysvx LEARNINGS + notes).
//   2. NON-UNIT packed stride can flip izamax pivot TIES, changing the discrete
//      Bunch-Kaufman pivot path -> a different (still correct) factor, not bit-
//      exact (zsptrf's own invariance uses a unit-stride pure family for this).
//   3. ROW-MAJOR / negative / gapped DENSE B/X reorders the iterative refinement
//      (zsprfs) and packed solve (zsptrs) reductions ~a few ULP — a benign
//      floating-point reorder, not an addressing bug (the sibling zsprfs/zsptrs
//      certify only tight col-major dense B/X; cf. RFP fast-path-reorder LEARNINGS).
//
// Changing ONLY the base offset cannot reorder any arithmetic nor alter a pivot
// decision, so X ++ rcond ++ FERR ++ BERR must reproduce bit-for-bit; any diff is
// a genuine packed/dense base-offset addressing bug (the zpptri storage-mapping
// class). Cross-order/stride correctness (that non-unit packed AND row-major /
// negative dense B/X still SOLVE correctly, to tolerance) is certified separately
// by the cross-layout residual sweep below.
var PACKED_PURE = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 5, 'tail': 1 },
	{ 'stride': 1, 'lead': 2, 'tail': 4 }
];
var DENSE_PURE = schemes.dense.pureAddrLayouts();

test( 'zspsvx: bit-exact across pure-addressing layouts (packed AP + dense B/X base offset)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 9;
	var nrhs = 2;
	var SEED = 0xBEEF;
	var nVariants = Math.max( PACKED_PURE.length, DENSE_PURE.length );
	var variants = [];
	var k;
	for ( k = 0; k < nVariants; k++ ) {
		variants.push( k );
	}
	checked( 'zspsvx', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( idx ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.symmetric( sc, rng, N );
			var B0 = logical.general( sc, rng, N, nrhs );
			var d = drive( zspsvx, uplo, N, nrhs, A0, B0, PACKED_PURE[ idx % PACKED_PURE.length ], DENSE_PURE[ idx % DENSE_PURE.length ] );
			var out = check.flattenLogical( sc, readMat( d.Xr, N, nrhs ) );
			var m;
			out.push( d.rcond[ 0 ] );
			for ( m = 0; m < nrhs; m++ ) {
				out.push( d.FERR[ m ] );
			}
			for ( m = 0; m < nrhs; m++ ) {
				out.push( d.BERR[ m ] );
			}
			return out;
		}, { 'label': 'zspsvx '+uplo+' pure-addressing layout invariance' } );
	});
}
