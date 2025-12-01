/**
 * Collaboration Module
 *
 * Enterprise-grade real-time collaboration system
 * inspired by Figma, Notion, and Google Docs.
 */

// CRDT (Conflict-free Replicated Data Types)
export {
  GCounter,
  PNCounter,
  LWWRegister,
  LWWMap,
  ORSet,
  TextCRDT,
  DocumentCRDT,
  compareVectorClocks,
  mergeVectorClocks,
  type VectorClock,
  type NodeId,
  type Clock,
  type TextChar,
  type DocumentNode
} from './CRDT';

// Presence System
export {
  presence,
  usePresence,
  useTypingIndicator,
  getCursorStyle,
  getSelectionStyle,
  type UserPresence,
  type CursorPosition,
  type Selection,
  type UserStatus,
  type PresenceEvent
} from './Presence';

// Operational Transformation
export {
  OTClient,
  OTServer,
  insert,
  del,
  retain,
  apply,
  compose,
  transform,
  invert,
  createInsertOperation,
  createDeleteOperation,
  type TextOperation,
  type ComposedOperation,
  type OperationMeta,
  type SyncOperation
} from './OperationalTransform';
