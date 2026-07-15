/**
* Scalar traits: the element-type seam that makes every generator, reference
* operation, and check work for BOTH real (`d`) and complex (`z`) routines
* without duplication.
*
* A trait encapsulates everything type-dependent:
*   - physical storage: how many Float64 slots an element occupies, how to
*     allocate a poisoned (NaN-filled) API-ready array, and how to read/write an
*     element at an ELEMENT index (matching the ndarray convention, where
*     strides/offsets count elements, not floats);
*   - arithmetic on element VALUES (harness-internal representation): real values
*     are plain JS numbers; complex values are `{ re, im }` objects;
*   - the API scalar form passed to a routine (a bare number, or a Complex128);
*   - exact-equality and finiteness for the assertion layer.
*
* Because a complex Hermitian matrix degenerates to a real symmetric one under
* `conj = identity`, structure code (symmetric/Hermitian, SPD/HPD) is written
* once against `conj`/`mul`/`abs` and specializes automatically.
*/

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import creal from '@stdlib/complex/float64/real/lib/index.js';
import cimag from '@stdlib/complex/float64/imag/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

// REAL //

var real = {
	'name': 'real',
	'floatsPerElem': 1,
	'zero': 0.0,
	'one': 1.0,

	/**
	* Allocate a poisoned (NaN) Float64Array of `nElem` elements.
	*/
	'alloc': function alloc( nElem ) {
		var a = new Float64Array( nElem );
		a.fill( NaN );
		return a;
	},
	'read': function read( data, idx ) {
		return data[ idx ];
	},
	'write': function write( data, idx, v ) {
		data[ idx ] = v;
	},

	'add': function add( a, b ) { return a + b; },
	'sub': function sub( a, b ) { return a - b; },
	'mul': function mul( a, b ) { return a * b; },
	'neg': function neg( a ) { return -a; },
	'conj': function conj( a ) { return a; },
	'abs': function abs( a ) { return Math.abs( a ); },
	'scale': function scale( a, s ) { return a * s; }, // s is a real number
	'fromReal': function fromReal( x ) { return x; },

	'eq': function eq( a, b ) { return Object.is( a, b ); },
	'isFinite': function isFin( a ) { return Number.isFinite( a ); },
	'components': function components( a ) { return [ a ]; },
	'random': function random( rng ) { return rng.normal(); },

	/**
	* The scalar as passed to a routine's scalar argument (alpha/beta): a number.
	*/
	'apiScalar': function apiScalar( a ) { return a; }
};


// COMPLEX //

var complex = {
	'name': 'complex',
	'floatsPerElem': 2,
	'zero': { 're': 0.0, 'im': 0.0 },
	'one': { 're': 1.0, 'im': 0.0 },

	/**
	* Allocate a poisoned Complex128Array of `nElem` elements over NaN-filled
	* Float64 backing, so any untouched element reads as NaN+NaNi.
	*/
	'alloc': function alloc( nElem ) {
		var f = new Float64Array( nElem * 2 );
		f.fill( NaN );
		return new Complex128Array( f.buffer );
	},
	'read': function read( data, idx ) {
		var f = reinterpret( data, 0 );
		return { 're': f[ idx * 2 ], 'im': f[ ( idx * 2 ) + 1 ] };
	},
	'write': function write( data, idx, v ) {
		var f = reinterpret( data, 0 );
		f[ idx * 2 ] = v.re;
		f[ ( idx * 2 ) + 1 ] = v.im;
	},

	'add': function add( a, b ) {
		return { 're': a.re + b.re, 'im': a.im + b.im };
	},
	'sub': function sub( a, b ) {
		return { 're': a.re - b.re, 'im': a.im - b.im };
	},
	'mul': function mul( a, b ) {
		return {
			're': ( a.re * b.re ) - ( a.im * b.im ),
			'im': ( a.re * b.im ) + ( a.im * b.re )
		};
	},
	'neg': function neg( a ) {
		return { 're': -a.re, 'im': -a.im };
	},
	'conj': function conj( a ) {
		return { 're': a.re, 'im': -a.im };
	},
	'abs': function abs( a ) {
		return Math.hypot( a.re, a.im );
	},
	'scale': function scale( a, s ) {
		return { 're': a.re * s, 'im': a.im * s };
	},
	'fromReal': function fromReal( x ) {
		return { 're': x, 'im': 0.0 };
	},

	'eq': function eq( a, b ) {
		return Object.is( a.re, b.re ) && Object.is( a.im, b.im );
	},
	'isFinite': function isFin( a ) {
		return Number.isFinite( a.re ) && Number.isFinite( a.im );
	},
	'components': function components( a ) {
		return [ a.re, a.im ];
	},
	'random': function random( rng ) {
		return { 're': rng.normal(), 'im': rng.normal() };
	},

	'apiScalar': function apiScalar( a ) {
		return new Complex128( a.re, a.im );
	}
};


// HELPERS //

/**
* Look up a trait by prefix ('d'/'s' -> real, 'z'/'c' -> complex) or name.
*
* @param {string} key
* @returns {Object} scalar trait
*/
function scalarOf( key ) {
	var k = String( key ).toLowerCase();
	if ( k === 'z' || k === 'c' || k === 'complex' ) {
		return complex;
	}
	if ( k === 'd' || k === 's' || k === 'real' ) {
		return real;
	}
	throw new Error( 'unknown scalar type: '+key );
}


// EXPORTS //

export { real, complex, scalarOf, creal, cimag };
