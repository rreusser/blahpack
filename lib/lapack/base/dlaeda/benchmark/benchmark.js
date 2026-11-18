

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlaeda from './../lib/dlaeda.js';


// VARIABLES //

const pkg = pkgJson.name;
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
	const n1 = Math.floor( N / 2 );
	const n2 = N - n1;
	const q = uniform( ( n1 * n1 ) + ( n2 * n2 ), -10.0, 10.0, options );
	const QPTR = new Int32Array( [ 1, 1 + ( n1 * n1 ), 1 + ( n1 * n1 ) + ( n2 * n2 ) ] );
	const PRMPTR = new Int32Array( 4 );
	const PERM = new Int32Array( 4 );
	const GIVPTR = new Int32Array( 4 );
	const GIVCOL = new Int32Array( 8 );
	const GIVNUM = new Float64Array( 8 );
	const z = new Float64Array( N );
	const ZTEMP = new Float64Array( N );
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
			y = dlaeda( 'column-major', N, 1, 1, 0, PRMPTR, 1, PERM, 1, GIVPTR, 1, GIVCOL, 2, GIVNUM, 2, q, 1, QPTR, 1, z, 1, ZTEMP, 1 );
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
