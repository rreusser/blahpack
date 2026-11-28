/**
* Property-based validation for dsytrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense
* (schemes.dense, logical.symmetric — dsytrf is COMPLEX-SYMMETRIC, so the real
* analogue is a plain symmetric matrix, NOT Hermitian); `trf` (Bunch-Kaufman
* L*D*L^T / U*D*U^T factorization with 1x1 / 2x2 block pivots).
*
* The L*D*L^T reconstruction with block pivots is messy to assemble, so the
* factor is certified via a FACTOR+SOLVE RESIDUAL against an INDEPENDENT oracle
* (the ORIGINAL symmetric matrix A0): factor A0 with dsytrf, solve A0*X = B0 with
* the sibling dsytrs, and assert `‖A0*X − B0‖` is small per RHS column. A wrong
* factorization cannot pass this — the recovered X would not reproduce B0 through
* A0 — so the residual certifies the dsytrf/dsytrs pair together.
*/

import Float64Array from '@stdlib/array/float64/lib/index.js';
import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../test/harness/index.js';
import { checked } from '../../../../test/harness/ledger.js';
import { poisonedWork } from '../../../../test/harness/workspace.js';
import dsytrf from './../lib/strided.js';
import dsytrs from '../../dsytrs/lib/strided.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];

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

// Read the factored triangle (the dsytrf output) back into a full LogicalMatrix
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

// Steps 2-3-5: factor+solve residual over uplo x N x nrhs x every pivot-valid
// storage layout. SIZES_SMALL spans the unblocked path and the blocked path
// (N=70 exceeds the reference's NB = ILAENV( 1 ) = 64). Sweeping ALL pivotLayouts (col AND row order, padded
// leading dims, gaps, negative column stride) at backward-error tolerance is what
// certifies cross-storage-order addressing, since bit-exactness across orders is
// NOT expected (dsytrf's optimized inner dgemv/dger reorder on a storage flip;
// see the bit-exact test below). Verifies A0*X = B0 per RHS column against the
// ORIGINAL symmetric matrix.
test( 'dsytrf: factor+solve residual against original A0 (uplo x N x nrhs x layout)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.concat( [ 70 ] ).forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				schemes.dense.pivotLayouts().forEach( function eachLayout( layout ) {
					runResidual( uplo, N, nrhs, layout );
				});
			});
		});
	});
});

function runResidual( uplo, N, nrhs, layout ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.symmetric( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	const ipiv = new Int32Array( N );

	dsytrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, new Float64Array( Math.max( 1, N * 64 ) ), 1, 0 );
	dsytrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'dsytrf', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dsytrf '+uplo+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});

	// Structural self-consistency of the pivots: every 0-based 1x1 pivot index is
	// a valid row, and every 2x2 pivot (~kp) resolves to a valid row; 2x2 blocks
	// come in the adjacent pair the convention requires.
	checked( 'dsytrf', 'structural', function run() {
		assertPivotsConsistent( ipiv, N, uplo );
	});
}

// Assert IPIV obeys the dsytrf/dsytf2 convention: 1x1 pivots (>=0) index a valid
// row; a 2x2 pivot is encoded on BOTH members of an adjacent pair as the same
// negative value ~kp with kp in [0,N).
function assertPivotsConsistent( ipiv, N, uplo ) {
	let kp, k;
	if ( uplo === 'upper' ) {
		k = N - 1;
		while ( k >= 0 ) {
			if ( ipiv[ k ] >= 0 ) {
				if ( ipiv[ k ] >= N ) {
					throw new Error( 'dsytrf upper: 1x1 pivot index '+ipiv[ k ]+' out of range at k='+k );
				}
				k -= 1;
			} else {
				kp = ~ipiv[ k ];
				if ( k < 1 || ipiv[ k - 1 ] !== ipiv[ k ] || kp < 0 || kp >= N ) {
					throw new Error( 'dsytrf upper: malformed 2x2 pivot at k='+k+' (ipiv='+ipiv[ k ]+', ipiv[k-1]='+ipiv[ k - 1 ]+')' );
				}
				k -= 2;
			}
		}
	} else {
		k = 0;
		while ( k < N ) {
			if ( ipiv[ k ] >= 0 ) {
				if ( ipiv[ k ] >= N ) {
					throw new Error( 'dsytrf lower: 1x1 pivot index '+ipiv[ k ]+' out of range at k='+k );
				}
				k += 1;
			} else {
				kp = ~ipiv[ k ];
				if ( k > N - 2 || ipiv[ k + 1 ] !== ipiv[ k ] || kp < 0 || kp >= N ) {
					throw new Error( 'dsytrf lower: malformed 2x2 pivot at k='+k+' (ipiv='+ipiv[ k ]+', ipiv[k+1]='+ipiv[ k + 1 ]+')' );
				}
				k += 2;
			}
		}
	}
}

// Step 4: layout-invariance fuzz on the FACTOR's own addressing. dsytrf does an
// idamax pivot search over a column, so a negative first-dimension (row) stride
// is out of contract (see LEARNINGS getrf/getf2 family). It also bottoms out in
// the reference BLAS unit-stride-fast-path Level-2 kernels (dgemv/dger), which
// reorder the summation not only on a col<->row flip but on stride sign/gap
// within a single order (see the dpotri/dpptri LEARNINGS entry). So bit-exactness
// is asserted only across a PURE-ADDRESSING family — tight col-major, g=1,
// positive strides, varying ONLY base offset, leading pad, and leading-dimension
// padding — which cannot change arithmetic order; any residual diff is a real
// offset/leading-dim addressing bug. Cross-order/sign/gap correctness is covered
// by the residual sweep over all pivotLayouts above. Records L3 honestly.
const PURE_LAYOUTS = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 }
];

test( 'dsytrf: factor bit-exact across pure-addressing layouts', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const n = 12;
	const SEED = 0xF00D;
	checked( 'dsytrf', 'layout-invariance', function run() {
		layoutInvariant( PURE_LAYOUTS, function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A = logical.symmetric( sc, rng, n );
			const R = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
			const ipiv = new Int32Array( n );
			dsytrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, new Float64Array( Math.max( 1, n * 64 ) ), 1, 0 );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'dsytrf '+uplo+' factor layout invariance' } );
	});
}


// Step 4c: CALLER-OWNED WORK. As in the reference, base.js shrinks NB to fit the
// caller's WORK (LDWORK = N) and uses unblocked code throughout once NB < NBMIN = max( 2, ILAENV( 2 ) ) = 8.
// On the blocked-size N=70, sweep WORK lengths that reach every branch — full NB,
// a reduced NB that does not divide N, NB = NBMIN, NB < NBMIN, and the advertised
// minimum of 1 — with a POISONED WORK at a nonzero offset.
// The factor+solve residual must hold for each (a NaN leak from reading
// unwritten or past-the-end WORK would break it).
test( 'dsytrf: caller WORK of any length >= 1 (reduced NB, NBMIN fallback), offset poisoned WORK (Step 4c)', function t() {
	const N = 70;
	const nrhs = 2;
	const sw = 1; // WORK is opaque scratch: only its offset (sub-allocation) is meaningful
	const ow = 3;
	[ 64, 9, 8, 7, 1, 0 ].forEach( function eachCols( cols ) {
		UPLO.forEach( function eachUplo( uplo ) {
			const len = Math.max( 1, cols * N );
			const label = 'dsytrf ' + uplo + ' N=' + N + ' WORK=' + len + ' (stride ' + sw + ', offset ' + ow + ')';
			const rng = new RNG( 0x4C00 + cols );
			const A0 = logical.symmetric( sc, rng, N );
			const B0 = logical.general( sc, rng, N, nrhs );
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, null );
			const ipiv = new Int32Array( N );
			const W = poisonedWork( sc, ow + ( len * sw ) );
			dsytrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, W, sw, ow );
			dsytrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			checked( 'dsytrf', 'workspace', function run() {
				let j;
				for ( j = 0; j < nrhs; j++ ) {
					check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
						'trans': 'n',
						'factor': 100,
						'label': label + ' col=' + j
					});
				}
			});
		});
	});
});


// REGRESSION (ticket 0049): NB and NBMIN come from ILAENV with the reference's
// arguments. The unblocked kernel (dsytf2) uses no workspace, so a poisoned WORK
// left all-NaN shows that the factorization took the unblocked path, as the
// reference does at these sizes; the former constants (NB = 32, NBMIN = 2) took
// the blocked path there.
function assertUnblocked( N, len ) {
	UPLO.forEach( function eachUplo( uplo ) {
		const label = 'dsytrf ' + uplo + ' N=' + N + ' WORK=' + len;
		const rng = new RNG( 0x4900 + N );
		const A0 = logical.symmetric( sc, rng, N );
		const B0 = logical.general( sc, rng, N, 1 );
		const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
		const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, null );
		const ipiv = new Int32Array( N );
		const W = poisonedWork( sc, len );
		let w, i;
		dsytrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, W, 1, 0 );
		dsytrs( uplo, N, 1, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
		check.assertResidual( sc, A0, readCol( Br, N, 0 ), logicalCol( B0, N, 0 ), {
			'trans': 'n',
			'factor': 100,
			'label': label
		});
		w = W;
		for ( i = 0; i < w.length; i++ ) {
			if ( !Number.isNaN( w[ i ] ) ) {
				throw new Error( label + ': WORK[ ' + i + ' ] was written (blocked path)' );
			}
		}
	});
}

test( 'dsytrf: at N=50, between the former NB (32) and ILAENV\'s NB (64), the optimal WORK (N*64) takes the unblocked path, as in the reference (WORK untouched)', function t() {
	assertUnblocked( 50, 50 * 64 );
});

test( 'dsytrf: at N=70, a WORK of N*7 (NB = 7 < NBMIN = max( 2, ILAENV( 2 ) ) = 8) takes the unblocked path, as in the reference (WORK untouched)', function t() {
	assertUnblocked( 70, 70 * 7 );
});
