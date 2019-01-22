import expect from 'expect';
import TextNode from './TextNode';
import WikiDomNode from './WikiDomNode';

export default class Container extends WikiDomNode {

  static parseChildren( parser, node ) {
    const children = [];
    for ( let i = 0; i < node.childNodes.length; i++ ) {
      children.push( parser.parse( node.childNodes[ i ] ) );
    }
    return children;
  }

  constructor( children ) {
    super();
    expect ( children ).toBeAn( 'array' );
    this.children = children;
  }

  getChildByClass( cls ) {
    expect( cls ).toBeA( 'function', 'Passed argument cls is not a function: ' + cls );

    const childResults = this.children
      .filter( child => child instanceof Container )
      .flatMap( child => child.getChildByClass( cls ) );
    return this instanceof cls
      ? [ this, ...childResults ]
      : childResults;
  }

  getChildByClassAsString( cls ) {
    expect( cls ).toBeA( 'function' );
    const child = this.children.find( c => c instanceof cls );
    if ( child ) {
      return child.getTextIfOnlyText();
    }
  }

  getTextIfOnlyText() {
    if ( this.children.some( child => !( child instanceof TextNode ) ) ) return null;
    return this.children.map( child => child.value ).join( '' );
  }

  toWikitext( stripComments ) {
    return this.children
      .map( child => child.toWikitext( stripComments ) )
      .join( '' );
  }

  mapFilteredChildrenR( predicate, map ) {
    this.children = this.children.flatMap( child => {
      if ( !predicate( child ) ) return [ child ];
      const result = map( child );
      return Array.isArray( result ) ? result : [ result ];
    } );

    this.children
      .filter( child => child instanceof Container )
      .forEach( child => child.mapFilteredChildrenR( predicate, map ) );
  }

  mergeContainers() {
    this.children
      .filter( child => child instanceof Container )
      .forEach( child => child.mergeContainers() );

    this.children
      .filter( child => child instanceof Container )
      .filter( child => child.children.length === 1 )
      .filter( child => child.children[ 0 ].constructor === Container )
      .forEach( child => {
        child.children = child.children[ 0 ].children;
      } );

    for ( let i = this.children.length - 1; i >= 1; i-- ) {
      const c1 = this.children[ i - 1 ];
      const c2 = this.children[ i ];
      if ( c1.constructor == Container && c2.constructor == Container ) {
        this.children[ i - 1 ] = new Container( [ ...c1.children, ...c2.children ] );
        this.children.splice( i, 1 );
      }
    }
  }

  mergeTextNodes( ) {
    this.children
      .filter( child => child instanceof Container )
      .forEach( child => child.mergeTextNodes() );

    for ( let i = this.children.length - 1; i >= 1; i-- ) {
      const c1 = this.children[ i - 1 ];
      const c2 = this.children[ i ];
      if ( c1 instanceof TextNode && c2 instanceof TextNode ) {
        this.children[ i - 1 ] = new TextNode( c1.value + c2.value );
        this.children.splice( i, 1 );
      }
    }
  }

  trim( trimLeft = true, trimRight = true ) {
    if ( this.children.length > 0 ) {
      if ( trimLeft ) {
        if ( this.children[ 0 ] instanceof TextNode ) {
          this.children[ 0 ].value = this.children[ 0 ].value.replace( /^[\s\r\n\t]+/, '' );
        }
      }
      if ( trimRight ) {
        const last = this.children[ this.children.length - 1 ];
        if ( last instanceof TextNode ) {
          last.value = last.value.replace( /[\s\r\n\t]+$/, '' );
        }
      }
    }
  }

}
