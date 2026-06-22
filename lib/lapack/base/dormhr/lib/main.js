// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dormhr from './dormhr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dormhr, 'ndarray', ndarray );


// EXPORTS //

export default dormhr;
