/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspmv from './dspmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspmv, 'ndarray', ndarray );


// EXPORTS //

export default dspmv;
