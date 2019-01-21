import assert from 'assert';
import Container from 'Container';
import Parser from 'Parser';
import Template from 'Template';

describe( 'Container', () => {

  const sourceXml = '<root><template><title>Навигационная полоса\n</title>'
    + '<part><name>имя </name><equals>=</equals><value>Муниципалитеты микрорегиона Умаризал\n</value></part>'
    + '<part><name>цвет</name><equals>=</equals><value><template><title>цвет</title>'
    + '<part><name index="1"/><value>Бразилия</value></part></template>\n</value></part>'
    + '<part><name>заглавие</name><equals>=</equals><value>Муниципалитеты микрорегиона [[Умаризал (микрорегион)|Умаризал]] ([[Бразилия]])\n</value></part>'
    + '<part><name>содержание  </name><equals>=</equals><value>\n&amp;nbsp;[[Алмину-Афонсу (Риу-Гранди-ду-Норти)|Алмину-Афонсу]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Умаризал]]\n</value></part>'
    + '</template>'
    + '<ignore>&lt;noinclude&gt;</ignore>\n[[Категория:Навигационные шаблоны:География Бразилии|Умаризал]]\n<ignore>&lt;/noinclude&gt;</ignore>\n</root>';

  const doc = new DOMParser().parseFromString( sourceXml, 'application/xml' );
  const root = new Parser().parseDocument( doc );

  it ( 'Can use getChildByClass', () => {
    assert( root instanceof Container );

    const templates = root.getChildByClass( Template );
    assert.equal( 2, templates.length );

    assert( templates[ 0 ] instanceof Template );
    assert.equal( templates[ 0 ].findTitleText(), 'Навигационная полоса' );

    assert( templates[ 1 ] instanceof Template );
    assert.equal( templates[ 1 ].findTitleText(), 'цвет' );
  } );

} );
