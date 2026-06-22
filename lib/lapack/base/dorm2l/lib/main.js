// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorm2l from './dorm2l.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorm2l, 'ndarray', ndarray );


// EXPORTS //

export default dorm2l;
