
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dopmtr from './dopmtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dopmtr, 'ndarray', ndarray );


// EXPORTS //

export default dopmtr;
