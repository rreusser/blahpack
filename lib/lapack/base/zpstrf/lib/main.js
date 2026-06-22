
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpstrf from './zpstrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpstrf, 'ndarray', ndarray );


// EXPORTS //

export default zpstrf;
