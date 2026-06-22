
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpftri from './zpftri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpftri, 'ndarray', ndarray );


// EXPORTS //

export default zpftri;
