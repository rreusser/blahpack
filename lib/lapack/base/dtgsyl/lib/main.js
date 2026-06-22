// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgsyl from './dtgsyl.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgsyl, 'ndarray', ndarray );


// EXPORTS //

export default dtgsyl;
