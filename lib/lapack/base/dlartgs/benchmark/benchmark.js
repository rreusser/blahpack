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

/* eslint-disable no-restricted-syntax */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dlartgs from './../lib/dlartgs.js';


// MAIN //

bench( pkg, function benchmark( b ) {
	var r;
	var i;

	b.tic();
	for ( i = 0; i < b.iterations; i++ ) {
		r = dlartgs( 3.0 + ( i % 5 ), 4.0 + ( i % 7 ), 1.5 );
		if ( isnan( r.cs ) ) {
			b.fail( 'should not return NaN' );
		}
	}
	b.toc();
	if ( isnan( r.cs ) ) {
		b.fail( 'should not return NaN' );
	}
	b.pass( 'benchmark finished' );
	b.end();
});
