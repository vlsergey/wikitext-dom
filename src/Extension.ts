import Container from './Container';
import Parser from './Parser';

export default class Extension extends Container {

  static parse (parser: Parser, node: Element) {
    const children = [];

    for (const child of Array.from(node.children)) {
      switch (child.nodeName) {
      case 'name': {
        children.push(new ExtensionName(Container.parseChildren(parser, child)));
        break;
      }
      case 'attr': {
        children.push(new ExtensionAttr(Container.parseChildren(parser, child)));
        break;
      }
      case 'inner': {
        children.push(new ExtensionInner(Container.parseChildren(parser, child)));
        break;
      }
      case 'close': {
        children.push(new ExtensionClose(Container.parseChildren(parser, child)));
        break;
      }
      default:
        throw new Error('Unsupported ext child node: ' + child.nodeName);
      }
    }

    return new Extension(children);
  }

  getCloseAsString (): null | string {
    return this.getFirstChildByClass(ExtensionClose)?.getTextIfOnlyText() || null;
  }

  getNameAsString (): null | string {
    return this.getFirstChildByClass(ExtensionName)?.getTextIfOnlyText() || null;
  }

  getInnerAsString (): null | string {
    return this.getFirstChildByClass(ExtensionInner)?.getTextIfOnlyText() || null;
  }

  override toWikitext (stripComments: boolean) {
    const f = (child: Container) => child.toWikitext(stripComments);

    return '<'
      + this.getChildrenByClass(ExtensionName).map(f).join('')
      + this.getChildrenByClass(ExtensionAttr).map(f).join('')
      + '>'
      + this.getChildrenByClass(ExtensionInner).map(f).join('')
      + this.getChildrenByClass(ExtensionClose).map(f).join('');
  }

}

export class ExtensionName extends Container {}
export class ExtensionAttr extends Container {}
export class ExtensionInner extends Container {}
export class ExtensionClose extends Container {}
