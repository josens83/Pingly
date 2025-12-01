/**
 * State Management Module
 *
 * Advanced state management system inspired by Discord.
 */

// Core Store
export {
  Store,
  createStore,
  combineReducers,
  loggerMiddleware,
  thunkMiddleware,
  errorMiddleware,
  createAction,
  createAsyncAction,
  type Action,
  type Reducer,
  type Middleware,
  type Dispatch,
  type Unsubscribe,
  type Selector,
  type Listener,
  type StoreConfig,
  type PersistConfig
} from './Store';

// Normalized State
export {
  createEntityAdapter,
  normalize,
  denormalize,
  createSelector,
  type Entity,
  type EntityId,
  type NormalizedEntity,
  type EntityAdapter,
  type NormalizationSchema,
  type NormalizedData
} from './NormalizedState';
