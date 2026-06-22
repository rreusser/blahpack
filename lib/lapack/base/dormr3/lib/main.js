
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dormr3 from './dormr3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dormr3, 'ndarray', ndarray );


// EXPORTS //

export default dormr3;
