import assert from 'assert';
import Parser from 'Parser';
import TemplateArgument from 'TemplateArgument';

describe( 'TemplateArgument', () => {

  it ( 'Can parse template argument and access it\'s properties', () => {
    const sourceXml = '<root><tplarg><title>nocat</title><part><name index="1"/><value/></part></tplarg></root>';

    const doc = new DOMParser().parseFromString( sourceXml, 'application/xml' );
    const root = new Parser().parseDocument( doc );

    const tplarg = root.children[ 0 ];
    assert( tplarg instanceof TemplateArgument );
    assert.equal( tplarg.findTitleText(), 'nocat' );
    assert.equal( root.toWikitext(), '{{{nocat|}}}' );
  } );

} );
