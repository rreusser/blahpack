// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import idamax from './idamax.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( idamax, 'ndarray', ndarray );


// EXPORTS //

export default idamax;
