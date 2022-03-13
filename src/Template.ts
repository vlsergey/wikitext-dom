import Container from './Container';
import Parser from './Parser';
import TextNode from './TextNode';
import WikiDomNode from './WikiDomNode';

export default class Template extends Container {

  static parse (parser: Parser, node: Element) {
    const children = [];

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (!(child instanceof Element)) continue;

      switch (child.nodeName) {
      case 'title': {
        children.push(new TemplateTitle(Container.parseChildren(parser, child)));
        break;
      }
      case 'part': {
        children.push(TemplatePart.parse(parser, child));
        break;
      }
      default:
        throw new Error('Unsupported template child node: ' + child.nodeName);
      }
    }

    return new Template(children);
  }

  getTitleAsString (): null | string {
    return this.getFirstChildByClass(TemplateTitle)?.getTextIfOnlyText()?.trim() || null;
  }

  getValueByNameAsString (partName: string) {
    const part = this.findPartByNameText(partName);
    if (!part) return null;
    return part.getValueAsString();
  }

  findPartNamesAsStrings () {
    return this.getChildrenByClass(TemplatePart)
      .map(child => child.getNameAsString())
      .filter(name => name !== null);
  }

  findPartByNameText (name: string): null | TemplatePart {
    name = name.trim();

    return this.getChildrenByClass(TemplatePart)
      .find(child => (child.getNameAsString() || '').trim() === name)
      || null;
  }

  getValuesAsNodesArray (): WikiDomNode[] {
    return this.getChildrenByClass(TemplatePart)
      .flatMap(child => child.children)
      .filter(child => child instanceof TemplatePartValue)
      .flatMap(child => (child as TemplatePartValue).children);
  }

  padNames () {
    const hasNonTextNames = this.getChildrenByClass(TemplatePart)
      .some(child => !child.getNameAsString());
    if (hasNonTextNames) return;

    const maxTrimmedLength = 1 + this.getChildrenByClass(TemplatePart)
      .map(part => (part.getNameAsString() || '').trim().length)
      .reduce((acc, cur) => Math.max(acc, cur), 0);

    this.getChildrenByClass(TemplatePart)
      .forEach(part => {
        const oldName = part.getNameAsString();
        if (oldName != null) {
          const newName = oldName.trim().padEnd(maxTrimmedLength, ' ');
          part.setNameAsString(newName);
        }
      });
  }

  padValues () {
    this.getChildrenByClass(TemplatePart).forEach(part => {
      const valueNode = part.getValueAsNode();
      if (!valueNode) return;
      if (valueNode.toWikitext(true).trim().includes('\n')) return;

      valueNode.trim();
      part.setValueAsNodes([new TextNode(' '), ...valueNode.children, new TextNode('\n')]);
      part.mergeTextNodes();
    });
  }

  override toWikitext (stripComments: boolean) {
    return '{{' + this.children
      .map(child => child.toWikitext(stripComments))
      .join('|') + '}}';
  }

}

export class TemplateTitle extends Container {}

export class TemplatePart extends Container {

  static parse (parser: Parser, node: Element) {
    let index: null | string = null;
    const children = [];

    for (const child of Array.from(node.children)) {
      switch (child.nodeName) {
      case 'name': {
        index = child.getAttribute('index');
        children.push(new TemplatePartName(Container.parseChildren(parser, child)));
        break;
      }
      case 'equals': {
        children.push(new TemplatePartEquals(Container.parseChildren(parser, child)));
        break;
      }
      case 'value': {
        children.push(new TemplatePartValue(Container.parseChildren(parser, child)));
        break;
      }
      default:
        throw new Error('Unsupported template part child node: ' + child.nodeName);
      }
    }

    const result = new TemplatePart(children);
    result.index = index;
    return result;
  }

  index: string | null = null;

  getNameAsString (): null | string {
    return this.getFirstChildByClass(TemplatePartName)?.getTextIfOnlyText() || null;
  }

  setNameAsNode (wikiDomNode: WikiDomNode): void {
    const existing = this.getFirstChildByClass(TemplatePartName);
    if (existing) {
      existing.children = [wikiDomNode];
    } else {
      this.children.unshift(new TemplatePartName([wikiDomNode]));
    }
  }

  setNameAsString (str: string): void {
    this.setNameAsNode(new TextNode(str));
  }

  getValueAsNode = () => this.getFirstChildByClass(TemplatePartValue);

  getValueAsString (): null | string {
    return this.getFirstChildByClass(TemplatePartValue)?.getTextIfOnlyText() || null;
  }

  setValueAsNode (wikiDomNode: WikiDomNode): void {
    const existing = this.getValueAsNode();
    if (existing) {
      existing.children = [wikiDomNode];
    } else {
      this.children.push(new TemplatePartValue([wikiDomNode]));
    }
  }

  setValueAsNodes (wikiDomNodes: WikiDomNode[]): void {
    const existing = this.getFirstChildByClass(TemplatePartValue);
    if (existing) {
      existing.children = [...wikiDomNodes];
    } else {
      this.children.push(new TemplatePartValue([...wikiDomNodes]));
    }
  }

  setValueAsString (str: string): void {
    this.setValueAsNode(new TextNode(str));
  }

}

export class TemplatePartName extends Container {}
export class TemplatePartEquals extends Container {}
export class TemplatePartValue extends Container {}
