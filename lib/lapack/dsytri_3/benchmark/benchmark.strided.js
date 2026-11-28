// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dsytri3 from './../lib/strided.js';


// VARIABLES //

const pkg = pkgJson.name;
/** @type {{ dtype: 'float64' }} */
const options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} len - array length
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	const N = len;
	const A = uniform( N * N, -10.0, 10.0, options );
	const e = new Float64Array( N );
	const IPIV = new Int32Array( N );
	const WORK = new Float64Array( ( N + 2 ) * 4 );
	let i;

	// Treat `A` as a factored form with 1-by-1 pivots only (0-based `IPIV[ i ] = i`) and a dominant diagonal `D`:
	for ( i = 0; i < N; i++ ) {
		IPIV[ i ] = i;
		A[ ( i * N ) + i ] += 2.0 * N;
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let y, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			y = dsytri3( 'upper', N, A, N, 1, 0, e, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
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
	let len, f, i;

	const min = 1; // 10^min
	const max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:strided:len=%d', pkg, len ), f );
	}
}

main();
