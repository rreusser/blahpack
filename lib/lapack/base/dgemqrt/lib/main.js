
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgemqrt from './dgemqrt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgemqrt, 'ndarray', ndarray );


// EXPORTS //

export default dgemqrt;
