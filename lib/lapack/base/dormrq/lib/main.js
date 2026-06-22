// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dormrq from './dormrq.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dormrq, 'ndarray', ndarray );


// EXPORTS //

export default dormrq;
