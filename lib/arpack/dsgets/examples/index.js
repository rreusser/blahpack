/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsgets from './../lib/base.js';

// Current Ritz values and their error bounds:
const ritz = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
const bounds = new Float64Array( [ 0.1, 0.5, 0.02, 0.3, 0.05 ] );
const shifts = new Float64Array( 2 );

// Keep the 3 largest-magnitude values and take the other 2 as shifts:
dsgets( 1, 'LM', 3, 2, ritz, 1, 0, bounds, 1, 0, shifts, 1, 0 );

console.log( ritz ); // eslint-disable-line no-console
// => <Float64Array>[ -1.0, -1.5, 2.0, 3.0, 4.0 ]

console.log( shifts ); // eslint-disable-line no-console
// => <Float64Array>[ -1.0, -1.5 ]
