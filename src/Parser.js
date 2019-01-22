import Comment from './Comment';
import Container from './Container';
import expect from 'expect';
import Extension from './Extension';
import Header from './Header';
import Ignore from './Ignore';
import Root from './Root';
import Template from './Template';
import TemplateArgument from './TemplateArgument';
import TextNode from './TextNode';

const KNOWN_NODES = {
  comment: Comment,
  ext: Extension,
  h: Header,
  ignore: Ignore,
  root: Root,
  template: Template,
  tplarg: TemplateArgument,
};

export default class Parser {

  parse( node ) {
    if ( node.nodeType === Node.TEXT_NODE ) {
      return new TextNode( node.textContent );
    }
    expect( node ).toBeAn( Element );

    const { nodeName } = node;
    const knownClass = KNOWN_NODES[ nodeName ];
    if ( !knownClass ) {
      throw new Error( 'Uknown node type: ' + nodeName );
    }
    return knownClass.parse( this, node );
  }

  parseChildren( node ) {
    if ( node.childNodes === null || node.childNodes.length === 0 ) {
      return null;
    }
    return new Container( Container.parseChildren( this, node ) );
  }

  parseDocument( doc ) {
    expect( doc ).toBeA( Document );

    const root = doc.documentElement;
    expect( root.nodeName ).toEqual( 'root' );

    return Root.parse( this, root );
  }

}
