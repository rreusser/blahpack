// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsysv from './zsysv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsysv, 'ndarray', ndarray );


// EXPORTS //

export default zsysv;
