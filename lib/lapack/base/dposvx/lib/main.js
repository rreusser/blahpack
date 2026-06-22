// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dposvx from './dposvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dposvx, 'ndarray', ndarray );


// EXPORTS //

export default dposvx;
