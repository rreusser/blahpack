/**
* Property-based validation for zhptrf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `hp` -> HERMITIAN PACKED
* (schemes.packed, logical.hermitian — the mirror CONJUGATES and the diagonal is
* real); `trf` (Bunch-Kaufman P*L*D*L^H / U*D*U^H factorization with 1x1 / 2x2
* block pivots and IPIV).
*
* The L*D*L^H reconstruction with block pivots is messy to assemble, so the
* factor is certified via a FACTOR+SOLVE RESIDUAL against an INDEPENDENT oracle
* (the ORIGINAL Hermitian matrix A0): factor A0 with zhptrf, solve A0*X = B0 with
* the sibling zhptrs, and assert `‖A0*X − B0‖` is small per RHS column. A wrong
* factorization cannot pass this — the recovered X would not reproduce B0 through
* A0 — so the residual certifies the zhptrf/zhptrs pair together (recorded under
* BOTH names). CRITICALLY, BOTH uplo are swept: the UPPER path was broken until
* 2026-07-17 (a running interchange index KX was off by one, so the wrong
* off-diagonal element was conjugated — residual ~1.4e1 at n=3, growing with n;
* see test/harness/LEARNINGS.md "zhptrf UPPER path"). This suite is the
* regression guard for that fix.
*
* Packed-stride note: zhptrf's pivot search calls `izamax` over the packed
* column, which faithfully returns -1 for `strideAP <= 0` (reference BLAS
* `INCX<=0 -> no index`; see LEARNINGS getrf/getf2 + zsytrf entries). A negative
* packed stride is therefore OUT OF CONTRACT for the factor, so the residual
* sweep uses only POSITIVE packed strides (1,2,3) — which still certifies the
* non-unit packed-stride addressing that bit `zpptri` (LEARNINGS storage-mapping
* class). The negative-stride packed solve is isolated in the zhptrs sibling
* validate (the solve has no pivot search).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhptrf from './../lib/ndarray.js';
import zhptrs from '../../zhptrs/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var NRHS = [ 1, 2, 3 ];

// zhptrf's pivot search (izamax) requires a positive packed stride, so the
// factor+solve residual sweeps only positive packed layouts (stride 1,2,3).
var POSITIVE_PACKED = schemes.packed.layouts().filter( function positive( L ) {
	return L.stride > 0;
});

// Pure-addressing packed family for factor bit-exactness: UNIT stride, varying
// ONLY the base offset (lead/tail). Changing these cannot reorder any arithmetic
// (no fast-path switch, no pivot-tie flip), so a correct factor is bit-exact
// across them; any diff is a real offset addressing bug. Non-unit / negative
// packed strides are NOT bit-exact for a Bunch-Kaufman factor (a last-ULP
// reorder can flip a discrete pivot decision — see the zsytrf/zhetrf LEARNINGS
// entries), so cross-stride correctness is certified by the residual instead.
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

// Read the factored triangle (the zhptrf output) back into a full LogicalMatrix
// (opposite triangle zeroed) for bit-exact layout comparison.
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
// packed layout for AP. SIZES_SMALL spans the unblocked-only packed path across
// sizes that straddle the unrolled-remainder / block thresholds. Sweeping
// non-unit packed strides (2,3) is the NaN guard for the packed stride-mapping
// bug class (see test/harness/LEARNINGS.md, zpptri). B is held at a fixed tight
// dense layout so only AP addressing varies. Verifies A0*X = B0 per RHS column
// against the ORIGINAL Hermitian matrix — for BOTH uplo (upper was broken).
test( 'zhptrf: factor+solve residual against original A0 (uplo x N x nrhs x positive packed layout)', function t() {
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
	var A0 = logical.hermitian( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var ipiv = new Int32Array( N );

	if ( zhptrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0 ) !== 0 ) {
		return; // rare singular draw — solve undefined
	}
	zhptrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	// The residual certifies the zhptrf/zhptrs PAIR; record under both names.
	function residual() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zhptrf '+uplo+' N='+N+' nrhs='+nrhs+' strideAP='+Ar.args[ 0 ]+' col='+j
			});
		}
	}
	checked( 'zhptrf', 'residual', residual );
	checked( 'zhptrs', 'residual', residual );

	// Structural self-consistency of the pivots: every 0-based 1x1 pivot index is
	// a valid row, and every 2x2 pivot (~kp) resolves to a valid row; 2x2 blocks
	// come in the adjacent pair the convention requires.
	checked( 'zhptrf', 'structural', function run() {
		assertPivotsConsistent( ipiv, N, uplo );
	});
}

// Assert IPIV obeys the zhptrf/zhptf2 convention: 1x1 pivots (>=0) index a valid
// row; a 2x2 pivot is encoded on BOTH members of an adjacent pair as the same
// negative value ~kp with kp in [0,N).
function assertPivotsConsistent( ipiv, N, uplo ) {
	var kp;
	var k;
	if ( uplo === 'upper' ) {
		k = N - 1;
		while ( k >= 0 ) {
			if ( ipiv[ k ] >= 0 ) {
				if ( ipiv[ k ] >= N ) {
					throw new Error( 'zhptrf upper: 1x1 pivot index '+ipiv[ k ]+' out of range at k='+k );
				}
				k -= 1;
			} else {
				kp = ~ipiv[ k ];
				if ( k < 1 || ipiv[ k - 1 ] !== ipiv[ k ] || kp < 0 || kp >= N ) {
					throw new Error( 'zhptrf upper: malformed 2x2 pivot at k='+k+' (ipiv='+ipiv[ k ]+', ipiv[k-1]='+ipiv[ k - 1 ]+')' );
				}
				k -= 2;
			}
		}
	} else {
		k = 0;
		while ( k < N ) {
			if ( ipiv[ k ] >= 0 ) {
				if ( ipiv[ k ] >= N ) {
					throw new Error( 'zhptrf lower: 1x1 pivot index '+ipiv[ k ]+' out of range at k='+k );
				}
				k += 1;
			} else {
				kp = ~ipiv[ k ];
				if ( k > N - 2 || ipiv[ k + 1 ] !== ipiv[ k ] || kp < 0 || kp >= N ) {
					throw new Error( 'zhptrf lower: malformed 2x2 pivot at k='+k+' (ipiv='+ipiv[ k ]+', ipiv[k+1]='+ipiv[ k + 1 ]+')' );
				}
				k += 2;
			}
		}
	}
}

// Step 4: layout-invariance fuzz on the FACTOR's own packed addressing. The
// factor must be bit-exact across a PURE-ADDRESSING packed family (unit stride,
// varying ONLY base offset) — which cannot change arithmetic order or the pivot
// path. Cross-stride correctness is covered by the residual sweep over the
// non-unit positive packed layouts above. Records L3 honestly.
test( 'zhptrf: factor bit-exact across pure-addressing packed layouts', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var n = 12;
	var SEED = 0xF00D;
	checked( 'zhptrf', 'layout-invariance', function run() {
		layoutInvariant( PURE_PACKED, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A = logical.hermitian( sc, rng, n );
			var R = schemes.packed.realize( sc, A, { 'part': uplo }, layout );
			var ipiv = new Int32Array( n );
			zhptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0 );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'zhptrf '+uplo+' factor packed layout invariance' } );
	});
}
