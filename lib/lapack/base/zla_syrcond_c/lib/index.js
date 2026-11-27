/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Estimates the infinity norm condition number for a complex symmetric indefinite matrix with inverse-c scaling.
*
* ## Notes
*
* -   `A` and `AF` are `Complex128Array` views; `c` and `RWORK` are `Float64Array`.
* -   `A` is complex _symmetric_ (not Hermitian): mirror reads are NOT conjugated.
* -   `WORK` must have length at least `2*N` complex elements; `RWORK` must have length at least `N`.
* -   `IPIV` must contain 0-based pivot indices (as produced by `zsytrf`).
*
* @module @rreusser/blahpack/lapack/base/zla_syrcond_c
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zsytrf from '@rreusser/blahpack/lapack/base/zsytrf';
* import zla_syrcond_c from '@rreusser/blahpack/lapack/base/zla_syrcond_c';
*
* var N = 1;
* var A = new Complex128Array( [ 5.0, 2.0 ] );
* var AF = new Complex128Array( [ 5.0, 2.0 ] );
* var IPIV = new Int32Array( [ 1 ] );
* var c = new Float64Array( [ 2.0 ] );
* var WORK = new Complex128Array( 2 );
* var RWORK = new Float64Array( 1 );
*
* zsytrf( 'column-major', 'upper', N, AF, N, IPIV );
*
* var rcond = zla_syrcond_c( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_syrcond_c.ndarray" }
