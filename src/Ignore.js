import Container from './Container';

export default class Ignore extends Container {

  static parse( parser, node ) {
    return new Ignore( Container.parseChildren( parser, node ) );
  }

}
