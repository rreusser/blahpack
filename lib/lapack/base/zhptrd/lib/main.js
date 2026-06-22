
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhptrd from './zhptrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhptrd, 'ndarray', ndarray );


// EXPORTS //

export default zhptrd;
