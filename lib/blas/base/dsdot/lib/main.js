
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsdot from './dsdot.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsdot, 'ndarray', ndarray );


// EXPORTS //

export default dsdot;
