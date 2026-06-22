// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunmr3 from './zunmr3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunmr3, 'ndarray', ndarray );


// EXPORTS //

export default zunmr3;
