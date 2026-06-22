
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgbbrd from './zgbbrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgbbrd, 'ndarray', ndarray );


// EXPORTS //

export default zgbbrd;
