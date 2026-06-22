// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpttf from './dtpttf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpttf, 'ndarray', ndarray );


// EXPORTS //

export default dtpttf;
