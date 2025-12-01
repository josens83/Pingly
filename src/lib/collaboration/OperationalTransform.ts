/**
 * Operational Transformation (OT) Implementation
 * Inspired by Google Docs real-time collaboration
 *
 * Features:
 * - Text operations (insert, delete, retain)
 * - Operation composition
 * - Operation transformation
 * - Undo/Redo support
 * - Server-client synchronization
 */

export type OperationType = 'insert' | 'delete' | 'retain';

export interface TextOperation {
  type: OperationType;
  position?: number;
  text?: string;
  count?: number;
}

export interface ComposedOperation {
  ops: TextOperation[];
  baseLength: number;
  targetLength: number;
}

export interface OperationMeta {
  userId: string;
  timestamp: number;
  revision: number;
}

export interface SyncOperation {
  operation: ComposedOperation;
  meta: OperationMeta;
}

/**
 * Create operation builders
 */
export function insert(position: number, text: string): TextOperation {
  return { type: 'insert', position, text };
}

export function del(position: number, count: number): TextOperation {
  return { type: 'delete', position, count };
}

export function retain(count: number): TextOperation {
  return { type: 'retain', count };
}

/**
 * Apply operation to a string
 */
export function apply(document: string, operation: ComposedOperation): string {
  if (document.length !== operation.baseLength) {
    throw new Error(`Document length (${document.length}) doesn't match baseLength (${operation.baseLength})`);
  }

  let result = '';
  let index = 0;

  for (const op of operation.ops) {
    switch (op.type) {
      case 'retain':
        if (op.count === undefined) throw new Error('Retain requires count');
        result += document.slice(index, index + op.count);
        index += op.count;
        break;

      case 'insert':
        if (op.text === undefined) throw new Error('Insert requires text');
        result += op.text;
        break;

      case 'delete':
        if (op.count === undefined) throw new Error('Delete requires count');
        index += op.count;
        break;
    }
  }

  // Append remaining text
  result += document.slice(index);

  if (result.length !== operation.targetLength) {
    throw new Error(`Result length (${result.length}) doesn't match targetLength (${operation.targetLength})`);
  }

  return result;
}

/**
 * Compose two operations into one
 * The resulting operation has the effect of applying both operations in sequence
 */
export function compose(op1: ComposedOperation, op2: ComposedOperation): ComposedOperation {
  if (op1.targetLength !== op2.baseLength) {
    throw new Error('Operations cannot be composed: length mismatch');
  }

  const ops: TextOperation[] = [];
  let i1 = 0;
  let i2 = 0;
  let op1Ops = [...op1.ops];
  let op2Ops = [...op2.ops];

  while (i1 < op1Ops.length || i2 < op2Ops.length) {
    const a = op1Ops[i1];
    const b = op2Ops[i2];

    // Delete from op1 takes priority
    if (a?.type === 'delete') {
      ops.push({ ...a });
      i1++;
      continue;
    }

    // Insert from op2 takes priority
    if (b?.type === 'insert') {
      ops.push({ ...b });
      i2++;
      continue;
    }

    if (!a && !b) break;

    if (!a) {
      ops.push({ ...b! });
      i2++;
      continue;
    }

    if (!b) {
      ops.push({ ...a });
      i1++;
      continue;
    }

    // Both are retain or insert/retain combination
    if (a.type === 'retain' && b.type === 'retain') {
      const len = Math.min(a.count!, b.count!);
      ops.push(retain(len));

      if (a.count! > len) {
        op1Ops[i1] = retain(a.count! - len);
      } else {
        i1++;
      }

      if (b.count! > len) {
        op2Ops[i2] = retain(b.count! - len);
      } else {
        i2++;
      }
    } else if (a.type === 'insert' && b.type === 'retain') {
      const len = Math.min(a.text!.length, b.count!);
      ops.push(insert(0, a.text!.slice(0, len)));

      if (a.text!.length > len) {
        op1Ops[i1] = insert(0, a.text!.slice(len));
      } else {
        i1++;
      }

      if (b.count! > len) {
        op2Ops[i2] = retain(b.count! - len);
      } else {
        i2++;
      }
    } else if (a.type === 'insert' && b.type === 'delete') {
      const len = Math.min(a.text!.length, b.count!);

      if (a.text!.length > len) {
        op1Ops[i1] = insert(0, a.text!.slice(len));
      } else {
        i1++;
      }

      if (b.count! > len) {
        op2Ops[i2] = del(0, b.count! - len);
      } else {
        i2++;
      }
    } else if (a.type === 'retain' && b.type === 'delete') {
      const len = Math.min(a.count!, b.count!);
      ops.push(del(0, len));

      if (a.count! > len) {
        op1Ops[i1] = retain(a.count! - len);
      } else {
        i1++;
      }

      if (b.count! > len) {
        op2Ops[i2] = del(0, b.count! - len);
      } else {
        i2++;
      }
    }
  }

  return {
    ops: optimizeOps(ops),
    baseLength: op1.baseLength,
    targetLength: op2.targetLength
  };
}

/**
 * Transform two concurrent operations
 * Returns [op1', op2'] where:
 * - apply(apply(doc, op1), op2') = apply(apply(doc, op2), op1')
 */
export function transform(
  op1: ComposedOperation,
  op2: ComposedOperation
): [ComposedOperation, ComposedOperation] {
  if (op1.baseLength !== op2.baseLength) {
    throw new Error('Operations must have same base length to transform');
  }

  const ops1Prime: TextOperation[] = [];
  const ops2Prime: TextOperation[] = [];

  let i1 = 0;
  let i2 = 0;
  const op1Ops = [...op1.ops];
  const op2Ops = [...op2.ops];

  while (i1 < op1Ops.length || i2 < op2Ops.length) {
    const a = op1Ops[i1];
    const b = op2Ops[i2];

    // Insert in op1 goes first
    if (a?.type === 'insert') {
      ops1Prime.push({ ...a });
      ops2Prime.push(retain(a.text!.length));
      i1++;
      continue;
    }

    // Insert in op2 goes first
    if (b?.type === 'insert') {
      ops1Prime.push(retain(b.text!.length));
      ops2Prime.push({ ...b });
      i2++;
      continue;
    }

    if (!a && !b) break;

    if (!a) {
      ops2Prime.push({ ...b! });
      i2++;
      continue;
    }

    if (!b) {
      ops1Prime.push({ ...a });
      i1++;
      continue;
    }

    // Both are retain
    if (a.type === 'retain' && b.type === 'retain') {
      const len = Math.min(a.count!, b.count!);
      ops1Prime.push(retain(len));
      ops2Prime.push(retain(len));

      if (a.count! > len) {
        op1Ops[i1] = retain(a.count! - len);
      } else {
        i1++;
      }

      if (b.count! > len) {
        op2Ops[i2] = retain(b.count! - len);
      } else {
        i2++;
      }
    }
    // Both are delete
    else if (a.type === 'delete' && b.type === 'delete') {
      const len = Math.min(a.count!, b.count!);

      if (a.count! > len) {
        op1Ops[i1] = del(0, a.count! - len);
      } else {
        i1++;
      }

      if (b.count! > len) {
        op2Ops[i2] = del(0, b.count! - len);
      } else {
        i2++;
      }
    }
    // Delete vs Retain
    else if (a.type === 'delete' && b.type === 'retain') {
      const len = Math.min(a.count!, b.count!);
      ops1Prime.push(del(0, len));

      if (a.count! > len) {
        op1Ops[i1] = del(0, a.count! - len);
      } else {
        i1++;
      }

      if (b.count! > len) {
        op2Ops[i2] = retain(b.count! - len);
      } else {
        i2++;
      }
    }
    // Retain vs Delete
    else if (a.type === 'retain' && b.type === 'delete') {
      const len = Math.min(a.count!, b.count!);
      ops2Prime.push(del(0, len));

      if (a.count! > len) {
        op1Ops[i1] = retain(a.count! - len);
      } else {
        i1++;
      }

      if (b.count! > len) {
        op2Ops[i2] = del(0, b.count! - len);
      } else {
        i2++;
      }
    }
  }

  const op1Target = op1Ops.reduce((sum, op) => {
    if (op.type === 'insert') return sum + op.text!.length;
    if (op.type === 'delete') return sum - op.count!;
    return sum;
  }, op1.baseLength);

  const op2Target = op2Ops.reduce((sum, op) => {
    if (op.type === 'insert') return sum + op.text!.length;
    if (op.type === 'delete') return sum - op.count!;
    return sum;
  }, op2.baseLength);

  return [
    {
      ops: optimizeOps(ops1Prime),
      baseLength: op2Target,
      targetLength: op1Target + (op2Target - op2.baseLength)
    },
    {
      ops: optimizeOps(ops2Prime),
      baseLength: op1Target,
      targetLength: op2Target + (op1Target - op1.baseLength)
    }
  ];
}

/**
 * Optimize operations by merging consecutive same-type ops
 */
function optimizeOps(ops: TextOperation[]): TextOperation[] {
  const result: TextOperation[] = [];

  for (const op of ops) {
    if (result.length === 0) {
      result.push(op);
      continue;
    }

    const last = result[result.length - 1];

    if (last.type === 'retain' && op.type === 'retain') {
      result[result.length - 1] = retain(last.count! + op.count!);
    } else if (last.type === 'insert' && op.type === 'insert') {
      result[result.length - 1] = insert(0, last.text! + op.text!);
    } else if (last.type === 'delete' && op.type === 'delete') {
      result[result.length - 1] = del(0, last.count! + op.count!);
    } else if (
      (op.type === 'retain' && op.count === 0) ||
      (op.type === 'delete' && op.count === 0) ||
      (op.type === 'insert' && op.text === '')
    ) {
      // Skip no-op
    } else {
      result.push(op);
    }
  }

  return result;
}

/**
 * Invert an operation for undo
 */
export function invert(operation: ComposedOperation, document: string): ComposedOperation {
  const ops: TextOperation[] = [];
  let index = 0;

  for (const op of operation.ops) {
    switch (op.type) {
      case 'retain':
        ops.push(retain(op.count!));
        index += op.count!;
        break;

      case 'insert':
        ops.push(del(0, op.text!.length));
        break;

      case 'delete':
        ops.push(insert(0, document.slice(index, index + op.count!)));
        index += op.count!;
        break;
    }
  }

  return {
    ops: optimizeOps(ops),
    baseLength: operation.targetLength,
    targetLength: operation.baseLength
  };
}

/**
 * Create a simple operation from position and text
 */
export function createInsertOperation(
  position: number,
  text: string,
  documentLength: number
): ComposedOperation {
  const ops: TextOperation[] = [];

  if (position > 0) {
    ops.push(retain(position));
  }

  ops.push(insert(position, text));

  if (position < documentLength) {
    ops.push(retain(documentLength - position));
  }

  return {
    ops,
    baseLength: documentLength,
    targetLength: documentLength + text.length
  };
}

export function createDeleteOperation(
  position: number,
  length: number,
  documentLength: number
): ComposedOperation {
  const ops: TextOperation[] = [];

  if (position > 0) {
    ops.push(retain(position));
  }

  ops.push(del(position, length));

  if (position + length < documentLength) {
    ops.push(retain(documentLength - position - length));
  }

  return {
    ops,
    baseLength: documentLength,
    targetLength: documentLength - length
  };
}

/**
 * Client-side OT synchronization
 */
export class OTClient {
  private document: string = '';
  private revision = 0;
  private pendingOperation: ComposedOperation | null = null;
  private buffer: ComposedOperation | null = null;
  private state: 'synchronized' | 'awaiting_ack' | 'awaiting_with_buffer' = 'synchronized';

  constructor(initialDocument: string = '', initialRevision: number = 0) {
    this.document = initialDocument;
    this.revision = initialRevision;
  }

  getDocument(): string {
    return this.document;
  }

  getRevision(): number {
    return this.revision;
  }

  /**
   * Apply local operation
   * Returns operation to send to server (if any)
   */
  applyLocal(operation: ComposedOperation): ComposedOperation | null {
    this.document = apply(this.document, operation);

    switch (this.state) {
      case 'synchronized':
        this.pendingOperation = operation;
        this.state = 'awaiting_ack';
        return operation;

      case 'awaiting_ack':
        this.buffer = this.buffer
          ? compose(this.buffer, operation)
          : operation;
        this.state = 'awaiting_with_buffer';
        return null;

      case 'awaiting_with_buffer':
        this.buffer = compose(this.buffer!, operation);
        return null;
    }
  }

  /**
   * Handle acknowledgement from server
   * Returns operation to send (if any)
   */
  handleAck(): ComposedOperation | null {
    this.revision++;

    switch (this.state) {
      case 'awaiting_ack':
        this.pendingOperation = null;
        this.state = 'synchronized';
        return null;

      case 'awaiting_with_buffer':
        this.pendingOperation = this.buffer;
        this.buffer = null;
        this.state = 'awaiting_ack';
        return this.pendingOperation;

      default:
        throw new Error('Unexpected ack in synchronized state');
    }
  }

  /**
   * Handle operation from server (another client's change)
   */
  handleRemote(operation: ComposedOperation): void {
    switch (this.state) {
      case 'synchronized':
        this.document = apply(this.document, operation);
        this.revision++;
        break;

      case 'awaiting_ack':
        const [pending1, remote1] = transform(this.pendingOperation!, operation);
        this.pendingOperation = pending1;
        this.document = apply(this.document, remote1);
        this.revision++;
        break;

      case 'awaiting_with_buffer':
        const [pending2, remote2] = transform(this.pendingOperation!, operation);
        const [buffer2, remote3] = transform(this.buffer!, remote2);
        this.pendingOperation = pending2;
        this.buffer = buffer2;
        this.document = apply(this.document, remote3);
        this.revision++;
        break;
    }
  }
}

/**
 * Server-side OT synchronization
 */
export class OTServer {
  private document: string = '';
  private revision = 0;
  private history: SyncOperation[] = [];

  constructor(initialDocument: string = '') {
    this.document = initialDocument;
  }

  getDocument(): string {
    return this.document;
  }

  getRevision(): number {
    return this.revision;
  }

  /**
   * Receive operation from client
   * Returns transformed operation to broadcast
   */
  receiveOperation(
    operation: ComposedOperation,
    meta: OperationMeta
  ): ComposedOperation {
    // Transform against all operations since client's revision
    let transformed = operation;

    for (let i = meta.revision; i < this.revision; i++) {
      const serverOp = this.history[i];
      if (serverOp) {
        [transformed] = transform(transformed, serverOp.operation);
      }
    }

    // Apply to document
    this.document = apply(this.document, transformed);
    this.revision++;

    // Store in history
    this.history.push({
      operation: transformed,
      meta: { ...meta, revision: this.revision }
    });

    // Trim old history (keep last 1000 operations)
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }

    return transformed;
  }

  /**
   * Get operations since a revision
   */
  getOperationsSince(revision: number): SyncOperation[] {
    return this.history.filter(op => op.meta.revision > revision);
  }
}
