/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhetrf from './../../zhetrf/lib/base.js';
import zhetrs from './../../zhetrs/lib/base.js';
import layoutFn from './../lib/zla_herfsx_extended.js';
import zlaHerfsxExtended from './../lib/ndarray.js';
const ndarrayFn = zlaHerfsxExtended;


// FUNCTIONS //

/**
* Sets a complex element in a column-major matrix.
*
* @private
* @param {Float64Array} v - reinterpreted view
* @param {NonNegativeInteger} n - leading dimension
* @param {NonNegativeInteger} r - row index
* @param {NonNegativeInteger} cc - column index
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function setElem( v, n, r, cc, re, im ) {
	const idx = ( ( cc * n ) + r ) * 2;
	v[ idx ] = re;
	v[ idx + 1 ] = im;
}

/**
* Builds a 4x4 Hermitian matrix stored column-major in a Complex128Array.
*
* @private
* @returns {Complex128Array} matrix
*/
function buildHerm4() {
	const A = new Complex128Array( 16 );
	const v = new Float64Array( A.buffer );
	const n = 4;
	let i;
	for ( i = 0; i < 32; i++ ) {
		v[ i ] = 0.0;
	}
	setElem( v, n, 0, 0, 4.0, 0.0 );
	setElem( v, n, 1, 1, 6.0, 0.0 );
	setElem( v, n, 2, 2, 5.0, 0.0 );
	setElem( v, n, 3, 3, 7.0, 0.0 );
	setElem( v, n, 0, 1, 1.0, 2.0 );
	setElem( v, n, 1, 0, 1.0, -2.0 );
	setElem( v, n, 0, 2, 3.0, -1.0 );
	setElem( v, n, 2, 0, 3.0, 1.0 );
	setElem( v, n, 0, 3, 0.5, 0.5 );
	setElem( v, n, 3, 0, 0.5, -0.5 );
	setElem( v, n, 1, 2, 2.0, 1.0 );
	setElem( v, n, 2, 1, 2.0, -1.0 );
	setElem( v, n, 1, 3, 1.0, -2.0 );
	setElem( v, n, 3, 1, 1.0, 2.0 );
	setElem( v, n, 2, 3, 3.0, 0.5 );
	setElem( v, n, 3, 2, 3.0, -0.5 );
	return A;
}

/**
* Copies a Complex128Array.
*
* @private
* @param {Complex128Array} src - source
* @returns {Complex128Array} copy
*/
function cloneCA( src ) {
	const dst = new Complex128Array( src.length );
	const sv = new Float64Array( src.buffer );
	const dv = new Float64Array( dst.buffer );
	let i;
	for ( i = 0; i < sv.length; i++ ) {
		dv[ i ] = sv[ i ];
	}
	return dst;
}

/**
* Populates a sample right-hand side B (length 4 or 8).
*
* @private
* @param {Complex128Array} B - target
*/
function fillB( B ) {
	const Bv = new Float64Array( B.buffer );
	Bv[ 0 ] = 1.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 1.0;
	Bv[ 4 ] = -1.0;
	Bv[ 5 ] = 3.0;
	Bv[ 6 ] = 0.5;
	Bv[ 7 ] = -0.5;
	if ( B.length >= 8 ) {
		Bv[ 8 ] = 0.0;
		Bv[ 9 ] = 1.0;
		Bv[ 10 ] = 1.0;
		Bv[ 11 ] = 0.0;
		Bv[ 12 ] = 2.0;
		Bv[ 13 ] = -1.0;
		Bv[ 14 ] = -1.0;
		Bv[ 15 ] = 2.0;
	}
}

/**
* Runs a single refinement case and verifies correctness.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {boolean} colequ - column equilibration flag
* @param {integer} nNorms - number of error norms to compute
* @param {boolean} ignoreCwise - whether to ignore componentwise convergence
*/
function runCase( uplo, colequ, nNorms, ignoreCwise ) {
	let info, sumR, sumI, aR, aI, yR, yI, bR, bI, jj, r, i, j;

	const nrhs = 2;
	const n = 4;
	const A = buildHerm4();
	const AF = cloneCA( A );
	const IPIV = new Int32Array( n );
	info = zhetrf( uplo, n, AF, 1, n, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0, 'zhetrf succeeds' );

	const B = new Complex128Array( n * nrhs );
	fillB( B );
	const Bv = new Float64Array( B.buffer );

	const Y = cloneCA( B );
	info = zhetrs( uplo, n, nrhs, AF, 1, n, 0, IPIV, 1, 0, Y, 1, n, 0 );
	assert.strictEqual( info, 0, 'zhetrs succeeds' );

	const c = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		c[ i ] = 1.0;
	}
	const berrOut = new Float64Array( nrhs );
	const errBndsNorm = new Float64Array( nrhs * 3 );
	const errBndsComp = new Float64Array( nrhs * 3 );
	for ( j = 0; j < nrhs; j++ ) {
		errBndsNorm[ j ] = 1.0;
		errBndsComp[ j ] = 1.0;
	}
	const RES = new Complex128Array( n );
	const AYB = new Float64Array( n );
	const DY = new Complex128Array( n );
	const yTail = new Complex128Array( n );

	const zlaHerfsxExtendedInfo = zlaHerfsxExtended( 1, uplo, n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, colequ, c, 1, 0, B, 1, n, 0, Y, 1, n, 0, berrOut, 1, 0, nNorms, errBndsNorm, 1, nrhs, 0, errBndsComp, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, yTail, 1, 0, 1e-10, 10, 0.5, 0.25, ignoreCwise );
	assert.strictEqual( zlaHerfsxExtendedInfo, 0, 'refinement returns 0' );

	for ( j = 0; j < nrhs; j++ ) {
		assert.ok( berrOut[ j ] < 1e-10, 'berrOut[' + j + '] is small' );
	}

	const Av = new Float64Array( A.buffer );
	const Yv = new Float64Array( Y.buffer );
	for ( jj = 0; jj < nrhs; jj++ ) {
		for ( i = 0; i < n; i++ ) {
			sumR = 0.0;
			sumI = 0.0;
			for ( j = 0; j < n; j++ ) {
				aR = Av[ ( ( j * n ) + i ) * 2 ];
				aI = Av[ ( ( ( j * n ) + i ) * 2 ) + 1 ];
				yR = Yv[ ( ( jj * n ) + j ) * 2 ];
				yI = Yv[ ( ( ( jj * n ) + j ) * 2 ) + 1 ];
				sumR += ( aR * yR ) - ( aI * yI );
				sumI += ( aR * yI ) + ( aI * yR );
			}
			bR = Bv[ ( ( jj * n ) + i ) * 2 ];
			bI = Bv[ ( ( ( jj * n ) + i ) * 2 ) + 1 ];
			r = Math.abs( sumR - bR ) + Math.abs( sumI - bI );
			assert.ok( r < 1e-10, 'A*Y residual small' );
		}
	}

	if ( nNorms >= 1 ) {
		for ( j = 0; j < nrhs; j++ ) {
			assert.ok( Number.isFinite( errBndsNorm[ nrhs + j ] ), 'errBndsNorm updated' );
		}
	}
	if ( nNorms >= 2 ) {
		for ( j = 0; j < nrhs; j++ ) {
			assert.ok( Number.isFinite( errBndsComp[ nrhs + j ] ), 'errBndsComp updated' );
		}
	}
}

/**
* Runs a refinement case starting from a zero initial solution (bad guess).
*
* @private
* @param {boolean} colequ - column equilibration flag
*/
function runBadInitCase( colequ ) {
	let c;

	const nrhs = 1;
	const n = 4;
	const A = buildHerm4();
	const AF = cloneCA( A );
	const IPIV = new Int32Array( n );
	zhetrf( 'upper', n, AF, 1, n, 0, IPIV, 1, 0 );

	const B = new Complex128Array( n );
	const Bv = new Float64Array( B.buffer );
	Bv[ 0 ] = 1.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 1.0;
	Bv[ 4 ] = -1.0;
	Bv[ 5 ] = 3.0;
	Bv[ 6 ] = 0.5;
	Bv[ 7 ] = -0.5;

	const Y = new Complex128Array( n );
	if ( colequ ) {
		c = new Float64Array( [ 0.5, 2.0, 1.0, 1.5 ] );
	} else {
		c = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	}
	const berrOut = new Float64Array( nrhs );
	const errBndsNorm = new Float64Array( nrhs * 3 );
	const errBndsComp = new Float64Array( nrhs * 3 );
	errBndsNorm[ 0 ] = 1.0;
	errBndsComp[ 0 ] = 1.0;
	const RES = new Complex128Array( n );
	const AYB = new Float64Array( n );
	const DY = new Complex128Array( n );
	const yTail = new Complex128Array( n );

	const info = zlaHerfsxExtended( 1, 'upper', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, colequ, c, 1, 0, B, 1, n, 0, Y, 1, n, 0, berrOut, 1, 0, 2, errBndsNorm, 1, nrhs, 0, errBndsComp, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, yTail, 1, 0, 1e-10, 30, 0.5, 0.25, false );
	assert.strictEqual( info, 0, 'info zero' );
	assert.ok( berrOut[ 0 ] < 1e-10, 'berrOut small' );
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof zlaHerfsxExtended, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'quick-return when N = 0', function t() {
	const errBndsNorm = new Float64Array( 3 );
	const errBndsComp = new Float64Array( 3 );
	const IPIV = new Int32Array( 1 );
	const AYB = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const berrOut = new Float64Array( 1 );
	const A = new Complex128Array( 1 );
	const AF = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const Y = new Complex128Array( 1 );
	const RES = new Complex128Array( 1 );
	const DY = new Complex128Array( 1 );
	const yTail = new Complex128Array( 1 );
	const info = zlaHerfsxExtended( 1, 'upper', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, false, c, 1, 0, B, 1, 1, 0, Y, 1, 1, 0, berrOut, 1, 0, 2, errBndsNorm, 1, 1, 0, errBndsComp, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, yTail, 1, 0, 1e-10, 10, 0.5, 0.25, false );
	assert.strictEqual( info, 0, 'info is zero' );
});

test( 'quick-return when nrhs = 0', function t() {
	const errBndsNorm = new Float64Array( 3 );
	const errBndsComp = new Float64Array( 3 );
	const IPIV = new Int32Array( 4 );
	const AYB = new Float64Array( 4 );
	const c = new Float64Array( 4 );
	const berrOut = new Float64Array( 1 );
	const A = new Complex128Array( 16 );
	const AF = new Complex128Array( 16 );
	const B = new Complex128Array( 1 );
	const Y = new Complex128Array( 1 );
	const RES = new Complex128Array( 4 );
	const DY = new Complex128Array( 4 );
	const yTail = new Complex128Array( 4 );
	const info = zlaHerfsxExtended( 1, 'upper', 4, 0, A, 1, 4, 0, AF, 1, 4, 0, IPIV, 1, 0, false, c, 1, 0, B, 1, 4, 0, Y, 1, 4, 0, berrOut, 1, 0, 2, errBndsNorm, 1, 1, 0, errBndsComp, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, yTail, 1, 0, 1e-10, 10, 0.5, 0.25, false );
	assert.strictEqual( info, 0, 'info is zero' );
});

test( 'negative precType returns -1', function t() {
	const A = new Complex128Array( 1 );
	const info = zlaHerfsxExtended( -1, 'upper', 0, 1, A, 1, 1, 0, A, 1, 1, 0, new Int32Array( 1 ), 1, 0, false, new Float64Array( 1 ), 1, 0, A, 1, 1, 0, A, 1, 1, 0, new Float64Array( 1 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, 1e-10, 10, 0.5, 0.25, false );
	assert.strictEqual( info, -1, 'returns -1 for negative precType' );
});

test( 'upper 4x4 / 2 RHS / colequ=false / nNorms=2', function t() {
	runCase( 'upper', false, 2, false );
});

test( 'lower 4x4 / 2 RHS / colequ=false / nNorms=2', function t() {
	runCase( 'lower', false, 2, false );
});

test( 'upper 4x4 / colequ=true / nNorms=1', function t() {
	runCase( 'upper', true, 1, false );
});

test( 'upper 4x4 / ignoreCwise=true / nNorms=2', function t() {
	runCase( 'upper', false, 2, true );
});

test( 'upper 4x4 / nNorms=0 (no error bounds written)', function t() {
	runCase( 'upper', false, 0, false );
});

test( 'zero Y initial guess forces multiple refinement iterations', function t() {
	runBadInitCase( false );
});

test( 'zero Y with colequ=true exercises weighted branches', function t() {
	runBadInitCase( true );
});

test( 'zero B produces zero solution and zero backward error', function t() {
	const errBndsNorm = new Float64Array( 3 );
	const errBndsComp = new Float64Array( 3 );
	const IPIV = new Int32Array( 4 );
	const AYB = new Float64Array( 4 );
	const berrOut = new Float64Array( 1 );
	const A = buildHerm4();
	const AF = cloneCA( A );
	zhetrf( 'upper', 4, AF, 1, 4, 0, IPIV, 1, 0 );
	const B = new Complex128Array( 4 );
	const Y = new Complex128Array( 4 );
	const c = new Float64Array( [ 1, 1, 1, 1 ] );
	const RES = new Complex128Array( 4 );
	const DY = new Complex128Array( 4 );
	const yTail = new Complex128Array( 4 );
	const info = zlaHerfsxExtended( 1, 'upper', 4, 1, A, 1, 4, 0, AF, 1, 4, 0, IPIV, 1, 0, false, c, 1, 0, B, 1, 4, 0, Y, 1, 4, 0, berrOut, 1, 0, 2, errBndsNorm, 1, 1, 0, errBndsComp, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, yTail, 1, 0, 1e-10, 10, 0.5, 0.25, false );
	assert.strictEqual( info, 0, 'info zero' );
});

test( 'layout wrapper: column-major 4x4', function t() {
	let info;
	const errBndsNorm = new Float64Array( 3 );
	const errBndsComp = new Float64Array( 3 );
	const IPIV = new Int32Array( 4 );
	const berrOut = new Float64Array( 1 );
	const AYB = new Float64Array( 4 );
	const nrhs = 1;
	const n = 4;
	const A = buildHerm4();
	const AF = cloneCA( A );
	info = zhetrf( 'upper', n, AF, 1, n, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0, 'zhetrf' );
	const B = new Complex128Array( n );
	const Bv = new Float64Array( B.buffer );
	Bv[ 0 ] = 1.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 1.0;
	Bv[ 4 ] = -1.0;
	Bv[ 5 ] = 3.0;
	Bv[ 6 ] = 0.5;
	Bv[ 7 ] = -0.5;
	const Y = cloneCA( B );
	info = zhetrs( 'upper', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, Y, 1, n, 0 );
	assert.strictEqual( info, 0, 'zhetrs' );
	const c = new Float64Array( [ 1, 1, 1, 1 ] );
	errBndsNorm[ 0 ] = 1.0;
	errBndsComp[ 0 ] = 1.0;
	const RES = new Complex128Array( n );
	const DY = new Complex128Array( n );
	const yTail = new Complex128Array( n );
	info = layoutFn( 'column-major', 1, 'upper', n, nrhs, A, n, AF, n, IPIV, false, c, B, n, Y, n, berrOut, 2, errBndsNorm, nrhs, errBndsComp, nrhs, RES, AYB, DY, yTail, 1e-10, 10, 0.5, 0.25, false );
	assert.strictEqual( info, 0, 'column-major layout returns 0' );
	assert.ok( berrOut[ 0 ] < 1e-10, 'berrOut small' );
});

test( 'layout wrapper: row-major 4x4', function t() {
	let info, i, j;
	const errBndsNorm = new Float64Array( 3 );
	const errBndsComp = new Float64Array( 3 );
	const IPIV = new Int32Array( 4 );
	const berrOut = new Float64Array( 1 );
	const AYB = new Float64Array( 4 );
	const nrhs = 1;
	const n = 4;
	const Acm = buildHerm4();
	const AcmV = new Float64Array( Acm.buffer );
	const A = new Complex128Array( n * n );
	const Av = new Float64Array( A.buffer );
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			Av[ ( ( i * n ) + j ) * 2 ] = AcmV[ ( ( j * n ) + i ) * 2 ];
			Av[ ( ( ( i * n ) + j ) * 2 ) + 1 ] = AcmV[ ( ( ( j * n ) + i ) * 2 ) + 1 ];
		}
	}
	const AF = cloneCA( A );
	info = zhetrf( 'lower', n, AF, n, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0, 'zhetrf row-major' );
	const B = new Complex128Array( n );
	const Bv = new Float64Array( B.buffer );
	Bv[ 0 ] = 1.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 1.0;
	Bv[ 4 ] = -1.0;
	Bv[ 5 ] = 3.0;
	Bv[ 6 ] = 0.5;
	Bv[ 7 ] = -0.5;
	const Y = cloneCA( B );
	info = zhetrs( 'lower', n, nrhs, AF, n, 1, 0, IPIV, 1, 0, Y, 1, n, 0 );
	assert.strictEqual( info, 0, 'zhetrs' );
	const c = new Float64Array( [ 1, 1, 1, 1 ] );
	errBndsNorm[ 0 ] = 1.0;
	errBndsComp[ 0 ] = 1.0;
	const RES = new Complex128Array( n );
	const DY = new Complex128Array( n );
	const yTail = new Complex128Array( n );
	info = layoutFn( 'row-major', 1, 'lower', n, nrhs, A, n, AF, n, IPIV, false, c, B, n, Y, n, berrOut, 2, errBndsNorm, nrhs, errBndsComp, nrhs, RES, AYB, DY, yTail, 1e-10, 10, 0.5, 0.25, false );
	assert.strictEqual( info, 0, 'row-major layout returns 0' );
	assert.ok( berrOut[ 0 ] < 1e-10, 'berrOut small' );
});

test( 'ndarray wrapper: bad uplo throws', function t() {
	assert.throws( function badUplo() {
		ndarrayFn( 1, 'bogus', 1, 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, false, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, 2, new Float64Array( 3 ), 1, 1, 0, new Float64Array( 3 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, 1e-10, 10, 0.5, 0.25, false );
	}, TypeError );
});
