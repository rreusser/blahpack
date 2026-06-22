// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunm2l from './zunm2l.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunm2l, 'ndarray', ndarray );


// EXPORTS //

export default zunm2l;
