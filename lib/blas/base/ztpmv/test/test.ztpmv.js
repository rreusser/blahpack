/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpmv from './../lib/ztpmv.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'ztpmv is a function', function t() {
	assert.strictEqual( typeof ztpmv, 'function', 'is a function' );
});

test( 'ztpmv has expected arity', function t() {
	assert.strictEqual( ztpmv.length, 8, 'has expected arity' );
});

test( 'ztpmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpmv( 'column-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'ztpmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztpmv( 'column-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'ztpmv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztpmv( 'column-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'ztpmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpmv( 'column-major', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 2, 1 );
	}, RangeError );
});

test( 'ztpmv throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		ztpmv( 'row-major', 'upper', 'no-transpose', 'non-unit', 2, new Complex128Array( 3 ), new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'ztpmv matches ndarray (column-major, positive and negative strides)', function t() {
	const ap = [ 4.0, 1.0, 1.0, -1.0, 3.0, 0.5, -2.0, 0.0, 0.5, 2.0, 5.0, -1.0 ];
	const xv = [ 1.0, 2.0, 0.0, 0.0, -1.0, 0.5, 0.0, 0.0, 2.0, -3.0, 0.0, 0.0 ];
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		[ 'no-transpose', 'transpose', 'conjugate-transpose' ].forEach( function eachTrans( trans ) {
			[ 'non-unit', 'unit' ].forEach( function eachDiag( diag ) {
				[ 2, -2 ].forEach( function eachStride( sx ) {
					const label = uplo + '/' + trans + '/' + diag + '/' + sx;
					const AP = new Complex128Array( ap );
					const x1 = new Complex128Array( xv );
					const x2 = new Complex128Array( xv );
					const out = ztpmv( 'column-major', uplo, trans, diag, 3, AP, x1, sx );
					ndarray( uplo, trans, diag, 3, AP, 1, 0, x2, sx, ( sx > 0 ) ? 0 : 4 );
					assert.strictEqual( out, x1, label + ' returns x' );
					assert.deepStrictEqual( reinterpret( x1, 0 ), reinterpret( x2, 0 ), label + ' x' );
					assert.notDeepStrictEqual( reinterpret( x1, 0 ), new Float64Array( xv ), label + ' x changed' );
				});
			});
		});
	});
});
