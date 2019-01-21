import Container from './Container';
import expect from 'expect';
import TextNode from './TextNode';
import WikiDomNode from './WikiDomNode';

export default class Template extends Container {

  static parse( parser, node ) {
    expect( parser ).toBeAn( 'object' );
    expect( node ).toBeAn( Element );

    const children = [];

    for ( let i = 0; i < node.childNodes.length; i++ ) {
      const child = node.childNodes[ i ];
      expect( child ).toBeAn( Element );

      switch ( child.nodeName ) {
      case 'title': {
        children.push( new TemplateTitle( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'part': {
        children.push( TemplatePart.parse( parser, child ) );
        break;
      }
      default:
        throw new Error( 'Unsupported template child node: ' + child.nodeName );
      }
    }

    return new Template( children );
  }

  findTitleText() {
    if ( this.children && this.children[ 0 ] instanceof TemplateTitle ) {
      const asText = this.children[ 0 ].getTextIfOnlyText();
      if ( asText ) {
        return asText.trim();
      }
    }
  }

  findPartByNameText( name ) {
    expect( name ).toBeA( 'string' );

    return this.children
      .filter( child => child instanceof TemplatePart )
      .find( child => ( child.getNameAsString() || '' ).trim() === name );
  }

  getValuesAsNodesArray() {
    return this.children
      .filter( child => child instanceof TemplatePart )
      .flatMap( child => child.children )
      .filter( child => child instanceof TemplatePartValue )
      .flatMap( child => child.children );
  }

  padNames() {
    const hasNonTextNames = this.children
      .filter( child => child instanceof TemplatePart )
      .some( child => !child.getNameAsString() );
    if ( hasNonTextNames ) return;

    const maxTrimmedLength = 1 + this.children
      .filter( child => child instanceof TemplatePart )
      .map( part => part.getNameAsString().trim().length )
      .reduce( ( acc, cur ) => Math.max( acc, cur ), 0 );

    this.children
      .filter( child => child instanceof TemplatePart )
      .forEach( part => {
        const oldName = part.getNameAsString();
        const newName = oldName.trim().padRight( maxTrimmedLength, ' ' );
        part.setNameAsString( newName );
      } );
  }

  padValues() {
    this.children
      .filter( child => child instanceof TemplatePart )
      .filter( child => !!child.getValueAsNode() )
      .filter( child => child.getValueAsNode().toWikitext( true ).trim().indexOf( '\n' ) === -1 )
      .forEach( child => {
        child.getValueAsNode().trim();
        child.setValueAsNodes( [ new TextNode( ' ' ), ...child.getValueAsNode().children, new TextNode( '\n' ) ] );
        child.mergeTextNodes();
      } );
  }

  toWikitext( stripComments ) {
    return '{{' + this.children
      .map( child => child.toWikitext( stripComments ) )
      .join( '|' ) + '}}';
  }

}

export class TemplateTitle extends Container {

}

export class TemplatePart extends Container {

  static parse( parser, node ) {
    let index;
    const children = [];

    for ( let i = 0; i < node.childNodes.length; i++ ) {
      const child = node.childNodes[ i ];
      expect( child ).toBeAn( Element );

      switch ( child.nodeName ) {
      case 'name': {
        index = child.getAttribute( 'index' );
        children.push( new TemplatePartName( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'equals': {
        children.push( new TemplatePartEquals( Container.parseChildren( parser, child ) ) );
        break;
      }
      case 'value': {
        children.push( new TemplatePartValue( Container.parseChildren( parser, child ) ) );
        break;
      }
      default:
        throw new Error( 'Unsupported template part child node: ' + child.nodeName );
      }
    }

    const result = new TemplatePart ( children );
    result.index = index;
    return result;
  }

  getNameAsString() {
    const name = this.children
      .find( child => child instanceof TemplatePartName );
    if ( name ) {
      return name.getTextIfOnlyText();
    }
  }

  setNameAsNode( wikiDomNode ) {
    expect( wikiDomNode ).toBeA( WikiDomNode );

    const existing = this.children.find( child => child instanceof TemplatePartName );
    if ( existing ) {
      existing.children = [ wikiDomNode ];
    } else {
      this.children.unshift( new TemplatePartName( [ wikiDomNode ] ) );
    }
  }

  setNameAsString( str ) {
    expect( str ).toBeA( 'string' );
    this.setNameAsNode( new TextNode( str ) );
  }

  getValueAsNode() {
    return this.children.find( child => child instanceof TemplatePartValue );
  }

  getValueAsString() {
    const value = this.getValueAsNode();
    if ( value ) {
      return value.getTextIfOnlyText();
    }
  }

  setValueAsNode( wikiDomNode ) {
    expect( wikiDomNode ).toBeA( WikiDomNode );

    const existing = this.children.find( child => child instanceof TemplatePartValue );
    if ( existing ) {
      existing.children = [ wikiDomNode ];
    } else {
      this.children.push( new TemplatePartValue( [ wikiDomNode ] ) );
    }
  }

  setValueAsNodes( wikiDomNodes ) {
    expect( wikiDomNodes ).toBeAn( 'array' );

    const existing = this.children.find( child => child instanceof TemplatePartValue );
    if ( existing ) {
      existing.children = [ ...wikiDomNodes ];
    } else {
      this.children.push( new TemplatePartValue( [ ...wikiDomNodes ] ) );
    }
  }

  setValueAsString( str ) {
    expect( str ).toBeA( 'string' );
    this.setValueAsNode( new TextNode( str ) );
  }

}

export class TemplatePartName extends Container {}
export class TemplatePartEquals extends Container {}
export class TemplatePartValue extends Container {}
