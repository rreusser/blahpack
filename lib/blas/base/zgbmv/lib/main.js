// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgbmv from './zgbmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgbmv, 'ndarray', ndarray );


// EXPORTS //

export default zgbmv;
