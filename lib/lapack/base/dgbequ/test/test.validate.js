/**
* Property-based validation for dgbequ, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gb` -> general BANDED
* (schemes.banded, logical.banded). dgbequ computes DETERMINISTIC row/column
* equilibration scale factors over the band, so this is a `reconstruct`-grade
* DIRECT-oracle match (no estimator slack):
*
*   R(i) = 1 / max_j |A(i,j)|                     (row scale, band only)
*   C(j) = 1 / max_i ( R(i)*|A(i,j)| )            (col scale of the row-scaled A)
*   rowcnd = min_i(rowmax) / max_i(rowmax) = min(R)/max(R)
*   colcnd = min_j(colmax) / max_j(colmax) = min(C)/max(C)
*   amax   = max |A(i,j)|
*
* (|.| is Math.abs for the real routine.) Because logical.banded stores exact
* zero outside the band and |0| = 0 contributes nothing to any max, the direct
* oracle can iterate the full logical A0 unchanged from the dense (dgeequ) case.
* We recompute all outputs and assert per-element agreement, plus the defining
* EQUILIBRATION property: diag(R)*A has unit max in every (nonempty) row, and
* diag(R)*A*diag(C) has unit max in every column.
*
* Dimensions are constrained to |M-N| <= 1 so every row and column of the band
* has at least one referenced element (otherwise a zero rowmax/colmax makes the
* routine return info>0 -- a legitimate but uninteresting singular-scaling path).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgbequ from './../lib/ndarray.js';

var sc = S.real; // d-routine

var SIZES = [ 1, 2, 3, 5, 8, 16, 17, 33 ];
var BANDS = [ [ 1, 1 ], [ 2, 3 ] ]; // (kl, ku)


// HELPERS //

// Element magnitude in the routine's convention: |A(i,j)| = Math.abs for real.
function elemAbs( v ) {
	return Math.abs( v );
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


// STEP 2-3-5: DIRECT-oracle PROPERTY over a sweep of (M,N) x (kl,ku). //

test( 'dgbequ: scale factors == direct oracle + equilibration (M x N, band)', function t() {
	SIZES.forEach( function eachS( s ) {
		[ [ s, s ], [ s, s + 1 ], [ s + 1, s ] ].forEach( function eachMN( mn ) {
			BANDS.forEach( function eachB( b ) {
				runProperty( mn[ 0 ], mn[ 1 ], b[ 0 ], b[ 1 ] );
			});
		});
	});
});

function runProperty( M, N, kl, ku ) {
	var rng = new RNG( 0x100 + ( M * 101 ) + ( N * 7 ) + ( kl * 3 ) + ku );
	var A0 = logical.banded( sc, rng, M, N, kl, ku );
	var exp = oracle( A0, M, N );
	var TIGHT = schemes.banded.layouts()[ 0 ];
	var Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku }, TIGHT );

	var R = sc.alloc( M ); // poisoned (NaN) -> unwritten slot trips assertScaled
	var C = sc.alloc( N );
	var res = dgbequ( M, N, kl, ku, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], R, 1, 0, C, 1, 0 );

	var t = check.tol( Math.max( M, N ), 50 );
	var label = 'dgbequ M=' + M + ' N=' + N + ' kl=' + kl + ' ku=' + ku;

	checked( 'dgbequ', 'property', function run() {
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


// STEP 4: LAYOUT INVARIANCE (bit-exact across all band-array layouts). //

// dgbequ only max-scans |A(i,j)| over the band by value and divides; the max
// value and the 1/x are independent of iteration order and of the band array's
// physical storage, so the outputs are bit-exact across ALL 7 layouts (col &
// row, incl. negative strides) -- a single invariance family.
test( 'dgbequ: bit-exact across all storage layouts', function t() {
	var M = 8;
	var N = 7; // rectangular
	var kl = 2;
	var ku = 3;
	var rng = new RNG( 0x900 + ( M * 101 ) + N );
	var A0 = logical.banded( sc, rng, M, N, kl, ku );

	checked( 'dgbequ', 'layout-invariance', function run() {
		layoutInvariant( schemes.banded.layouts(), function build( layout ) {
			var Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku }, layout );
			var R = sc.alloc( M );
			var C = sc.alloc( N );
			var res = dgbequ( M, N, kl, ku, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], R, 1, 0, C, 1, 0 );
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
		}, { 'label': 'dgbequ layout invariance' } );
	} );
});
