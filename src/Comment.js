import WikiDomNode from './WikiDomNode';

export default class Comment extends WikiDomNode {

  static parse( parser, node ) {
    return new Comment( node.textContent );
  }

  constructor( value ) {
    super();
    this.value = value;
  }

  toWikitext( ) {
    return this.value;
  }
}
