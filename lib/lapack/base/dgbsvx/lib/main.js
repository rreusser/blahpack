
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgbsvx from './dgbsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgbsvx, 'ndarray', ndarray );


// EXPORTS //

export default dgbsvx;
