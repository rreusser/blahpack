
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarz from './zlarz.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarz, 'ndarray', ndarray );


// EXPORTS //

export default zlarz;
