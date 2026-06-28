/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zhetri2 from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var ldwork;
	var IPIV;
	var WORK;
	var nb;
	var A;
	var i;

	nb = 32;
	ldwork = N + nb + 1;

	A = new Complex128Array( N * N );
	for ( i = 0; i < N; i++ ) {
		A.set( [ 1.0 + i, 0.0 ], ( i * N ) + i );
	}
	IPIV = new Int32Array( N );
	for ( i = 0; i < N; i++ ) {
		IPIV[ i ] = i;
	}
	WORK = new Complex128Array( ldwork * ( nb + 3 ) );
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
			info = zhetri2( 'lower', N, A, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
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
	max = 2; // 10^max (max N=100 to bound runtime)

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
