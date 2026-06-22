// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunmr2 from './zunmr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunmr2, 'ndarray', ndarray );


// EXPORTS //

export default zunmr2;
