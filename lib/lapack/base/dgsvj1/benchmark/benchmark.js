/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dgsvj1 from './../lib/dgsvj1.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};
var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;


// FUNCTIONS //

/**
* Creates a benchmark function for an `N`x`N` matrix.
*
* @private
* @param {PositiveInteger} N - matrix dimension
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var work;
	var sva;
	var n1;
	var A;
	var d;
	var V;
	var i;

	A = uniform( N * N, -1.0, 1.0, options );
	d = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		d[ i ] = 1.0;
	}
	sva = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		sva[ i ] = 1.0;
	}
	V = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		V[ ( i * N ) + i ] = 1.0;
	}
	work = new Float64Array( N );
	n1 = N >> 1;

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
			info = dgsvj1( 'column-major', 'no-v', N, N, n1, A, N, d, 1, sva, 1, 0, V, N, EPS, SFMIN, TOL, 1, work, 1, N );
			if ( isnan( info ) ) {
				b.fail( 'should not return NaN' );
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

	min = 2; // 2^min
	max = 6; // 2^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 2, i );
		f = createBenchmark( len );
		bench( format( '%s:N=%d', pkg, len ), f );
	}
}

main();
