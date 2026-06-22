// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgerqf from './dgerqf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgerqf, 'ndarray', ndarray );


// EXPORTS //

export default dgerqf;
