/**
 * Normalized State Management (Discord Style)
 *
 * Entity normalization for efficient state management:
 * - Flat entity storage
 * - Relationship handling
 * - Selective updates
 * - Derived data computation
 * - Memory efficient
 */

export type EntityId = string | number;

export interface Entity {
  id: EntityId;
}

export interface NormalizedEntity<T extends Entity> {
  byId: Record<EntityId, T>;
  allIds: EntityId[];
}

export interface EntityAdapter<T extends Entity> {
  getInitialState: () => NormalizedEntity<T>;
  addOne: (state: NormalizedEntity<T>, entity: T) => NormalizedEntity<T>;
  addMany: (state: NormalizedEntity<T>, entities: T[]) => NormalizedEntity<T>;
  setOne: (state: NormalizedEntity<T>, entity: T) => NormalizedEntity<T>;
  setMany: (state: NormalizedEntity<T>, entities: T[]) => NormalizedEntity<T>;
  setAll: (state: NormalizedEntity<T>, entities: T[]) => NormalizedEntity<T>;
  updateOne: (state: NormalizedEntity<T>, update: { id: EntityId; changes: Partial<T> }) => NormalizedEntity<T>;
  updateMany: (state: NormalizedEntity<T>, updates: { id: EntityId; changes: Partial<T> }[]) => NormalizedEntity<T>;
  upsertOne: (state: NormalizedEntity<T>, entity: T) => NormalizedEntity<T>;
  upsertMany: (state: NormalizedEntity<T>, entities: T[]) => NormalizedEntity<T>;
  removeOne: (state: NormalizedEntity<T>, id: EntityId) => NormalizedEntity<T>;
  removeMany: (state: NormalizedEntity<T>, ids: EntityId[]) => NormalizedEntity<T>;
  removeAll: (state: NormalizedEntity<T>) => NormalizedEntity<T>;
  selectById: (state: NormalizedEntity<T>, id: EntityId) => T | undefined;
  selectIds: (state: NormalizedEntity<T>) => EntityId[];
  selectAll: (state: NormalizedEntity<T>) => T[];
  selectTotal: (state: NormalizedEntity<T>) => number;
}

/**
 * Create an entity adapter for normalized state management
 */
export function createEntityAdapter<T extends Entity>(options?: {
  selectId?: (entity: T) => EntityId;
  sortComparer?: (a: T, b: T) => number;
}): EntityAdapter<T> {
  const selectId = options?.selectId || ((entity: T) => entity.id);
  const sortComparer = options?.sortComparer;

  const getInitialState = (): NormalizedEntity<T> => ({
    byId: {},
    allIds: []
  });

  const sortIds = (state: NormalizedEntity<T>): EntityId[] => {
    if (!sortComparer) return state.allIds;

    return [...state.allIds].sort((a, b) => {
      const entityA = state.byId[a];
      const entityB = state.byId[b];
      if (!entityA || !entityB) return 0;
      return sortComparer(entityA, entityB);
    });
  };

  const addOne = (state: NormalizedEntity<T>, entity: T): NormalizedEntity<T> => {
    const id = selectId(entity);

    if (id in state.byId) {
      return state;
    }

    return {
      byId: { ...state.byId, [id]: entity },
      allIds: sortComparer
        ? sortIds({ byId: { ...state.byId, [id]: entity }, allIds: [...state.allIds, id] })
        : [...state.allIds, id]
    };
  };

  const addMany = (state: NormalizedEntity<T>, entities: T[]): NormalizedEntity<T> => {
    let newState = state;
    for (const entity of entities) {
      newState = addOne(newState, entity);
    }
    return newState;
  };

  const setOne = (state: NormalizedEntity<T>, entity: T): NormalizedEntity<T> => {
    const id = selectId(entity);
    const isNew = !(id in state.byId);

    const newById = { ...state.byId, [id]: entity };
    const newAllIds = isNew ? [...state.allIds, id] : state.allIds;

    return {
      byId: newById,
      allIds: sortComparer ? sortIds({ byId: newById, allIds: newAllIds }) : newAllIds
    };
  };

  const setMany = (state: NormalizedEntity<T>, entities: T[]): NormalizedEntity<T> => {
    let newState = state;
    for (const entity of entities) {
      newState = setOne(newState, entity);
    }
    return newState;
  };

  const setAll = (_state: NormalizedEntity<T>, entities: T[]): NormalizedEntity<T> => {
    const byId: Record<EntityId, T> = {};
    const allIds: EntityId[] = [];

    for (const entity of entities) {
      const id = selectId(entity);
      byId[id] = entity;
      allIds.push(id);
    }

    return {
      byId,
      allIds: sortComparer ? sortIds({ byId, allIds }) : allIds
    };
  };

  const updateOne = (
    state: NormalizedEntity<T>,
    update: { id: EntityId; changes: Partial<T> }
  ): NormalizedEntity<T> => {
    const { id, changes } = update;

    if (!(id in state.byId)) {
      return state;
    }

    const existing = state.byId[id];
    if (!existing) return state;

    const updatedEntity = { ...existing, ...changes } as T;

    return {
      byId: { ...state.byId, [id]: updatedEntity },
      allIds: sortComparer ? sortIds({ ...state, byId: { ...state.byId, [id]: updatedEntity } }) : state.allIds
    };
  };

  const updateMany = (
    state: NormalizedEntity<T>,
    updates: { id: EntityId; changes: Partial<T> }[]
  ): NormalizedEntity<T> => {
    let newState = state;
    for (const update of updates) {
      newState = updateOne(newState, update);
    }
    return newState;
  };

  const upsertOne = (state: NormalizedEntity<T>, entity: T): NormalizedEntity<T> => {
    return setOne(state, entity);
  };

  const upsertMany = (state: NormalizedEntity<T>, entities: T[]): NormalizedEntity<T> => {
    return setMany(state, entities);
  };

  const removeOne = (state: NormalizedEntity<T>, id: EntityId): NormalizedEntity<T> => {
    if (!(id in state.byId)) {
      return state;
    }

    const { [id]: removed, ...restById } = state.byId;
    const newAllIds = state.allIds.filter(existingId => existingId !== id);

    return {
      byId: restById,
      allIds: newAllIds
    };
  };

  const removeMany = (state: NormalizedEntity<T>, ids: EntityId[]): NormalizedEntity<T> => {
    let newState = state;
    for (const id of ids) {
      newState = removeOne(newState, id);
    }
    return newState;
  };

  const removeAll = (_state: NormalizedEntity<T>): NormalizedEntity<T> => {
    return getInitialState();
  };

  const selectById = (state: NormalizedEntity<T>, id: EntityId): T | undefined => {
    return state.byId[id];
  };

  const selectIds = (state: NormalizedEntity<T>): EntityId[] => {
    return state.allIds;
  };

  const selectAll = (state: NormalizedEntity<T>): T[] => {
    return state.allIds.map(id => state.byId[id]).filter((entity): entity is T => entity !== undefined);
  };

  const selectTotal = (state: NormalizedEntity<T>): number => {
    return state.allIds.length;
  };

  return {
    getInitialState,
    addOne,
    addMany,
    setOne,
    setMany,
    setAll,
    updateOne,
    updateMany,
    upsertOne,
    upsertMany,
    removeOne,
    removeMany,
    removeAll,
    selectById,
    selectIds,
    selectAll,
    selectTotal
  };
}

/**
 * Normalize nested data into flat structure
 */
export interface NormalizationSchema<T> {
  key: string;
  getId?: (entity: T) => EntityId;
  relations?: {
    [key: string]: NormalizationSchema<unknown> | [NormalizationSchema<unknown>];
  };
}

export interface NormalizedData {
  entities: Record<string, Record<EntityId, unknown>>;
  result: EntityId | EntityId[];
}

export function normalize<T extends Entity>(
  data: T | T[],
  schema: NormalizationSchema<T>
): NormalizedData {
  const entities: Record<string, Record<EntityId, unknown>> = {};
  const getId = schema.getId || ((e: T) => e.id);

  const processEntity = (entity: T, entitySchema: NormalizationSchema<T>): EntityId => {
    const id = getId(entity);
    const key = entitySchema.key;

    if (!entities[key]) {
      entities[key] = {};
    }

    const normalized: Record<string, unknown> = { ...entity };

    // Process relations
    if (entitySchema.relations) {
      for (const [relationKey, relationSchema] of Object.entries(entitySchema.relations)) {
        const relationData = (entity as Record<string, unknown>)[relationKey];

        if (Array.isArray(relationSchema)) {
          // One-to-many relation
          const itemSchema = relationSchema[0];
          if (Array.isArray(relationData)) {
            normalized[relationKey] = relationData.map(item =>
              processEntity(item as Entity & Record<string, unknown>, itemSchema as NormalizationSchema<Entity & Record<string, unknown>>)
            );
          }
        } else {
          // One-to-one relation
          if (relationData) {
            normalized[relationKey] = processEntity(
              relationData as Entity & Record<string, unknown>,
              relationSchema as NormalizationSchema<Entity & Record<string, unknown>>
            );
          }
        }
      }
    }

    entities[key][id] = normalized;
    return id;
  };

  const result = Array.isArray(data)
    ? data.map(entity => processEntity(entity, schema))
    : processEntity(data, schema);

  return { entities, result };
}

/**
 * Denormalize data back to nested structure
 */
export function denormalize<T>(
  id: EntityId | EntityId[],
  schema: NormalizationSchema<T>,
  entities: Record<string, Record<EntityId, unknown>>
): T | T[] | null {
  const processId = (entityId: EntityId, entitySchema: NormalizationSchema<unknown>): unknown => {
    const key = entitySchema.key;
    const entity = entities[key]?.[entityId];

    if (!entity) return null;

    const denormalized = { ...(entity as Record<string, unknown>) };

    // Process relations
    if (entitySchema.relations) {
      for (const [relationKey, relationSchema] of Object.entries(entitySchema.relations)) {
        const relationIds = denormalized[relationKey];

        if (Array.isArray(relationSchema)) {
          // One-to-many relation
          const itemSchema = relationSchema[0];
          if (Array.isArray(relationIds)) {
            denormalized[relationKey] = relationIds.map(relId => processId(relId as EntityId, itemSchema));
          }
        } else {
          // One-to-one relation
          if (relationIds) {
            denormalized[relationKey] = processId(relationIds as EntityId, relationSchema);
          }
        }
      }
    }

    return denormalized;
  };

  if (Array.isArray(id)) {
    return id.map(entityId => processId(entityId, schema)).filter(Boolean) as T[];
  }

  return processId(id, schema) as T | null;
}

/**
 * Create a memoized selector for derived data
 */
export function createSelector<S, Args extends unknown[], R>(
  selectors: [...{ [K in keyof Args]: (state: S) => Args[K] }],
  combiner: (...args: Args) => R
): (state: S) => R {
  let lastArgs: Args | null = null;
  let lastResult: R;

  return (state: S): R => {
    const args = selectors.map(selector => selector(state)) as Args;

    // Check if args have changed
    if (
      lastArgs === null ||
      args.some((arg, index) => arg !== lastArgs![index])
    ) {
      lastResult = combiner(...args);
      lastArgs = args;
    }

    return lastResult;
  };
}
