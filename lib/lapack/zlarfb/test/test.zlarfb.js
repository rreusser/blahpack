/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfb from './../lib/zlarfb.js';
import zlarfbNd from './../lib/strided.js';


// FUNCTIONS //

/**
* Returns a deterministic pseudo-random complex array.
*
* @private
* @param {NonNegativeInteger} n - number of complex elements
* @param {integer} seed - seed
* @returns {Complex128Array} array
*/
function fill( n, seed ) {
	const out = new Float64Array( 2 * n );
	let s = seed;
	let i;
	for ( i = 0; i < out.length; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( s / 1073741824 ) - 1.0;
	}
	return new Complex128Array( out.buffer );
}

/**
* Calls the wrapper with valid arguments, overriding selected ones.
*
* @private
* @param {Object} opts - overrides
* @returns {Complex128Array} output
*/
function call( opts ) {
	const a = {
		'order': 'column-major',
		'side': 'left',
		'trans': 'no-transpose',
		'direct': 'forward',
		'storev': 'columnwise',
		'M': 4,
		'N': 3,
		'K': 2,
		'LDV': 4,
		'LDT': 2,
		'LDC': 4,
		'LDWORK': 3
	};
	Object.assign( a, opts );
	return zlarfb( a.order, a.side, a.trans, a.direct, a.storev, a.M, a.N, a.K, fill( 64, 1 ), a.LDV, fill( 64, 2 ), a.LDT, fill( 64, 3 ), a.LDC, new Complex128Array( 64 ), a.LDWORK );
}

/**
* Calls the layout wrapper and `strided` on the same data and asserts identical outputs.
*
* @private
* @param {string} order - layout
* @param {string} side - side
* @param {string} trans - transpose operation
* @param {string} direct - direction
* @param {string} storev - storage direction
* @param {(Complex128Array|null)} WORK - workspace passed to the wrapper
*/
function checkAgainstStrided( order, side, trans, direct, storev, WORK ) {
	const label = [ order, side, trans, direct, storev, ( WORK ) ? 'WORK' : 'null' ].join( ' ' );
	const M = 6;
	const N = 5;
	const K = 2;
	const LD = 8;
	const V = fill( 128, 3 );
	const T = fill( 64, 5 );
	const C1 = fill( 128, 7 );
	const C2 = fill( 128, 7 );
	const W2 = new Complex128Array( 128 );
	let s1 = 1;
	let s2 = LD;
	let out;
	let c1;
	let c2;
	let i;
	if ( order === 'row-major' ) {
		s1 = LD;
		s2 = 1;
	}
	out = zlarfb( order, side, trans, direct, storev, M, N, K, V, LD, T, LD, C1, LD, WORK, LD );
	assert.strictEqual( out, C1, 'returns C' );
	zlarfbNd( side, trans, direct, storev, M, N, K, V, s1, s2, 0, T, s1, s2, 0, C2, s1, s2, 0, W2, s1, s2, 0 );
	c1 = reinterpret( C1, 0 );
	c2 = reinterpret( C2, 0 );
	for ( i = 0; i < c1.length; i++ ) {
		assert.strictEqual( c1[ i ], c2[ i ], label + ' C[' + i + ']' );
	}
	assert.notDeepStrictEqual( c1, reinterpret( fill( 128, 7 ), 0 ), label + ': C was modified' );
}


// TESTS //

test( 'zlarfb is a function', function t() {
	assert.strictEqual( typeof zlarfb, 'function', 'is a function' );
});

test( 'zlarfb has expected arity', function t() {
	assert.strictEqual( zlarfb.length, 16, 'has expected arity' );
});

test( 'zlarfb accepts valid arguments', function t() {
	assert.doesNotThrow( function ok() {
		call( {} );
	});
	assert.doesNotThrow( function ok() {
		call( { 'order': 'row-major', 'LDC': 3, 'LDV': 2 } );
	});
});

test( 'zlarfb throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		call( { 'order': 'invalid' } );
	}, TypeError );
});

test( 'zlarfb throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		call( { 'side': 'invalid' } );
	}, TypeError );
});

test( 'zlarfb throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		call( { 'trans': 'invalid' } );
	}, TypeError );
});

test( 'zlarfb throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		call( { 'direct': 'invalid' } );
	}, TypeError );
});

test( 'zlarfb throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		call( { 'storev': 'invalid' } );
	}, TypeError );
});

test( 'zlarfb throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		call( { 'M': -1 } );
	}, RangeError );
});

test( 'zlarfb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		call( { 'N': -1 } );
	}, RangeError );
});

test( 'zlarfb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		call( { 'K': -1 } );
	}, RangeError );
});

test( 'zlarfb throws RangeError for LDC < M (column-major)', function t() {
	assert.throws( function throws() {
		call( { 'LDC': 3 } );
	}, RangeError );
});

test( 'zlarfb throws RangeError for LDC < N (row-major)', function t() {
	assert.throws( function throws() {
		call( { 'order': 'row-major', 'LDC': 2, 'LDV': 2 } );
	}, RangeError );
});

test( 'zlarfb throws RangeError for LDT < K', function t() {
	assert.throws( function throws() {
		call( { 'LDT': 1 } );
	}, RangeError );
});

test( 'zlarfb matches strided for all option combinations (both layouts, allocated and provided WORK)', function t() {
	const orders = [ 'column-major', 'row-major' ];
	const sides = [ 'left', 'right' ];
	const transes = [ 'no-transpose', 'conjugate-transpose' ];
	const directs = [ 'forward', 'backward' ];
	const storevs = [ 'columnwise', 'rowwise' ];
	let a;
	let b;
	let c;
	let d;
	let e;
	for ( a = 0; a < orders.length; a++ ) {
		for ( b = 0; b < sides.length; b++ ) {
			for ( c = 0; c < transes.length; c++ ) {
				for ( d = 0; d < directs.length; d++ ) {
					for ( e = 0; e < storevs.length; e++ ) {
						checkAgainstStrided( orders[ a ], sides[ b ], transes[ c ], directs[ d ], storevs[ e ], null );
						checkAgainstStrided( orders[ a ], sides[ b ], transes[ c ], directs[ d ], storevs[ e ], new Complex128Array( 128 ) );
					}
				}
			}
		}
	}
});
