/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspgst from './../lib/dspgst.js';

import dpptrf from './../../dpptrf/lib/ndarray.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dspgst is a function', function t() {
	assert.strictEqual( typeof dspgst, 'function', 'is a function' );
});

test( 'dspgst has expected arity', function t() {
	assert.strictEqual( dspgst.length, 6, 'has expected arity' );
});

test( 'dspgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspgst( 'column-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspgst( 'column-major', 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dspgst throws TypeError for row-major order', function t() {
	assert.throws( function throws() {
		dspgst( 'row-major', 1, 'upper', 2, new Float64Array( 3 ), new Float64Array( 3 ) );
	}, TypeError );
});

test( 'dspgst throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dspgst( 'invalid', 1, 'upper', 2, new Float64Array( 3 ), new Float64Array( 3 ) );
	}, TypeError );
});

test( 'dspgst throws RangeError for invalid itype', function t() {
	assert.throws( function throws() {
		dspgst( 'column-major', 4, 'upper', 2, new Float64Array( 3 ), new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dspgst (column-major) matches ndarray for all itype and uplo', function t() {
	const uplos = [ 'upper', 'lower' ];
	let itype, APe, APw, BP, u, i;
	for ( itype = 1; itype <= 3; itype++ ) {
		for ( u = 0; u < uplos.length; u++ ) {
			// SPD B (diagonally dominant) and symmetric A, 3x3 packed:
			BP = new Float64Array( [ 4, 1, 5, 0.5, 1, 6 ] );
			dpptrf( uplos[ u ], 3, BP, 1, 0 );
			APe = new Float64Array( [ 2, -1, 3, 0.5, 1, -4 ] );
			APw = new Float64Array( APe );
			ndarray( itype, uplos[ u ], 3, APe, 1, 0, BP, 1, 0 );
			dspgst( 'column-major', itype, uplos[ u ], 3, APw, BP );
			for ( i = 0; i < APe.length; i++ ) {
				assert.equal( APw[ i ], APe[ i ], 'itype ' + itype + ' ' + uplos[ u ] + ' AP[' + i + ']' );
			}
		}
	}
});
