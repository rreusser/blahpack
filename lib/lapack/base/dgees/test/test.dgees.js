/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dgees from './../lib/dgees.js';
import ndarray from './../lib/ndarray.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'dgees is a function', function t() {
	assert.strictEqual( typeof dgees, 'function', 'is a function' );
});

test( 'dgees has expected arity', function t() {
	assert.strictEqual( dgees.length, 16, 'has expected arity' );
});

test( 'dgees throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgees( 'column-major', 'no-vectors', 'none', 2, -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgees allocates WORK and BWORK when they are omitted, giving the same result as explicit workspace', function t() {
	const N = 4;
	const A0 = new Float64Array( [ 4.0, 1.0, -2.0, 0.5, 1.0, 3.0, 0.0, -1.0, 2.0, -1.0, 1.0, 2.5, 0.3, 0.7, -1.5, 2.0 ] ); // eslint-disable-line max-len
	const results = [];
	let info;
	let k;
	let r;
	for ( k = 0; k < 3; k++ ) {
		r = {
			'A': new Float64Array( A0 ),
			'sdim': new Int32Array( 1 ),
			'WR': new Float64Array( N ),
			'WI': new Float64Array( N ),
			'VS': new Float64Array( N * N )
		};
		if ( k === 0 ) {
			info = dgees( 'column-major', 'compute-vectors', 'sort', select, N, r.A, N, r.sdim, r.WR, 1, r.WI, 1, r.VS, N, new Float64Array( 3 * N ), new Uint8Array( N ) ); // eslint-disable-line max-len
		} else if ( k === 1 ) {
			info = dgees( 'column-major', 'compute-vectors', 'sort', select, N, r.A, N, r.sdim, r.WR, 1, r.WI, 1, r.VS, N, null, null ); // eslint-disable-line max-len
		} else {
			info = dgees( 'column-major', 'compute-vectors', 'sort', select, N, r.A, N, r.sdim, r.WR, 1, r.WI, 1, r.VS, N ); // eslint-disable-line max-len
		}
		assert.strictEqual( info, 0, 'info ' + k );
		results.push( r );
	}
	assert.ok( results[ 0 ].sdim[ 0 ] > 0, 'some eigenvalues selected' );
	for ( k = 1; k < 3; k++ ) {
		assert.deepStrictEqual( results[ k ].sdim, results[ 0 ].sdim, 'sdim ' + k );
		assert.deepStrictEqual( results[ k ].WR, results[ 0 ].WR, 'WR ' + k );
		assert.deepStrictEqual( results[ k ].WI, results[ 0 ].WI, 'WI ' + k );
		assert.deepStrictEqual( results[ k ].A, results[ 0 ].A, 'T ' + k );
		assert.deepStrictEqual( results[ k ].VS, results[ 0 ].VS, 'VS ' + k );
	}

	function select( wr ) {
		return wr > 2.0;
	}
});

test( 'dgees with N = 0 and omitted workspace returns info = 0 and sdim = 0', function t() {
	const sdim = new Int32Array( [ 5 ] );
	const WR = new Float64Array( [ 7.0 ] );
	const info = dgees( 'row-major', 'compute-vectors', 'sort', function select() {
		return true;
	}, 0, new Float64Array( 1 ), 1, sdim, WR, 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null, null ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( sdim[ 0 ], 0, 'sdim' );
	assert.strictEqual( WR[ 0 ], 7.0, 'WR untouched' );
});

test( 'dgees allocates a sufficient workspace when WORK and BWORK are null (the optimum; tickets 0096, 0100)', function t() { // eslint-disable-line max-len
	const sizes = [ 3, 40 ];
	let seed = 11;
	let A0, A1, A2, r1, r2, i1, i2, V1, V2, N, i, s;
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		A0 = new Float64Array( N * N );
		for ( i = 0; i < A0.length; i++ ) {
			seed = ( seed * 16807 ) % 2147483647;
			A0[ i ] = ( seed / 2147483647 ) - 0.5;
		}
		A1 = new Float64Array( A0 );
		A2 = new Float64Array( A0 );
		r1 = new Float64Array( N );
		r2 = new Float64Array( N );
		i1 = new Float64Array( N );
		i2 = new Float64Array( N );
		V1 = new Float64Array( N * N );
		V2 = new Float64Array( N * N );
		assert.equal( dgees( 'column-major', 'compute-vectors', 'none', null, N, A1, N, new Int32Array( 1 ), r1, 1, i1, 1, V1, N, null, null ), 0 ); // eslint-disable-line max-len
		ndarray( 'compute-vectors', 'none', null, N, A2, 1, N, 0, new Int32Array( 1 ), r2, 1, 0, i2, 1, 0, V2, 1, N, 0, new Float64Array( computeOptimalWorkSize( 'compute-vectors', N ) ), 1, 0, new Uint8Array( N ), 1, 0 ); // eslint-disable-line max-len
		assert.deepEqual( r1, r2, 'WR' );
		assert.deepEqual( i1, i2, 'WI' );
		assert.deepEqual( V1, V2, 'VS' );
		assert.deepEqual( A1, A2, 'T' );
	}
});
