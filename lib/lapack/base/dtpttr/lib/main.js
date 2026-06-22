// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpttr from './dtpttr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpttr, 'ndarray', ndarray );


// EXPORTS //

export default dtpttr;
