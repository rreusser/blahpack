/**
* Property-based validation for zgbcon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gb` -> GENERAL BANDED
* (schemes.banded with kl/ku, logical.banded); `con` (condition-number ESTIMATOR
* from an LU factor) -> PROPERTY: zgbcon returns `rcond ≈ 1/κ` where κ = ‖A‖·‖A⁻¹‖
* in the chosen norm. It is a Hager/Higham estimate (a lower bound on ‖A⁻¹‖, hence
* an upper bound on true_rcond), guaranteed within a factor ~N and usually tight.
*
* TRUE value INDEPENDENTLY: anorm = exact 1-/inf-norm of the ORIGINAL full band
* matrix A0; ‖A0⁻¹‖ from A0⁻¹ obtained by solving A0·X = I with the already-
* validated zgbsv, independent of zgbcon's zlacn2/zlatbs estimator path.
*
* NOTE: unlike the real dgbcon (Float64 WORK[3N] + integer IWORK[N]), zgbcon's
* workspace is a Complex128Array WORK[2N] plus a REAL RWORK (Float64Array, N).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, norms, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgbcon from './../lib/ndarray.js';
import zgbtrf from '../../zgbtrf/lib/ndarray.js';
import zgbsv from '../../zgbsv/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const NS = [ 2, 3, 5, 8, 16, 17, 33 ];
const NORMS = [
	{ 'api': 'one-norm', 'fn': norms.oneNorm },
	{ 'api': 'inf-norm', 'fn': norms.infNorm }
];
const FACTOR = 3;

const BANDED_POS = schemes.banded.layouts().filter( function pos( L ) {
	return L.sgn1 !== -1;
});
const TIGHT_BANDED = BANDED_POS[ 0 ];
const TIGHT_DENSE = schemes.dense.layouts()[ 0 ];

function bands( N ) {
	const hi = Math.max( 0, N - 1 );
	const raw = [ [ 1, 1 ], [ 2, 3 ], [ 0, 2 ] ];
	const seen = {};
	const out = [];
	raw.forEach( function each( p ) {
		const kl = Math.min( p[ 0 ], hi );
		const ku = Math.min( p[ 1 ], hi );
		const key = kl + ':' + ku;
		if ( !seen[ key ] ) {
			seen[ key ] = true;
			out.push( [ kl, ku ] );
		}
	});
	return out;
}

function identity( n ) {
	const M = new LogicalMatrix( sc, n, n ); // inits to sc.zero
	let i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

function readFull( R, rows, cols ) {
	const M = new LogicalMatrix( sc, rows, cols );
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			M.set( i, j, R.read( i, j ) );
		}
	}
	return M;
}

// INDEPENDENT true inverse: solve A0·X = I with zgbsv (X = A0⁻¹).
function bandedInverse( A0, N, kl, ku ) {
	const Ar = schemes.banded.realize( sc, A0.copy(), { 'kl': kl, 'ku': ku, 'luFill': true }, TIGHT_BANDED );
	const Br = schemes.dense.realize( sc, identity( N ), { 'part': 'full' }, TIGHT_DENSE );
	const ipiv = new Int32Array( N );
	zgbsv( N, kl, ku, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	return readFull( Br, N, N );
}

test( 'zgbcon: rcond ≈ 1/κ vs independent truth (norm x N x band)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		NS.forEach( function eachN( N ) {
			bands( N ).forEach( function eachBand( b ) {
				runProperty( nm, N, b[ 0 ], b[ 1 ] );
			});
		});
	});
});

function runProperty( nm, N, kl, ku ) {
	const rng = new RNG( 0x4000 + ( N * 100 ) + ( kl * 10 ) + ku );
	const A0 = logical.banded( sc, rng, N, N, kl, ku );
	const anorm = nm.fn( sc, A0 );

	const Af = schemes.banded.realize( sc, A0.copy(), { 'kl': kl, 'ku': ku, 'luFill': true }, TIGHT_BANDED );
	const ipiv = new Int32Array( N );
	zgbtrf( N, N, kl, ku, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );

	const rcond = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );
	const info = zgbcon( nm.api, N, kl, ku, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );

	const Ainv = bandedInverse( A0, N, kl, ku );
	const invnorm = nm.fn( sc, Ainv );
	const trueRcond = 1.0 / ( anorm * invnorm );

	const label = 'zgbcon ' + nm.api + ' N=' + N + ' kl=' + kl + ' ku=' + ku;
	checked( 'zgbcon', 'property', function run() {
		if ( info !== 0 ) {
			throw new Error( label + ': info=' + info + ' (expected 0)' );
		}
		const r = rcond[ 0 ];
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( label + ': rcond=' + r + ' not in (0,1]' );
		}
		if ( !( r <= FACTOR * trueRcond && trueRcond <= FACTOR * r ) ) {
			throw new Error( label + ': rcond=' + r.toExponential( 4 ) + ' disagrees with true_rcond=' + trueRcond.toExponential( 4 ) + ' beyond factor ' + FACTOR + ' (ratio ' + ( r / trueRcond ).toExponential( 3 ) + ')' );
		}
	} );
}

// Step 4: layout-invariance. Pre-factor ONCE, read the fixed factor band, re-realize
// at every positive-sgn1 banded layout and run only zgbcon (fixed anorm). No pivot
// search of its own; inner zaxpy/zdotc/zlatbs read AB(i,j) by value in a fixed
// arithmetic order -> bit-exact across the whole positive-sgn1 banded family. The
// factor is a plain banded matrix (kl, ku_f=kl+ku); realized {kl, ku:kl+ku} it
// reproduces byte-identical AB storage (ldab=2*kl+ku+1, bandrow=kl+ku+i-j).
function readFactorBand( Ar, N, kl, ku ) {
	const kuF = kl + ku;
	const F = new LogicalMatrix( sc, N, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - kuF ); i <= Math.min( N - 1, j + kl ); i++ ) {
			F.set( i, j, Ar.read( i, j ) );
		}
	}
	return F;
}

test( 'zgbcon: bit-exact across positive-sgn1 banded layouts (estimate isolated from factor)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		runInvariance( nm );
	});
});

function runInvariance( nm ) {
	const N = 9;
	const kl = 2;
	const ku = 3;
	const kuF = kl + ku;
	const SEED = 0x4000 + N;
	const rng = new RNG( SEED );
	const A0 = logical.banded( sc, rng, N, N, kl, ku );
	const anorm = nm.fn( sc, A0 );

	const Af = schemes.banded.realize( sc, A0.copy(), { 'kl': kl, 'ku': ku, 'luFill': true }, TIGHT_BANDED );
	const ipiv = new Int32Array( N );
	zgbtrf( N, N, kl, ku, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
	const Fac = readFactorBand( Af, N, kl, ku );

	checked( 'zgbcon', 'layout-invariance', function run() {
		layoutInvariant( BANDED_POS, function build( layout ) {
			const Ar = schemes.banded.realize( sc, Fac, { 'kl': kl, 'ku': kuF }, layout );
			const rcond = new Float64Array( 1 );
			const WORK = new Complex128Array( 2 * N );
			const RWORK = new Float64Array( N );
			zgbcon( nm.api, N, kl, ku, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'zgbcon ' + nm.api + ' layout invariance' } );
	} );
}
