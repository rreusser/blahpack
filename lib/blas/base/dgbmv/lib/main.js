
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgbmv from './dgbmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgbmv, 'ndarray', ndarray );


// EXPORTS //

export default dgbmv;
