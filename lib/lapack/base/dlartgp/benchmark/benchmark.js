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
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dlartgp from './../lib/dlartgp.js';


// MAIN //

/**
* Benchmark main export.
*
* @private
* @param {Benchmark} b - benchmark instance
*/
function benchmark( b ) {
	var result;
	var i;

	b.tic();
	for ( i = 0; i < b.iterations; i++ ) {
		result = dlartgp( ( i % 7 ) + 1.0, ( i % 5 ) + 1.0 );
		if ( isnan( result.r ) ) {
			b.fail( 'should not return NaN' );
		}
	}
	b.toc();
	if ( isnan( result.r ) ) {
		b.fail( 'should not return NaN' );
	}
	b.pass( 'benchmark finished' );
	b.end();
}

bench( pkg, benchmark );
