
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhfrk from './zhfrk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhfrk, 'ndarray', ndarray );


// EXPORTS //

export default zhfrk;
