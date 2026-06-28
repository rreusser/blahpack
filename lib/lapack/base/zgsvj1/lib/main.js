/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgsvj1 from './zgsvj1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgsvj1, 'ndarray', ndarray );


// EXPORTS //

export default zgsvj1;
