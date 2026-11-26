/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeevx from './../lib/zgeevx.js';


// TESTS //

test( 'zgeevx is a function', function t() {
	assert.strictEqual( typeof zgeevx, 'function', 'is a function' );
});

test( 'zgeevx allocates a sufficient workspace when WORK and RWORK are null (ticket 0096)', function t() { // eslint-disable-line max-len
	const senses = [ 'none', 'both' ];
	const sizes = [ 3, 40, 70 ];
	let seed = 11;
	let res, Av0, N, i, s, j, k;
	function run( sense, N, Av0, WORK, RWORK ) {
		const out = {
			'A': new Complex128Array( Av0 ),
			'w': new Complex128Array( N ),
			'VL': new Complex128Array( N * N ),
			'VR': new Complex128Array( N * N ),
			'SCALE': new Float64Array( N ),
			'abnrm': new Float64Array( 1 ),
			'RCONDE': new Float64Array( N ),
			'RCONDV': new Float64Array( N )
		};
		out.info = zgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', sense, N, out.A, N, out.w, 1, out.VL, N, out.VR, N, new Int32Array( 1 ), new Int32Array( 1 ), out.SCALE, 1, out.abnrm, out.RCONDE, 1, out.RCONDV, 1, WORK, RWORK ); // eslint-disable-line max-len
		out.A = reinterpret( out.A, 0 );
		out.w = reinterpret( out.w, 0 );
		out.VL = reinterpret( out.VL, 0 );
		out.VR = reinterpret( out.VR, 0 );
		return out;
	}
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		Av0 = new Float64Array( 2 * N * N );
		for ( i = 0; i < Av0.length; i++ ) {
			seed = ( seed * 16807 ) % 2147483647;
			Av0[ i ] = ( seed / 2147483647 ) - 0.5;
		}
		for ( j = 0; j < senses.length; j++ ) {
			res = [ run( senses[ j ], N, Av0, null, null ), run( senses[ j ], N, Av0, new Complex128Array( ( 2 * N * N ) + ( 100 * N ) ), new Float64Array( 2 * N ) ) ]; // eslint-disable-line max-len
			assert.equal( res[ 0 ].info, 0, 'info' );
			for ( k in res[ 0 ] ) {
				if ( Object.prototype.hasOwnProperty.call( res[ 0 ], k ) ) {
					assert.deepEqual( res[ 0 ][ k ], res[ 1 ][ k ], k );
				}
			}
		}
	}
});
