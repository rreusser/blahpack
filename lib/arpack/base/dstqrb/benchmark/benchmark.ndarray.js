

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dstqrb from './../lib/ndarray.js';


// VARIABLES //

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
	const dd = uniform( N, -5.0, 5.0, options );
	const ee = uniform( N-1, -2.0, 2.0, options );
	const d = new Float64Array( N );
	const e = new Float64Array( N-1 );
	const z = new Float64Array( N );
	const work = new Float64Array( (2*N)-2 );
	let info, i2;
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			for ( i2 = 0; i2 < N; i2++ ) {
				d[ i2 ] = dd[ i2 ];
			}
			for ( i2 = 0; i2 < N-1; i2++ ) {
				e[ i2 ] = ee[ i2 ];
			}
			info = dstqrb( N, d, 1, 0, e, 1, 0, z, 1, 0, work, 1, 0 );
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
	let len, f, i;

	const min = 1; // 10^min
	const max = 6; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
