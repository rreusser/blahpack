/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Converts the factorization output format used in zsytrf for complex symmetric matrices.
*
* @module @rreusser/blahpack/lapack/base/zsyconvf
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zsyconvf from '@rreusser/blahpack/lapack/base/zsyconvf';
*
* var A = new Complex128Array( 4 );
* var E = new Complex128Array( 2 );
* var IPIV = new Int32Array( [ 0, 1 ] );
*
* zsyconvf( 'column-major', 'upper', 'convert', 2, A, 2, E, 1, IPIV, 1, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zsyconvf.ndarray" }
