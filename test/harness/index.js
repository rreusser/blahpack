/**
* Validation harness for BLAS/LAPACK routines.
*
* A layered, storage- and scalar-agnostic toolkit for rigorous property-based
* validation:
*
*   scalar    real | complex element traits (the d<->z seam)
*   logical   storage-agnostic mathematical matrices + structured constructors
*   schemes   pluggable physical storage (dense / banded / packed / vector),
*             each realizing a logical matrix into a poisoned, API-ready buffer
*             and yielding the routine's stride/offset arguments
*   ref       independent naive reference math (the honest oracle)
*   norms     independent norms
*   check     residual / reconstruction / structural / orthogonality / exact
*             assertions, all NaN-intolerant against poisoned storage
*   invariance  layout-invariance driver (bit-exact across storage layouts)
*
* See README.md for the workflow, the validation-level ladder, and the mandatory
* LEARNINGS.md logging when a bug is caught.
*/

import RNG from './rng.js';
import * as scalar from './scalar.js';
import * as logical from './logical.js';
import * as schemes from './schemes.js';
import * as ref from './reference.js';
import * as norms from './norms.js';
import * as check from './checks.js';
import { layoutInvariant } from './invariance.js';

// Sizes chosen to straddle unrolled-remainder crossovers (n % 4 != 0) and the
// common LAPACK block-size thresholds (NB = 32, 64) that tame fixtures miss.
var SIZES = [ 0, 1, 2, 3, 4, 5, 7, 8, 15, 16, 17, 31, 32, 33, 48, 63, 64, 65, 100 ];
var SIZES_SMALL = [ 1, 2, 3, 5, 8, 16, 17, 33, 64 ];

export {
	RNG,
	scalar,
	logical,
	schemes,
	ref,
	norms,
	check,
	layoutInvariant,
	SIZES,
	SIZES_SMALL
};
