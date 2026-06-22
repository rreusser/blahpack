// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlansf from './zlansf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlansf, 'ndarray', ndarray );


// EXPORTS //

export default zlansf;
