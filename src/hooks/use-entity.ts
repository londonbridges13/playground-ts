// src/hooks/use-entity.ts
// React hooks for entity CRUD operations

import { useState, useEffect, useCallback } from 'react';

import type { EntityTypeName } from 'src/types/entities';

import { entityAPI } from 'src/lib/api/entities';

// ----------------------------------------------------------------------

/**
 * Hook for fetching a single entity by ID
 */
export function useEntity<T>(entityType: EntityTypeName, id: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await entityAPI.get<T>(entityType, id);
      setData(result);
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [entityType, id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching a list of entities
 */
export function useEntityList<T>(entityType: EntityTypeName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await entityAPI.list<T>(entityType);
      setData(result);
    } catch (err) {
      setError(err as Error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ----------------------------------------------------------------------

/**
 * Hook for entity mutations (create, update, delete)
 */
export function useEntityMutation<T>(entityType: EntityTypeName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async <TInput = Partial<T>>(payload: TInput): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await entityAPI.create<T, TInput>(entityType, payload);
        return result;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [entityType]
  );

  const update = useCallback(
    async <TInput = Partial<T>>(id: string, payload: TInput): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await entityAPI.update<T, TInput>(entityType, id, payload);
        return result;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [entityType]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await entityAPI.delete(entityType, id);
        return true;
      } catch (err) {
        setError(err as Error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [entityType]
  );

  return { create, update, remove, loading, error };
}

// ----------------------------------------------------------------------

/**
 * Combined hook for full CRUD operations on an entity type
 */
export function useEntityCRUD<T>(entityType: EntityTypeName) {
  const list = useEntityList<T>(entityType);
  const mutation = useEntityMutation<T>(entityType);

  const createAndRefresh = useCallback(
    async <TInput = Partial<T>>(payload: TInput): Promise<T | null> => {
      const result = await mutation.create(payload);
      if (result) {
        await list.refetch();
      }
      return result;
    },
    [mutation, list]
  );

  const updateAndRefresh = useCallback(
    async <TInput = Partial<T>>(id: string, payload: TInput): Promise<T | null> => {
      const result = await mutation.update(id, payload);
      if (result) {
        await list.refetch();
      }
      return result;
    },
    [mutation, list]
  );

  const removeAndRefresh = useCallback(
    async (id: string): Promise<boolean> => {
      const success = await mutation.remove(id);
      if (success) {
        await list.refetch();
      }
      return success;
    },
    [mutation, list]
  );

  return {
    // List state
    data: list.data,
    loading: list.loading || mutation.loading,
    error: list.error || mutation.error,
    refetch: list.refetch,

    // Mutations
    create: createAndRefresh,
    update: updateAndRefresh,
    remove: removeAndRefresh,
  };
}

