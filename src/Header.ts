import Container from './Container';
import Parser from './Parser';
import WikiDomNode from './WikiDomNode';

export default class Header extends Container {

  static parse (parser: Parser, node: Element) {
    const i = node.getAttribute('i');
    const level = node.getAttribute('level');
    return new Header(Container.parseChildren(parser, node), i, level);
  }

  i: string | null;
  level: string | null;

  constructor (children: WikiDomNode[], i: string | null, level: string | null) {
    super(children);
    this.i = i;
    this.level = level;
  }

}
