import Container from './Container';
import expect from 'expect';
import TextNode from './TextNode';
import WikiDomNode from './WikiDomNode';

export default class TemplateArgument extends Container {

  static parse( parser, node ) {
    expect( parser ).toBeAn( 'object' );
    expect( node ).toBeAn( Element );

    const children = [];

    for ( let i = 0; i < node.childNodes.length; i++ ) {
      const child = node.childNodes[ i ];
      expect( child ).toBeAn( Element );

      switch ( child.nodeName ) {
      case 'title': {
        children.push( new TemplateArgumentTitle( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'part': {
        children.push( TemplateArgumentPart.parse( parser, child ) );
        break;
      }
      default:
        throw new Error( 'Unsupported template argument child node: ' + child.nodeName );
      }
    }

    return new TemplateArgument( children );
  }

  findTitleText() {
    if ( this.children && this.children[ 0 ] instanceof TemplateArgumentTitle ) {
      const asText = this.children[ 0 ].getTextIfOnlyText();
      if ( asText ) {
        return asText.trim();
      }
    }
  }

  findPartByNameText( name ) {
    expect( name ).toBeA( 'string' );

    return this.children
      .filter( child => child instanceof TemplateArgumentPart )
      .find( child => ( child.getNameAsString() || '' ).trim() === name );
  }

  padNames() {
    const hasNonTextNames = this.children
      .filter( child => child instanceof TemplateArgumentPart )
      .some( child => !child.getNameAsString() );
    if ( hasNonTextNames ) return;

    const maxTrimmedLength = 1 + this.children
      .filter( child => child instanceof TemplateArgumentPart )
      .map( part => part.getNameAsString().trim().length )
      .reduce( ( acc, cur ) => Math.max( acc, cur ), 0 );

    this.children
      .filter( child => child instanceof TemplateArgumentPart )
      .forEach( part => {
        const oldName = part.getNameAsString();
        const newName = oldName.trim().padRight( maxTrimmedLength, ' ' );
        part.setNameAsString( newName );
      } );
  }

  padValues() {
    this.children
      .filter( child => child instanceof TemplateArgumentPart )
      .filter( child => !!child.getValueAsNode() )
      .filter( child => child.getValueAsNode().toWikitext( true ).trim().indexOf( '\n' ) === -1 )
      .forEach( child => {
        child.getValueAsNode().trim();
        child.setValueAsNode( new Container( [ new TextNode( ' ' ), ...child.getValueAsNode().children, new TextNode( '\n' ) ] ) );
      } );
  }

  toWikitext( stripComments ) {
    return '{{{' + this.children
      .map( child => child.toWikitext( stripComments ) )
      .join( '|' ) + '}}}';
  }

}

export class TemplateArgumentTitle extends Container {

}

export class TemplateArgumentPart extends Container {

  static parse( parser, node ) {
    let index;
    const children = [];

    for ( let i = 0; i < node.childNodes.length; i++ ) {
      const child = node.childNodes[ i ];
      expect( child ).toBeAn( Element );

      switch ( child.nodeName ) {
      case 'name': {
        index = child.getAttribute( 'index' );
        children.push( new TemplateArgumentPartName( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'equals': {
        children.push( new TemplateArgumentPartEquals( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'value': {
        children.push( new TemplateArgumentPartValue( Container.parseChildren( parser, child ) ) );
        break;
      }
      default:
        throw new Error( 'Unsupported template part child node: ' + child.nodeName );
      }
    }

    const result = new TemplateArgumentPart ( children );
    result.index = index;
    return result;
  }

  getNameAsString() {
    return this.getChildByClassAsString( TemplateArgumentPartName );
  }

  setNameAsNode( wikiDomNode ) {
    expect( wikiDomNode ).toBeA( WikiDomNode );

    const existing = this.children.find( child => child instanceof TemplateArgumentPartName );
    if ( existing ) {
      existing.children = [ wikiDomNode ];
    } else {
      this.children.unshift( new TemplateArgumentPartName( [ wikiDomNode ] ) );
    }
  }

  setNameAsString( str ) {
    expect( str ).toBeA( 'string' );
    this.setNameAsNode( new TextNode( str ) );
  }

  getValueAsNode() {
    return this.children.find( child => child instanceof TemplateArgumentPartValue );
  }

  getValueAsString() {
    return this.getChildByClassAsString( TemplateArgumentPartValue );
  }

  setValueAsNode( wikiDomNode ) {
    expect( wikiDomNode ).toBeA( WikiDomNode );

    const existing = this.children.find( child => child instanceof TemplateArgumentPartValue );
    if ( existing ) {
      existing.children = [ wikiDomNode ];
    } else {
      this.children.push( new TemplateArgumentPartValue( [ wikiDomNode ] ) );
    }
  }

  setValueAsString( str ) {
    expect( str ).toBeA( 'string' );
    this.setValueAsNode( new TextNode( str ) );
  }

}

export class TemplateArgumentPartName extends Container {}
export class TemplateArgumentPartEquals extends Container {}
export class TemplateArgumentPartValue extends Container {}
