
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaqsy from './zlaqsy.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaqsy, 'ndarray', ndarray );


// EXPORTS //

export default zlaqsy;
