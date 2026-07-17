/**
* Property-based validation for zpoequ, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `po` -> Hermitian positive
* definite (schemes.dense, logical.positiveDefinite). zpoequ computes
* DETERMINISTIC symmetric diagonal equilibration from the REAL PART of the
* DIAGONAL only, so this is a `reconstruct`-grade DIRECT-oracle match:
*
*   S(i)  = 1 / sqrt( real(A(i,i)) )
*   scond = sqrt(min_i real(A(i,i))) / sqrt(max_i real(A(i,i)))
*   amax  = max_i real(A(i,i))
*
* We recompute all outputs directly from the (real) diagonal of the full logical
* A0 and assert per-element agreement, plus the defining EQUILIBRATION property:
* the diagonal of diag(S)*A*diag(S), i.e. S(i)^2 * real(A(i,i)), is exactly 1.
* Scale factors S are REAL (Float64Array) even for complex A.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpoequ from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var real = S.real; // S output is a real Float64Array


// HELPERS //

// Diagonal value in the routine's convention: real part of A(i,i).
function diagVal( v ) {
	return v.re;
}

// Direct oracle for the scale factors + summary scalars over a logical A0.
function oracle( A0, N ) {
	var Sexp = new Array( N );
	var diag = new Array( N );
	var smin;
	var amax;
	var d;
	var i;

	for ( i = 0; i < N; i++ ) {
		d = diagVal( A0.get( i, i ) );
		diag[ i ] = d;
		Sexp[ i ] = 1.0 / Math.sqrt( d );
	}
	smin = Math.min.apply( null, diag );
	amax = Math.max.apply( null, diag );
	return {
		'Sexp': Sexp,
		'diag': diag,
		'amax': amax,
		'scond': Math.sqrt( smin ) / Math.sqrt( amax )
	};
}


// STEP 2-3-5: DIRECT-oracle PROPERTY over a sweep of N. //

test( 'zpoequ: scale factors == direct oracle + unit-diagonal equilibration (N)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		runProperty( N );
	});
});

function runProperty( N ) {
	var rng = new RNG( 0x100 + N ); // reproducible; log on failure
	var A0 = logical.positiveDefinite( sc, rng, N );
	var exp = oracle( A0, N );
	var TIGHT = schemes.dense.layouts()[ 0 ];
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );

	var s = real.alloc( N ); // poisoned (NaN) -> unwritten slot trips assertScaled
	var res = zpoequ( N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], s, 1, 0 );

	var t = check.tol( N, 50 );
	var label = 'zpoequ N=' + N;

	checked( 'zpoequ', 'property', function run() {
		var i;
		if ( res.info !== 0 ) {
			throw new Error( label + ': info=' + res.info + ' (expected 0)' );
		}
		// Per-element scale factors vs oracle:
		for ( i = 0; i < N; i++ ) {
			check.assertScaled( Math.abs( s[ i ] - exp.Sexp[ i ] ), Math.abs( exp.Sexp[ i ] ), t, label + ' S[' + i + ']' );
		}
		// Summary scalars vs oracle:
		check.assertScaled( Math.abs( res.amax - exp.amax ), Math.abs( exp.amax ), t, label + ' amax' );
		check.assertScaled( Math.abs( res.scond - exp.scond ), Math.abs( exp.scond ), t, label + ' scond' );

		// Equilibration: diag of diag(S)*A*diag(S) is unit -> S(i)^2 * re(A(i,i)) = 1:
		for ( i = 0; i < N; i++ ) {
			check.assertScaled( Math.abs( ( s[ i ] * s[ i ] * exp.diag[ i ] ) - 1.0 ), 1.0, t, label + ' equilibration[' + i + ']' );
		}
	} );
}


// STEP 4: LAYOUT INVARIANCE (bit-exact across all dense layouts). //

// zpoequ only reads real(A(i,i)) by value, min/max-scans it, and computes
// 1/sqrt; none of this depends on iteration order or physical storage, so the
// outputs are bit-exact across ALL 7 layouts (col & row, incl. negative strides).
test( 'zpoequ: bit-exact across all storage layouts', function t() {
	var N = 9;
	var rng = new RNG( 0x100 + N );
	var A0 = logical.positiveDefinite( sc, rng, N );

	checked( 'zpoequ', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.layouts(), function build( layout ) {
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var s = real.alloc( N );
			var res = zpoequ( N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], s, 1, 0 );
			var out = [];
			var i;
			for ( i = 0; i < N; i++ ) {
				out.push( s[ i ] );
			}
			out.push( res.scond, res.amax );
			return out;
		}, { 'label': 'zpoequ layout invariance' } );
	} );
});
