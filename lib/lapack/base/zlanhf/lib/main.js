
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlanhf from './zlanhf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlanhf, 'ndarray', ndarray );


// EXPORTS //

export default zlanhf;
