'use strict';

/**
 * Abstract Controller to handle "same methods" or stuff like this
 */
class AbstractController {
  /**
   *
   */
  constructor() {
    // Disable instance create from AbstractController
    if (new.target === AbstractController) {
      throw new TypeError('AbstractController can\'t not be constructed');
    }
  }
}

export default AbstractController;