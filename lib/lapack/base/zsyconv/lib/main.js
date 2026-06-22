// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyconv from './zsyconv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyconv, 'ndarray', ndarray );


// EXPORTS //

export default zsyconv;
