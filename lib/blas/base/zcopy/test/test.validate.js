/**
* Property-based validation for zcopy, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 pure vector operation
* `y := x`. Because a copy performs no arithmetic, the result must equal the
* source BIT-FOR-BIT — validated by exact equality against `expected[i] = x_i`
* over a size sweep, then layout-fuzzed bit-exact across strided (incl. negative)
* vector layouts.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zcopy from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

function values( rng, n ) {
	var v = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		v.push( sc.random( rng ) );
	}
	return v;
}

// Read the destination y back out of physical storage as an N-length array.
function readVector( Y, n ) {
	var out = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		out.push( Y.read( i ) );
	}
	return out;
}

// Wrap an array of scalar values as an N x 1 LogicalMatrix (for flattenLogical).
function asColumn( arr ) {
	var M = new LogicalMatrix( sc, arr.length, 1 );
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		M.set( i, 0, arr[ i ] );
	}
	return M;
}

// Flatten an array of scalar values into real components.
function flat( arr ) {
	return check.flattenLogical( sc, asColumn( arr ) );
}

// Step 2: PROPERTY — y := x over a size sweep incl. N=0,1. Copy is exact.
test( 'zcopy: y := x (size sweep, incl. N=0,1, bit-exact)', function t() {
	SIZES.forEach( function eachN( N ) {
		var rng = new RNG( 0x100 + N );
		var x = values( rng, N );
		var y0 = values( rng, N ); // destination, fully overwritten

		var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
		var Y = schemes.realizeVector( sc, y0, { 'stride': 1 } );
		zcopy( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );

		var got = readVector( Y, N );
		checked( 'zcopy', 'property', function run() {
			check.assertFinite( sc, got, 'zcopy N='+N );
			check.assertExactEqual( flat( got ), flat( x ), 'zcopy N='+N );
		});
	});
});

// Step 3: LAYOUT INVARIANCE — output must be bit-exact across strided vector
// layouts (incl. negative strides), x and y at rotated layouts.
test( 'zcopy: bit-exact across vector layouts', function t() {
	var N = 17;
	var SEED = 0xF00D;
	var vLayouts = schemes.vectorLayouts();
	checked( 'zcopy', 'layout-invariance', function run() {
		layoutInvariant( vLayouts, function build( vL, idx ) {
			var rng = new RNG( SEED ); // identical values every variant
			var x = values( rng, N );
			var y0 = values( rng, N );

			var X = schemes.realizeVector( sc, x, vL );
			var Y = schemes.realizeVector( sc, y0, vLayouts[ ( idx + 2 ) % vLayouts.length ] );
			zcopy( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );
			return flat( readVector( Y, N ) );
		}, { 'label': 'zcopy layout invariance' } );
	});
});
