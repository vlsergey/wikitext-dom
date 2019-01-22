import Container from './Container';

export default class Header extends Container {

  static parse( parser, node ) {
    const i = node.getAttribute( 'i' );
    const level = node.getAttribute( 'level' );
    return new Header( Container.parseChildren( parser, node ), i, level );
  }

  constructor( children, i, level ) {
    super( children );
    this.i = i;
    this.level = level;
  }

}
