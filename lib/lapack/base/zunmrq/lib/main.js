// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunmrq from './zunmrq.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunmrq, 'ndarray', ndarray );


// EXPORTS //

export default zunmrq;
