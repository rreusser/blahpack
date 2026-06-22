// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrevc3 from './dtrevc3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrevc3, 'ndarray', ndarray );


// EXPORTS //

export default dtrevc3;
