// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpr2 from './zhpr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpr2, 'ndarray', ndarray );


// EXPORTS //

export default zhpr2;
