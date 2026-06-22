// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zupmtr from './zupmtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zupmtr, 'ndarray', ndarray );


// EXPORTS //

export default zupmtr;
