// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dormr2 from './dormr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dormr2, 'ndarray', ndarray );


// EXPORTS //

export default dormr2;
