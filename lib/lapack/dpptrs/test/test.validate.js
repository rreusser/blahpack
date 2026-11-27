/**
* Property-based validation for dpptrs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pp` -> SPD PACKED (schemes.packed,
* logical.positiveDefinite); `trs` (packed Cholesky solve, multiple RHS) ->
* RESIDUAL: the solve consumes a packed Cholesky factorization (produced here by
* the already-validated dpptrf), then we check `A0*X = B0` against the ORIGINAL,
* full symmetric matrix A0. The residual is independent of dpptrf's correctness.
* Only the referenced triangle (uplo) is realized; the opposite triangle stays
* poisoned, so a read of the wrong triangle trips a NaN. The property is swept
* over EVERY packed layout (incl. strideAP in {2,3,-1,-2}) to certify correctness
* across packed strides — the class of the zpptri/ztptri stride-mapping bug.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpptrs from './../lib/ndarray.js';
import dpptrf from '../../dpptrf/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];

// Read column j of the solution X out of physical B storage as an array of
// scalar values.
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

// Read the full N x nrhs solution back into a LogicalMatrix (for bit-exact
// layout comparison).
function readB( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Steps 2-3-5: residual property across uplo flags, a size sweep, nrhs, and
// EVERY packed layout for AP. Factor the referenced packed triangle with dpptrf,
// solve with dpptrs, then verify A0*X = B0 per RHS column against the ORIGINAL
// full symmetric matrix (trans 'n' — A is symmetric so op is identity). Sweeping
// non-unit / negative packed strides here is the NaN guard for the packed
// stride-mapping bug class (see test/harness/LEARNINGS.md).
test( 'dpptrs: packed Cholesky solve residual (uplo x N x nrhs x all packed layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				schemes.packed.layouts().forEach( function eachLayout( layout ) {
					runResidual( uplo, N, nrhs, layout );
				});
			});
		});
	});
});

function runResidual( uplo, N, nrhs, apLayout ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.positiveDefinite( sc, rng, N ); // full symmetric/SPD oracle
	const B0 = logical.general( sc, rng, N, nrhs );

	const Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );

	// Factor the referenced packed triangle in place, then solve in place (B<-X):
	dpptrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ] );
	dpptrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'dpptrs', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dpptrs '+uplo+' N='+N+' nrhs='+nrhs+' stride='+Ar.args[ 0 ]+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz — the solution must be bit-exact across packed
// AP layouts that share an arithmetic order. dpptrs = dtpsv forward+back solves
// whose real reference kernels special-case incx==1, so unit-stride and
// non-unit/negative packed strides choose different (equally valid) summation
// orders (~1 ULP; see the dpotri/dpptri LEARNINGS entry). Bit-equality is
// asserted within two pure-arithmetic-order families: stride==1 (variants 0,1)
// and stride!=1 (variants {2,3,-1,-2} — must AGREE with each other and be
// finite). Cross-order correctness is covered by the residual above. B is held
// at a fixed dense layout so only AP addressing varies.
const packedLayouts = schemes.packed.layouts();
const unitFam = packedLayouts.filter( function isUnit( L ) {
	return L.stride === 1;
});
const stridedFam = packedLayouts.filter( function isStrided( L ) {
	return L.stride !== 1;
});

test( 'dpptrs: bit-exact within packed arithmetic-order family (unit-stride / strided)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, unitFam, 'unit-stride' );
		runInvariance( uplo, stridedFam, 'strided(2,3,-1,-2)' );
	});
});

function runInvariance( uplo, variants, fam ) {
	const N = 9;
	const nrhs = 3;
	const SEED = 0xBEEF;
	checked( 'dpptrs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.positiveDefinite( sc, rng, N );
			const B0 = logical.general( sc, rng, N, nrhs );
			const Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
			dpptrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ] );
			dpptrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'dpptrs '+uplo+' layout invariance '+fam } );
	});
}
