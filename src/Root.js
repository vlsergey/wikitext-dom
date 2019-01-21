import Container from './Container';

export default class Root extends Container {

  static parse( parser, node ) {
    return new Root( Container.parseChildren( parser, node ) );
  }

}
