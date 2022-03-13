import Parser from './Parser';
import TextNode from './TextNode';
import WikiDomNode from './WikiDomNode';

declare type Class<T = any> = new (...args: any[]) => T;

export default class Container implements WikiDomNode {

  static parseChildren (parser : Parser, element : Element) : WikiDomNode[] {
    const children : WikiDomNode[] = [];
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];
      if (!(child instanceof Element) && !(child instanceof Text)) continue;
      children.push(parser.parse(child));
    }
    return children;
  }

  children : WikiDomNode[];

  constructor (children : WikiDomNode[]) {
    this.children = children;
  }

  getFirstChildByClass<T extends Container>(cls : Class<T>) : null | T {
    return (this.children.find( child => child instanceof cls ) || null) as null | T;
  }

  getChildrenByClass<T extends Container>(cls : Class<T>) : T[] {
    return this.children.filter( child => child instanceof cls ) as T[];
  }

  getChildrenByClassR<T extends Container>(cls : Class<T>) : T[] {
    const childResults = this.children
      .filter(child => child instanceof Container)
      .map<Container>(child => child as Container)
      .flatMap(child => child.getChildrenByClassR(cls));
    return this instanceof cls
      ? [this, ...childResults]
      : childResults;
  }

  getTextIfOnlyText () : null | string {
    if (this.children.some(child => !(child instanceof TextNode))) return null;
    return this.children.map(child => (child as TextNode).value).join('');
  }

  toWikitext (stripComments : boolean) {
    return this.children
      .map(child => child.toWikitext(stripComments))
      .join('');
  }

  mapFilteredChildrenR<T>(predicate : (child : WikiDomNode) => boolean, map: (value : WikiDomNode) => T ) {
    this.children = this.children.flatMap(child => {
      if (!predicate(child)) return [child];
      const result = map(child);
      return Array.isArray(result) ? result : [result];
    });

    this.getChildrenByClass(Container)
      .forEach(child => child.mapFilteredChildrenR(predicate, map));
  }

  mergeContainers () {
    this.getChildrenByClass( Container )
      .forEach(child => child.mergeContainers());

    this.getChildrenByClass( Container )
      .filter(child => child.children.length === 1)
      .filter(child => child.children[0]?.constructor === Container)
      .forEach(child =>
        child.children = (child.children[0] as Container).children
      );

    for (let i = this.children.length - 1; i >= 1; i--) {
      const c1 = this.children[i - 1] as WikiDomNode;
      const c2 = this.children[i] as WikiDomNode;
      if (c1 instanceof Container && c2 instanceof Container &&
          c1.constructor == Container && c2.constructor == Container) {
        this.children[i - 1] = new Container([...c1.children, ...c2.children]);
        this.children.splice(i, 1);
      }
    }
  }

  mergeTextNodes () {
    this.getChildrenByClass(Container)
      .forEach(child => child.mergeTextNodes());

    for (let i = this.children.length - 1; i >= 1; i--) {
      const c1 = this.children[i - 1];
      const c2 = this.children[i];
      if (c1 instanceof TextNode && c2 instanceof TextNode) {
        this.children[i - 1] = new TextNode(c1.value + c2.value);
        this.children.splice(i, 1);
      }
    }
  }

  trim (trimLeft = true, trimRight = true) {
    if (this.children.length > 0) {
      if (trimLeft) {
        if (this.children[0] instanceof TextNode) {
          this.children[0].value = this.children[0].value.replace(/^[\s\r\n\t]+/, '');
        }
      }
      if (trimRight) {
        const last = this.children[this.children.length - 1];
        if (last instanceof TextNode) {
          last.value = last.value.replace(/[\s\r\n\t]+$/, '');
        }
      }
    }
  }

}
