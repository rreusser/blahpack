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

/* eslint-disable camelcase, max-len */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgbtrf from './../../zgbtrf/lib/base.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zla_gbrcond_c from './../lib/zla_gbrcond_c.js';


// VARIABLES //

var realOpts = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var LDAFB;
	var RWORK;
	var IPIV;
	var LDAB;
	var WORK;
	var afbv;
	var AFB;
	var abv;
	var AB;
	var KL;
	var KU;
	var c;
	var i;
	var j;

	KL = 1;
	KU = 1;
	LDAB = KL + KU + 1;
	LDAFB = ( 2 * KL ) + KU + 1;
	AB = new Complex128Array( uniform( 2 * LDAB * N, -1.0, 1.0, realOpts ).buffer );
	AFB = new Complex128Array( LDAFB * N );
	IPIV = new Int32Array( N );
	c = uniform( N, 0.5, 1.5, realOpts );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );

	// Copy AB into AFB offset by KL rows so zgbtrf has a valid band
	abv = new Float64Array( AB.buffer );
	afbv = new Float64Array( AFB.buffer );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < LDAB; i++ ) {
			afbv[ 2 * ( ( KL + i ) + ( j * LDAFB ) ) ] = abv[ 2 * ( i + ( j * LDAB ) ) ];
			afbv[ ( 2 * ( ( KL + i ) + ( j * LDAFB ) ) ) + 1 ] = abv[ ( 2 * ( i + ( j * LDAB ) ) ) + 1 ];
		}
	}
	zgbtrf( N, N, KL, KU, AFB, 1, LDAFB, 0, IPIV, 1, 0 );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			y = zla_gbrcond_c( 'column-major', 'no-transpose', N, KL, KU, AB, LDAB, AFB, LDAFB, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
			if ( isnan( y ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y ) ) {
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
