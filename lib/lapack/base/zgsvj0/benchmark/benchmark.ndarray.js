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

/* eslint-disable max-len */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zgsvj0 from './../lib/ndarray.js';


// VARIABLES //

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix size
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var work;
	var aRef;
	var dRef;
	var sva;
	var A;
	var d;
	var V;
	var i;
	A = new Complex128Array( N * N );
	d = new Complex128Array( N );
	V = new Complex128Array( N * N );
	sva = new Float64Array( N );
	work = new Complex128Array( N );
	aRef = reinterpret( A, 0 );
	dRef = reinterpret( d, 0 );
	for ( i = 0; i < N * N; i++ ) {
		aRef[ i * 2 ] = Math.sin( i * 0.1 );
		aRef[ ( i * 2 ) + 1 ] = Math.cos( i * 0.07 );
	}
	for ( i = 0; i < N; i++ ) {
		dRef[ i * 2 ] = 1.0;
		sva[ i ] = 1.0;
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
			info = zgsvj0( 'no-v', N, N, A, 1, N, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 1, work, 1, 0, N );
			if ( info < 0 ) {
				b.fail( 'unexpected error info' );
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1;
	max = 2;

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:N=%d', pkg, len ), f );
	}
}

main();
