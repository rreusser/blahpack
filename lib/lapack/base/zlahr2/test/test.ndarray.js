/* eslint-disable max-len */
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlahr2 from './../lib/ndarray.js';

// FIXTURES //

import basic_n6_k1_nb2 from './fixtures/basic_n6_k1_nb2.json' with { type: 'json' };
import n5_k2_nb2 from './fixtures/n5_k2_nb2.json' with { type: 'json' };
import n8_k1_nb3 from './fixtures/n8_k1_nb3.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var diff;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		diff = Math.abs( actual[ i ] - expected[ i ] );
		if ( diff > tol && diff / Math.max( Math.abs( expected[ i ] ), 1.0 ) > tol ) { // eslint-disable-line max-len
			assert.fail( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

// TESTS //

test( 'zlahr2: n6_k1_nb2', function () {
	var tc = basic_n6_k1_nb2;
	// A must be N*(N-K+1) = 6*6 = 36 complex elements (ZLAHR2 reads all N-K+1 columns)
	var A = new Complex128Array( 6 * 6 ); var av = reinterpret( A, 0 );
	av.set([1,0, 5,-0.5, 9,1, 13,-1, 17,0.5, 21,0, 2,1, 6,0, 10,-1, 14,0.5, 18,0, 22,1, 3,-0.5, 7,1, 11,0, 15,0, 19,-1, 23,0.5]);
	var tau = new Complex128Array( 2 ); var T = new Complex128Array( 4 ); var Y = new Complex128Array( 12 );
	zlahr2( 6, 1, 2, A, 1, 6, 0, tau, 1, 0, T, 1, 2, 0, Y, 1, 6, 0 );
	assertArrayClose( av.slice( 0, tc.A.length ), new Float64Array( tc.A ), 1e-13, 'A' );
	assertArrayClose( reinterpret(tau,0), new Float64Array( tc.TAU ), 1e-13, 'TAU' );
	assertArrayClose( reinterpret(T,0), new Float64Array( tc.T ), 1e-13, 'T' );
	assertArrayClose( reinterpret(Y,0), new Float64Array( tc.Y ), 1e-13, 'Y' );
});
test( 'zlahr2: n5_k2_nb2', function () {
	var tc = n5_k2_nb2;
	// A must be N*(N-K+1) = 5*4 = 20 complex elements (ZLAHR2 reads all N-K+1 columns)
	var A = new Complex128Array( 5 * 4 ); var av = reinterpret( A, 0 );
	av.set([1,0.5, 2,-1, 3,0, 4,1, 5,-0.5, 6,0, 7,1, 8,-1, 9,0.5, 10,0, 11,-0.5, 12,0, 13,1, 14,-1, 15,0.5]);
	var tau = new Complex128Array( 2 ); var T = new Complex128Array( 4 ); var Y = new Complex128Array( 10 );
	zlahr2( 5, 2, 2, A, 1, 5, 0, tau, 1, 0, T, 1, 2, 0, Y, 1, 5, 0 );
	assertArrayClose( av.slice( 0, tc.A.length ), new Float64Array( tc.A ), 1e-13, 'A' );
	assertArrayClose( reinterpret(tau,0), new Float64Array( tc.TAU ), 1e-13, 'TAU' );
	assertArrayClose( reinterpret(T,0), new Float64Array( tc.T ), 1e-13, 'T' );
	assertArrayClose( reinterpret(Y,0), new Float64Array( tc.Y ), 1e-13, 'Y' );
});
test( 'zlahr2: n8_k1_nb3', function () {
	var tc = n8_k1_nb3;
	// A must be N*(N-K+1) = 8*8 = 64 complex elements (ZLAHR2 reads all N-K+1 columns)
	var A = new Complex128Array( 8 * 8 ); var av = reinterpret( A, 0 );
	av.set([1,0, 2,1, 3,-1, 4,0.5, 5,0, 6,-0.5, 7,1, 8,0, 9,0.5, 10,0, 11,1, 12,-1, 13,0, 14,0.5, 15,0, 16,-0.5, 17,-1, 18,0, 19,0.5, 20,0, 21,-0.5, 22,1, 23,0, 24,0.5, 25,0, 26,-1, 27,0.5, 28,0, 29,1, 30,0, 31,-0.5, 32,1]);
	var tau = new Complex128Array( 3 ); var T = new Complex128Array( 9 ); var Y = new Complex128Array( 24 );
	zlahr2( 8, 1, 3, A, 1, 8, 0, tau, 1, 0, T, 1, 3, 0, Y, 1, 8, 0 );
	assertArrayClose( av.slice( 0, tc.A.length ), new Float64Array( tc.A ), 1e-13, 'A' );
	assertArrayClose( reinterpret(tau,0), new Float64Array( tc.TAU ), 1e-13, 'TAU' );
	assertArrayClose( reinterpret(T,0), new Float64Array( tc.T ), 1e-13, 'T' );
	assertArrayClose( reinterpret(Y,0), new Float64Array( tc.Y ), 1e-13, 'Y' );
});
test( 'zlahr2: n_one', function () {
	var tc = n_one;
	var A = new Complex128Array( 1 ); var av = reinterpret( A, 0 );
	av[ 0 ] = 42.0; av[ 1 ] = 3.0;
	var tau = new Complex128Array( 1 ); var T = new Complex128Array( 1 ); var Y = new Complex128Array( 1 );
	zlahr2( 1, 1, 1, A, 1, 1, 0, tau, 1, 0, T, 1, 1, 0, Y, 1, 1, 0 );
	assertArrayClose( av, new Float64Array( tc.A ), 1e-14, 'A' );
});
