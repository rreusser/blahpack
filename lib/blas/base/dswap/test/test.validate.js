/**
* Property-based validation for dswap, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 pure vector operation
* interchanging two vectors `(x,y) := (y,x)`. Validated by asserting the
* post-swap x equals the pre-swap y and post-swap y equals the pre-swap x,
* BIT-EXACT (a swap is a pure data move), then layout-fuzzed bit-exact across
* independent x/y strided (incl. negative) vector layouts.
*/

import test from 'node:test';
import { RNG, scalar as S, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dswap from './../lib/ndarray.js';

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


// TESTS //

test( 'dswap: property (x,y) := (y,x), bit-exact, across sizes', function t() {
	checked( 'dswap', 'property', function run() {
		var rng;
		var x0;
		var y0;
		var X;
		var Y;
		var gx;
		var gy;
		var i;
		SIZES.forEach( function eachN( n ) {
			rng = new RNG( 0x100 + n );
			x0 = [];
			y0 = [];
			for ( i = 0; i < n; i++ ) {
				x0.push( sc.random( rng ) );
			}
			for ( i = 0; i < n; i++ ) {
				y0.push( sc.random( rng ) );
			}
			X = schemes.realizeVector( sc, x0, { 'stride': 1 } );
			Y = schemes.realizeVector( sc, y0, { 'stride': 1 } );
			dswap( n, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );
			gx = [];
			gy = [];
			for ( i = 0; i < n; i++ ) {
				gx.push( X.read( i ) );
				gy.push( Y.read( i ) );
			}
			check.assertFinite( sc, gx, 'dswap x n='+n );
			check.assertFinite( sc, gy, 'dswap y n='+n );

			// After swap, x must equal old y and y must equal old x, bit-exact:
			check.assertExactEqual( flat( gx ), flat( y0 ), 'dswap x==y0 n='+n );
			check.assertExactEqual( flat( gy ), flat( x0 ), 'dswap y==x0 n='+n );
		});
	});
});

test( 'dswap: layout invariance (bit-exact across x/y strided/negative layouts)', function t() {
	var layouts = schemes.vectorLayouts();
	var n = 17;
	var SEED = 0xD54A9;
	checked( 'dswap', 'layout-invariance', function run() {
		layoutInvariant( layouts, function build( L, idx ) {
			var rng = new RNG( SEED );
			var Ly = layouts[ ( idx + 2 ) % layouts.length ];
			var x0 = [];
			var y0 = [];
			var out = [];
			var X;
			var Y;
			var i;
			for ( i = 0; i < n; i++ ) {
				x0.push( sc.random( rng ) );
			}
			for ( i = 0; i < n; i++ ) {
				y0.push( sc.random( rng ) );
			}
			X = schemes.realizeVector( sc, x0, L );
			Y = schemes.realizeVector( sc, y0, Ly );
			dswap( n, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );
			for ( i = 0; i < n; i++ ) {
				out.push( X.read( i ) );
			}
			for ( i = 0; i < n; i++ ) {
				out.push( Y.read( i ) );
			}
			return flat( out );
		}, { 'label': 'dswap layout invariance' } );
	});
});
