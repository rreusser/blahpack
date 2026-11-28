/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhptrf from '../../zhptrf/lib/base.js';
import zhptri from './../lib/zhptri.js';
import strided from './../lib/strided.js';
import upperIndef from './fixtures/4x4_upper_indef.json' with { type: 'json' };
import lowerIndef from './fixtures/4x4_lower_indef.json' with { type: 'json' };


// TESTS //

test( 'zhptri is a function', function t() {
	assert.strictEqual( typeof zhptri, 'function', 'is a function' );
});

test( 'zhptri has expected arity', function t() {
	assert.strictEqual( zhptri.length, 7, 'has expected arity' );
});

test( 'zhptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhptri( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhptri( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhptri throws TypeError for row-major order (packed storage is column-major)', function t() {
	assert.throws( function throws() {
		zhptri( 'row-major', 'upper', 1, new Complex128Array( [ 4.0, 0.0 ] ), new Int32Array( [ 0 ] ), 1, null );
	}, TypeError );
});

test( 'zhptri (column-major) matches strided, with and without a WORK buffer', function t() {
	const data = [
		[ 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 2.0, -1.0, 4.0, 2.0, 0.0, 0.0, 3.0, 0.5, 5.0, -1.0, 6.0, 1.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 1.0, -1.0, 2.0, 1.0, 3.0, -0.5, 0.0, 0.0, 4.0, -2.0, 5.0, 1.0, 0.0, 0.0, 6.0, -1.0, 0.0, 0.0 ]
	];
	const uplos = [ 'upper', 'lower' ];
	const refs = [ upperIndef.ap, lowerIndef.ap ];
	const works = [ null, new Complex128Array( 4 ) ];
	let IPIV;
	let info1;
	let info2;
	let AP0;
	let AP1;
	let AP2;
	let v1;
	let v2;
	let i;
	let k;
	let w;

	for ( k = 0; k < uplos.length; k++ ) {
		for ( w = 0; w < works.length; w++ ) {
			AP0 = new Complex128Array( data[ k ] );
			IPIV = new Int32Array( 4 );
			assert.strictEqual( zhptrf( uplos[ k ], 4, AP0, 1, 0, IPIV, 1, 0 ), 0 );
			AP1 = new Complex128Array( reinterpret( AP0, 0 ) );
			AP2 = new Complex128Array( reinterpret( AP0, 0 ) );
			info1 = zhptri( 'column-major', uplos[ k ], 4, AP1, IPIV, 1, works[ w ] );
			info2 = strided( uplos[ k ], 4, AP2, 1, 0, IPIV, 1, 0, new Complex128Array( 4 ), 1, 0 );
			assert.strictEqual( info1, 0 );
			assert.strictEqual( info2, 0 );
			v1 = reinterpret( AP1, 0 );
			v2 = reinterpret( AP2, 0 );
			for ( i = 0; i < v1.length; i++ ) {
				assert.strictEqual( v1[ i ], v2[ i ], uplos[ k ] + ': AP[' + i + ']' );
				assert.ok( Math.abs( v1[ i ] - refs[ k ][ i ] ) <= 1e-12 * Math.max( 1.0, Math.abs( refs[ k ][ i ] ) ), uplos[ k ] + ': AP[' + i + '] vs reference' );
			}
		}
	}
});
