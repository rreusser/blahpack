
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyconvf from './zsyconvf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyconvf, 'ndarray', ndarray );


// EXPORTS //

export default zsyconvf;
