/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr5 from './../lib/ndarray.js';

// FIXTURES //

import _6x6_2shifts_wantt_wantz from './fixtures/6x6_2shifts_wantt_wantz.json' with { type: 'json' };
import _8x8_4shifts_kacc22_1 from './fixtures/8x8_4shifts_kacc22_1.json' with { type: 'json' };
import _6x6_no_wantt_no_wantz from './fixtures/6x6_no_wantt_no_wantz.json' with { type: 'json' };
import nshfts_0_noop from './fixtures/nshfts_0_noop.json' with { type: 'json' };
import ktop_eq_kbot_noop from './fixtures/ktop_eq_kbot_noop.json' with { type: 'json' };
import _6x6_4shifts_kacc22_2 from './fixtures/6x6_4shifts_kacc22_2.json' with { type: 'json' };
import _6x6_partial_sweep from './fixtures/6x6_partial_sweep.json' with { type: 'json' };
import _8x8_4shifts_kacc22_0 from './fixtures/8x8_4shifts_kacc22_0.json' with { type: 'json' };
import _4x4_2shifts_kacc22_1 from './fixtures/4x4_2shifts_kacc22_1.json' with { type: 'json' };
import _6x6_4shifts_bmp22 from './fixtures/6x6_4shifts_bmp22.json' with { type: 'json' };
import _6x6_shuffle_shifts from './fixtures/6x6_shuffle_shifts.json' with { type: 'json' };
import _8x8_5shifts_odd from './fixtures/8x8_5shifts_odd.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
	}
}

/**
* ExtractMatrix.
*
* @private
* @param {*} A - A
* @param {*} N - N
* @param {*} LDA - LDA
* @returns {*} result
*/
function extractMatrix( A, N, LDA ) {
	var out = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out[ j * N + i ] = A[ j * LDA + i ];
		}
	}
	return out;
}

/**
* ColMajor.
*
* @private
* @param {*} N - N
* @param {*} entries - entries
* @returns {*} result
*/
function colMajor( N, entries ) {
	var key;
	var row;
	var col;
	var A = new Float64Array( N * N );
	for ( key in entries ) {
		row = parseInt( key.split( ',' )[ 0 ], 10 ) - 1;
		col = parseInt( key.split( ',' )[ 1 ], 10 ) - 1;
		A[ col * N + row ] = entries[ key ];
	}
	return A;
}

/**
* Eye.
*
* @private
* @param {*} N - N
* @returns {*} result
*/
function eye( N ) {
	var A = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		A[ i * N + i ] = 1.0;
	}
	return A;
}

/**
* Run.
*
* @private
* @param {*} wantt - wantt
* @param {*} wantz - wantz
* @param {*} kacc22 - kacc22
* @param {*} N - N
* @param {*} ktop - ktop
* @param {*} kbot - kbot
* @param {*} nshfts - nshfts
* @param {*} SR - SR
* @param {*} SI - SI
* @param {*} H - H
* @param {*} iloz - iloz
* @param {*} ihiz - ihiz
* @param {*} Z - Z
*/
function run( wantt, wantz, kacc22, N, ktop, kbot, nshfts, SR, SI, H, iloz, ihiz, Z ) { // eslint-disable-line max-len
	var nbmps = ( nshfts / 2 ) | 0;
	var kdu = 4 * nbmps;
	var nh = N;
	var nv = N;
	var WV = new Float64Array( Math.max( nv, 1 ) * Math.max( 2 * nshfts, 1 ) );
	var WH = new Float64Array( Math.max( 2 * nshfts, 1 ) * Math.max( nh, 1 ) );
	var V = new Float64Array( 3 * ( nshfts + 2 ) );
	var U = new Float64Array( Math.max( kdu, 1 ) * Math.max( kdu, 1 ) );

	dlaqr5( wantt, wantz, kacc22, N, ktop, kbot, nshfts, SR, 1, 0, SI, 1, 0, H, 1, N, 0, iloz, ihiz, Z, 1, N, 0, V, 1, 3, 0, U, 1, Math.max( kdu, 1 ), 0, nv, WV, 1, Math.max( nv, 1 ), 0, nh, WH, 1, Math.max( 2 * nshfts, 1 ), 0 );
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlaqr5: 6x6_2shifts_wantt_wantz', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _6x6_2shifts_wantt_wantz;
	N = 6;
	H = colMajor( N, {
		'1,1': 4.0,
		'1,2': 3.0,
		'1,3': 2.0,
		'1,4': 1.0,
		'1,5': 0.5,
		'1,6': 0.25,
		'2,1': 1.0,
		'2,2': 3.0,
		'2,3': 2.5,
		'2,4': 1.5,
		'2,5': 0.8,
		'2,6': 0.4,
		'3,2': 1.5,
		'3,3': 2.0,
		'3,4': 1.0,
		'3,5': 0.7,
		'3,6': 0.3,
		'4,3': 0.8,
		'4,4': 1.5,
		'4,5': 0.6,
		'4,6': 0.2,
		'5,4': 0.5,
		'5,5': 1.0,
		'5,6': 0.5,
		'6,5': 0.3,
		'6,6': 0.5
	});
	Z = eye( N );
	SR = new Float64Array([ 2.0, 2.0 ]);
	SI = new Float64Array([ 0.5, -0.5 ]);
	run( true, true, 0, N, 0, 5, 2, SR, SI, H, 0, 5, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
	assertArrayClose( toArray( SR ), tc.SR, 1e-14, 'SR' );
	assertArrayClose( toArray( SI ), tc.SI, 1e-14, 'SI' );
});

test( 'dlaqr5: 8x8_4shifts_kacc22_1', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _8x8_4shifts_kacc22_1;
	N = 8;
	H = colMajor( N, {
		'1,1': 10.0,
		'1,2': 2.0,
		'1,3': 1.0,
		'1,4': 0.5,
		'1,5': 0.3,
		'1,6': 0.2,
		'1,7': 0.1,
		'1,8': 0.05, // eslint-disable-line max-len
		'2,1': 3.0,
		'2,2': 9.0,
		'2,3': 2.0,
		'2,4': 1.0,
		'2,5': 0.4,
		'2,6': 0.3,
		'2,7': 0.2,
		'2,8': 0.1, // eslint-disable-line max-len
		'3,2': 2.5,
		'3,3': 8.0,
		'3,4': 1.5,
		'3,5': 0.5,
		'3,6': 0.4,
		'3,7': 0.3,
		'3,8': 0.15, // eslint-disable-line max-len
		'4,3': 2.0,
		'4,4': 7.0,
		'4,5': 1.0,
		'4,6': 0.5,
		'4,7': 0.4,
		'4,8': 0.2,
		'5,4': 1.5,
		'5,5': 6.0,
		'5,6': 1.0,
		'5,7': 0.5,
		'5,8': 0.3,
		'6,5': 1.0,
		'6,6': 5.0,
		'6,7': 0.8,
		'6,8': 0.4,
		'7,6': 0.8,
		'7,7': 4.0,
		'7,8': 0.6,
		'8,7': 0.5,
		'8,8': 3.0
	});
	Z = eye( N );
	SR = new Float64Array([ 5.0, 5.0, 3.0, 3.0 ]);
	SI = new Float64Array([ 1.0, -1.0, 0.5, -0.5 ]);
	run( true, true, 1, N, 0, 7, 4, SR, SI, H, 0, 7, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
	assertArrayClose( toArray( SR ), tc.SR, 1e-14, 'SR' );
	assertArrayClose( toArray( SI ), tc.SI, 1e-14, 'SI' );
});

test( 'dlaqr5: 6x6_no_wantt_no_wantz', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _6x6_no_wantt_no_wantz;
	N = 6;
	H = colMajor( N, {
		'1,1': 4.0,
		'1,2': 3.0,
		'1,3': 2.0,
		'1,4': 1.0,
		'1,5': 0.5,
		'1,6': 0.25,
		'2,1': 1.0,
		'2,2': 3.0,
		'2,3': 2.5,
		'2,4': 1.5,
		'2,5': 0.8,
		'2,6': 0.4,
		'3,2': 1.5,
		'3,3': 2.0,
		'3,4': 1.0,
		'3,5': 0.7,
		'3,6': 0.3,
		'4,3': 0.8,
		'4,4': 1.5,
		'4,5': 0.6,
		'4,6': 0.2,
		'5,4': 0.5,
		'5,5': 1.0,
		'5,6': 0.5,
		'6,5': 0.3,
		'6,6': 0.5
	});
	Z = new Float64Array( N * N );
	SR = new Float64Array([ 2.0, 2.0 ]);
	SI = new Float64Array([ 0.5, -0.5 ]);
	run( false, false, 0, N, 0, 5, 2, SR, SI, H, 0, 5, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
});

test( 'dlaqr5: nshfts_0_noop', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = nshfts_0_noop;
	N = 4;
	H = colMajor( N, {
		'1,1': 4.0,
		'1,2': 1.0,
		'1,3': 0.5,
		'1,4': 0.25,
		'2,1': 2.0,
		'2,2': 3.0,
		'2,3': 1.0,
		'2,4': 0.5,
		'3,2': 1.5,
		'3,3': 2.0,
		'3,4': 0.8,
		'4,3': 1.0,
		'4,4': 1.0
	});
	Z = new Float64Array( N * N );
	SR = new Float64Array( 4 );
	SI = new Float64Array( 4 );
	dlaqr5( true, true, 0, N, 0, 3, 0, SR, 1, 0, SI, 1, 0, H, 1, N, 0, 0, 3, Z, 1, N, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, N, new Float64Array( 1 ), 1, 1, 0, N, new Float64Array( 1 ), 1, 1, 0 );
	assertArrayClose( toArray( H ), tc.H, 1e-14, 'H' );
});

test( 'dlaqr5: ktop_eq_kbot_noop', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = ktop_eq_kbot_noop;
	N = 4;
	H = colMajor( N, {
		'1,1': 4.0,
		'1,2': 1.0,
		'1,3': 0.5,
		'1,4': 0.25,
		'2,1': 2.0,
		'2,2': 3.0,
		'2,3': 1.0,
		'2,4': 0.5,
		'3,2': 1.5,
		'3,3': 2.0,
		'3,4': 0.8,
		'4,3': 1.0,
		'4,4': 1.0
	});
	Z = new Float64Array( N * N );
	SR = new Float64Array([ 2.0, 1.0 ]);
	SI = new Float64Array([ 0.0, 0.0 ]);
	dlaqr5( true, true, 0, N, 2, 2, 2, SR, 1, 0, SI, 1, 0, H, 1, N, 0, 0, 3, Z, 1, N, 0, new Float64Array( 6 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, N, new Float64Array( 16 ), 1, 4, 0, N, new Float64Array( 16 ), 1, 4, 0 );
	assertArrayClose( toArray( H ), tc.H, 1e-14, 'H' );
});

test( 'dlaqr5: 6x6_4shifts_kacc22_2', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _6x6_4shifts_kacc22_2;
	N = 6;
	H = colMajor( N, {
		'1,1': 6.0,
		'1,2': 2.0,
		'1,3': 1.5,
		'1,4': 1.0,
		'1,5': 0.5,
		'1,6': 0.3,
		'2,1': 2.0,
		'2,2': 5.0,
		'2,3': 2.0,
		'2,4': 1.5,
		'2,5': 0.8,
		'2,6': 0.4,
		'3,2': 1.8,
		'3,3': 4.0,
		'3,4': 1.0,
		'3,5': 0.6,
		'3,6': 0.35,
		'4,3': 1.2,
		'4,4': 3.0,
		'4,5': 0.9,
		'4,6': 0.5,
		'5,4': 0.7,
		'5,5': 2.0,
		'5,6': 0.6,
		'6,5': 0.4,
		'6,6': 1.0
	});
	Z = eye( N );
	SR = new Float64Array([ 4.0, 4.0, 2.0, 1.0 ]);
	SI = new Float64Array([ 1.0, -1.0, 0.0, 0.0 ]);
	run( true, true, 2, N, 0, 5, 4, SR, SI, H, 0, 5, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
	assertArrayClose( toArray( SR ), tc.SR, 1e-14, 'SR' );
	assertArrayClose( toArray( SI ), tc.SI, 1e-14, 'SI' );
});

test( 'dlaqr5: 6x6_partial_sweep', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _6x6_partial_sweep;
	N = 6;
	H = colMajor( N, {
		'1,1': 5.0,
		'1,2': 1.0,
		'1,3': 0.5,
		'1,4': 0.3,
		'1,5': 0.2,
		'1,6': 0.1,
		'2,1': 0.0,
		'2,2': 4.0,
		'2,3': 2.0,
		'2,4': 1.0,
		'2,5': 0.5,
		'2,6': 0.3,
		'3,2': 1.5,
		'3,3': 3.0,
		'3,4': 1.5,
		'3,5': 0.7,
		'3,6': 0.4,
		'4,3': 1.0,
		'4,4': 2.0,
		'4,5': 1.0,
		'4,6': 0.5,
		'5,4': 0.8,
		'5,5': 1.5,
		'5,6': 0.6,
		'6,5': 0.0,
		'6,6': 1.0
	});
	Z = eye( N );
	SR = new Float64Array([ 3.0, 2.0 ]);
	SI = new Float64Array([ 0.0, 0.0 ]);
	run( true, true, 0, N, 1, 4, 2, SR, SI, H, 0, 5, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaqr5: 8x8_4shifts_kacc22_0', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _8x8_4shifts_kacc22_0;
	N = 8;
	H = colMajor( N, {
		'1,1': 10.0,
		'1,2': 2.0,
		'1,3': 1.0,
		'1,4': 0.5,
		'1,5': 0.3,
		'1,6': 0.2,
		'1,7': 0.1,
		'1,8': 0.05, // eslint-disable-line max-len
		'2,1': 3.0,
		'2,2': 9.0,
		'2,3': 2.0,
		'2,4': 1.0,
		'2,5': 0.4,
		'2,6': 0.3,
		'2,7': 0.2,
		'2,8': 0.1, // eslint-disable-line max-len
		'3,2': 2.5,
		'3,3': 8.0,
		'3,4': 1.5,
		'3,5': 0.5,
		'3,6': 0.4,
		'3,7': 0.3,
		'3,8': 0.15, // eslint-disable-line max-len
		'4,3': 2.0,
		'4,4': 7.0,
		'4,5': 1.0,
		'4,6': 0.5,
		'4,7': 0.4,
		'4,8': 0.2,
		'5,4': 1.5,
		'5,5': 6.0,
		'5,6': 1.0,
		'5,7': 0.5,
		'5,8': 0.3,
		'6,5': 1.0,
		'6,6': 5.0,
		'6,7': 0.8,
		'6,8': 0.4,
		'7,6': 0.8,
		'7,7': 4.0,
		'7,8': 0.6,
		'8,7': 0.5,
		'8,8': 3.0
	});
	Z = eye( N );
	SR = new Float64Array([ 5.0, 5.0, 3.0, 3.0 ]);
	SI = new Float64Array([ 1.0, -1.0, 0.5, -0.5 ]);
	run( true, true, 0, N, 0, 7, 4, SR, SI, H, 0, 7, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaqr5: 4x4_2shifts_kacc22_1', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _4x4_2shifts_kacc22_1;
	N = 4;
	H = colMajor( N, {
		'1,1': 4.0,
		'1,2': 1.0,
		'1,3': 0.5,
		'1,4': 0.25,
		'2,1': 2.0,
		'2,2': 3.0,
		'2,3': 1.0,
		'2,4': 0.5,
		'3,2': 1.5,
		'3,3': 2.0,
		'3,4': 0.8,
		'4,3': 1.0,
		'4,4': 1.0
	});
	Z = eye( N );
	SR = new Float64Array([ 2.5, 2.5 ]);
	SI = new Float64Array([ 0.5, -0.5 ]);
	run( true, true, 1, N, 0, 3, 2, SR, SI, H, 0, 3, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaqr5: 6x6_4shifts_bmp22', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _6x6_4shifts_bmp22;
	N = 6;
	H = colMajor( N, {
		'1,1': 5.0,
		'1,2': 2.0,
		'1,3': 1.0,
		'1,4': 0.5,
		'1,5': 0.3,
		'1,6': 0.2,
		'2,1': 1.5,
		'2,2': 4.0,
		'2,3': 1.5,
		'2,4': 0.8,
		'2,5': 0.4,
		'2,6': 0.3,
		'3,2': 1.0,
		'3,3': 3.0,
		'3,4': 1.0,
		'3,5': 0.5,
		'3,6': 0.2,
		'4,3': 0.8,
		'4,4': 2.0,
		'4,5': 0.6,
		'4,6': 0.3,
		'5,4': 0.4,
		'5,5': 1.5,
		'5,6': 0.5,
		'6,5': 0.3,
		'6,6': 0.8
	});
	Z = eye( N );
	SR = new Float64Array([ 3.5, 3.5, 1.5, 1.0 ]);
	SI = new Float64Array([ 0.5, -0.5, 0.0, 0.0 ]);
	run( true, true, 0, N, 0, 5, 4, SR, SI, H, 0, 5, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaqr5: 6x6_shuffle_shifts', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _6x6_shuffle_shifts;
	N = 6;
	H = colMajor( N, {
		'1,1': 5.0,
		'1,2': 2.0,
		'1,3': 1.0,
		'1,4': 0.5,
		'1,5': 0.3,
		'1,6': 0.2,
		'2,1': 1.5,
		'2,2': 4.0,
		'2,3': 1.5,
		'2,4': 0.8,
		'2,5': 0.4,
		'2,6': 0.3,
		'3,2': 1.0,
		'3,3': 3.0,
		'3,4': 1.0,
		'3,5': 0.5,
		'3,6': 0.2,
		'4,3': 0.8,
		'4,4': 2.0,
		'4,5': 0.6,
		'4,6': 0.3,
		'5,4': 0.4,
		'5,5': 1.5,
		'5,6': 0.5,
		'6,5': 0.3,
		'6,6': 0.8
	});
	Z = eye( N );
	SR = new Float64Array([ 1.0, 3.5, 3.5, 1.5 ]);
	SI = new Float64Array([ 0.0, 0.5, -0.5, 0.0 ]);
	run( true, true, 0, N, 0, 5, 4, SR, SI, H, 0, 5, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
	assertArrayClose( toArray( SR ), tc.SR, 1e-14, 'SR' );
	assertArrayClose( toArray( SI ), tc.SI, 1e-14, 'SI' );
});

test( 'dlaqr5: 8x8_5shifts_odd', function t() {
	var tc;
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	tc = _8x8_5shifts_odd;
	N = 8;
	H = colMajor( N, {
		'1,1': 10.0,
		'1,2': 2.0,
		'1,3': 1.0,
		'1,4': 0.5,
		'1,5': 0.3,
		'1,6': 0.2,
		'1,7': 0.1,
		'1,8': 0.05, // eslint-disable-line max-len
		'2,1': 3.0,
		'2,2': 9.0,
		'2,3': 2.0,
		'2,4': 1.0,
		'2,5': 0.4,
		'2,6': 0.3,
		'2,7': 0.2,
		'2,8': 0.1, // eslint-disable-line max-len
		'3,2': 2.5,
		'3,3': 8.0,
		'3,4': 1.5,
		'3,5': 0.5,
		'3,6': 0.4,
		'3,7': 0.3,
		'3,8': 0.15, // eslint-disable-line max-len
		'4,3': 2.0,
		'4,4': 7.0,
		'4,5': 1.0,
		'4,6': 0.5,
		'4,7': 0.4,
		'4,8': 0.2,
		'5,4': 1.5,
		'5,5': 6.0,
		'5,6': 1.0,
		'5,7': 0.5,
		'5,8': 0.3,
		'6,5': 1.0,
		'6,6': 5.0,
		'6,7': 0.8,
		'6,8': 0.4,
		'7,6': 0.8,
		'7,7': 4.0,
		'7,8': 0.6,
		'8,7': 0.5,
		'8,8': 3.0
	});
	Z = eye( N );
	SR = new Float64Array([ 5.0, 5.0, 3.0, 3.0, 2.0 ]);
	SI = new Float64Array([ 1.0, -1.0, 0.5, -0.5, 0.0 ]);
	run( true, true, 0, N, 0, 7, 5, SR, SI, H, 0, 7, Z );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
});

// ---- Additional coverage tests (no fixtures — verify structural properties) ---- // eslint-disable-line max-len

/**
* IsUpperHessenberg.
*
* @private
* @param {*} H - H
* @param {*} N - N
* @param {number} tol - tolerance
* @returns {*} result
*/
function isUpperHessenberg( H, N, tol ) {
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 2; i < N; i++ ) {
			if ( Math.abs( H[ i + j * N ] ) > tol ) {
				return false;
			}
		}
	}
	return true;
}

/**
* Matmul.
*
* @private
* @param {*} A - A
* @param {*} B - B
* @param {*} N - N
* @returns {*} result
*/
function matmul( A, B, N ) {
	var C = new Float64Array( N * N );
	var i;
	var j;
	var k;
	for ( j = 0; j < N; j++ ) {
		for ( k = 0; k < N; k++ ) {
			for ( i = 0; i < N; i++ ) {
				C[ i + j * N ] += A[ i + k * N ] * B[ k + j * N ];
			}
		}
	}
	return C;
}

/**
* TransposeM.
*
* @private
* @param {*} A - A
* @param {*} N - N
* @returns {*} result
*/
function transposeM( A, N ) {
	var AT = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			AT[ i + j * N ] = A[ j + i * N ];
		}
	}
	return AT;
}

/**
* MatFrobNorm.
*
* @private
* @param {*} A - A
* @param {*} N - N
* @returns {*} result
*/
function matFrobNorm( A, N ) {
	var s = 0.0;
	var i;
	for ( i = 0; i < N * N; i++ ) {
		s += A[ i ] * A[ i ];
	}
	return Math.sqrt( s );
}

test( 'dlaqr5: bmp22 at KTOP-1 (ktop=0, kbot=1, 2 shifts)', function t() {
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	N = 4;
	H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 4.0;
	H[ 0 + 1 * N ] = 3.0;
	H[ 1 + 0 * N ] = 1.0;
	H[ 1 + 1 * N ] = 3.0;
	H[ 2 + 2 * N ] = 2.0;
	H[ 3 + 3 * N ] = 1.0;
	Z = eye( N );
	SR = new Float64Array( [ 3.5, 3.5 ] );
	SI = new Float64Array( [ 0.5, -0.5 ] );
	run( true, true, 0, N, 0, 1, 2, SR, SI, H, 0, 1, Z );
	assert.ok( isUpperHessenberg( H, N, 1e-14 ), 'H should be upper Hessenberg' );
});

test( 'dlaqr5: tiny sub-diagonals trigger deflation (convergence test)', function t() { // eslint-disable-line max-len
	var relErr;
	var Horig;
	var ZtHZ;
	var diff;
	var ZtH;
	var SR;
	var SI;
	var N;
	var H;
	var Z;
	var i;

	N = 6;
	H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 5.0;
	H[ 0 + 1 * N ] = 2.0;
	H[ 0 + 2 * N ] = 1.0;
	H[ 0 + 3 * N ] = 0.5;
	H[ 0 + 4 * N ] = 0.3;
	H[ 0 + 5 * N ] = 0.2;
	H[ 1 + 0 * N ] = 1e-16;
	H[ 1 + 1 * N ] = 4.0;
	H[ 1 + 2 * N ] = 1.5;
	H[ 1 + 3 * N ] = 0.8;
	H[ 1 + 4 * N ] = 0.4;
	H[ 1 + 5 * N ] = 0.3;
	H[ 2 + 1 * N ] = 1e-16;
	H[ 2 + 2 * N ] = 3.0;
	H[ 2 + 3 * N ] = 1.0;
	H[ 2 + 4 * N ] = 0.5;
	H[ 2 + 5 * N ] = 0.2;
	H[ 3 + 2 * N ] = 1e-16;
	H[ 3 + 3 * N ] = 2.0;
	H[ 3 + 4 * N ] = 0.6;
	H[ 3 + 5 * N ] = 0.3;
	H[ 4 + 3 * N ] = 1e-16;
	H[ 4 + 4 * N ] = 1.5;
	H[ 4 + 5 * N ] = 0.5;
	H[ 5 + 4 * N ] = 1e-16;
	H[ 5 + 5 * N ] = 0.8;
	Horig = new Float64Array( H );
	Z = eye( N );
	SR = new Float64Array( [ 3.0, 3.0 ] );
	SI = new Float64Array( [ 0.5, -0.5 ] );
	run( true, true, 0, N, 0, 5, 2, SR, SI, H, 0, 5, Z );
	assert.ok( isUpperHessenberg( H, N, 1e-12 ), 'H should be upper Hessenberg' );
	ZtH = matmul( transposeM( Z, N ), Horig, N );
	ZtHZ = matmul( ZtH, Z, N );
	diff = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		diff[ i ] = ZtHZ[ i ] - H[ i ];
	}
	relErr = matFrobNorm( diff, N ) / Math.max( matFrobNorm( Horig, N ), 1.0 );
	assert.ok( relErr < 1e-12, 'Similarity transform should be preserved (relErr=' + relErr + ')' ); // eslint-disable-line max-len
});

test( 'dlaqr5: zero-diagonal matrix (tst1 === 0 branch)', function t() {
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	N = 6;
	H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 0.0;
	H[ 0 + 1 * N ] = 2.0;
	H[ 0 + 2 * N ] = 1.0;
	H[ 0 + 3 * N ] = 0.5;
	H[ 0 + 4 * N ] = 0.3;
	H[ 0 + 5 * N ] = 0.2;
	H[ 1 + 0 * N ] = 1e-17;
	H[ 1 + 1 * N ] = 0.0;
	H[ 1 + 2 * N ] = 1.5;
	H[ 1 + 3 * N ] = 0.8;
	H[ 1 + 4 * N ] = 0.4;
	H[ 1 + 5 * N ] = 0.3;
	H[ 2 + 1 * N ] = 1e-17;
	H[ 2 + 2 * N ] = 0.0;
	H[ 2 + 3 * N ] = 1.0;
	H[ 2 + 4 * N ] = 0.5;
	H[ 2 + 5 * N ] = 0.2;
	H[ 3 + 2 * N ] = 1e-17;
	H[ 3 + 3 * N ] = 0.0;
	H[ 3 + 4 * N ] = 0.6;
	H[ 3 + 5 * N ] = 0.3;
	H[ 4 + 3 * N ] = 1e-17;
	H[ 4 + 4 * N ] = 0.0;
	H[ 4 + 5 * N ] = 0.5;
	H[ 5 + 4 * N ] = 1e-17;
	H[ 5 + 5 * N ] = 0.0;
	Z = eye( N );
	SR = new Float64Array( [ 1.0, 1.0 ] );
	SI = new Float64Array( [ 0.5, -0.5 ] );
	run( true, true, 0, N, 0, 5, 2, SR, SI, H, 0, 5, Z );
	assert.ok( isUpperHessenberg( H, N, 1e-10 ), 'H should be upper Hessenberg' );
});

test( 'dlaqr5: accum with wantt=false (kacc22=2)', function t() {
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	N = 8;
	H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 10;
	H[ 0 + 1 * N ] = 2;
	H[ 0 + 2 * N ] = 1;
	H[ 0 + 3 * N ] = 0.5;
	H[ 0 + 4 * N ] = 0.3;
	H[ 0 + 5 * N ] = 0.2;
	H[ 0 + 6 * N ] = 0.1;
	H[ 0 + 7 * N ] = 0.05;
	H[ 1 + 0 * N ] = 3;
	H[ 1 + 1 * N ] = 9;
	H[ 1 + 2 * N ] = 2;
	H[ 1 + 3 * N ] = 1;
	H[ 1 + 4 * N ] = 0.4;
	H[ 1 + 5 * N ] = 0.3;
	H[ 1 + 6 * N ] = 0.2;
	H[ 1 + 7 * N ] = 0.1;
	H[ 2 + 1 * N ] = 2.5;
	H[ 2 + 2 * N ] = 8;
	H[ 2 + 3 * N ] = 1.5;
	H[ 2 + 4 * N ] = 0.5;
	H[ 2 + 5 * N ] = 0.4;
	H[ 2 + 6 * N ] = 0.3;
	H[ 2 + 7 * N ] = 0.15;
	H[ 3 + 2 * N ] = 2;
	H[ 3 + 3 * N ] = 7;
	H[ 3 + 4 * N ] = 1;
	H[ 3 + 5 * N ] = 0.5;
	H[ 3 + 6 * N ] = 0.4;
	H[ 3 + 7 * N ] = 0.2;
	H[ 4 + 3 * N ] = 1.5;
	H[ 4 + 4 * N ] = 6;
	H[ 4 + 5 * N ] = 1;
	H[ 4 + 6 * N ] = 0.5;
	H[ 4 + 7 * N ] = 0.3;
	H[ 5 + 4 * N ] = 1;
	H[ 5 + 5 * N ] = 5;
	H[ 5 + 6 * N ] = 0.8;
	H[ 5 + 7 * N ] = 0.4;
	H[ 6 + 5 * N ] = 0.8;
	H[ 6 + 6 * N ] = 4;
	H[ 6 + 7 * N ] = 0.6;
	H[ 7 + 6 * N ] = 0.5;
	H[ 7 + 7 * N ] = 3;
	Z = eye( N );
	SR = new Float64Array( [ 5, 5, 3, 3 ] );
	SI = new Float64Array( [ 1, -1, 0.5, -0.5 ] );
	run( false, true, 2, N, 0, 7, 4, SR, SI, H, 0, 7, Z );
	assert.ok( isUpperHessenberg( H, N, 1e-10 ), 'H should be upper Hessenberg' );
});

test( 'dlaqr5: bmp22 with larger window (ktop=0, kbot=3, 4 shifts)', function t() { // eslint-disable-line max-len
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	N = 6;
	H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 6.0;
	H[ 0 + 1 * N ] = 2.0;
	H[ 0 + 2 * N ] = 1.5;
	H[ 0 + 3 * N ] = 1.0;
	H[ 0 + 4 * N ] = 0.5;
	H[ 0 + 5 * N ] = 0.3;
	H[ 1 + 0 * N ] = 2.0;
	H[ 1 + 1 * N ] = 5.0;
	H[ 1 + 2 * N ] = 2.0;
	H[ 1 + 3 * N ] = 1.5;
	H[ 1 + 4 * N ] = 0.8;
	H[ 1 + 5 * N ] = 0.4;
	H[ 2 + 1 * N ] = 1.8;
	H[ 2 + 2 * N ] = 4.0;
	H[ 2 + 3 * N ] = 1.0;
	H[ 2 + 4 * N ] = 0.6;
	H[ 2 + 5 * N ] = 0.35;
	H[ 3 + 2 * N ] = 1.2;
	H[ 3 + 3 * N ] = 3.0;
	H[ 3 + 4 * N ] = 0.9;
	H[ 3 + 5 * N ] = 0.5;
	H[ 4 + 3 * N ] = 0.7;
	H[ 4 + 4 * N ] = 2.0;
	H[ 4 + 5 * N ] = 0.6;
	H[ 5 + 4 * N ] = 0.4;
	H[ 5 + 5 * N ] = 1.0;
	Z = eye( N );
	SR = new Float64Array( [ 4.0, 4.0, 2.0, 1.0 ] );
	SI = new Float64Array( [ 1.0, -1.0, 0.0, 0.0 ] );
	run( true, true, 0, N, 0, 3, 4, SR, SI, H, 0, 5, Z );
	assert.ok( isUpperHessenberg( H, N, 1e-10 ), 'H should be upper Hessenberg' );
});

test( 'dlaqr5: 3x3 with 2 shifts (minimal for 3x3 bulge + deflation)', function t() { // eslint-disable-line max-len
	var relErr;
	var Horig;
	var ZtHZ;
	var diff;
	var ZtH;
	var SR;
	var SI;
	var N;
	var H;
	var Z;
	var i;

	N = 3;
	H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 3.0;
	H[ 0 + 1 * N ] = 2.0;
	H[ 0 + 2 * N ] = 1.0;
	H[ 1 + 0 * N ] = 1.0;
	H[ 1 + 1 * N ] = 2.0;
	H[ 1 + 2 * N ] = 1.5;
	H[ 2 + 1 * N ] = 0.5;
	H[ 2 + 2 * N ] = 1.0;
	Horig = new Float64Array( H );
	Z = eye( N );
	SR = new Float64Array( [ 2.5, 2.5 ] );
	SI = new Float64Array( [ 0.3, -0.3 ] );
	run( true, true, 0, N, 0, 2, 2, SR, SI, H, 0, 2, Z );
	ZtH = matmul( transposeM( Z, N ), Horig, N );
	ZtHZ = matmul( ZtH, Z, N );
	diff = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		diff[ i ] = ZtHZ[ i ] - H[ i ];
	}
	relErr = matFrobNorm( diff, N ) / Math.max( matFrobNorm( Horig, N ), 1.0 );
	assert.ok( relErr < 1e-12, 'Similarity transform preserved (relErr=' + relErr + ')' ); // eslint-disable-line max-len
});

test( 'dlaqr5: zero-diagonal with large sub-diags (tst1 === 0, 3x3 path)', function t() { // eslint-disable-line max-len
	var SR;
	var SI;
	var N;
	var H;
	var Z;

	N = 6;
	H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 0.0;
	H[ 0 + 1 * N ] = 2.0;
	H[ 0 + 2 * N ] = 1.0;
	H[ 0 + 3 * N ] = 0.5;
	H[ 0 + 4 * N ] = 0.3;
	H[ 0 + 5 * N ] = 0.2;
	H[ 1 + 0 * N ] = 1.5;
	H[ 1 + 1 * N ] = 0.0;
	H[ 1 + 2 * N ] = 1.5;
	H[ 1 + 3 * N ] = 0.8;
	H[ 1 + 4 * N ] = 0.4;
	H[ 1 + 5 * N ] = 0.3;
	H[ 2 + 1 * N ] = 1.2;
	H[ 2 + 2 * N ] = 0.0;
	H[ 2 + 3 * N ] = 1.0;
	H[ 2 + 4 * N ] = 0.5;
	H[ 2 + 5 * N ] = 0.2;
	H[ 3 + 2 * N ] = 1.0;
	H[ 3 + 3 * N ] = 0.0;
	H[ 3 + 4 * N ] = 0.6;
	H[ 3 + 5 * N ] = 0.3;
	H[ 4 + 3 * N ] = 0.8;
	H[ 4 + 4 * N ] = 0.0;
	H[ 4 + 5 * N ] = 0.5;
	H[ 5 + 4 * N ] = 0.6;
	H[ 5 + 5 * N ] = 0.0;
	Z = eye( N );
	SR = new Float64Array( [ 1.0, 1.0 ] );
	SI = new Float64Array( [ 0.5, -0.5 ] );
	run( true, true, 0, N, 0, 5, 2, SR, SI, H, 0, 5, Z );
	assert.ok( isUpperHessenberg( H, N, 1e-10 ), 'H should be upper Hessenberg' );
});
