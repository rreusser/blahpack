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

/* eslint-disable camelcase */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zhetrd_he2hb from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var WORK;
	var TAU;
	var kd;
	var nb;
	var AB;
	var ar;
	var A;
	var i;

	kd = Math.max( 1, Math.floor( N / 8 ) );
	nb = ( kd > 32 ) ? kd : 32;
	A = new Complex128Array( N * N );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( Math.max( 1, N - kd ) );
	WORK = new Complex128Array( Math.max( 1, (N*kd) + (N*nb) + (2*kd*kd) ) );
	ar = reinterpret( A, 0 );

	for ( i = 0; i < N; i++ ) {
		ar[ ( i * (N + 1) ) * 2 ] = 10.0 + i;
	}

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			info = zhetrd_he2hb( 'lower', N, kd, A, 1, N, 0, AB, 1, kd+1, 0, TAU, 1, 0, WORK, 1, 0 );
			if ( isnan( info ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( info ) ) {
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
	var max;
	var min;
	var f;
	var i;

	min = 1;
	max = 6;

	for ( i = min; i <= max; i++ ) {
		len = pow( 2, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
