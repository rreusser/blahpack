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
* Factorize a panel of a complex symmetric matrix using Aasen's algorithm.
*
* @module @rreusser/blahpack/lapack/base/zlasyf_aa
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zlasyfAa from '@rreusser/blahpack/lapack/base/zlasyf_aa';
*
* var A = new Complex128Array( 9 );
* var H = new Complex128Array( 9 );
* var WORK = new Complex128Array( 3 );
* var IPIV = new Int32Array( 3 );
*
* zlasyfAa( 'column-major', 'lower', 1, 3, 3, A, 3, IPIV, 1, 0, H, 3, WORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlasyf_aa.ndarray" }
