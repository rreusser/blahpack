// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsymv from './zsymv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsymv, 'ndarray', ndarray );


// EXPORTS //

export default zsymv;
