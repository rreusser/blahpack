// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrsyl from './dtrsyl.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrsyl, 'ndarray', ndarray );


// EXPORTS //

export default dtrsyl;
