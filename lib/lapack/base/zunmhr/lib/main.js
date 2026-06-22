// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunmhr from './zunmhr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunmhr, 'ndarray', ndarray );


// EXPORTS //

export default zunmhr;
