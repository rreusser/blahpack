
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpsv from './zhpsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpsv, 'ndarray', ndarray );


// EXPORTS //

export default zhpsv;
