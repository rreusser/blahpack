/**
* Property-based validation for dsptrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sp` -> symmetric PACKED
* (schemes.packed, logical.symmetric — dsptrf is the packed analogue of the
* COMPLEX-SYMMETRIC family, so the real oracle is a plain symmetric matrix, NOT
* Hermitian); `trf` (Bunch-Kaufman P*L*D*L^T / U*D*U^T factorization with 1x1 /
* 2x2 block pivots and IPIV).
*
* The L*D*L^T reconstruction with block pivots is messy to assemble, so the
* factor is certified via a FACTOR+SOLVE RESIDUAL against an INDEPENDENT oracle
* (the ORIGINAL symmetric matrix A0): factor A0 with dsptrf, solve A0*X = B0 with
* the sibling dsptrs, and assert `‖A0*X − B0‖` is small per RHS column. A wrong
* factorization cannot pass this — the recovered X would not reproduce B0 through
* A0 — so the residual certifies the dsptrf/dsptrs pair together (recorded under
* BOTH names).
*
* Packed-stride note: dsptrf's pivot search calls `idamax` over the packed
* column, which faithfully returns -1 for `strideAP <= 0` (reference BLAS
* `INCX<=0 -> no index`; see LEARNINGS getrf/getf2 + zsytrf entries). A negative
* packed stride is therefore OUT OF CONTRACT for the factor, so the residual
* sweep uses only POSITIVE packed strides (1,2,3) — which still certifies the
* non-unit packed-stride addressing that bit `zpptri` (LEARNINGS storage-mapping
* class). The negative-stride packed solve is isolated in the dsptrs sibling
* validate (the solve has no pivot search).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsptrf from './../lib/ndarray.js';
import dsptrs from '../../dsptrs/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];

// dsptrf's pivot search (idamax) requires a positive packed stride, so the
// factor+solve residual sweeps only positive packed layouts (stride 1,2,3).
const POSITIVE_PACKED = schemes.packed.layouts().filter( function positive( L ) {
	return L.stride > 0;
});

// Pure-addressing packed family for factor bit-exactness: UNIT stride, varying
// ONLY the base offset (lead/tail). Changing these cannot reorder any arithmetic
// (no fast-path switch, no pivot-tie flip), so a correct factor is bit-exact
// across them; any diff is a real offset addressing bug. Non-unit / negative
// packed strides are NOT bit-exact for a Bunch-Kaufman factor (a last-ULP
// reorder can flip a discrete pivot decision — see the zsytrf/zhetrf LEARNINGS
// entries), so cross-stride correctness is certified by the residual instead.
const PURE_PACKED = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 5, 'tail': 1 }
];

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

// Read the factored triangle (the dsptrf output) back into a full LogicalMatrix
// (opposite triangle zeroed) for bit-exact layout comparison.
function readTri( R, n, uplo ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
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
// against the ORIGINAL symmetric matrix.
test( 'dsptrf: factor+solve residual against original A0 (uplo x N x nrhs x positive packed layout)', function t() {
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
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.symmetric( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	const Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	const ipiv = new Int32Array( N );

	dsptrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0 );
	dsptrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	// The residual certifies the dsptrf/dsptrs PAIR; record under both names.
	function residual() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dsptrf '+uplo+' N='+N+' nrhs='+nrhs+' strideAP='+Ar.args[ 0 ]+' col='+j
			});
		}
	}
	checked( 'dsptrf', 'residual', residual );
	checked( 'dsptrs', 'residual', residual );

	// Structural self-consistency of the pivots: every 0-based 1x1 pivot index is
	// a valid row, and every 2x2 pivot (~kp) resolves to a valid row; 2x2 blocks
	// come in the adjacent pair the convention requires.
	checked( 'dsptrf', 'structural', function run() {
		assertPivotsConsistent( ipiv, N, uplo );
	});
}

// Assert IPIV obeys the dsptrf/dsptf2 convention: 1x1 pivots (>=0) index a valid
// row; a 2x2 pivot is encoded on BOTH members of an adjacent pair as the same
// negative value ~kp with kp in [0,N).
function assertPivotsConsistent( ipiv, N, uplo ) {
	let kp, k;
	if ( uplo === 'upper' ) {
		k = N - 1;
		while ( k >= 0 ) {
			if ( ipiv[ k ] >= 0 ) {
				if ( ipiv[ k ] >= N ) {
					throw new Error( 'dsptrf upper: 1x1 pivot index '+ipiv[ k ]+' out of range at k='+k );
				}
				k -= 1;
			} else {
				kp = ~ipiv[ k ];
				if ( k < 1 || ipiv[ k - 1 ] !== ipiv[ k ] || kp < 0 || kp >= N ) {
					throw new Error( 'dsptrf upper: malformed 2x2 pivot at k='+k+' (ipiv='+ipiv[ k ]+', ipiv[k-1]='+ipiv[ k - 1 ]+')' );
				}
				k -= 2;
			}
		}
	} else {
		k = 0;
		while ( k < N ) {
			if ( ipiv[ k ] >= 0 ) {
				if ( ipiv[ k ] >= N ) {
					throw new Error( 'dsptrf lower: 1x1 pivot index '+ipiv[ k ]+' out of range at k='+k );
				}
				k += 1;
			} else {
				kp = ~ipiv[ k ];
				if ( k > N - 2 || ipiv[ k + 1 ] !== ipiv[ k ] || kp < 0 || kp >= N ) {
					throw new Error( 'dsptrf lower: malformed 2x2 pivot at k='+k+' (ipiv='+ipiv[ k ]+', ipiv[k+1]='+ipiv[ k + 1 ]+')' );
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
test( 'dsptrf: factor bit-exact across pure-addressing packed layouts', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const n = 12;
	const SEED = 0xF00D;
	checked( 'dsptrf', 'layout-invariance', function run() {
		layoutInvariant( PURE_PACKED, function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A = logical.symmetric( sc, rng, n );
			const R = schemes.packed.realize( sc, A, { 'part': uplo }, layout );
			const ipiv = new Int32Array( n );
			dsptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0 );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'dsptrf '+uplo+' factor packed layout invariance' } );
	});
}
