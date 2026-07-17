/**
* Property-based validation for zgeequ, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general). zgeequ computes DETERMINISTIC row/column
* equilibration scale factors using the CABS1 magnitude |re|+|im| (NOT hypot),
* so this is a `reconstruct`-grade DIRECT-oracle match:
*
*   R(i) = 1 / max_j cabs1(A(i,j))                (row scale)
*   C(j) = 1 / max_i ( R(i)*cabs1(A(i,j)) )       (col scale of the row-scaled A)
*   rowcnd = min(rowmax)/max(rowmax) = min(R)/max(R)
*   colcnd = min(colmax)/max(colmax) = min(C)/max(C)
*   amax   = max cabs1(A(i,j))
*
* We recompute all outputs with the direct formulas over the full logical A0 and
* assert per-element agreement, plus the defining EQUILIBRATION property (using
* cabs1): diag(R)*A has unit max in every row and diag(R)*A*diag(C) has unit max
* in every column. Scale factors R/C are REAL (Float64Array) even for complex A.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgeequ from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var real = S.real; // R/C outputs are real Float64Array


// HELPERS //

// Element magnitude in the routine's convention: CABS1 = |re| + |im|.
function elemAbs( v ) {
	return Math.abs( v.re ) + Math.abs( v.im );
}

// Direct oracle for the scale factors + summary scalars over a logical A0.
function oracle( A0, M, N ) {
	var rowmax = new Array( M ).fill( 0.0 );
	var colmax = new Array( N ).fill( 0.0 );
	var Rexp = new Array( M );
	var Cexp = new Array( N );
	var amax = 0.0;
	var av;
	var i;
	var j;

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

test( 'zgeequ: scale factors == direct oracle + equilibration (M x N)', function t() {
	SIZES_SMALL.forEach( function eachM( M ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( M, N );
		});
	});
});

function runProperty( M, N ) {
	var rng = new RNG( 0x100 + ( M * 101 ) + N ); // reproducible; log on failure
	var A0 = logical.general( sc, rng, M, N );
	var exp = oracle( A0, M, N );
	var TIGHT = schemes.dense.layouts()[ 0 ];
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );

	var R = real.alloc( M ); // poisoned (NaN) -> unwritten slot trips assertScaled
	var C = real.alloc( N );
	var res = zgeequ( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], R, 1, 0, C, 1, 0 );

	var t = check.tol( Math.max( M, N ), 50 );
	var label = 'zgeequ M=' + M + ' N=' + N;

	checked( 'zgeequ', 'property', function run() {
		var mx;
		var i;
		var j;
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

		// Equilibration: each row of diag(R)*A has unit max (cabs1):
		for ( i = 0; i < M; i++ ) {
			mx = 0.0;
			for ( j = 0; j < N; j++ ) {
				mx = Math.max( mx, elemAbs( A0.get( i, j ) ) * R[ i ] );
			}
			check.assertScaled( Math.abs( mx - 1.0 ), 1.0, t, label + ' row-equilibration[' + i + ']' );
		}
		// Equilibration: each column of diag(R)*A*diag(C) has unit max (cabs1):
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

// zgeequ only max-scans cabs1(A(i,j)) by value and divides; the max value and
// the 1/x are independent of iteration order and physical storage, so the
// outputs are bit-exact across ALL 7 layouts (col & row, incl. negative strides).
test( 'zgeequ: bit-exact across all storage layouts', function t() {
	var M = 7;
	var N = 5; // rectangular
	var rng = new RNG( 0x100 + ( M * 101 ) + N );
	var A0 = logical.general( sc, rng, M, N );

	checked( 'zgeequ', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.layouts(), function build( layout ) {
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var R = real.alloc( M );
			var C = real.alloc( N );
			var res = zgeequ( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], R, 1, 0, C, 1, 0 );
			var out = [];
			var i;
			for ( i = 0; i < M; i++ ) {
				out.push( R[ i ] );
			}
			for ( i = 0; i < N; i++ ) {
				out.push( C[ i ] );
			}
			out.push( res.rowcnd, res.colcnd, res.amax );
			return out;
		}, { 'label': 'zgeequ layout invariance' } );
	} );
});
