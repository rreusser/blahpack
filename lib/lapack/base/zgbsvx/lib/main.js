
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgbsvx from './zgbsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgbsvx, 'ndarray', ndarray );


// EXPORTS //

export default zgbsvx;
