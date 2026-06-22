
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpftrf from './zpftrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpftrf, 'ndarray', ndarray );


// EXPORTS //

export default zpftrf;
