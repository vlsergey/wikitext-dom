import assert from 'assert';
import Parser from 'Parser';
import Template from 'Template';

describe( 'Template', () => {

  it ( 'Can parse navigation template and access it\'s properties', () => {
    const sourceXml = '<root><template><title>Навигационная полоса\n</title>'
      + '<part><name>имя </name><equals>=</equals><value>Муниципалитеты микрорегиона Умаризал\n</value></part>'
      + '<part><name>цвет</name><equals>=</equals><value><template><title>цвет</title>'
      + '<part><name index="1"/><value>Бразилия</value></part></template>\n</value></part>'
      + '<part><name>заглавие</name><equals>=</equals><value>Муниципалитеты микрорегиона [[Умаризал (микрорегион)|Умаризал]] ([[Бразилия]])\n</value></part>'
      + '<part><name>содержание  </name><equals>=</equals><value>\n&amp;nbsp;[[Алмину-Афонсу (Риу-Гранди-ду-Норти)|Алмину-Афонсу]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Антониу-Мартинс]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Фрутуозу-Гомис]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Жуан-Диас]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Лукресия (Риу-Гранди-ду-Норти)|Лукресия]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Мартинс (муниципалитет)|Мартинс]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Олью-д’Агуа-ду-Боржис]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Пату (Бразилия)|Пату]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Рафаэл-Годейру]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Серринья-дус-Пинтус]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Умаризал]]\n</value></part>'
      + '</template>'
      + '<ignore>&lt;noinclude&gt;</ignore>\n[[Категория:Навигационные шаблоны:География Бразилии|Умаризал]]\n<ignore>&lt;/noinclude&gt;</ignore>\n</root>';

    const doc = new DOMParser().parseFromString( sourceXml, 'application/xml' );
    const root = new Parser().parseDocument( doc );

    const template = root.children[ 0 ];
    assert( template instanceof Template );
    assert.equal( template.findTitleText(), 'Навигационная полоса' );
  } );

} );
