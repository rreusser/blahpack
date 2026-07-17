/**
* Property-based validation for zsptrf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `sp` -> COMPLEX-SYMMETRIC PACKED
* (schemes.packed, logical.symmetric — zsptrf factors A = A^T with NO
* conjugation, NOT Hermitian); `trf` (Bunch-Kaufman P*L*D*L^T / U*D*U^T
* factorization with 1x1 / 2x2 block pivots and IPIV).
*
* The L*D*L^T reconstruction with block pivots is messy to assemble, so the
* factor is certified via a FACTOR+SOLVE RESIDUAL against an INDEPENDENT oracle
* (the ORIGINAL complex-symmetric matrix A0): factor A0 with zsptrf, solve
* A0*X = B0 with the sibling zsptrs, and assert `‖A0*X − B0‖` is small per RHS
* column. A wrong factorization cannot pass — so the residual certifies the
* zsptrf/zsptrs pair together (recorded under BOTH names).
*
* Packed-stride note: zsptrf's pivot search calls `izamax` over the packed
* column, which faithfully returns -1 for `strideAP <= 0` (reference BLAS
* `INCX<=0 -> no index`; see LEARNINGS getrf/getf2 + zsytrf entries). A negative
* packed stride is therefore OUT OF CONTRACT for the factor, so the residual
* sweep uses only POSITIVE packed strides (1,2,3) — which still certifies the
* non-unit packed-stride addressing that bit `zpptri` (LEARNINGS storage-mapping
* class). The negative-stride packed solve is isolated in the zsptrs sibling
* validate (the solve has no pivot search).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zsptrf from './../lib/ndarray.js';
import zsptrs from '../../zsptrs/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var NRHS = [ 1, 2, 3 ];

// zsptrf's pivot search (izamax) requires a positive packed stride, so the
// factor+solve residual sweeps only positive packed layouts (stride 1,2,3).
var POSITIVE_PACKED = schemes.packed.layouts().filter( function positive( L ) {
	return L.stride > 0;
});

// Pure-addressing packed family for factor bit-exactness: UNIT stride, varying
// ONLY the base offset (lead/tail). Cannot reorder arithmetic (no fast-path
// switch, no pivot-tie flip), so a correct factor is bit-exact across them; any
// diff is a real offset addressing bug. Non-unit / negative packed strides are
// NOT bit-exact for a Bunch-Kaufman factor (a last-ULP reorder can flip a
// discrete pivot decision — see zsytrf/zhetrf LEARNINGS), so cross-stride
// correctness is certified by the residual instead.
var PURE_PACKED = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 5, 'tail': 1 }
];

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

function readTri( R, n, uplo ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Steps 2-3-5: factor+solve residual over uplo x N x nrhs x every positive
// packed layout for AP. Sweeping non-unit packed strides (2,3) is the NaN guard
// for the packed stride-mapping bug class (see LEARNINGS, zpptri). B is held at a
// fixed tight dense layout so only AP addressing varies. Verifies A0*X = B0 per
// RHS column against the ORIGINAL complex-symmetric matrix (trans 'n': A is
// symmetric, no conjugation).
test( 'zsptrf: factor+solve residual against original A0 (uplo x N x nrhs x positive packed layout)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				POSITIVE_PACKED.forEach( function eachLayout( layout ) {
					runResidual( uplo, N, nrhs, layout );
				});
			});
		});
	});
});

function runResidual( uplo, N, nrhs, apLayout ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.symmetric( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var ipiv = new Int32Array( N );

	zsptrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0 );
	zsptrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	// The residual certifies the zsptrf/zsptrs PAIR; record under both names.
	function residual() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zsptrf '+uplo+' N='+N+' nrhs='+nrhs+' strideAP='+Ar.args[ 0 ]+' col='+j
			});
		}
	}
	checked( 'zsptrf', 'residual', residual );
	checked( 'zsptrs', 'residual', residual );

	// Structural self-consistency of the pivots (see dsptrf sibling): 1x1 pivots
	// index a valid row; 2x2 pivots (~kp) are encoded identically on the adjacent
	// pair with kp in range.
	checked( 'zsptrf', 'structural', function run() {
		assertPivotsConsistent( ipiv, N, uplo );
	});
}

function assertPivotsConsistent( ipiv, N, uplo ) {
	var kp;
	var k;
	if ( uplo === 'upper' ) {
		k = N - 1;
		while ( k >= 0 ) {
			if ( ipiv[ k ] >= 0 ) {
				if ( ipiv[ k ] >= N ) {
					throw new Error( 'zsptrf upper: 1x1 pivot index '+ipiv[ k ]+' out of range at k='+k );
				}
				k -= 1;
			} else {
				kp = ~ipiv[ k ];
				if ( k < 1 || ipiv[ k - 1 ] !== ipiv[ k ] || kp < 0 || kp >= N ) {
					throw new Error( 'zsptrf upper: malformed 2x2 pivot at k='+k+' (ipiv='+ipiv[ k ]+', ipiv[k-1]='+ipiv[ k - 1 ]+')' );
				}
				k -= 2;
			}
		}
	} else {
		k = 0;
		while ( k < N ) {
			if ( ipiv[ k ] >= 0 ) {
				if ( ipiv[ k ] >= N ) {
					throw new Error( 'zsptrf lower: 1x1 pivot index '+ipiv[ k ]+' out of range at k='+k );
				}
				k += 1;
			} else {
				kp = ~ipiv[ k ];
				if ( k > N - 2 || ipiv[ k + 1 ] !== ipiv[ k ] || kp < 0 || kp >= N ) {
					throw new Error( 'zsptrf lower: malformed 2x2 pivot at k='+k+' (ipiv='+ipiv[ k ]+', ipiv[k+1]='+ipiv[ k + 1 ]+')' );
				}
				k += 2;
			}
		}
	}
}

// Step 4: layout-invariance fuzz on the FACTOR's own packed addressing —
// bit-exact across a PURE-ADDRESSING packed family (unit stride, varying ONLY
// base offset). Cross-stride correctness is covered by the residual sweep over
// the non-unit positive packed layouts above. Records L3 honestly.
test( 'zsptrf: factor bit-exact across pure-addressing packed layouts', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var n = 12;
	var SEED = 0xF00D;
	checked( 'zsptrf', 'layout-invariance', function run() {
		layoutInvariant( PURE_PACKED, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A = logical.symmetric( sc, rng, n );
			var R = schemes.packed.realize( sc, A, { 'part': uplo }, layout );
			var ipiv = new Int32Array( n );
			zsptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0 );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'zsptrf '+uplo+' factor packed layout invariance' } );
	});
}
