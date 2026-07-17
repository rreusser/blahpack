/**
* Property-based validation for dscal, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 pure vector operation
* `x := alpha*x`. Validated component-wise against an independent oracle
* `expected[i] = alpha*x0_i` (single multiply -> bit-exact), then layout-fuzzed
* bit-exact across strided (incl. negative) vector layouts. alpha=0 is exercised.
*/

import test from 'node:test';
import { RNG, scalar as S, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dscal from './../lib/ndarray.js';

var sc = S.real;


// HELPERS //

function flat( arr ) {
	var out = [];
	var i;
	var j;
	var c;
	for ( i = 0; i < arr.length; i++ ) {
		c = sc.components( arr[ i ] );
		for ( j = 0; j < c.length; j++ ) {
			out.push( c[ j ] );
		}
	}
	return out;
}

// Compare bit-exact if possible (single multiply per element), else scaled tol.
function compare( expected, got, n, label ) {
	var exact;
	var errC;
	var scC;
	var e;
	var g;
	var d;
	var i;
	check.assertFinite( sc, got, label+' output' );
	e = flat( expected );
	g = flat( got );
	exact = ( e.length === g.length );
	for ( i = 0; exact && i < e.length; i++ ) {
		if ( !Object.is( e[ i ], g[ i ] ) ) {
			exact = false;
		}
	}
	if ( exact ) {
		return;
	}
	errC = 0.0;
	scC = 0.0;
	for ( i = 0; i < e.length; i++ ) {
		d = g[ i ] - e[ i ];
		errC += d * d;
		scC += e[ i ] * e[ i ];
	}
	check.assertScaled( Math.sqrt( errC ), Math.sqrt( scC ), check.tol( n, 20 ), label );
}


// TESTS //

test( 'dscal: property x := alpha*x across sizes and alpha (incl. 0)', function t() {
	checked( 'dscal', 'property', function run() {
		var alphas;
		var expected;
		var alpha;
		var got;
		var rng;
		var x0;
		var X;
		var i;
		var a;
		SIZES.forEach( function eachN( n ) {
			rng = new RNG( 0x100 + n );
			x0 = [];
			for ( i = 0; i < n; i++ ) {
				x0.push( sc.random( rng ) );
			}
			alphas = [ rng.normal(), 0.0 ];
			for ( a = 0; a < alphas.length; a++ ) {
				alpha = alphas[ a ];
				X = schemes.realizeVector( sc, x0, { 'stride': 1 } );
				dscal( n, sc.apiScalar( alpha ), X.data, X.args[ 0 ], X.args[ 1 ] );
				expected = [];
				got = [];
				for ( i = 0; i < n; i++ ) {
					expected.push( sc.mul( alpha, x0[ i ] ) );
					got.push( X.read( i ) );
				}
				compare( expected, got, n, 'dscal n='+n+' alpha='+alpha );
			}
		});
	});
});

test( 'dscal: layout invariance (bit-exact across strided/negative layouts)', function t() {
	var n = 17;
	var SEED = 0xD5CA1;
	checked( 'dscal', 'layout-invariance', function run() {
		layoutInvariant( schemes.vectorLayouts(), function build( L ) {
			var rng = new RNG( SEED );
			var x0 = [];
			var out = [];
			var alpha;
			var X;
			var i;
			for ( i = 0; i < n; i++ ) {
				x0.push( sc.random( rng ) );
			}
			alpha = rng.normal();
			X = schemes.realizeVector( sc, x0, L );
			dscal( n, sc.apiScalar( alpha ), X.data, X.args[ 0 ], X.args[ 1 ] );
			for ( i = 0; i < n; i++ ) {
				out.push( X.read( i ) );
			}
			return flat( out );
		}, { 'label': 'dscal layout invariance' } );
	});
});
