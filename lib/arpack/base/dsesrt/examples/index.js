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
import dsesrt from './../lib/base.js';

// Ritz values and a 2-row companion matrix (columns pair with the values):
const x = new Float64Array( [ 3.0, 1.0, 4.0, 2.0 ] );
const A = new Float64Array( [ 11.0, 12.0, 21.0, 22.0, 31.0, 32.0, 41.0, 42.0 ] ); // 2x4, column-major

// Sort x so the largest algebraic value ends up last, permuting the columns of A:
dsesrt( 'LA', true, 4, x, 1, 0, 2, A, 1, 2, 0 );

console.log( x ); // eslint-disable-line no-console
// => <Float64Array>[ 1.0, 2.0, 3.0, 4.0 ]

console.log( A ); // eslint-disable-line no-console
// => <Float64Array>[ 21.0, 22.0, 41.0, 42.0, 11.0, 12.0, 31.0, 32.0 ]
