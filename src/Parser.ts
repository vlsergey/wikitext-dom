import Comment from './Comment';
import Container from './Container';
import Extension from './Extension';
import Timeline from './extensions/Timeline';
import Header from './Header';
import Ignore from './Ignore';
import Root from './Root';
import Template from './Template';
import TemplateArgument from './TemplateArgument';
import TextNode from './TextNode';
import WikiDomNode from './WikiDomNode';

type Class<T = any> = new (...args: any[]) => T; // eslint-disable-line @typescript-eslint/no-explicit-any

declare interface WithParse {
  parse: (parser: Parser, node: Element) => WikiDomNode;
}
declare interface WithExtensionParse {
  parseAsExtensionOf: (parser: Parser, node: Element, asExtensionOf: Extension) => Extension;
}

const KNOWN_NODES: Record<string, Class<WikiDomNode> & WithParse> = {
  comment: Comment,
  ext: Extension,
  h: Header,
  ignore: Ignore,
  root: Root,
  template: Template,
  tplarg: TemplateArgument,
};

const KNOWN_EXTENSIONS: Record<string, Class<WikiDomNode> & WithExtensionParse> = {
  timeline: Timeline,
};

export default class Parser {

  parse (node: Text | Element) {
    if (node instanceof Text) {
      return new TextNode(node.textContent || '');
    }

    const {nodeName} = node;
    const knownClass = KNOWN_NODES[nodeName];
    if (!knownClass) {
      throw new Error('Uknown node type: ' + nodeName);
    }

    let parsed = knownClass.parse(this, node);
    if (parsed instanceof Extension) {
      const extName = parsed.getNameAsString();
      if (extName) {
        const knownExtensionClass = KNOWN_EXTENSIONS[extName];
        if (knownExtensionClass) {
          parsed = knownExtensionClass.parseAsExtensionOf(this, node, parsed);
        }
      }
    }

    return parsed;
  }

  parseChildren (node: Element) {
    if (node.childNodes === null || node.childNodes.length === 0) {
      return null;
    }
    return new Container(Container.parseChildren(this, node));
  }

  parseDocument (doc: Document) {
    const root = doc.documentElement;
    return Root.parse(this, root);
  }

}
