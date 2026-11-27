/**
* Property-based validation for dsyr2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense
* (schemes.dense one triangle, logical.symmetric); rank-2 update
* `A := alpha*x*y**T + alpha*y*x**T + A` validated by direct residual against an
* independent oracle `A(i,j) += alpha*( x_i*y_j + y_i*x_j )` over the referenced
* (uplo) triangle only. The complementary triangle is left poisoned and never
* read back.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsyr2 from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

// Read ONLY the referenced (uplo) triangle back out of physical storage;
// unreferenced entries are filled with zero (kept out of the comparison).
function readTri( R, n, uplo ) {
	const G = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				G.set( i, j, R.read( i, j ) );
			} else {
				G.set( i, j, sc.zero );
			}
		}
	}
	return G;
}

// Independent oracle over the referenced triangle:
//   expected(i,j) = A0(i,j) + alpha*( x_i*y_j + y_i*x_j ).
function expected( A0, alpha, x, y, n, uplo ) {
	const E = new LogicalMatrix( sc, n, n );
	let upd, i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				upd = sc.add( sc.mul( x[ i ], y[ j ] ), sc.mul( y[ i ], x[ j ] ) );
				E.set( i, j, sc.add( A0.get( i, j ), sc.scale( upd, alpha ) ) );
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

// Steps 2-3-5: residual across the size sweep (incl. N=0,1) x both uplo, with a
// mix of alpha values including alpha=0 (quick-return path).
test( 'dsyr2: symmetric rank-2 update residual (size sweep x uplo, incl. alpha=0)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( N ) {
			const rng = new RNG( 0x100 + N ); // reproducible; log on failure
			const A0 = logical.symmetric( sc, rng, N );
			const x = values( rng, N );
			const y = values( rng, N );
			const alpha = ( N % 4 === 3 ) ? 0.0 : rng.normal();

			const R = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			const X = schemes.realizeVector( sc, x, { 'stride': 1 } );
			const Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
			dsyr2( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );

			const got = readTri( R, N, uplo );
			const exp = expected( A0, alpha, x, y, N, uplo );
			checked( 'dsyr2', 'residual', function run() {
				check.assertReconstruct( sc, got, exp, { 'label': 'dsyr2 '+uplo+' N='+N+' alpha='+alpha } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the updated triangle must be bit-exact across
// storage layouts (matrix AND strided/negative vectors).
test( 'dsyr2: bit-exact across storage layouts', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const N = 9;
		const SEED = 0xF00D;
		const aLayouts = schemes.dense.layouts();
		const vLayouts = schemes.vectorLayouts();
		checked( 'dsyr2', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A0 = logical.symmetric( sc, rng, N );
				const x = values( rng, N );
				const y = values( rng, N );
				const alpha = rng.normal();

				const R = schemes.dense.realize( sc, A0, { 'part': uplo }, aL );
				const vL = vLayouts[ idx % vLayouts.length ];
				const X = schemes.realizeVector( sc, x, vL );
				const Y = schemes.realizeVector( sc, y, vL );
				dsyr2( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readTri( R, N, uplo ) );
			}, { 'label': 'dsyr2 '+uplo+' layout invariance' } );
		});
	});
});
