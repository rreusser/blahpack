// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zptsv from './zptsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zptsv, 'ndarray', ndarray );


// EXPORTS //

export default zptsv;
