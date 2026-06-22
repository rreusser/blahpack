/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztprfb from './ztprfb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztprfb, 'ndarray', ndarray );


// EXPORTS //

export default ztprfb;
