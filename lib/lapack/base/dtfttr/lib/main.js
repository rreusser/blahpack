// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtfttr from './dtfttr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtfttr, 'ndarray', ndarray );


// EXPORTS //

export default dtfttr;
