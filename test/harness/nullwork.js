/**
* CONVENTIONS D5c: a `<routine>.js` wrapper given `WORK = null` must allocate
* a SUFFICIENT workspace (ticket 0060). This calls the wrapper twice on fresh
* copies of the same inputs, once with the workspace argument `null` and once
* with an ample one, and requires the return value and every array argument
* (except the workspace) to be bit-identical. An undersized allocation drops
* writes silently (typed arrays), so its results differ, usually by NaN.
*/

import assert from 'node:assert/strict';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

function flat( x ) {
	if ( x && x.constructor && x.constructor.name === 'Complex128Array' ) {
		return Array.from( reinterpret( x, 0 ) );
	}
	if ( ArrayBuffer.isView( x ) ) {
		return Array.from( x );
	}
	return null;
}

/**
* @param {Function} fn - wrapper
* @param {Function} makeArgs - returns a fresh argument array (fresh typed arrays) on each call
* @param {(integer|Array<integer>)} workIndex - position(s) of the workspace argument(s)
* @param {Function} ample - called with a workspace position; returns an ample workspace for it
* @param {string} label - assertion label
*/
function assertNullWorkspaceSufficient( fn, makeArgs, workIndex, ample, label ) {
	const idx = ( Array.isArray( workIndex ) ) ? workIndex : [ workIndex ];
	const a = makeArgs();
	const b = makeArgs();
	idx.forEach( function set( k ) {
		a[ k ] = null;
		b[ k ] = ample( k );
	});
	const ra = fn.apply( null, a );
	const rb = fn.apply( null, b );
	const fa = flat( ra );
	if ( fa ) {
		assert.deepEqual( fa, flat( rb ), label + ': returned array' );
	} else {
		assert.ok( Object.is( ra, rb ), label + ': return value' );
	}
	a.forEach( function each( x, i ) {
		const v = flat( x );
		if ( idx.includes( i ) || !v ) {
			return;
		}
		const w = flat( b[ i ] );
		v.forEach( function cmp( e, k ) {
			assert.ok( Object.is( e, w[ k ] ), label + ': argument ' + i + ' element ' + k + ' differs with WORK = null (' + e + ' vs ' + w[ k ] + ')' );
		});
	});
}

/**
* Deterministic, stateless test values in (-0.5, 0.5): the same `( n, phase )`
* always gives the same array, so `makeArgs` can be called twice.
*
* @param {NonNegativeInteger} n - length
* @param {number} phase - distinguishes arrays
* @returns {Float64Array} values
*/
function values( n, phase ) {
	const out = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) {
		out[ i ] = 0.5 * Math.sin( ( 1.7 * i ) + phase );
	}
	return out;
}

export { assertNullWorkspaceSufficient, values };
