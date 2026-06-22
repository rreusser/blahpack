// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhbmv from './zhbmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhbmv, 'ndarray', ndarray );


// EXPORTS //

export default zhbmv;
