import Parser from './Parser';
import WikiDomNode from './WikiDomNode';

export default class Comment implements WikiDomNode {

  static parse (_parser: Parser, node: Node) {
    if (!node.textContent) {
      throw Error('Text content must present in comment node');
    }
    return new Comment(node.textContent);
  }

  value: string;

  constructor (value: string) {
    this.value = value;
  }

  toWikitext (): string {
    return this.value;
  }
}
