// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlanhb from './zlanhb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlanhb, 'ndarray', ndarray );


// EXPORTS //

export default zlanhb;
