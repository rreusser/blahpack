/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasd7 from './../lib/dlasd7.js';
import deflation from './fixtures/deflation.json' with { type: 'json' };


// VARIABLES //

const N = 7;


// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	let relErr, i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Embeds a vector into a strided buffer (`stride` may be negative), filling unused slots with `fill`.
*
* @private
* @param {TypedArray} x - logical vector
* @param {integer} stride - stride
* @param {*} fill - fill value
* @returns {TypedArray} strided buffer
*/
function embed( x, stride, fill ) {
	const s = Math.abs( stride );
	const out = new x.constructor( ( ( x.length - 1 ) * s ) + 1 ).fill( fill );
	let i;
	for ( i = 0; i < x.length; i++ ) {
		out[ ( stride > 0 ) ? i * s : ( x.length - 1 - i ) * s ] = x[ i ];
	}
	return out;
}

/**
* Extracts a logical vector from a strided buffer.
*
* @private
* @param {TypedArray} buf - strided buffer
* @param {NonNegativeInteger} len - logical length
* @param {integer} stride - stride
* @returns {Array} logical vector
*/
function extract( buf, len, stride ) {
	const s = Math.abs( stride );
	const out = [];
	let i;
	for ( i = 0; i < len; i++ ) {
		out.push( buf[ ( stride > 0 ) ? i * s : ( len - 1 - i ) * s ] );
	}
	return out;
}

/**
* Returns the inputs of the `deflation` fixture case (N = M = 7).
*
* @private
* @returns {Object} inputs
*/
function deflationCase() {
	return {
		'd': new Float64Array( [ 1.0, 2.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] ),
		'z': new Float64Array( N ),
		'ZW': new Float64Array( N ),
		'VF': new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ] ),
		'VFW': new Float64Array( N ),
		'VL': new Float64Array( [ 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ] ),
		'VLW': new Float64Array( N ),
		'DSIGMA': new Float64Array( N ),
		'IDX': new Int32Array( N ),
		'IDXP': new Int32Array( N ),
		'IDXQ': new Int32Array( [ 1, 2, 3, 0, 1, 2, 3 ] ),
		'PERM': new Int32Array( N )
	};
}

function checkScalars( out ) {
	const tc = deflation;
	assert.equal( out.info, tc.info, 'info' );
	assert.equal( out.K, tc.K, 'K' );
	assert.equal( out.givptr, tc.givptr, 'givptr' );
	assertArrayClose( [ out.c, out.s ], [ tc.c, tc.s ], 1e-14, 'c,s' );
}

function checkGivens( givcol1, givcol2, givnum1, givnum2 ) {
	const tc = deflation;
	assert.deepEqual( givcol1, tc.GIVCOL1, 'GIVCOL1' );
	assert.deepEqual( givcol2, tc.GIVCOL2, 'GIVCOL2' );
	assertArrayClose( givnum1, tc.GIVNUM1, 1e-14, 'GIVNUM1' );
	assertArrayClose( givnum2, tc.GIVNUM2, 1e-14, 'GIVNUM2' );
}

function runStrided( stride ) {
	const kOut = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const cOut = new Float64Array( 1 );
	const sOut = new Float64Array( 1 );
	const c = deflationCase();
	const b = {};
	let k;
	for ( k in c ) {
		if ( Object.prototype.hasOwnProperty.call( c, k ) ) {
			b[ k ] = embed( c[ k ], stride, ( c[ k ] instanceof Float64Array ) ? NaN : -99 );
		}
	}
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const out = {
		'info': dlasd7( 'column-major', 1, 3, 3, 0, kOut, b.d, stride, b.z, stride, b.ZW, stride, b.VF, stride, b.VFW, stride, b.VL, stride, b.VLW, stride, 0.5, 0.3, b.DSIGMA, stride, b.IDX, stride, b.IDXP, stride, b.IDXQ, stride, b.PERM, stride, givptr, GIVCOL, N, GIVNUM, N, cOut, sOut ),
		'K': kOut[ 0 ],
		'givptr': givptr[ 0 ],
		'c': cOut[ 0 ],
		's': sOut[ 0 ]
	};
	checkScalars( out );
	assertArrayClose( extract( b.d, N, stride ), deflation.D, 1e-14, 'D' );
	assertArrayClose( extract( b.z, N, stride ), deflation.Z, 1e-14, 'Z' );
	assertArrayClose( extract( b.DSIGMA, N, stride ), deflation.DSIGMA, 1e-14, 'DSIGMA' );
	assert.deepEqual( extract( b.IDX, N, stride ), deflation.IDX, 'IDX' );
	assert.deepEqual( extract( b.IDXP, N, stride ), deflation.IDXP, 'IDXP' );
	assert.deepEqual( extract( b.PERM, N, stride ), deflation.PERM, 'PERM' );
	checkGivens( Array.from( GIVCOL.slice( 0, N ) ), Array.from( GIVCOL.slice( N ) ), Array.from( GIVNUM.slice( 0, N ) ), Array.from( GIVNUM.slice( N ) ) );
}


// TESTS //

test( 'dlasd7 is a function', function t() {
	assert.strictEqual( typeof dlasd7, 'function', 'is a function' );
});

test( 'dlasd7 has expected arity', function t() {
	assert.strictEqual( dlasd7.length, 39, 'has expected arity' );
});

test( 'dlasd7 throws TypeError for invalid order', function t() {
	const c = deflationCase();
	assert.throws( function throws() {
		const kOut = new Int32Array( 1 );
		const givptr = new Int32Array( 1 );
		const cOut = new Float64Array( 1 );
		const sOut = new Float64Array( 1 );
		dlasd7( 'invalid', 1, 3, 3, 0, kOut, c.d, 1, c.z, 1, c.ZW, 1, c.VF, 1, c.VFW, 1, c.VL, 1, c.VLW, 1, 0.5, 0.3, c.DSIGMA, 1, c.IDX, 1, c.IDXP, 1, c.IDXQ, 1, c.PERM, 1, givptr, new Int32Array( 2 * N ), N, new Float64Array( 2 * N ), N, cOut, sOut );
	}, TypeError );
});

test( 'dlasd7 throws RangeError for too-small leading dimensions', function t() {
	const c = deflationCase();
	assert.throws( function throws() {
		const kOut = new Int32Array( 1 );
		const givptr = new Int32Array( 1 );
		const cOut = new Float64Array( 1 );
		const sOut = new Float64Array( 1 );
		dlasd7( 'column-major', 1, 3, 3, 0, kOut, c.d, 1, c.z, 1, c.ZW, 1, c.VF, 1, c.VFW, 1, c.VL, 1, c.VLW, 1, 0.5, 0.3, c.DSIGMA, 1, c.IDX, 1, c.IDXP, 1, c.IDXQ, 1, c.PERM, 1, givptr, new Int32Array( 2 * N ), N - 1, new Float64Array( 2 * N ), N, cOut, sOut );
	}, RangeError );
	assert.throws( function throws() {
		const kOut = new Int32Array( 1 );
		const givptr = new Int32Array( 1 );
		const cOut = new Float64Array( 1 );
		const sOut = new Float64Array( 1 );
		dlasd7( 'column-major', 1, 3, 3, 0, kOut, c.d, 1, c.z, 1, c.ZW, 1, c.VF, 1, c.VFW, 1, c.VL, 1, c.VLW, 1, 0.5, 0.3, c.DSIGMA, 1, c.IDX, 1, c.IDXP, 1, c.IDXQ, 1, c.PERM, 1, givptr, new Int32Array( 2 * N ), N, new Float64Array( 2 * N ), N - 1, cOut, sOut );
	}, RangeError );
	assert.throws( function throws() {
		const kOut = new Int32Array( 1 );
		const givptr = new Int32Array( 1 );
		const cOut = new Float64Array( 1 );
		const sOut = new Float64Array( 1 );
		dlasd7( 'row-major', 1, 3, 3, 0, kOut, c.d, 1, c.z, 1, c.ZW, 1, c.VF, 1, c.VFW, 1, c.VL, 1, c.VLW, 1, 0.5, 0.3, c.DSIGMA, 1, c.IDX, 1, c.IDXP, 1, c.IDXQ, 1, c.PERM, 1, givptr, new Int32Array( 2 * N ), 1, new Float64Array( 2 * N ), 2, cOut, sOut );
	}, RangeError );
	assert.throws( function throws() {
		const kOut = new Int32Array( 1 );
		const givptr = new Int32Array( 1 );
		const cOut = new Float64Array( 1 );
		const sOut = new Float64Array( 1 );
		dlasd7( 'row-major', 1, 3, 3, 0, kOut, c.d, 1, c.z, 1, c.ZW, 1, c.VF, 1, c.VFW, 1, c.VL, 1, c.VLW, 1, 0.5, 0.3, c.DSIGMA, 1, c.IDX, 1, c.IDXP, 1, c.IDXQ, 1, c.PERM, 1, givptr, new Int32Array( 2 * N ), 2, new Float64Array( 2 * N ), 1, cOut, sOut );
	}, RangeError );
});

test( 'dlasd7: column-major unit strides match fixture (deflation)', function t() {
	runStrided( 1 );
});

test( 'dlasd7: non-unit vector strides match fixture (deflation)', function t() {
	runStrided( 3 );
});

test( 'dlasd7: negative vector strides match fixture (deflation)', function t() {
	runStrided( -2 );
});

test( 'dlasd7: column-major with padded leading dimensions matches fixture', function t() {
	const kOut = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const cOut = new Float64Array( 1 );
	const sOut = new Float64Array( 1 );
	const c = deflationCase();
	const LD = N + 2;
	const GIVCOL = new Int32Array( 2 * LD ).fill( -99 );
	const GIVNUM = new Float64Array( 2 * LD ).fill( NaN );
	let i;
	for ( i = 0; i < N; i++ ) {
		GIVCOL[ i ] = 0;
		GIVCOL[ LD + i ] = 0;
		GIVNUM[ i ] = 0.0;
		GIVNUM[ LD + i ] = 0.0;
	}
	const out = {
		'info': dlasd7( 'column-major', 1, 3, 3, 0, kOut, c.d, 1, c.z, 1, c.ZW, 1, c.VF, 1, c.VFW, 1, c.VL, 1, c.VLW, 1, 0.5, 0.3, c.DSIGMA, 1, c.IDX, 1, c.IDXP, 1, c.IDXQ, 1, c.PERM, 1, givptr, GIVCOL, LD, GIVNUM, LD, cOut, sOut ),
		'K': kOut[ 0 ],
		'givptr': givptr[ 0 ],
		'c': cOut[ 0 ],
		's': sOut[ 0 ]
	};
	checkScalars( out );
	checkGivens( Array.from( GIVCOL.slice( 0, N ) ), Array.from( GIVCOL.slice( LD, LD + N ) ), Array.from( GIVNUM.slice( 0, N ) ), Array.from( GIVNUM.slice( LD, LD + N ) ) );
	assert.equal( GIVCOL[ N ], -99, 'padding untouched' );
});

test( 'dlasd7: row-major GIVCOL/GIVNUM match fixture', function t() {
	const kOut = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const cOut = new Float64Array( 1 );
	const sOut = new Float64Array( 1 );
	const c = deflationCase();
	const LD = 3;
	const GIVCOL = new Int32Array( N * LD ).fill( -99 );
	const GIVNUM = new Float64Array( N * LD ).fill( NaN );
	const givcol1 = [];
	const givcol2 = [];
	const givnum1 = [];
	const givnum2 = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		GIVCOL[ i * LD ] = 0;
		GIVCOL[ ( i * LD ) + 1 ] = 0;
		GIVNUM[ i * LD ] = 0.0;
		GIVNUM[ ( i * LD ) + 1 ] = 0.0;
	}
	const out = {
		'info': dlasd7( 'row-major', 1, 3, 3, 0, kOut, c.d, 1, c.z, 1, c.ZW, 1, c.VF, 1, c.VFW, 1, c.VL, 1, c.VLW, 1, 0.5, 0.3, c.DSIGMA, 1, c.IDX, 1, c.IDXP, 1, c.IDXQ, 1, c.PERM, 1, givptr, GIVCOL, LD, GIVNUM, LD, cOut, sOut ),
		'K': kOut[ 0 ],
		'givptr': givptr[ 0 ],
		'c': cOut[ 0 ],
		's': sOut[ 0 ]
	};
	for ( i = 0; i < N; i++ ) {
		givcol1.push( GIVCOL[ i * LD ] );
		givcol2.push( GIVCOL[ ( i * LD ) + 1 ] );
		givnum1.push( GIVNUM[ i * LD ] );
		givnum2.push( GIVNUM[ ( i * LD ) + 1 ] );
		assert.equal( GIVCOL[ ( i * LD ) + 2 ], -99, 'padding untouched' );
	}
	checkScalars( out );
	checkGivens( givcol1, givcol2, givnum1, givnum2 );
});
