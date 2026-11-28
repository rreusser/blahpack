/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasy2 from './../lib/strided.js';

// FIXTURES //

import n1_1_n2_1_basic from './fixtures/n1_1_n2_1_basic.json' with { type: 'json' };
import n1_1_n2_2 from './fixtures/n1_1_n2_2.json' with { type: 'json' };
import n1_2_n2_1 from './fixtures/n1_2_n2_1.json' with { type: 'json' };
import n1_2_n2_2 from './fixtures/n1_2_n2_2.json' with { type: 'json' };
import n1_1_n2_1_ltranl_t_ltranr_t_isgn__1 from './fixtures/n1_1_n2_1_ltranl_t_ltranr_t_isgn_-1.json' with { type: 'json' };
import n1_1_n2_2_ltranr_t from './fixtures/n1_1_n2_2_ltranr_t.json' with { type: 'json' };
import n1_2_n2_1_ltranl_t from './fixtures/n1_2_n2_1_ltranl_t.json' with { type: 'json' };
import n1_2_n2_2_ltranl_t_ltranr_t from './fixtures/n1_2_n2_2_ltranl_t_ltranr_t.json' with { type: 'json' };
import n1_2_n2_2_ltranl_t_isgn__1 from './fixtures/n1_2_n2_2_ltranl_t_isgn_-1.json' with { type: 'json' };
import n1_2_n2_2_ltranr_t_isgn__1 from './fixtures/n1_2_n2_2_ltranr_t_isgn_-1.json' with { type: 'json' };
import n1_1_n2_1_isgn__1 from './fixtures/n1_1_n2_1_isgn_-1.json' with { type: 'json' };
import n1_1_n2_2_isgn__1 from './fixtures/n1_1_n2_2_isgn_-1.json' with { type: 'json' };
import n1_2_n2_1_isgn__1 from './fixtures/n1_2_n2_1_isgn_-1.json' with { type: 'json' };
import n1_1_n2_1_near_singular from './fixtures/n1_1_n2_1_near-singular.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Solves the Sylvester equation with `dlasy2` (column-major, leading dimension 2) and returns the outputs together with the relative residual of `op(TL)*X + isgn*X*op(TR) = scale*B`.
*
* @private
* @param {boolean} ltranl - whether to transpose `TL`
* @param {boolean} ltranr - whether to transpose `TR`
* @param {integer} isgn - sign
* @param {integer} n1 - order of `TL`
* @param {integer} n2 - order of `TR`
* @param {Array} tl - `TL` in column-major order with leading dimension 2
* @param {Array} tr - `TR` in column-major order with leading dimension 2
* @param {Array} b - `B` in column-major order with leading dimension 2
* @returns {Object} result
*/
function solveAndCheck( ltranl, ltranr, isgn, n1, n2, tl, tr, b ) {
	const TL = new Float64Array( tl );
	const TR = new Float64Array( tr );
	const B = new Float64Array( b );
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( ltranl, ltranr, isgn, n1, n2, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	let denom = 0.0;
	let resid = 0.0;
	let xinf = 0.0;
	let row;
	let s;
	let i;
	let j;
	let k;
	for ( i = 0; i < n1; i++ ) {
		row = 0.0;
		for ( j = 0; j < n2; j++ ) {
			s = -scale[ 0 ] * B[ i + ( 2 * j ) ];
			for ( k = 0; k < n1; k++ ) {
				s += ( ( ltranl ) ? TL[ k + ( 2 * i ) ] : TL[ i + ( 2 * k ) ] ) * X[ k + ( 2 * j ) ];
			}
			for ( k = 0; k < n2; k++ ) {
				s += isgn * X[ i + ( 2 * k ) ] * ( ( ltranr ) ? TR[ j + ( 2 * k ) ] : TR[ k + ( 2 * j ) ] );
			}
			resid = Math.max( resid, Math.abs( s ) );
			denom = Math.max( denom, Math.abs( scale[ 0 ] * B[ i + ( 2 * j ) ] ) );
			row += Math.abs( X[ i + ( 2 * j ) ] );
		}
		xinf = Math.max( xinf, row );
	}
	return {
		'info': info,
		'scale': scale[ 0 ],
		'xnorm': xnorm[ 0 ],
		'xinf': xinf,
		'X': X,
		'relres': ( denom > 0.0 ) ? resid / denom : resid
	};
}


// TESTS //

test( 'dlasy2: n1=1 n2=1 basic', function t() {

	const tc = n1_1_n2_1_basic;
	const TL = new Float64Array([ 3.0, 0, 0, 0 ]);
	const TR = new Float64Array([ 2.0, 0, 0, 0 ]);
	const B = new Float64Array([ 10.0, 0, 0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, 1, 1, 1, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=1 n2=2', function t() {

	const tc = n1_1_n2_2;
	const TL = new Float64Array([ 2.0, 0, 0, 0 ]);
	const TR = new Float64Array([ 1.0, -0.5, 0.5, 1.0 ]);
	const B = new Float64Array([ 3.0, 0, 4.0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, 1, 1, 2, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=2 n2=1', function t() {

	const tc = n1_2_n2_1;
	const TL = new Float64Array([ 2.0, -0.5, 0.5, 2.0 ]);
	const TR = new Float64Array([ 1.0, 0, 0, 0 ]);
	const B = new Float64Array([ 3.0, 4.0, 0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, 1, 2, 1, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=2 n2=2', function t() {

	const tc = n1_2_n2_2;
	const TL = new Float64Array([ 1.0, -0.5, 0.5, 1.0 ]);
	const TR = new Float64Array([ 2.0, -0.3, 0.3, 2.0 ]);
	const B = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, 1, 2, 2, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: quick return for n1=0', function t() {

	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, 1, 0, 1, new Float64Array(4), 1, 2, 0, new Float64Array(4), 1, 2, 0, new Float64Array(4), 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlasy2: n1=1 n2=1 ltranl=T ltranr=T isgn=-1', function t() {

	const tc = n1_1_n2_1_ltranl_t_ltranr_t_isgn__1;
	const TL = new Float64Array([ 3.0, 0, 0, 0 ]);
	const TR = new Float64Array([ 2.0, 0, 0, 0 ]);
	const B = new Float64Array([ 10.0, 0, 0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( true, true, -1, 1, 1, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=1 n2=2 ltranr=T', function t() {

	const tc = n1_1_n2_2_ltranr_t;
	const TL = new Float64Array([ 2.0, 0, 0, 0 ]);
	const TR = new Float64Array([ 1.0, -0.5, 0.5, 1.0 ]);
	const B = new Float64Array([ 3.0, 0, 4.0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, true, 1, 1, 2, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=2 n2=1 ltranl=T', function t() {

	const tc = n1_2_n2_1_ltranl_t;
	const TL = new Float64Array([ 2.0, -0.5, 0.5, 2.0 ]);
	const TR = new Float64Array([ 1.0, 0, 0, 0 ]);
	const B = new Float64Array([ 3.0, 4.0, 0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( true, false, 1, 2, 1, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=2 n2=2 ltranl=T ltranr=T', function t() {

	const tc = n1_2_n2_2_ltranl_t_ltranr_t;
	const TL = new Float64Array([ 1.0, -0.5, 0.5, 1.0 ]);
	const TR = new Float64Array([ 2.0, -0.3, 0.3, 2.0 ]);
	const B = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( true, true, 1, 2, 2, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=2 n2=2 ltranl=T isgn=-1', function t() {

	const tc = n1_2_n2_2_ltranl_t_isgn__1;
	const TL = new Float64Array([ 1.0, -0.5, 0.5, 1.0 ]);
	const TR = new Float64Array([ 2.0, -0.3, 0.3, 2.0 ]);
	const B = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( true, false, -1, 2, 2, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=2 n2=2 ltranr=T isgn=-1', function t() {

	const tc = n1_2_n2_2_ltranr_t_isgn__1;
	const TL = new Float64Array([ 1.0, -0.5, 0.5, 1.0 ]);
	const TR = new Float64Array([ 2.0, -0.3, 0.3, 2.0 ]);
	const B = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, true, -1, 2, 2, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=1 n2=1 isgn=-1', function t() {

	const tc = n1_1_n2_1_isgn__1;
	const TL = new Float64Array([ 3.0, 0, 0, 0 ]);
	const TR = new Float64Array([ 2.0, 0, 0, 0 ]);
	const B = new Float64Array([ 10.0, 0, 0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, -1, 1, 1, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=1 n2=2 isgn=-1', function t() {

	const tc = n1_1_n2_2_isgn__1;
	const TL = new Float64Array([ 2.0, 0, 0, 0 ]);
	const TR = new Float64Array([ 1.0, -0.5, 0.5, 1.0 ]);
	const B = new Float64Array([ 3.0, 0, 4.0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, -1, 1, 2, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=2 n2=1 isgn=-1', function t() {

	const tc = n1_2_n2_1_isgn__1;
	const TL = new Float64Array([ 2.0, -0.5, 0.5, 2.0 ]);
	const TR = new Float64Array([ 1.0, 0, 0, 0 ]);
	const B = new Float64Array([ 3.0, 4.0, 0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, -1, 2, 1, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-14, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
});

test( 'dlasy2: n1=1 n2=1 near-singular', function t() {

	const tc = n1_1_n2_1_near_singular;
	const TL = new Float64Array([ 1.0e-300, 0, 0, 0 ]);
	const TR = new Float64Array([ -1.0e-300, 0, 0, 0 ]);
	const B = new Float64Array([ 1.0, 0, 0, 0 ]);
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const info = dlasy2( false, false, 1, 1, 1, TL, 1, 2, 0, TR, 1, 2, 0, B, 1, 2, 0, scale, X, 1, 2, 0, xnorm ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( xnorm[ 0 ], tc.xnorm, 1e-10, 'xnorm' );
	assertArrayClose( toArray( X ), tc.X, 1e-10, 'X' );
});

test( 'dlasy2: n1=1 n2=1 scales the right-hand side to avoid overflow', function t() {
	const r = solveAndCheck( false, false, 1, 1, 1, [ 1.0, 0, 0, 0 ], [ 1.0, 0, 0, 0 ], [ 1.0e300, 0, 0, 0 ] ); // eslint-disable-line max-len
	assert.strictEqual( r.info, 0, 'info' );
	assert.strictEqual( r.scale, 1.0 / 1.0e300, 'scale = 1/|B|' );
	assert.ok( r.scale < 1.0, 'scale < 1' );
	assert.ok( r.relres <= 1e-14, 'residual: ' + r.relres );
	assert.strictEqual( r.xnorm, r.xinf, 'xnorm is the infinity norm of X' );
});

test( 'dlasy2: n1=1 n2=2 residual for pivots that swap rows and/or columns (all ltranr, isgn)', function t() {
	const cases = [
		// Largest element is TR(1,2) or TR(2,1): off-diagonal pivot
		[ 0.5, [ 1.0, -3.0, 10.0, 2.0 ] ],
		[ 0.5, [ 1.0, 10.0, -3.0, 2.0 ] ],

		// Largest element is TR(2,2): pivot on the (2,2) entry
		[ 0.5, [ 1.0, 0.2, 0.5, 10.0 ] ]
	];
	const B = [ 1.0, 0, -2.0, 0 ];
	let isgn;
	let ltr;
	let r;
	let c;
	for ( c = 0; c < cases.length; c++ ) {
		for ( ltr = 0; ltr < 2; ltr++ ) {
			for ( isgn = -1; isgn <= 1; isgn += 2 ) {
				r = solveAndCheck( false, ltr === 1, isgn, 1, 2, [ cases[ c ][ 0 ], 0, 0, 0 ], cases[ c ][ 1 ], B ); // eslint-disable-line max-len
				assert.strictEqual( r.info, 0, 'info' );
				assert.strictEqual( r.scale, 1.0, 'scale' );
				assert.ok( r.relres <= 1e-14, 'residual case ' + c + ': ' + r.relres );
				assertClose( r.xnorm, r.xinf, 1e-15, 'xnorm' );
			}
		}
	}
});

test( 'dlasy2: n1=2 n2=1 residual for pivots that swap rows and/or columns (all ltranl, isgn)', function t() {
	const cases = [
		[ [ 1.0, -3.0, 10.0, 2.0 ], 0.5 ],
		[ [ 1.0, 10.0, -3.0, 2.0 ], 0.5 ],
		[ [ 1.0, 0.2, 0.5, 10.0 ], 0.5 ]
	];
	const B = [ 1.0, -2.0, 0, 0 ];
	let isgn;
	let ltl;
	let r;
	let c;
	for ( c = 0; c < cases.length; c++ ) {
		for ( ltl = 0; ltl < 2; ltl++ ) {
			for ( isgn = -1; isgn <= 1; isgn += 2 ) {
				r = solveAndCheck( ltl === 1, false, isgn, 2, 1, cases[ c ][ 0 ], [ cases[ c ][ 1 ], 0, 0, 0 ], B ); // eslint-disable-line max-len
				assert.strictEqual( r.info, 0, 'info' );
				assert.strictEqual( r.scale, 1.0, 'scale' );
				assert.ok( r.relres <= 1e-14, 'residual case ' + c + ': ' + r.relres );
				assertClose( r.xnorm, r.xinf, 1e-15, 'xnorm' );
			}
		}
	}
});

test( 'dlasy2: n1=1 n2=2 scales the right-hand side to avoid overflow', function t() {
	const r = solveAndCheck( false, false, 1, 1, 2, [ 1.0, 0, 0, 0 ], [ 1.0, 0, 0, 1.0 ], [ 1.0e300, 0, 1.0e300, 0 ] ); // eslint-disable-line max-len
	assert.strictEqual( r.info, 0, 'info' );
	assert.ok( r.scale < 1.0, 'scale < 1' );
	assert.strictEqual( r.scale, 0.5 / 1.0e300, 'scale = 0.5/max|B|' );
	assert.ok( r.relres <= 1e-14, 'residual: ' + r.relres );
});

test( 'dlasy2: n1=1 n2=2 singular second pivot is perturbed (info=1) and a consistent system is still solved exactly', function t() {
	// TL = 0, TR = [1 1; 1 1]: coefficient matrix [1 1; 1 1] has u22 = 0
	const r = solveAndCheck( false, false, 1, 1, 2, [ 0.0, 0, 0, 0 ], [ 1.0, 1.0, 1.0, 1.0 ], [ 1.0, 0, 1.0, 0 ] ); // eslint-disable-line max-len
	assert.strictEqual( r.info, 1, 'info' );
	assert.strictEqual( r.scale, 1.0, 'scale' );
	assert.strictEqual( r.relres, 0.0, 'residual' );
	assert.deepStrictEqual( [ r.X[ 0 ], r.X[ 2 ] ], [ 1.0, 0.0 ], 'X' );
});

test( 'dlasy2: n1=1 n2=2 all-zero coefficients: both pivots perturbed to smin and the right-hand side scaled', function t() {
	const smlnum = 2.2250738585072014e-308 / 2.220446049250313e-16;
	const r = solveAndCheck( false, false, 1, 1, 2, [ 0.0, 0, 0, 0 ], [ 0.0, 0, 0, 0 ], [ 1.0, 0, 1.0, 0 ] ); // eslint-disable-line max-len
	assert.strictEqual( r.info, 1, 'info' );
	assert.strictEqual( r.scale, 0.5, 'scale' );

	// X solves the perturbed system smin*I*X = scale*B
	assertClose( r.X[ 0 ] * smlnum, 0.5, 1e-15, 'X(1,1)' );
	assertClose( r.X[ 2 ] * smlnum, 0.5, 1e-15, 'X(1,2)' );
	assert.ok( Number.isFinite( r.xnorm ), 'xnorm finite' );
});

test( 'dlasy2: n1=2 n2=2 scales the right-hand side to avoid overflow', function t() {
	const r = solveAndCheck( false, true, -1, 2, 2, [ 3.0, 1.0, 0.5, 4.0 ], [ 1.0, 0.25, -0.5, -1.0 ], [ 1.0e300, -2.0e300, 0.5e300, 1.0e300 ] ); // eslint-disable-line max-len
	assert.strictEqual( r.info, 0, 'info' );
	assert.ok( r.scale < 1.0e-300, 'scale < 1/max|B|' );
	assert.ok( r.relres <= 1e-14, 'residual: ' + r.relres );
	assertClose( r.xnorm, r.xinf, 1e-15, 'xnorm' );
});

test( 'dlasy2: n1=2 n2=2 singular last pivot is perturbed (info=1) and a consistent system is still solved exactly', function t() {
	// TL = diag(1,2), TR = diag(1,3), isgn = -1: Kronecker diagonal (0, 1, -2, -1)
	const r = solveAndCheck( false, false, -1, 2, 2, [ 1.0, 0, 0, 2.0 ], [ 1.0, 0, 0, 3.0 ], [ 0.0, 1.0, -2.0, -1.0 ] ); // eslint-disable-line max-len
	assert.strictEqual( r.info, 1, 'info' );
	assert.strictEqual( r.scale, 1.0, 'scale' );
	assert.strictEqual( r.relres, 0.0, 'residual' );
	assert.deepStrictEqual( toArray( r.X ), [ 0.0, 1.0, 1.0, 1.0 ], 'X' );
});

test( 'dlasy2: n1=2 n2=2 all-zero coefficients: every pivot perturbed (info=1) and the right-hand side scaled', function t() {
	const smlnum = 2.2250738585072014e-308 / 2.220446049250313e-16;
	const r = solveAndCheck( true, true, 1, 2, 2, [ 0.0, 0, 0, 0 ], [ 0.0, 0, 0, 0 ], [ 1.0, 2.0, -4.0, 1.0 ] ); // eslint-disable-line max-len
	assert.strictEqual( r.info, 1, 'info' );
	assert.strictEqual( r.scale, 0.125 / 4.0, 'scale = (1/8)/max|B|' );

	// X solves the perturbed system smin*I*X = scale*B
	assertClose( r.X[ 0 ] * smlnum, r.scale * 1.0, 1e-15, 'X(1,1)' );
	assertClose( r.X[ 1 ] * smlnum, r.scale * 2.0, 1e-15, 'X(2,1)' );
	assertClose( r.X[ 2 ] * smlnum, r.scale * -4.0, 1e-15, 'X(1,2)' );
	assertClose( r.X[ 3 ] * smlnum, r.scale * 1.0, 1e-15, 'X(2,2)' );
});
