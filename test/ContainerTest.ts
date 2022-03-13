import {assert} from 'chai';
import Container from '../src/Container';
import Parser from '../src/Parser';
import Template from '../src/Template';

describe('Container', () => {

  const sourceXml = '<root><template><title>Навигационная полоса\n</title>'
    + '<part><name>имя </name><equals>=</equals><value>Муниципалитеты микрорегиона Умаризал\n</value></part>'
    + '<part><name>цвет</name><equals>=</equals><value><template><title>цвет</title>'
    + '<part><name index="1"/><value>Бразилия</value></part></template>\n</value></part>'
    + '<part><name>заглавие</name><equals>=</equals><value>Муниципалитеты микрорегиона [[Умаризал (микрорегион)|Умаризал]] ([[Бразилия]])\n</value></part>'
    + '<part><name>содержание  </name><equals>=</equals><value>\n&amp;nbsp;[[Алмину-Афонсу (Риу-Гранди-ду-Норти)|Алмину-Афонсу]]\n&amp;nbsp;&amp;#124;&amp;nbsp;[[Умаризал]]\n</value></part>'
    + '</template>'
    + '<ignore>&lt;noinclude&gt;</ignore>\n[[Категория:Навигационные шаблоны:География Бразилии|Умаризал]]\n<ignore>&lt;/noinclude&gt;</ignore>\n</root>';

  const doc = new DOMParser().parseFromString(sourceXml, 'application/xml');
  const root = new Parser().parseDocument(doc);

  it('Can use getChildByClass', () => {
    assert(root instanceof Container);

    const templates = root.getChildrenByClassR(Template);
    assert.equal(2, templates.length);

    assert.equal(templates[0]?.getTitleAsString(), 'Навигационная полоса');
    assert.equal(templates[1]?.getTitleAsString(), 'цвет');
  });

});
