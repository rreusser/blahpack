/**
* Property-based validation for zhptrs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `hp` -> HERMITIAN PACKED
* (schemes.packed, logical.hermitian — the mirror CONJUGATES and the diagonal is
* real); `trs` (packed Bunch-Kaufman solve, multiple RHS, consuming the
* P*L*D*L^H factor + IPIV from zhptrf).
*
* Strategy: the solve is certified by a FACTOR+SOLVE RESIDUAL against the
* ORIGINAL, full Hermitian matrix A0 (independent of zhptrf's internal
* correctness). Because zhptrs performs NO pivot search of its own (it consumes a
* FIXED factor + IPIV), it tolerates the FULL packed layout set — including the
* NEGATIVE packed strides that bit `zpptri` (LEARNINGS storage-mapping class). So
* the factor is computed ONCE (unit stride), then the fixed factor+IPIV is
* re-realized into EVERY packed layout and only zhptrs is re-run, isolating the
* solve's packed addressing. A NaN under any non-unit / negative packed stride
* would be a REAL bug (out-of-bounds read into poisoned storage).
*
* The factor source is zhptrf; its UPPER path was fixed on 2026-07-17 (a running
* interchange index KX was off by one, conjugating the wrong off-diagonal element
* — see test/harness/LEARNINGS.md "zhptrf UPPER path"). This suite asserts BOTH
* uplo pass, so it also guards against a regression of that fix.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhptrs from './../lib/ndarray.js';
import zhptrf from '../../zhptrf/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];

var ALL_PACKED = schemes.packed.layouts(); // stride 1,1,2,3,-1,-2 (incl negative)

// Arithmetic-order families for bit-exactness. The complex packed kernels here
// (zgeru/zgemv/zscal panels) do not have real-BLAS incx==1 fast paths, but keep
// the split for safety and parity with the real sibling: stride==1 vs stride!=1
// ({2,3,-1,-2}, which must AGREE and be finite). Cross-order correctness is the
// residual sweep below.
var unitFam = ALL_PACKED.filter( function isUnit( L ) {
	return L.stride === 1;
});
var stridedFam = ALL_PACKED.filter( function isStrided( L ) {
	return L.stride !== 1;
});

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

function readB( R, n, nrhs ) {
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

// Factor A0 ONCE at unit packed stride and read the factored triangle back into
// a LogicalMatrix F (opposite triangle zeroed). F + ipiv is the fixed
// P*L*D*L^H factorization re-realized into each packed layout for the isolated
// solve. Returns null on a rare singular draw.
function factorOnce( uplo, N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs );
	var A0 = logical.hermitian( sc, rng, N );
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, ALL_PACKED[ 0 ] );
	var ipiv = new Int32Array( N );
	var F = new LogicalMatrix( sc, N, N );
	var info;
	var i;
	var j;
	info = zhptrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0 );
	if ( info !== 0 ) {
		return null; // rare singular draw
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, Ar.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return { 'A0': A0, 'F': F, 'ipiv': ipiv };
}

// Solve with the fixed factor F+ipiv re-realized into packed layout `apLayout`;
// B held at a fixed tight dense layout. Returns the realized B (= X).
function solveAt( uplo, N, nrhs, fac, B0, apLayout ) {
	var Ar = schemes.packed.realize( sc, fac.F, { 'part': uplo }, apLayout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	zhptrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], fac.ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	return Br;
}

// Steps 2-3-5: solve residual over uplo x N x EVERY packed layout (incl negative
// strides). Factor once, then re-realize the fixed factor into each packed
// layout and solve; verify A0*X = B0 per RHS column against the ORIGINAL full
// Hermitian matrix. NaN under any non-unit/negative packed stride would trip the
// poisoned-storage guard (real bug). Records under both zhptrs, zhptrf. BOTH uplo
// must pass — upper was the path fixed on 2026-07-17.
test( 'zhptrs: packed Bunch-Kaufman solve residual (uplo x N x all packed layouts, isolated solve)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runResidual( uplo, N, 3 );
		});
	});
});

function runResidual( uplo, N, nrhs ) {
	var rng = new RNG( 0x777 + ( N * 10 ) + nrhs );
	var fac = factorOnce( uplo, N, nrhs );
	if ( fac === null ) {
		return; // rare singular draw — solve undefined
	}
	var B0 = logical.general( sc, rng, N, nrhs );
	ALL_PACKED.forEach( function eachLayout( apLayout ) {
		var Br = solveAt( uplo, N, nrhs, fac, B0, apLayout );
		function residual() {
			var j;
			for ( j = 0; j < nrhs; j++ ) {
				check.assertResidual( sc, fac.A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
					'trans': 'n',
					'factor': 100,
					'label': 'zhptrs '+uplo+' N='+N+' nrhs='+nrhs+' strideAP='+apLayout.stride+' col='+j
				});
			}
		}
		checked( 'zhptrs', 'residual', residual );
		checked( 'zhptrf', 'residual', residual );
	});
}

// Step 4: layout-invariance — the solution must be bit-exact across packed AP
// layouts that share an arithmetic order (unit vs strided families). B fixed, so
// only AP addressing varies. Factor once, re-realize into each variant, solve.
// Records L3 honestly for zhptrs (isolated packed solve).
test( 'zhptrs: bit-exact within packed arithmetic-order family (unit-stride / strided incl negative)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, unitFam, 'unit-stride' );
		runInvariance( uplo, stridedFam, 'strided(2,3,-1,-2)' );
	});
});

function runInvariance( uplo, variants, fam ) {
	var N = 9;
	var nrhs = 3;
	var rng = new RNG( 0xBEEF );
	var fac = factorOnce( uplo, N, nrhs );
	if ( fac === null ) {
		throw new Error( 'zhptrs invariance setup: zhptrf returned a singular factor' );
	}
	var B0 = logical.general( sc, rng, N, nrhs );
	checked( 'zhptrs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var Br = solveAt( uplo, N, nrhs, fac, B0, layout );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zhptrs '+uplo+' layout invariance '+fam } );
	});
}
