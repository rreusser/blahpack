// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsymm from './zsymm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsymm, 'ndarray', ndarray );


// EXPORTS //

export default zsymm;
