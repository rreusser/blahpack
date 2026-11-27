/**
* Property-based validation for zdscal, following the /blahpack-validate process.
*
* Step 0 classification: complex vector `x`, REAL scalar alpha; Level-1 pure
* vector operation `x := alpha*x`. alpha is passed as a raw double. Validated
* component-wise against an independent oracle `expected[i] = scale(x0_i, alpha)`
* (single multiply per component -> bit-exact), then layout-fuzzed bit-exact
* across strided (incl. negative) vector layouts. alpha=0 is exercised.
*/

import test from 'node:test';
import { RNG, scalar as S, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zdscal from './../lib/ndarray.js';

// alpha is a REAL scalar; x is complex.
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

test( 'zdscal: property x := alpha*x (real alpha, complex x, incl. 0) across sizes', function t() {
	checked( 'zdscal', 'property', function run() {
		let alphas, expected, alpha, got, rng, x0, X, i, a;
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

				// alpha is passed as a raw double (real scalar):
				zdscal( n, alpha, X.data, X.args[ 0 ], X.args[ 1 ] );
				expected = [];
				got = [];
				for ( i = 0; i < n; i++ ) {
					expected.push( sc.scale( x0[ i ], alpha ) );
					got.push( X.read( i ) );
				}
				compare( expected, got, n, 'zdscal n='+n+' alpha='+alpha );
			}
		});
	});
});

test( 'zdscal: layout invariance (bit-exact across strided/negative layouts)', function t() {
	const n = 17;
	const SEED = 0xD5C41;
	checked( 'zdscal', 'layout-invariance', function run() {
		layoutInvariant( schemes.vectorLayouts(), function build( L ) {
			const rng = new RNG( SEED );
			const x0 = [];
			const out = [];
			let i;
			for ( i = 0; i < n; i++ ) {
				x0.push( sc.random( rng ) );
			}
			const alpha = rng.normal();
			const X = schemes.realizeVector( sc, x0, L );
			zdscal( n, alpha, X.data, X.args[ 0 ], X.args[ 1 ] );
			for ( i = 0; i < n; i++ ) {
				out.push( X.read( i ) );
			}
			return flat( out );
		}, { 'label': 'zdscal layout invariance' } );
	});
});
