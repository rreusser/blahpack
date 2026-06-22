
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpqrt2 from './dtpqrt2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpqrt2, 'ndarray', ndarray );


// EXPORTS //

export default dtpqrt2;
