// expect: noAttach
// FAIL — index.js exports both forms but never attaches the offset form to the default.
import ddot from './ddot.js';
import ndarray from './ndarray.js';

export default ddot;
export { ndarray };
