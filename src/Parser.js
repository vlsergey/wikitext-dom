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
import Timeline from './extensions/Timeline';

const KNOWN_NODES = {
  comment: Comment,
  ext: Extension,
  h: Header,
  ignore: Ignore,
  root: Root,
  template: Template,
  tplarg: TemplateArgument,
};

const KNOWN_EXTENSIONS = {
  timeline: Timeline,
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

    let parsed = knownClass.parse( this, node );
    if ( parsed instanceof Extension ) {
      const extName = parsed.getNameAsString();
      if ( extName ) {
        const knownExtensionClass = KNOWN_EXTENSIONS[ extName ];
        if ( knownExtensionClass ) {
          parsed = knownExtensionClass.parse( this, node, parsed );
        }
      }
    }

    return parsed;
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
