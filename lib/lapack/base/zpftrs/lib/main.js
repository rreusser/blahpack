// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpftrs from './zpftrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpftrs, 'ndarray', ndarray );


// EXPORTS //

export default zpftrs;
