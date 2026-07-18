/**
* Property-based validation for zscal, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; Level-1 pure vector operation
* `x := alpha*x` with COMPLEX alpha. Validated component-wise against an
* independent oracle `expected[i] = alpha*x0_i` (matches the base's complex
* multiply -> bit-exact), then layout-fuzzed bit-exact across strided (incl.
* negative) vector layouts. alpha=0 is exercised.
*/

import test from 'node:test';
import { RNG, scalar as S, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zscal from './../lib/ndarray.js';

const sc = S.complex;


// HELPERS //

function flat( arr ) {
	const out = [];
	let i, j, c;
	for ( i = 0; i < arr.length; i++ ) {
		c = sc.components( arr[ i ] );
		for ( j = 0; j < c.length; j++ ) {
			out.push( c[ j ] );
		}
	}
	return out;
}

function compare( expected, got, n, label ) {
	let exact, errC, scC, d, i;
	check.assertFinite( sc, got, label+' output' );
	const e = flat( expected );
	const g = flat( got );
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

test( 'zscal: property x := alpha*x (complex alpha, incl. 0) across sizes', function t() {
	checked( 'zscal', 'property', function run() {
		let alphas, expected, alpha, got, rng, x0, X, i, a;
		SIZES.forEach( function eachN( n ) {
			rng = new RNG( 0x100 + n );
			x0 = [];
			for ( i = 0; i < n; i++ ) {
				x0.push( sc.random( rng ) );
			}
			alphas = [ sc.random( rng ), sc.zero ];
			for ( a = 0; a < alphas.length; a++ ) {
				alpha = alphas[ a ];
				X = schemes.realizeVector( sc, x0, { 'stride': 1 } );
				zscal( n, sc.apiScalar( alpha ), X.data, X.args[ 0 ], X.args[ 1 ] );
				expected = [];
				got = [];
				for ( i = 0; i < n; i++ ) {
					expected.push( sc.mul( alpha, x0[ i ] ) );
					got.push( X.read( i ) );
				}
				compare( expected, got, n, 'zscal n='+n+' alpha=('+alpha.re+','+alpha.im+')' );
			}
		});
	});
});

test( 'zscal: layout invariance (bit-exact across strided/negative layouts)', function t() {
	const n = 17;
	const SEED = 0x25CA1;
	checked( 'zscal', 'layout-invariance', function run() {
		layoutInvariant( schemes.vectorLayouts(), function build( L ) {
			const rng = new RNG( SEED );
			const x0 = [];
			const out = [];
			let i;
			for ( i = 0; i < n; i++ ) {
				x0.push( sc.random( rng ) );
			}
			const alpha = sc.random( rng );
			const X = schemes.realizeVector( sc, x0, L );
			zscal( n, sc.apiScalar( alpha ), X.data, X.args[ 0 ], X.args[ 1 ] );
			for ( i = 0; i < n; i++ ) {
				out.push( X.read( i ) );
			}
			return flat( out );
		}, { 'label': 'zscal layout invariance' } );
	});
});
