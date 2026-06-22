// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zspmv from './zspmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zspmv, 'ndarray', ndarray );


// EXPORTS //

export default zspmv;
