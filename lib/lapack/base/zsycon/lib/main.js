// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsycon from './zsycon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsycon, 'ndarray', ndarray );


// EXPORTS //

export default zsycon;
