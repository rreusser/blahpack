// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpttrf from './zpttrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpttrf, 'ndarray', ndarray );


// EXPORTS //

export default zpttrf;
