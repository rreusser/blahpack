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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zlaHerfsxExtended from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var errBndsNorm;
	var errBndsComp;
	var berrOut;
	var yTail;
	var IPIV;
	var AYB;
	var RES;
	var DY;
	var AF;
	var Av;
	var B;
	var Y;
	var c;
	var A;
	var i;

	errBndsNorm = new Float64Array( 3 );
	errBndsComp = new Float64Array( 3 );
	A = new Complex128Array( N * N );
	AF = new Complex128Array( N * N );
	B = new Complex128Array( N );
	Y = new Complex128Array( N );
	RES = new Complex128Array( N );
	DY = new Complex128Array( N );
	yTail = new Complex128Array( N );
	IPIV = new Int32Array( N );
	berrOut = new Float64Array( 1 );
	AYB = new Float64Array( N );
	c = new Float64Array( N );
	Av = new Float64Array( A.buffer );

	for ( i = 0; i < N; i++ ) {
		Av[ ( ( i * N ) + i ) * 2 ] = ( i + 2 ) * 1.0;
		c[ i ] = 1.0;
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
		var k;

		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			info = zlaHerfsxExtended( 1, 'upper', N, 1, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, false, c, 1, 0, B, 1, N, 0, Y, 1, N, 0, berrOut, 1, 0, 2, errBndsNorm, 1, 1, 0, errBndsComp, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, yTail, 1, 0, 1e-10, 10, 0.5, 0.25, false );
			if ( info !== 0 ) {
				b.fail( 'unexpected info ' + info );
			}
		}
		b.toc();
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
	var f;
	var i;
	var N;

	for ( i = 1; i <= 2; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:ndarray:N=%d', pkg, N ), f );
	}
}

main();
