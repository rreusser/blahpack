// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zspr from './zspr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zspr, 'ndarray', ndarray );


// EXPORTS //

export default zspr;
