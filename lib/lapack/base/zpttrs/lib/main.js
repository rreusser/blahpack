// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpttrs from './zpttrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpttrs, 'ndarray', ndarray );


// EXPORTS //

export default zpttrs;
