/**
* Property-based validation for zhpr, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `hp` -> Hermitian PACKED, one
* triangle referenced (schemes.packed with part=uplo, logical.hermitian);
* Hermitian packed rank-1 update `A := alpha*x*x**H + A` (alpha REAL) validated
* by direct residual against an independent oracle
* `A(i,j) += alpha*x_i*conj(x_j)` over the referenced triangle only. The
* diagonal is forced real by the routine, which the conjugate-symmetric oracle
* reproduces exactly (mul(x_j, conj(x_j)) has zero imaginary part). Unreferenced
* slots stay poisoned and are never read.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhpr from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const CONJ = true; // A := alpha*x*x**H + A (conjugate the trailing factor)
const LogicalMatrix = logical.LogicalMatrix;

function isRef( uplo, i, j ) {
	return ( uplo === 'upper' ) ? ( i <= j ) : ( i >= j );
}

// Read back ONLY the referenced (uplo) triangle; non-referenced -> sc.zero.
function readTri( R, uplo, n ) {
	const G = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			G.set( i, j, isRef( uplo, i, j ) ? R.read( i, j ) : sc.zero );
		}
	}
	return G;
}

// Independent oracle over the referenced triangle only.
function expectedTri( A0, alpha, x, uplo, n ) {
	const E = new LogicalMatrix( sc, n, n );
	let xj, i, j;
	for ( j = 0; j < n; j++ ) {
		xj = CONJ ? sc.conj( x[ j ] ) : x[ j ];
		for ( i = 0; i < n; i++ ) {
			if ( isRef( uplo, i, j ) ) {
				E.set( i, j, sc.add( A0.get( i, j ), sc.scale( sc.mul( x[ i ], xj ), alpha ) ) );
			} else {
				E.set( i, j, sc.zero );
			}
		}
	}
	return E;
}

function values( rng, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		v.push( sc.random( rng ) );
	}
	return v;
}

const UPLOS = [ 'upper', 'lower' ];

// Steps 2-3-5: residual across the size sweep (incl. N=0,1 and alpha=0) x uplo.
test( 'zhpr: Hermitian packed rank-1 update residual (size + uplo sweep, incl. alpha=0)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( N ) {
			const rng = new RNG( 0x100 + N );
			const A0 = logical.hermitian( sc, rng, N );
			const x = values( rng, N );
			const alpha = ( N % 8 === 0 ) ? 0.0 : rng.normal(); // real; includes alpha=0

			const R = schemes.packed.realize( sc, A0, { 'part': uplo }, schemes.packed.layouts()[ 0 ] );
			const X = schemes.realizeVector( sc, x, { 'stride': 1 } );
			zhpr( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ] );

			const got = readTri( R, uplo, N );
			const exp = expectedTri( A0, alpha, x, uplo, N );
			checked( 'zhpr', 'residual', function run() {
				check.assertReconstruct( sc, got, exp, { 'label': 'zhpr uplo='+uplo+' N='+N } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — output bit-exact across storage layouts
// (packed triangle AND strided/negative vectors), for both uplo.
test( 'zhpr: bit-exact across storage layouts', function t() {
	const N = 9;
	const SEED = 0xF00D;
	const aLayouts = schemes.packed.layouts();
	const vLayouts = schemes.vectorLayouts();
	UPLOS.forEach( function eachUplo( uplo ) {
		checked( 'zhpr', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A0 = logical.hermitian( sc, rng, N );
				const x = values( rng, N );
				const alpha = rng.normal();

				const R = schemes.packed.realize( sc, A0, { 'part': uplo }, aL );
				const vL = vLayouts[ idx % vLayouts.length ];
				const X = schemes.realizeVector( sc, x, vL );
				zhpr( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ] );
				return check.flattenLogical( sc, readTri( R, uplo, N ) );
			}, { 'label': 'zhpr layout invariance uplo='+uplo } );
		});
	});
});
