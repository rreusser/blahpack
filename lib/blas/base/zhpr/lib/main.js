// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpr from './zhpr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpr, 'ndarray', ndarray );


// EXPORTS //

export default zhpr;
