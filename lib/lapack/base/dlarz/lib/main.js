
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarz from './dlarz.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarz, 'ndarray', ndarray );


// EXPORTS //

export default dlarz;
