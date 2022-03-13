import Container from './Container';
import Parser from './Parser';

export default class Root extends Container {

  static parse (parser: Parser, node: Element) {
    return new Root(Container.parseChildren(parser, node));
  }

}
