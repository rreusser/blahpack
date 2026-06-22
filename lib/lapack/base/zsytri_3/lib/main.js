// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsytri3 from './zsytri_3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsytri3, 'ndarray', ndarray );


// EXPORTS //

export default zsytri3;
