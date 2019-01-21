import WikiDomNode from './WikiDomNode';

export default class TextNode extends WikiDomNode {

  constructor( value ) {
    super();
    this.value = value;
  }

  toWikitext( ) {
    return this.value;
  }
}
