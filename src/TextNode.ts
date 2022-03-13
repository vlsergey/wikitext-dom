import WikiDomNode from './WikiDomNode';

export default class TextNode implements WikiDomNode {

  value: string;

  constructor (value: string) {
    this.value = value;
  }

  toWikitext (): string {
    return this.value;
  }
}
