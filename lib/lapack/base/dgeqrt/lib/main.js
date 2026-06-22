
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeqrt from './dgeqrt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeqrt, 'ndarray', ndarray );


// EXPORTS //

export default dgeqrt;
