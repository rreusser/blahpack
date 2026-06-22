// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dormtr from './dormtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dormtr, 'ndarray', ndarray );


// EXPORTS //

export default dormtr;
