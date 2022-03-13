import Container from './Container';
import Parser from './Parser';
import TextNode from './TextNode';
import WikiDomNode from './WikiDomNode';

export default class TemplateArgument extends Container {

  static parse (parser : Parser, node : Element) {
    const children = [];

    for (const child of Array.from(node.children)) {
      switch (child.nodeName) {
      case 'title': {
        children.push(new TemplateArgumentTitle(Container.parseChildren(parser, child)));
        break;
      }
      case 'part': {
        children.push(TemplateArgumentPart.parse(parser, child));
        break;
      }
      default:
        throw new Error('Unsupported template argument child node: ' + child.nodeName);
      }
    }

    return new TemplateArgument(children);
  }

  findTitleText () : null | string {
    if (this.children && this.children[0] instanceof TemplateArgumentTitle) {
      const asText = this.children[0].getTextIfOnlyText();
      if (asText) {
        return asText.trim();
      }
    }
    return null;
  }

  findPartByNameText (name : string) : null | TemplateArgumentPart{
    for (const child of this.children) {
      if (child instanceof TemplateArgumentPart) {
        if ((child.getNameAsString() || '').trim() === name) {
          return child;
        }
      }
    }
    return null;
  }

  padNames () {
    const hasNonTextNames = this.children
      .some(child => child instanceof TemplateArgumentPart && !child.getNameAsString());
    if (hasNonTextNames) return;

    const maxTrimmedLength = 1 + this.getChildrenByClass(TemplateArgumentPart)
      .map(part => (part.getNameAsString() as string).trim().length)
      .reduce((acc, cur) => Math.max(acc, cur), 0);

    this.getChildrenByClass(TemplateArgumentPart)
      .forEach(part => {
        const oldName = part.getNameAsString();
        if (oldName != null) {
          const newName = oldName.trim().padEnd(maxTrimmedLength, ' ');
          part.setNameAsString(newName);
        }
      });
  }

  padValues () {
    this.getChildrenByClass(TemplateArgumentPart).forEach( part => {
      const valueNode = part.getValueAsNode();
      if (!valueNode) return;
      if (valueNode.toWikitext(true).trim().indexOf('\n') !== -1) return;

      valueNode.trim();
      part.setValueAsNode(new Container([new TextNode(' '), ...valueNode.children, new TextNode('\n')]));
    })
  }

  override toWikitext (stripComments : boolean) {
    return '{{{' + this.children
      .map(child => child.toWikitext(stripComments))
      .join('|') + '}}}';
  }

}

export class TemplateArgumentTitle extends Container {

}

export class TemplateArgumentPart extends Container {

  static parse (parser : Parser, node : Node) {
    let index : null | string = null;
    const children = [];

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (!(child instanceof Element)) continue;

      switch (child.nodeName) {
      case 'name': {
        index = child.getAttribute('index');
        children.push(new TemplateArgumentPartName(Container.parseChildren(parser, child)));
        break;
      }
      case 'equals': {
        children.push(new TemplateArgumentPartEquals(Container.parseChildren(parser, child)));
        break;
      }
      case 'value': {
        children.push(new TemplateArgumentPartValue(Container.parseChildren(parser, child)));
        break;
      }
      default:
        throw new Error('Unsupported template part child node: ' + child.nodeName);
      }
    }

    const result = new TemplateArgumentPart(children);
    result.index = index;
    return result;
  }

  index: null | string = null;

  getNameAsString () : null | string {
    return this.getFirstChildByClass(TemplateArgumentPartName)?.getTextIfOnlyText() || null;
  }

  setNameAsNode (wikiDomNode : WikiDomNode) {
    const existing = this.children.find(child => child instanceof TemplateArgumentPartName);
    if (existing) {
      (existing as TemplateArgumentPartName).children = [wikiDomNode];
    } else {
      this.children.unshift(new TemplateArgumentPartName([wikiDomNode]));
    }
  }

  setNameAsString (str : string) : void {
    this.setNameAsNode(new TextNode(str));
  }

  getValueAsNode () : null | TemplateArgumentPartValue {
    return this.getChildrenByClass(TemplateArgumentPartValue)?.[0] || null;
  }

  getValueAsString () : null | string {
    return this.getFirstChildByClass(TemplateArgumentPartValue)?.getTextIfOnlyText() || null;
  }

  setValueAsNode (wikiDomNode : WikiDomNode) {
    const existing = this.children.find(child => child instanceof TemplateArgumentPartValue);
    if (existing) {
      (existing as TemplateArgumentPartValue).children = [wikiDomNode];
    } else {
      this.children.push(new TemplateArgumentPartValue([wikiDomNode]));
    }
  }

  setValueAsString (str : string) {
    this.setValueAsNode(new TextNode(str));
  }

}

export class TemplateArgumentPartName extends Container {}
export class TemplateArgumentPartEquals extends Container {}
export class TemplateArgumentPartValue extends Container {}
