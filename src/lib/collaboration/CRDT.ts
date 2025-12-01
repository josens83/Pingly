/**
 * CRDT (Conflict-free Replicated Data Types) Implementation
 * Inspired by Figma's real-time collaboration
 *
 * Features:
 * - G-Counter (Grow-only counter)
 * - PN-Counter (Positive-Negative counter)
 * - LWW-Register (Last-Writer-Wins)
 * - LWW-Map
 * - OR-Set (Observed-Remove Set)
 * - Text CRDT for collaborative editing
 */

export type NodeId = string;
export type Clock = number;

export interface VectorClock {
  [nodeId: string]: Clock;
}

/**
 * Compare vector clocks
 */
export function compareVectorClocks(
  a: VectorClock,
  b: VectorClock
): 'before' | 'after' | 'concurrent' | 'equal' {
  const allNodes = new Set([...Object.keys(a), ...Object.keys(b)]);

  let aBeforeB = false;
  let bBeforeA = false;

  for (const node of allNodes) {
    const clockA = a[node] || 0;
    const clockB = b[node] || 0;

    if (clockA < clockB) aBeforeB = true;
    if (clockB < clockA) bBeforeA = true;
  }

  if (aBeforeB && !bBeforeA) return 'before';
  if (bBeforeA && !aBeforeB) return 'after';
  if (!aBeforeB && !bBeforeA) return 'equal';
  return 'concurrent';
}

/**
 * Merge vector clocks
 */
export function mergeVectorClocks(a: VectorClock, b: VectorClock): VectorClock {
  const result: VectorClock = { ...a };

  for (const [node, clock] of Object.entries(b)) {
    result[node] = Math.max(result[node] || 0, clock);
  }

  return result;
}

/**
 * G-Counter: Grow-only counter
 */
export class GCounter {
  private counts: Map<NodeId, number> = new Map();
  private nodeId: NodeId;

  constructor(nodeId: NodeId) {
    this.nodeId = nodeId;
    this.counts.set(nodeId, 0);
  }

  increment(amount = 1): void {
    const current = this.counts.get(this.nodeId) || 0;
    this.counts.set(this.nodeId, current + amount);
  }

  value(): number {
    let total = 0;
    for (const count of this.counts.values()) {
      total += count;
    }
    return total;
  }

  merge(other: GCounter): void {
    for (const [nodeId, count] of other.counts.entries()) {
      const current = this.counts.get(nodeId) || 0;
      this.counts.set(nodeId, Math.max(current, count));
    }
  }

  toJSON(): Record<NodeId, number> {
    return Object.fromEntries(this.counts);
  }

  static fromJSON(nodeId: NodeId, data: Record<NodeId, number>): GCounter {
    const counter = new GCounter(nodeId);
    counter.counts = new Map(Object.entries(data));
    return counter;
  }
}

/**
 * PN-Counter: Positive-Negative counter
 */
export class PNCounter {
  private positive: GCounter;
  private negative: GCounter;

  constructor(nodeId: NodeId) {
    this.positive = new GCounter(nodeId);
    this.negative = new GCounter(nodeId);
  }

  increment(amount = 1): void {
    this.positive.increment(amount);
  }

  decrement(amount = 1): void {
    this.negative.increment(amount);
  }

  value(): number {
    return this.positive.value() - this.negative.value();
  }

  merge(other: PNCounter): void {
    this.positive.merge(other.positive);
    this.negative.merge(other.negative);
  }

  toJSON(): { positive: Record<NodeId, number>; negative: Record<NodeId, number> } {
    return {
      positive: this.positive.toJSON(),
      negative: this.negative.toJSON()
    };
  }
}

/**
 * LWW-Register: Last-Writer-Wins Register
 */
export class LWWRegister<T> {
  private value_: T | null = null;
  private timestamp = 0;
  private nodeId: NodeId;

  constructor(nodeId: NodeId, initialValue: T | null = null) {
    this.nodeId = nodeId;
    this.value_ = initialValue;
  }

  set(value: T, timestamp?: number): void {
    const ts = timestamp ?? Date.now();
    if (ts >= this.timestamp) {
      this.value_ = value;
      this.timestamp = ts;
    }
  }

  get(): T | null {
    return this.value_;
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  merge(other: LWWRegister<T>): void {
    if (other.timestamp > this.timestamp) {
      this.value_ = other.value_;
      this.timestamp = other.timestamp;
    } else if (other.timestamp === this.timestamp && other.nodeId > this.nodeId) {
      // Tie-breaker using nodeId
      this.value_ = other.value_;
    }
  }

  toJSON(): { value: T | null; timestamp: number } {
    return { value: this.value_, timestamp: this.timestamp };
  }
}

/**
 * LWW-Map: Last-Writer-Wins Map
 */
export class LWWMap<K extends string, V> {
  private registers: Map<K, LWWRegister<V | null>> = new Map();
  private nodeId: NodeId;

  constructor(nodeId: NodeId) {
    this.nodeId = nodeId;
  }

  set(key: K, value: V, timestamp?: number): void {
    if (!this.registers.has(key)) {
      this.registers.set(key, new LWWRegister<V | null>(this.nodeId));
    }
    this.registers.get(key)!.set(value, timestamp);
  }

  get(key: K): V | null {
    return this.registers.get(key)?.get() ?? null;
  }

  delete(key: K, timestamp?: number): void {
    if (!this.registers.has(key)) {
      this.registers.set(key, new LWWRegister<V | null>(this.nodeId));
    }
    this.registers.get(key)!.set(null, timestamp);
  }

  has(key: K): boolean {
    return this.get(key) !== null;
  }

  keys(): K[] {
    return Array.from(this.registers.keys()).filter(k => this.get(k) !== null);
  }

  entries(): [K, V][] {
    return this.keys()
      .map(k => [k, this.get(k)!] as [K, V]);
  }

  merge(other: LWWMap<K, V>): void {
    for (const [key, register] of other.registers.entries()) {
      if (!this.registers.has(key)) {
        this.registers.set(key, new LWWRegister<V | null>(this.nodeId));
      }
      this.registers.get(key)!.merge(register);
    }
  }

  toJSON(): Record<K, { value: V | null; timestamp: number }> {
    const result: Record<string, { value: V | null; timestamp: number }> = {};
    for (const [key, register] of this.registers.entries()) {
      result[key] = register.toJSON();
    }
    return result as Record<K, { value: V | null; timestamp: number }>;
  }
}

/**
 * OR-Set: Observed-Remove Set
 */
export class ORSet<T> {
  private elements: Map<string, Set<string>> = new Map(); // element -> Set of unique tags
  private tombstones: Map<string, Set<string>> = new Map();
  private nodeId: NodeId;
  private clock = 0;

  constructor(nodeId: NodeId) {
    this.nodeId = nodeId;
  }

  private generateTag(): string {
    this.clock++;
    return `${this.nodeId}:${this.clock}`;
  }

  private serialize(element: T): string {
    return JSON.stringify(element);
  }

  private deserialize(key: string): T {
    return JSON.parse(key) as T;
  }

  add(element: T): void {
    const key = this.serialize(element);
    const tag = this.generateTag();

    if (!this.elements.has(key)) {
      this.elements.set(key, new Set());
    }
    this.elements.get(key)!.add(tag);
  }

  remove(element: T): void {
    const key = this.serialize(element);
    const tags = this.elements.get(key);

    if (tags) {
      if (!this.tombstones.has(key)) {
        this.tombstones.set(key, new Set());
      }
      for (const tag of tags) {
        this.tombstones.get(key)!.add(tag);
      }
      this.elements.delete(key);
    }
  }

  has(element: T): boolean {
    const key = this.serialize(element);
    const tags = this.elements.get(key);
    return tags !== undefined && tags.size > 0;
  }

  values(): T[] {
    return Array.from(this.elements.keys())
      .filter(key => this.elements.get(key)!.size > 0)
      .map(key => this.deserialize(key));
  }

  merge(other: ORSet<T>): void {
    // Merge elements
    for (const [key, tags] of other.elements.entries()) {
      if (!this.elements.has(key)) {
        this.elements.set(key, new Set());
      }
      for (const tag of tags) {
        if (!this.tombstones.get(key)?.has(tag)) {
          this.elements.get(key)!.add(tag);
        }
      }
    }

    // Merge tombstones and apply
    for (const [key, tags] of other.tombstones.entries()) {
      if (!this.tombstones.has(key)) {
        this.tombstones.set(key, new Set());
      }
      for (const tag of tags) {
        this.tombstones.get(key)!.add(tag);
        this.elements.get(key)?.delete(tag);
      }
    }

    // Clean up empty sets
    for (const [key, tags] of this.elements.entries()) {
      if (tags.size === 0) {
        this.elements.delete(key);
      }
    }
  }

  toJSON(): {
    elements: Record<string, string[]>;
    tombstones: Record<string, string[]>;
  } {
    return {
      elements: Object.fromEntries(
        Array.from(this.elements.entries()).map(([k, v]) => [k, Array.from(v)])
      ),
      tombstones: Object.fromEntries(
        Array.from(this.tombstones.entries()).map(([k, v]) => [k, Array.from(v)])
      )
    };
  }
}

/**
 * Text CRDT for collaborative text editing
 * Based on RGA (Replicated Growable Array)
 */
export interface TextChar {
  id: string;
  char: string;
  deleted: boolean;
  parent: string | null;
}

export class TextCRDT {
  private chars: Map<string, TextChar> = new Map();
  private root: string;
  private nodeId: NodeId;
  private clock = 0;

  constructor(nodeId: NodeId) {
    this.nodeId = nodeId;
    this.root = 'ROOT';
    this.chars.set(this.root, {
      id: this.root,
      char: '',
      deleted: false,
      parent: null
    });
  }

  private generateId(): string {
    this.clock++;
    return `${this.nodeId}:${this.clock}`;
  }

  insert(char: string, afterId: string | null): string {
    const id = this.generateId();
    const parent = afterId || this.root;

    this.chars.set(id, {
      id,
      char,
      deleted: false,
      parent
    });

    return id;
  }

  delete(id: string): void {
    const char = this.chars.get(id);
    if (char && id !== this.root) {
      char.deleted = true;
    }
  }

  getText(): string {
    const ordered = this.getOrderedChars();
    return ordered
      .filter(c => !c.deleted && c.id !== this.root)
      .map(c => c.char)
      .join('');
  }

  getOrderedChars(): TextChar[] {
    // Build children map
    const children: Map<string, string[]> = new Map();
    for (const char of this.chars.values()) {
      if (char.parent !== null) {
        if (!children.has(char.parent)) {
          children.set(char.parent, []);
        }
        children.get(char.parent)!.push(char.id);
      }
    }

    // Sort children by id (timestamp-based ordering)
    for (const childList of children.values()) {
      childList.sort((a, b) => b.localeCompare(a)); // Reverse for correct insertion order
    }

    // DFS traversal
    const result: TextChar[] = [];
    const traverse = (id: string) => {
      const char = this.chars.get(id)!;
      result.push(char);

      const childIds = children.get(id) || [];
      for (const childId of childIds) {
        traverse(childId);
      }
    };

    traverse(this.root);
    return result;
  }

  merge(other: TextCRDT): void {
    for (const [id, char] of other.chars.entries()) {
      if (id === this.root) continue;

      if (!this.chars.has(id)) {
        this.chars.set(id, { ...char });
      } else {
        // Merge deleted status
        const existing = this.chars.get(id)!;
        existing.deleted = existing.deleted || char.deleted;
      }
    }
  }

  toJSON(): Record<string, TextChar> {
    return Object.fromEntries(this.chars);
  }

  static fromJSON(nodeId: NodeId, data: Record<string, TextChar>): TextCRDT {
    const crdt = new TextCRDT(nodeId);
    crdt.chars = new Map(Object.entries(data));
    return crdt;
  }
}

/**
 * Document CRDT for structured document collaboration
 */
export interface DocumentNode {
  id: string;
  type: string;
  properties: LWWMap<string, unknown>;
  children: ORSet<string>;
  parent: string | null;
  deleted: boolean;
  timestamp: number;
}

export class DocumentCRDT {
  private nodes: Map<string, DocumentNode> = new Map();
  private nodeId: NodeId;
  private clock = 0;

  constructor(nodeId: NodeId) {
    this.nodeId = nodeId;
  }

  private generateId(): string {
    this.clock++;
    return `${this.nodeId}:${this.clock}`;
  }

  createNode(type: string, properties: Record<string, unknown> = {}, parentId: string | null = null): string {
    const id = this.generateId();
    const timestamp = Date.now();

    const propsMap = new LWWMap<string, unknown>(this.nodeId);
    for (const [key, value] of Object.entries(properties)) {
      propsMap.set(key, value, timestamp);
    }

    const node: DocumentNode = {
      id,
      type,
      properties: propsMap,
      children: new ORSet<string>(this.nodeId),
      parent: parentId,
      deleted: false,
      timestamp
    };

    this.nodes.set(id, node);

    // Add to parent's children
    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) {
        parent.children.add(id);
      }
    }

    return id;
  }

  updateProperty(nodeId: string, key: string, value: unknown): void {
    const node = this.nodes.get(nodeId);
    if (node && !node.deleted) {
      node.properties.set(key, value, Date.now());
    }
  }

  deleteNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.deleted = true;
      node.timestamp = Date.now();

      // Remove from parent's children
      if (node.parent) {
        const parent = this.nodes.get(node.parent);
        if (parent) {
          parent.children.remove(nodeId);
        }
      }
    }
  }

  getNode(nodeId: string): DocumentNode | null {
    const node = this.nodes.get(nodeId);
    return node && !node.deleted ? node : null;
  }

  getChildren(nodeId: string): DocumentNode[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    return node.children.values()
      .map(id => this.nodes.get(id))
      .filter((n): n is DocumentNode => n !== undefined && !n.deleted);
  }

  merge(other: DocumentCRDT): void {
    for (const [id, otherNode] of other.nodes.entries()) {
      if (!this.nodes.has(id)) {
        // Create new node with same structure
        const newNode: DocumentNode = {
          id: otherNode.id,
          type: otherNode.type,
          properties: new LWWMap<string, unknown>(this.nodeId),
          children: new ORSet<string>(this.nodeId),
          parent: otherNode.parent,
          deleted: otherNode.deleted,
          timestamp: otherNode.timestamp
        };

        newNode.properties.merge(otherNode.properties);
        newNode.children.merge(otherNode.children);

        this.nodes.set(id, newNode);
      } else {
        const existingNode = this.nodes.get(id)!;

        // Merge properties
        existingNode.properties.merge(otherNode.properties);

        // Merge children
        existingNode.children.merge(otherNode.children);

        // Merge deleted status (LWW)
        if (otherNode.timestamp > existingNode.timestamp) {
          existingNode.deleted = otherNode.deleted;
          existingNode.timestamp = otherNode.timestamp;
        }
      }
    }
  }

  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [id, node] of this.nodes.entries()) {
      result[id] = {
        id: node.id,
        type: node.type,
        properties: node.properties.toJSON(),
        children: node.children.toJSON(),
        parent: node.parent,
        deleted: node.deleted,
        timestamp: node.timestamp
      };
    }
    return result;
  }
}
