import { ActionTypes } from "./ActionTypes";

/**
 * Delta update interface models
 * the type of the update and the entities
 * associated with the update.
 */
export interface Delta<E> {
    type: ActionTypes;
    entries: E[];
  }
  