
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zspsv from './zspsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zspsv, 'ndarray', ndarray );


// EXPORTS //

export default zspsv;
