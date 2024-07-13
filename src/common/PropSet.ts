export type ExtractPropCallback<T> = (item: T) => any;

export class PropSet<T> {
  private addedByProp: Set<any>;
  private items: T[];
  private extractProp: ExtractPropCallback<T>;

  constructor(extractProp: ExtractPropCallback<T>) {
    this.addedByProp = new Set();
    this.items = [];
    this.extractProp = extractProp;
  }

  public add(item: T) {
    let propValue = this.extractProp(item);
    if (!this.addedByProp.has(propValue)) {
      this.addedByProp.add(propValue);
      this.items.push(item);
    }
  }

  public getItems(): ReadonlyArray<T> {
    return this.items;
  }

  public static fromArray<T>(
    items: T[],
    extractProp: ExtractPropCallback<T>
  ): PropSet<T> {
    let set = new PropSet(extractProp);

    for (const item of items) {
      set.add(item);
    }

    return set;
  }
}
