
/* eslint-disable camelcase */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import uniform from '@stdlib/random/base/uniform/lib/index.js';
import zgetrf from './../../zgetrf/lib/base.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zla_gercond_c from './../lib/zla_gercond_c.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix size
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var A;
	var C;
	var i;

	A = new Complex128Array( N * N );
	AF = new Complex128Array( N * N );
	for ( i = 0; i < 2 * N * N; i++ ) {
		A.set( uniform( -1.0, 1.0 ), i >> 1 );
	}
	// Make diagonal dominant
	for ( i = 0; i < N; i++ ) {
		A.set( ( 2.0 * N ) + 1.0, ( ( i * N ) + i ) * 2 );
	}
	for ( i = 0; i < A.length; i++ ) {
		AF.set( A.get( i ), i );
	}
	IPIV = new Int32Array( N );
	C = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		C[ i ] = 1.0 + uniform( 0.0, 1.0 );
	}
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y;
		var j;

		b.tic();
		for ( j = 0; j < b.iterations; j++ ) {
			y = zla_gercond_c( 'column-major', 'no-transpose', N, A, N, AF, N, IPIV, 1, 0, C, 1, true, WORK, 1, RWORK, 1 );
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
	var min;
	var max;
	var N;
	var f;
	var i;

	min = 1; // 10^min
	max = 2; // 10^max (avoid OOM)

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:size=%d', pkg, N ), f );
	}
}

main();
