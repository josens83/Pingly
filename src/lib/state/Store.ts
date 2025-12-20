/**
 * Advanced State Management (Discord Style)
 *
 * Features:
 * - Normalized state structure
 * - Immutable updates
 * - Middleware support
 * - Time-travel debugging
 * - Selective subscriptions
 * - Action batching
 * - State persistence
 */

export type StateKey = string;
export type ActionType = string;

export interface Action<T = unknown> {
  type: ActionType;
  payload?: T;
  meta?: {
    timestamp: number;
    source?: string;
    batch?: boolean;
  };
}

export interface Reducer<S, A extends Action = Action> {
  (state: S, action: A): S;
}

export interface Middleware<S extends Record<string, unknown> = Record<string, unknown>> {
  (store: Store<S>): (next: Dispatch) => (action: Action) => unknown;
}

export type Dispatch = (action: Action) => void;
export type Unsubscribe = () => void;
export type Selector<S, R> = (state: S) => R;
export type Listener<S> = (state: S, prevState: S) => void;

export interface StoreConfig<S> {
  initialState: S;
  reducer: Reducer<S>;
  middleware?: Middleware<S>[];
  devTools?: boolean;
  persist?: PersistConfig;
}

export interface PersistConfig {
  key: string;
  storage?: Storage;
  whitelist?: string[];
  blacklist?: string[];
  serialize?: (state: unknown) => string;
  deserialize?: (data: string) => unknown;
  throttle?: number;
}

interface Subscription<S> {
  listener: Listener<S>;
  selector?: Selector<S, unknown>;
  equalityFn?: (a: unknown, b: unknown) => boolean;
}

/**
 * Core Store implementation
 */
export class Store<S extends Record<string, unknown>> {
  private state: S;
  private reducer: Reducer<S>;
  private subscriptions: Set<Subscription<S>> = new Set();
  private middleware: Middleware<S>[] = [];
  private dispatch: Dispatch;
  private isDispatching = false;
  private actionQueue: Action[] = [];
  private persistConfig?: PersistConfig;
  private persistTimeout?: ReturnType<typeof setTimeout>;
  private history: { state: S; action: Action }[] = [];
  private historyIndex = -1;
  private maxHistoryLength = 50;

  constructor(config: StoreConfig<S>) {
    this.reducer = config.reducer;
    this.middleware = config.middleware || [];
    this.persistConfig = config.persist;

    // Load persisted state or use initial
    this.state = this.loadPersistedState() || config.initialState;

    // Build middleware chain
    this.dispatch = this.buildMiddlewareChain();

    // Save initial state to history
    this.saveToHistory({ type: '@@INIT' });

    // Setup DevTools if enabled
    if (config.devTools && typeof window !== 'undefined') {
      this.setupDevTools();
    }
  }

  /**
   * Get current state
   */
  getState(): S {
    return this.state;
  }

  /**
   * Select a slice of state
   */
  select<R>(selector: Selector<S, R>): R {
    return selector(this.state);
  }

  /**
   * Dispatch an action
   */
  dispatchAction<T>(action: Action<T>): void {
    // Add metadata
    const enrichedAction: Action<T> = {
      ...action,
      meta: {
        ...action.meta,
        timestamp: Date.now()
      }
    };

    this.dispatch(enrichedAction);
  }

  /**
   * Dispatch multiple actions as a batch
   */
  batch(actions: Action[]): void {
    actions.forEach((action, index) => {
      this.dispatchAction({
        ...action,
        meta: {
          ...action.meta,
          batch: true,
          timestamp: Date.now() + index
        }
      });
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: Listener<S>): Unsubscribe {
    const subscription: Subscription<S> = { listener };
    this.subscriptions.add(subscription);

    return () => {
      this.subscriptions.delete(subscription);
    };
  }

  /**
   * Subscribe to a specific slice of state
   */
  subscribeToSlice<R>(
    selector: Selector<S, R>,
    listener: (value: R, prevValue: R) => void,
    equalityFn: (a: R, b: R) => boolean = Object.is
  ): Unsubscribe {
    const wrappedListener: Listener<S> = (state, prevState) => {
      const nextValue = selector(state);
      const prevValue = selector(prevState);

      if (!equalityFn(nextValue, prevValue)) {
        listener(nextValue, prevValue);
      }
    };

    const subscription: Subscription<S> = {
      listener: wrappedListener,
      selector: selector as Selector<S, unknown>,
      equalityFn: equalityFn as (a: unknown, b: unknown) => boolean
    };

    this.subscriptions.add(subscription);

    return () => {
      this.subscriptions.delete(subscription);
    };
  }

  /**
   * Replace the current reducer
   */
  replaceReducer(nextReducer: Reducer<S>): void {
    this.reducer = nextReducer;
    this.dispatchAction({ type: '@@REPLACE' });
  }

  /**
   * Time travel: go to a specific history index
   */
  goto(index: number): void {
    if (index < 0 || index >= this.history.length) {
      console.warn('Invalid history index');
      return;
    }

    const prevState = this.state;
    this.historyIndex = index;
    this.state = this.history[index]?.state ?? this.state;

    this.notifySubscribers(prevState);
  }

  /**
   * Time travel: undo last action
   */
  undo(): void {
    if (this.historyIndex > 0) {
      this.goto(this.historyIndex - 1);
    }
  }

  /**
   * Time travel: redo
   */
  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.goto(this.historyIndex + 1);
    }
  }

  /**
   * Get action history
   */
  getHistory(): { state: S; action: Action }[] {
    return [...this.history];
  }

  /**
   * Build middleware chain
   */
  private buildMiddlewareChain(): Dispatch {
    const coreDispatch: Dispatch = (action: Action) => {
      if (this.isDispatching) {
        this.actionQueue.push(action);
        return;
      }

      this.isDispatching = true;
      const prevState = this.state;

      try {
        this.state = this.reducer(this.state, action);
        this.saveToHistory(action);
        this.persistState();
      } finally {
        this.isDispatching = false;
      }

      this.notifySubscribers(prevState);

      // Process queued actions
      while (this.actionQueue.length > 0) {
        const queuedAction = this.actionQueue.shift()!;
        this.dispatch(queuedAction);
      }
    };

    // Apply middleware
    let dispatch = coreDispatch;
    for (let i = this.middleware.length - 1; i >= 0; i--) {
      const mw = this.middleware[i];
      if (mw) {
        dispatch = mw(this)(dispatch);
      }
    }

    return dispatch;
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(prevState: S): void {
    this.subscriptions.forEach(subscription => {
      subscription.listener(this.state, prevState);
    });
  }

  /**
   * Save state to history for time travel
   */
  private saveToHistory(action: Action): void {
    // Remove future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push({
      state: { ...this.state },
      action
    });

    // Trim history if too long
    if (this.history.length > this.maxHistoryLength) {
      this.history = this.history.slice(-this.maxHistoryLength);
    }

    this.historyIndex = this.history.length - 1;
  }

  /**
   * Persist state to storage
   */
  private persistState(): void {
    if (!this.persistConfig) return;

    // Throttle persistence
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
    }

    this.persistTimeout = setTimeout(() => {
      const { key, storage = localStorage, whitelist, blacklist, serialize = JSON.stringify } = this.persistConfig!;

      let stateToPersist: Record<string, unknown> = { ...this.state };

      if (whitelist) {
        stateToPersist = Object.fromEntries(
          Object.entries(stateToPersist).filter(([k]) => whitelist.includes(k))
        );
      }

      if (blacklist) {
        stateToPersist = Object.fromEntries(
          Object.entries(stateToPersist).filter(([k]) => !blacklist.includes(k))
        );
      }

      try {
        storage.setItem(key, serialize(stateToPersist));
      } catch (e) {
        console.error('Failed to persist state:', e);
      }
    }, this.persistConfig.throttle || 100);
  }

  /**
   * Load persisted state
   */
  private loadPersistedState(): S | null {
    if (!this.persistConfig || typeof window === 'undefined') return null;

    const { key, storage = localStorage, deserialize = JSON.parse } = this.persistConfig;

    try {
      const data = storage.getItem(key);
      if (data) {
        return deserialize(data) as S;
      }
    } catch (e) {
      console.error('Failed to load persisted state:', e);
    }

    return null;
  }

  /**
   * Setup Redux DevTools integration
   */
  private setupDevTools(): void {
    const devTools = (window as unknown as { __REDUX_DEVTOOLS_EXTENSION__?: { connect: () => unknown } }).__REDUX_DEVTOOLS_EXTENSION__;
    if (!devTools) return;

    // DevTools integration would go here
    console.log('Redux DevTools available for state inspection');
  }
}

/**
 * Create a store with configuration
 */
export function createStore<S extends Record<string, unknown>>(config: StoreConfig<S>): Store<S> {
  return new Store(config);
}

/**
 * Combine multiple reducers
 */
export function combineReducers<S extends Record<string, unknown>>(
  reducers: { [K in keyof S]: Reducer<S[K]> }
): Reducer<S> {
  return (state: S, action: Action): S => {
    let hasChanged = false;
    const nextState = {} as S;

    for (const key in reducers) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

/**
 * Built-in middleware: Logger
 */
export const loggerMiddleware: Middleware = () => next => action => {
  console.group(`Action: ${action.type}`);
  console.log('Payload:', action.payload);
  console.log('Meta:', action.meta);
  const result = next(action);
  console.groupEnd();
  return result;
};

/**
 * Built-in middleware: Thunk (async actions)
 */
export const thunkMiddleware: Middleware = store => next => action => {
  if (typeof action === 'function') {
    return (action as (dispatch: Dispatch, getState: () => unknown) => unknown)(
      store.dispatchAction.bind(store),
      store.getState.bind(store)
    );
  }
  return next(action);
};

/**
 * Built-in middleware: Error handling
 */
export const errorMiddleware: Middleware = () => next => action => {
  try {
    return next(action);
  } catch (error) {
    console.error('Error in reducer:', error);
    throw error;
  }
};

/**
 * Create action creator helper
 */
export function createAction<P = void>(type: ActionType): (payload?: P) => Action<P> {
  return (payload?: P) => ({
    type,
    payload
  });
}

/**
 * Create async action creator
 */
export function createAsyncAction<P, R>(
  typePrefix: string,
  asyncFn: (payload: P) => Promise<R>
): {
  pending: Action;
  fulfilled: (result: R) => Action<R>;
  rejected: (error: Error) => Action<Error>;
  run: (payload: P) => (dispatch: Dispatch) => Promise<R>;
} {
  const pending = { type: `${typePrefix}/pending` };
  const fulfilled = (result: R): Action<R> => ({ type: `${typePrefix}/fulfilled`, payload: result });
  const rejected = (error: Error): Action<Error> => ({ type: `${typePrefix}/rejected`, payload: error });

  const run = (payload: P) => async (dispatch: Dispatch): Promise<R> => {
    dispatch(pending);
    try {
      const result = await asyncFn(payload);
      dispatch(fulfilled(result));
      return result;
    } catch (error) {
      dispatch(rejected(error instanceof Error ? error : new Error(String(error))));
      throw error;
    }
  };

  return { pending, fulfilled, rejected, run };
}
