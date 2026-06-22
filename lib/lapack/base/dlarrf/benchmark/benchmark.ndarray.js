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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dlarrf from './../lib/ndarray.js';


// VARIABLES //

var PIVMIN = 2.2250738585072014e-308;


// FUNCTIONS //

/**
* Builds a benchmark-ready tridiagonal cluster of order `len`.
*
* @private
* @param {PositiveInteger} len - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	var sigma;
	var dplus;
	var lplus;
	var werr;
	var wgap;
	var work;
	var ld;
	var d;
	var l;
	var w;
	var i;

	d = new Float64Array( len );
	l = new Float64Array( len );
	ld = new Float64Array( len );
	w = new Float64Array( len );
	wgap = new Float64Array( len );
	werr = new Float64Array( len );
	sigma = new Float64Array( 1 );
	dplus = new Float64Array( len );
	lplus = new Float64Array( len );
	work = new Float64Array( 2 * len );
	for ( i = 0; i < len; i++ ) {
		d[ i ] = ( len - i ) + 0.5;
		l[ i ] = 0.1;
		ld[ i ] = d[ i ] * l[ i ];
		w[ i ] = ( i + 1 ) + 0.01;
		wgap[ i ] = 0.9;
		werr[ i ] = 1e-4;
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
			// eslint-disable-next-line max-len
			info = dlarrf( len, d, 1, 0, l, 1, 0, ld, 1, 0, 1, len, w, 1, 0, wgap, 1, 0, werr, 1, 0, len + 1, 1.0, 1.0, PIVMIN, sigma, dplus, 1, 0, lplus, 1, 0, work, 1, 0 );
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
	var min;
	var max;
	var f;
	var i;

	min = 1; // 10^min
	max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
