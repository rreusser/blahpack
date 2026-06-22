
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhbgv from './zhbgv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhbgv, 'ndarray', ndarray );


// EXPORTS //

export default zhbgv;
