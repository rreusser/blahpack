/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

/* eslint-disable camelcase, max-len, no-mixed-operators, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zgbtrf from './../../zgbtrf/lib/base.js';
import zla_gbrcond_x from './../lib/zla_gbrcond_x.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var RWORK;
	var LDAFB;
	var LDAB;
	var IPIV;
	var WORK;
	var afbv;
	var AFB;
	var abv;
	var AB;
	var KL;
	var KU;
	var xv;
	var x;
	var i;

	KL = 1;
	KU = 1;
	LDAB = KL + KU + 1;
	LDAFB = ( 2 * KL ) + KU + 1;
	AB = new Complex128Array( LDAB * N );
	AFB = new Complex128Array( LDAFB * N );
	IPIV = new Int32Array( N );
	x = new Complex128Array( N );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	abv = new Float64Array( AB.buffer );
	afbv = new Float64Array( AFB.buffer );
	xv = new Float64Array( x.buffer );

	for ( i = 0; i < N; i++ ) {
		abv[ 2 * ( 1 + ( i * LDAB ) ) ] = 4.0;
		abv[ ( 2 * ( 1 + ( i * LDAB ) ) ) + 1 ] = 1.0;
		afbv[ 2 * ( 2 + ( i * LDAFB ) ) ] = 4.0;
		afbv[ ( 2 * ( 2 + ( i * LDAFB ) ) ) + 1 ] = 1.0;
		xv[ 2 * i ] = 1.0;
		xv[ ( 2 * i ) + 1 ] = 0.5;
	}
	zgbtrf( N, N, KL, KU, AFB, 1, LDAFB, 0, IPIV, 1, 0 );

	return benchmark;

	function benchmark( b ) {
		var y;
		var j;

		b.tic();
		for ( j = 0; j < b.iterations; j++ ) {
			y = zla_gbrcond_x( 'column-major', 'no-transpose', N, KL, KU, AB, LDAB, AFB, LDAFB, IPIV, 1, 0, x, 1, WORK, 1, RWORK, 1 );
			if ( y !== y ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( y !== y ) {
			b.fail( 'should not return NaN' );
		}
		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1;
	max = 3;

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
