// utils/focus-interface-migration.ts
// Converts Focus interface JSON from v1.0 to v2.0 schema

import {
  CURRENT_INTERFACE_SCHEMA_VERSION,
  type FocusInterfaceV2,
  type InterfaceNode,
  type InterfaceEdge,
} from 'src/types/v3-interface-api-structure';

// Re-export for convenience
export const CURRENT_SCHEMA_VERSION = CURRENT_INTERFACE_SCHEMA_VERSION;
export type { FocusInterfaceV2 } from 'src/types/v3-interface-api-structure';

// ============================================
// Legacy V1 Types
// ============================================

interface LegacyInterfaceV1 {
  version: string;
  exportedAt?: string;
  viewport: { x: number; y: number; zoom: number };
  nodes: any[];
  edges: any[];
}

// ============================================
// Migration Functions
// ============================================

/**
 * Converts a v1.0 interface to v2.0 format
 * - Renames `version` to `schemaVersion`
 * - Removes `exportedAt` (now tracked by Focus.updatedAt)
 * - Adds optional `basisId` to node data (null by default)
 * - Adds optional `relationship` to edge data (null by default)
 */
export function migrateV1ToV2(legacy: LegacyInterfaceV1): FocusInterfaceV2 {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    viewport: legacy.viewport,
    nodes: legacy.nodes.map((node): InterfaceNode => ({
      id: node.id,
      type: node.type,
      position: node.position,
      width: node.width,
      height: node.height,
      zIndex: node.zIndex,
      parentId: node.parentId,
      data: {
        ...node.data,
        basisId: null,  // Explicitly null so it appears in JSON
      },
    })),
    edges: legacy.edges.map((edge): InterfaceEdge => ({
      id: edge.id,
      type: edge.type,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      data: {
        ...edge.data,
        relationship: null,  // Explicitly null so it appears in JSON
      },
    })),
  };
}

/**
 * Auto-detect version and migrate if needed
 */
export function migrateFocusInterface(input: any): FocusInterfaceV2 {
  const version = input.schemaVersion || input.version || '1.0';

  if (version === CURRENT_SCHEMA_VERSION) {
    return input as FocusInterfaceV2;
  }

  if (version === '1.0') {
    return migrateV1ToV2(input as LegacyInterfaceV1);
  }

  throw new Error(`Unknown schema version: ${version}`);
}

/**
 * Check if interface needs migration
 */
export function needsMigration(input: any): boolean {
  const version = input.schemaVersion || input.version || '1.0';
  return version !== CURRENT_SCHEMA_VERSION;
}

/**
 * Get the current version of an interface
 */
export function getInterfaceVersion(input: any): string {
  return input.schemaVersion || input.version || '1.0';
}

