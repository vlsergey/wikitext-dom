import Container from './Container';
import Parser from './Parser';

export default class Ignore extends Container {

  static parse (parser: Parser, node: Element) {
    return new Ignore(Container.parseChildren(parser, node));
  }

}
