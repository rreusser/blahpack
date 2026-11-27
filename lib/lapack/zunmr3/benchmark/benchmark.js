// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zunmr3 from './../lib/zunmr3.js';


// VARIABLES //

const pkg = pkgJson.name;



// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} len - matrix size
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	const N = len;
	const A = new Complex128Array( N * N );
	const TAU = new Complex128Array( N );
	const C = new Complex128Array( N * N );
	const WORK = new Complex128Array( N );
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
			y = zunmr3( 'column-major', 'left', 'no-transpose', N, N, N, 0, A, N, TAU, 1, C, N, WORK ); // eslint-disable-line max-len
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
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
