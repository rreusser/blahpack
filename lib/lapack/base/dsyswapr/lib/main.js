
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyswapr from './dsyswapr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyswapr, 'ndarray', ndarray );


// EXPORTS //

export default dsyswapr;
