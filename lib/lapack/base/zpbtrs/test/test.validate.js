/**
* Property-based validation for zpbtrs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pb` -> HPD BANDED (schemes.banded
* with half-bandwidth kd, logical.positiveDefiniteBanded, a Hermitian PD band
* matrix); `trs` (solve given a Cholesky factor) -> residual property `A*X = B`
* per RHS column against an independent matvec/residual oracle on the FULL logical
* A0 (both triangles reconstructed by the oracle via Hermitian symmetry), sweeping
* uplo x N x kd x nrhs. The band factor is produced by zpbtrf.
*
* zpbtrs applies two ztbsv triangular band solves; neither reorders its reduction
* with storage strides, so the solution is bit-exact across ALL banded layouts
* (single family) for AB and ALL dense layouts for B. Negative band strides
* (layouts 4-6) exercise the band-row-step class that bit dpbtf2 (see
* LEARNINGS.md, dpbtf2 entry).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpbtrs from './../lib/ndarray.js';
import zpbtrf from '../../zpbtrf/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];
const NRHS = [ 1, 2, 3 ];

// Unique half-bandwidths in {0,1,2, N-1} clamped to [0, N-1] (diagonal-only
// through near-full band).
function bands( n ) {
	const hi = Math.max( 0, n - 1 );
	const out = [];
	[ 0, 1, 2, hi ].forEach( function each( k ) {
		const v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

// Read the solution matrix X (overwrites B) back into a LogicalMatrix.
function readSolution( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Steps 2-3-5: residual A*X = B over uplo x N x kd x nrhs (incl diagonal kd=0
// and near-full bands). The oracle multiplies against the FULL logical HPD band
// matrix A0 (both triangles), so it independently checks that zpbtrs solved the
// Hermitian system, not just the stored triangle.
test( 'zpbtrs: HPD-banded solve residual (uplo x N x kd x nrhs sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		NS.forEach( function eachN( N ) {
			bands( N ).forEach( function eachKd( kd ) {
				NRHS.forEach( function eachNrhs( nrhs ) {
					const rng = new RNG( 0x100 + ( N * 100 ) + ( kd * 10 ) + nrhs );
					const A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
					const B0 = logical.general( sc, rng, N, nrhs );
					const R = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, schemes.banded.layouts()[ 0 ] );
					const BR = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
					zpbtrf( uplo, N, kd, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
					zpbtrs( uplo, N, kd, nrhs, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], BR.data, BR.args[ 0 ], BR.args[ 1 ], BR.args[ 2 ] );
					const X = readSolution( BR, N, nrhs );
					checked( 'zpbtrs', 'residual', function run() {
						let j, i;
						for ( j = 0; j < nrhs; j++ ) {
							const xj = [];
							const bj = [];
							for ( i = 0; i < N; i++ ) {
								xj.push( X.get( i, j ) );
								bj.push( B0.get( i, j ) );
							}
							check.assertResidual( sc, A0, xj, bj, { 'trans': 'n', 'factor': 100, 'label': 'zpbtrs '+uplo+' N='+N+' kd='+kd+' nrhs='+nrhs+' col='+j } );
						}
					});
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. zpbtrf + zpbtrs (ztbsv) never reorder a
// reduction with storage strides, so changing only addressing must reproduce X
// BIT-FOR-BIT across ALL banded layouts for AB (incl negative strides — the
// dpbtf2 band-step class) and ALL dense layouts for B (single family; no col/row
// split needed).
test( 'zpbtrs: solution is bit-exact across storage layouts', function t() {
	const N = 11;
	const kd = 3;
	const nrhs = 2;
	const SEED = 0xF00D;
	const aLayouts = schemes.banded.layouts();
	const bLayouts = schemes.dense.layouts();
	UPLO.forEach( function eachUplo( uplo ) {
		checked( 'zpbtrs', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
				const B0 = logical.general( sc, rng, N, nrhs );
				const R = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, aL );
				const bL = bLayouts[ idx % bLayouts.length ];
				const BR = schemes.dense.realize( sc, B0, { 'part': 'full' }, bL );
				zpbtrf( uplo, N, kd, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				zpbtrs( uplo, N, kd, nrhs, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], BR.data, BR.args[ 0 ], BR.args[ 1 ], BR.args[ 2 ] );
				return check.flattenLogical( sc, readSolution( BR, N, nrhs ) );
			}, { 'label': 'zpbtrs '+uplo+' layout invariance' } );
		});
	});
});
