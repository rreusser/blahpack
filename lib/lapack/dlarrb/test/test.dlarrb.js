/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlarrb from './../lib/dlarrb.js';
import strided from './../lib/strided.js';


// FUNCTIONS //

/**
* Wraps a typed array so that reading an index past its end throws, instead of yielding `undefined` (which makes the bisection loop forever).
*
* @private
* @param {Float64Array} arr - input array
* @returns {Proxy} guarded array
*/
function guarded( arr ) {
	return new Proxy( arr, {
		'get': function get( target, key ) {
			const v = Reflect.get( target, key );
			if ( typeof key === 'string' && /^[0-9]+$/.test( key ) && Number( key ) >= target.length ) {
				throw new RangeError( 'out-of-bounds read at index ' + key );
			}
			return ( typeof v === 'function' ) ? v.bind( target ) : v;
		}
	});
}


// TESTS //

test( 'dlarrb is a function', function t() {
	assert.strictEqual( typeof dlarrb, 'function', 'is a function' );
});

test( 'dlarrb has expected arity', function t() {
	assert.strictEqual( dlarrb.length, 21, 'has expected arity' );
});

test( 'dlarrb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarrb( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 1, 1, 1e-8, 1e-14, 0, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 8 ), new Int32Array( 8 ), 1e-30, 1.0, -1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlarrb: zero-size quick return via layout wrapper', function t() {
	const info = dlarrb( 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, 1, 0, 1e-8, 1e-14, 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 2 ), new Int32Array( 2 ), 1e-30, 1.0, -1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
});

test( 'dlarrb: negative strideLLD uses an (N-1)-element LLD (ticket 0068)', function t() {
	const SAFMIN = 2.2250738585072014e-308;
	const w1 = new Float64Array( [ 1.1, 2.1, 3.9 ] );
	const e1 = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	const g1 = new Float64Array( [ 0.8, 1.5, 0.0 ] );
	const w2 = new Float64Array( w1 );
	const e2 = new Float64Array( e1 );
	const g2 = new Float64Array( g1 );
	const d = new Float64Array( [ 2.0, 2.5, 1.6 ] );
	let i;

	// LLD has N-1 = 2 elements; stored reversed for stride -1:
	const i1 = strided( 3, d, 1, 0, new Float64Array( [ 0.5, 0.4 ] ), 1, 0, 1, 3, 1e-8, 1e-14, 0, w1, 1, 0, g1, 1, 0, e1, 1, 0, new Float64Array( 6 ), 1, 0, new Int32Array( 6 ), 1, 0, SAFMIN, 3.0, -1 ); // eslint-disable-line max-len
	const i2 = dlarrb( 3, d, 1, guarded( new Float64Array( [ 0.4, 0.5 ] ) ), -1, 1, 3, 1e-8, 1e-14, 0, w2, 1, g2, 1, e2, 1, null, null, SAFMIN, 3.0, -1 ); // eslint-disable-line max-len
	assert.strictEqual( i2, i1, 'info' );
	for ( i = 0; i < 3; i++ ) {
		assert.strictEqual( w2[ i ], w1[ i ], 'w[' + i + ']' );
		assert.strictEqual( e2[ i ], e1[ i ], 'WERR[' + i + ']' );
		assert.strictEqual( g2[ i ], g1[ i ], 'WGAP[' + i + ']' );
	}
});
