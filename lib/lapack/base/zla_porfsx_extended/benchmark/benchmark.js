/* eslint-disable camelcase */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zpotrf from './../../zpotrf/lib/base.js';
import zpotrs from './../../zpotrs/lib/base.js';
import zla_porfsx_extended from './../lib/zla_porfsx_extended.js';


// FUNCTIONS //

/**
* Build a diagonally dominant Hermitian positive-definite matrix.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Complex128Array} `A` in column-major order
*/
function buildHpd( N ) {
	var idx;
	var A;
	var i;
	var j;
	A = new Complex128Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = 2 * ( i + ( j * N ) );
			if ( i === j ) {
				A.buffer[ idx ] = 4.0 * N; // real diagonal, dominant
				A.buffer[ idx + 1 ] = 0.0;
			} else if ( i < j ) {
				A.buffer[ idx ] = 1.0 / ( 1 + j - i );
				A.buffer[ idx + 1 ] = 1.0 / ( 2 + j - i );
			} else {
				A.buffer[ idx ] = 1.0 / ( 1 + i - j );
				A.buffer[ idx + 1 ] = -1.0 / ( 2 + i - j );
			}
		}
	}
	return A;
}

/**
* Creates a benchmark function that refines a 1-RHS HPD system of size `N`.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var err_bnds_norm;
	var err_bnds_comp;
	var berr_out;
	var AYB;
	var RES;
	var DY;
	var YT;
	var AF;
	var Y0;
	var A;
	var B;
	var c;
	var i;

	A = buildHpd( N );
	AF = new Complex128Array( A.length );
	for ( i = 0; i < 2 * N * N; i++ ) {
		AF.buffer[ i ] = A.buffer[ i ];
	}
	zpotrf( 'upper', N, AF, 1, N, 0 );

	B = new Complex128Array( N );
	for ( i = 0; i < N; i++ ) {
		B.buffer[ 2 * i ] = 1.0;
	}

	Y0 = new Complex128Array( N );
	for ( i = 0; i < 2 * N; i++ ) {
		Y0.buffer[ i ] = B.buffer[ i ];
	}
	zpotrs( 'upper', N, 1, AF, 1, N, 0, Y0, 1, N, 0 );

	c = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		c[ i ] = 1.0;
	}
	RES = new Complex128Array( N );
	DY = new Complex128Array( N );
	YT = new Complex128Array( N );
	AYB = new Float64Array( N );
	berr_out = new Float64Array( 1 );
	err_bnds_norm = new Float64Array( 3 );
	err_bnds_comp = new Float64Array( 3 );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var Y;
		var k;
		var j;

		Y = new Complex128Array( N );
		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			for ( j = 0; j < 2 * N; j++ ) {
				Y.buffer[ j ] = Y0.buffer[ j ];
			}
			info = zla_porfsx_extended( 'column-major', 1, 'upper', N, 1, A, N, AF, N, false, c, 1, B, N, Y, N, berr_out, 1, 2, err_bnds_norm, 1, err_bnds_comp, 1, RES, 1, AYB, 1, DY, 1, YT, 1, 1.0, 10, 0.5, 0.25, false ); // eslint-disable-line max-len
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

	min = 2; // matrix order 2
	max = 6; // matrix order 64
	for ( i = min; i <= max; i++ ) {
		len = pow( 2, i );
		f = createBenchmark( len );
		bench( format( '%s:N=%d', pkg, len ), f );
	}
}

main();
