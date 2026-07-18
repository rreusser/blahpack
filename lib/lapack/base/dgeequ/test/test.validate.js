/**
* Property-based validation for dgeequ, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general). dgeequ computes DETERMINISTIC row/column
* equilibration scale factors, so this is a `reconstruct`-grade DIRECT-oracle
* match (no estimator slack):
*
*   R(i) = 1 / max_j |A(i,j)|                     (row scale)
*   C(j) = 1 / max_i ( R(i)*|A(i,j)| )            (col scale of the row-scaled A)
*   rowcnd = min_i(rowmax) / max_i(rowmax) = min(R)/max(R)
*   colcnd = min_j(colmax) / max_j(colmax) = min(C)/max(C)
*   amax   = max |A(i,j)|
*
* (|.| is Math.abs for the real routine.) We recompute all outputs with the
* direct formulas over the full logical A0 and assert per-element agreement, plus
* the defining EQUILIBRATION property: diag(R)*A has unit max in every row, and
* diag(R)*A*diag(C) has unit max in every column.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgeequ from './../lib/ndarray.js';

const sc = S.real; // d-routine


// HELPERS //

// Element magnitude in the routine's convention: |A(i,j)| = Math.abs for real.
function elemAbs( v ) {
	return Math.abs( v );
}

// Direct oracle for the scale factors + summary scalars over a logical A0.
function oracle( A0, M, N ) {
	const rowmax = new Array( M ).fill( 0.0 );
	const colmax = new Array( N ).fill( 0.0 );
	const Rexp = new Array( M );
	const Cexp = new Array( N );
	let amax = 0.0;
	let av, i, j;

	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			av = elemAbs( A0.get( i, j ) );
			if ( av > rowmax[ i ] ) {
				rowmax[ i ] = av;
			}
		}
		if ( rowmax[ i ] > amax ) {
			amax = rowmax[ i ];
		}
		Rexp[ i ] = 1.0 / rowmax[ i ];
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			av = elemAbs( A0.get( i, j ) ) * Rexp[ i ];
			if ( av > colmax[ j ] ) {
				colmax[ j ] = av;
			}
		}
		Cexp[ j ] = 1.0 / colmax[ j ];
	}
	return {
		'Rexp': Rexp,
		'Cexp': Cexp,
		'amax': amax,
		'rowcnd': Math.min.apply( null, rowmax ) / Math.max.apply( null, rowmax ),
		'colcnd': Math.min.apply( null, colmax ) / Math.max.apply( null, colmax )
	};
}


// STEP 2-3-5: DIRECT-oracle PROPERTY over a sweep of (M,N) incl. rectangular. //

test( 'dgeequ: scale factors == direct oracle + equilibration (M x N)', function t() {
	SIZES_SMALL.forEach( function eachM( M ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( M, N );
		});
	});
});

function runProperty( M, N ) {
	const rng = new RNG( 0x100 + ( M * 101 ) + N ); // reproducible; log on failure
	const A0 = logical.general( sc, rng, M, N );
	const exp = oracle( A0, M, N );
	const TIGHT = schemes.dense.layouts()[ 0 ];
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );

	const R = sc.alloc( M ); // poisoned (NaN) -> unwritten slot trips assertScaled
	const C = sc.alloc( N );
	const res = dgeequ( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], R, 1, 0, C, 1, 0 );

	const t = check.tol( Math.max( M, N ), 50 );
	const label = 'dgeequ M=' + M + ' N=' + N;

	checked( 'dgeequ', 'property', function run() {
		let mx, i, j;
		if ( res.info !== 0 ) {
			throw new Error( label + ': info=' + res.info + ' (expected 0)' );
		}
		// Per-element scale factors vs oracle:
		for ( i = 0; i < M; i++ ) {
			check.assertScaled( Math.abs( R[ i ] - exp.Rexp[ i ] ), Math.abs( exp.Rexp[ i ] ), t, label + ' R[' + i + ']' );
		}
		for ( j = 0; j < N; j++ ) {
			check.assertScaled( Math.abs( C[ j ] - exp.Cexp[ j ] ), Math.abs( exp.Cexp[ j ] ), t, label + ' C[' + j + ']' );
		}
		// Summary scalars vs oracle:
		check.assertScaled( Math.abs( res.amax - exp.amax ), Math.abs( exp.amax ), t, label + ' amax' );
		check.assertScaled( Math.abs( res.rowcnd - exp.rowcnd ), Math.abs( exp.rowcnd ), t, label + ' rowcnd' );
		check.assertScaled( Math.abs( res.colcnd - exp.colcnd ), Math.abs( exp.colcnd ), t, label + ' colcnd' );

		// Equilibration: each row of diag(R)*A has unit max:
		for ( i = 0; i < M; i++ ) {
			mx = 0.0;
			for ( j = 0; j < N; j++ ) {
				mx = Math.max( mx, elemAbs( A0.get( i, j ) ) * R[ i ] );
			}
			check.assertScaled( Math.abs( mx - 1.0 ), 1.0, t, label + ' row-equilibration[' + i + ']' );
		}
		// Equilibration: each column of diag(R)*A*diag(C) has unit max:
		for ( j = 0; j < N; j++ ) {
			mx = 0.0;
			for ( i = 0; i < M; i++ ) {
				mx = Math.max( mx, elemAbs( A0.get( i, j ) ) * R[ i ] * C[ j ] );
			}
			check.assertScaled( Math.abs( mx - 1.0 ), 1.0, t, label + ' col-equilibration[' + j + ']' );
		}
	} );
}


// STEP 4: LAYOUT INVARIANCE (bit-exact across all dense layouts). //

// dgeequ only max-scans A(i,j) by value and divides; the max value and the 1/x
// are independent of iteration order and physical storage, so the outputs are
// bit-exact across ALL 7 layouts (col & row, incl. negative strides).
test( 'dgeequ: bit-exact across all storage layouts', function t() {
	const M = 7;
	const N = 5; // rectangular
	const rng = new RNG( 0x100 + ( M * 101 ) + N );
	const A0 = logical.general( sc, rng, M, N );

	checked( 'dgeequ', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.layouts(), function build( layout ) {
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const R = sc.alloc( M );
			const C = sc.alloc( N );
			const res = dgeequ( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], R, 1, 0, C, 1, 0 );
			const out = [];
			let i;
			for ( i = 0; i < M; i++ ) {
				out.push( R[ i ] );
			}
			for ( i = 0; i < N; i++ ) {
				out.push( C[ i ] );
			}
			out.push( res.rowcnd, res.colcnd, res.amax );
			return out;
		}, { 'label': 'dgeequ layout invariance' } );
	} );
});
