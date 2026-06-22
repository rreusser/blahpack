// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhegv from './zhegv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhegv, 'ndarray', ndarray );


// EXPORTS //

export default zhegv;
