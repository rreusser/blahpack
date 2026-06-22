
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpstf2 from './zpstf2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpstf2, 'ndarray', ndarray );


// EXPORTS //

export default zpstf2;
