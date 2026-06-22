
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zppsv from './zppsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zppsv, 'ndarray', ndarray );


// EXPORTS //

export default zppsv;
