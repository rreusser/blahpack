
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlanhp from './zlanhp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlanhp, 'ndarray', ndarray );


// EXPORTS //

export default zlanhp;
