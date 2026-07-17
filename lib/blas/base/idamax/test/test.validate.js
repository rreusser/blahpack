/**
* Property-based validation for idamax, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 reduction over a pure
* vector; returns an integer INDEX. Property: idamax returns the 0-based index
* of the first element with maximum |x_i|, validated against an independent
* inline argmax oracle (exact integer equality).
*
* Contract note: the reference IDAMAX returns 0 (Fortran, 1-based) for
* `N < 1 OR INCX <= 0`. The 0-based JS port returns -1 for that "no index"
* case and does NOT offset-walk negative/zero strides. Mirrors the asum-family
* handling (see test/harness/LEARNINGS.md): the index is invariant across
* POSITIVE strides only, and the incx<=0 -> -1 contract is pinned separately.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, schemes, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import idamax from './../lib/ndarray.js';

var sc = S.real; // d-routine

// Independent oracle: 0-based index of the first element of maximum |x_i|.
function argmaxAbs( values ) {
	var best = -1;
	var bestv = -1.0;
	var v;
	var k;
	for ( k = 0; k < values.length; k++ ) {
		v = Math.abs( values[ k ] );
		if ( v > bestv ) {
			bestv = v;
			best = k;
		}
	}
	return best;
}

// Step 2: property across the size sweep (N >= 1) at stride 1, 2, 3. The
// LOGICAL index must be identical regardless of positive stride.
test( 'idamax: index of first max-|x| element (size + positive-stride sweep)', function t() {
	SIZES.forEach( function eachN( n ) {
		if ( n < 1 ) {
			return;
		}
		var rng = new RNG( 0x100 + n ); // reproducible; log on failure
		var values = [];
		var i;
		for ( i = 0; i < n; i++ ) {
			values.push( sc.random( rng ) );
		}
		var exp = argmaxAbs( values );
		[ 1, 2, 3 ].forEach( function eachStride( stride ) {
			var X = schemes.realizeVector( sc, values, { 'stride': stride } );
			var got = idamax( n, X.data, X.args[ 0 ], X.args[ 1 ] );
			checked( 'idamax', 'property', function run() {
				if ( got !== exp ) {
					throw new Error( 'idamax n='+n+' stride='+stride+': got index '+got+', expected '+exp );
				}
			});
		});
	});
});

// Faithful-contract pin: N < 1 and INCX <= 0 both yield the "no index" sentinel
// (-1 in the 0-based port), and negative strides are NOT offset-walked.
test( 'idamax: N<1 or non-positive stride returns -1 (reference contract)', function t() {
	var rng = new RNG( 0xF00D );
	var n = 17;
	var values = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		values.push( sc.random( rng ) );
	}
	var X = schemes.realizeVector( sc, values, { 'stride': 1 } );

	// N < 1:
	if ( idamax( 0, X.data, 1, 0 ) !== -1 ) {
		throw new Error( 'idamax N=0: expected -1' );
	}
	// stride == 0:
	if ( idamax( n, X.data, 0, 0 ) !== -1 ) {
		throw new Error( 'idamax stride=0: expected -1' );
	}
	// stride < 0 (negative strides unsupported by the reference -> -1):
	var Xn = schemes.realizeVector( sc, values, { 'stride': -1, 'lead': 4, 'tail': 1 } );
	if ( idamax( n, Xn.data, Xn.args[ 0 ], Xn.args[ 1 ] ) !== -1 ) {
		throw new Error( 'idamax stride<0: expected -1' );
	}
});

// Step 4: layout-invariance across POSITIVE-stride layouts only (the reference
// does not offset-walk negative strides; there is no unrolled path, so all
// positive strides share one arithmetic path and must give the int-exact index).
function buildIdamax( n, SEED, layout ) {
	var rng = new RNG( SEED ); // identical values every variant
	var values = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		values.push( sc.random( rng ) );
	}
	var X = schemes.realizeVector( sc, values, layout );
	return [ idamax( n, X.data, X.args[ 0 ], X.args[ 1 ] ) ];
}

test( 'idamax: int-exact index across positive-stride offset/stride layouts', function t() {
	var n = 17;
	var SEED = 0xF00D;
	var positive = schemes.vectorLayouts().filter( function pos( L ) {
		return L.stride > 0;
	});
	checked( 'idamax', 'layout-invariance', function run() {
		layoutInvariant( positive, function build( layout ) {
			return buildIdamax( n, SEED, layout );
		}, { 'label': 'idamax positive-stride layout invariance' } );
	});
});
