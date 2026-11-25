/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlarrj from './../lib/dlarrj.js';
import ndarray from './../lib/ndarray.js';


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

test( 'dlarrj is a function', function t() {
	assert.strictEqual( typeof dlarrj, 'function', 'is a function' );
});

test( 'dlarrj has expected arity', function t() {
	assert.strictEqual( dlarrj.length, 17, 'has expected arity' );
});

test( 'dlarrj throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarrj( -1, 2, 1, new Float64Array( 4 ), 1, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'dlarrj: negative strideE2 uses an (N-1)-element E2 (ticket 0068)', function t() {
	const PIVMIN = 2.2250738585072014e-308;
	const w1 = new Float64Array( [ 1.1, 2.1, 3.9 ] );
	const e1 = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	const w2 = new Float64Array( w1 );
	const e2 = new Float64Array( e1 );
	const d = new Float64Array( [ 2.0, 3.0, 2.0 ] );
	let i;

	// E2 has N-1 = 2 elements; stored reversed for stride -1:
	const i1 = ndarray( 3, d, 1, 0, new Float64Array( [ 1.0, 0.5 ] ), 1, 0, 1, 3, 1e-14, 0, w1, 1, 0, e1, 1, 0, new Float64Array( 12 ), 1, 0, new Int32Array( 12 ), 1, 0, PIVMIN, 3.0 ); // eslint-disable-line max-len
	const i2 = dlarrj( 3, d, 1, guarded( new Float64Array( [ 0.5, 1.0 ] ) ), -1, 1, 3, 1e-14, 0, w2, 1, e2, 1, null, null, PIVMIN, 3.0 ); // eslint-disable-line max-len
	assert.strictEqual( i2, i1, 'info' );
	for ( i = 0; i < 3; i++ ) {
		assert.strictEqual( w2[ i ], w1[ i ], 'w[' + i + ']' );
		assert.strictEqual( e2[ i ], e1[ i ], 'WERR[' + i + ']' );
	}
});
