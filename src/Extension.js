import Container from './Container';
import expect from 'expect';

export default class Extension extends Container {

  static parse( parser, node ) {
    expect( parser ).toBeAn( 'object' );
    expect( node ).toBeAn( Element );

    const children = [];

    for ( let i = 0; i < node.childNodes.length; i++ ) {
      const child = node.childNodes[ i ];
      expect( child ).toBeAn( Element );

      switch ( child.nodeName ) {
      case 'name': {
        children.push( new ExtensionName( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'attr': {
        children.push( new ExtensionAttr( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'inner': {
        children.push( new ExtensionInner( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'close': {
        children.push( new ExtensionClose( Container.parseChildren( parser, child ) ) );
        break;
      }
      default:
        throw new Error( 'Unsupported ext child node: ' + child.nodeName );
      }
    }

    return new Extension( children );
  }

  toWikitext( stripComments ) {
    const f = child => child.toWikitext( stripComments );

    return '<'
      + this.children.filter( child => child instanceof ExtensionName ).map( f ).join( '' )
      + this.children.filter( child => child instanceof ExtensionAttr ).map( f ).join( '' )
      + '>'
      + this.children.filter( child => child instanceof ExtensionInner ).map( f ).join( '' )
      + this.children.filter( child => child instanceof ExtensionClose ).map( f ).join( '' );
  }

}

export class ExtensionName extends Container {}
export class ExtensionAttr extends Container {}
export class ExtensionInner extends Container {}
export class ExtensionClose extends Container {}
