# MediaWiki Wikitext XML DOM

JavaScript library for working with Wikitext XML of wikitext content model.

![Travis](https://travis-ci.org/vlsergey/wikitext-dom.svg?branch=master)

## Starter example

```js
  import { Parser, Template } from 'wikitext-dom';

  // XML String from MediaWiki API
  // {{templateName|argName=argValue}}
  const xmlContent = '<root><template><title>templateName</title><part><name>argName</name><equals>=</equals><value>argValue</value></part></template></root>';
  // XML DOM from browser API
  const doc = new DOMParser().parseFromString( xmlContent, 'application/xml' );
  // Document model to work with
  const dom = new Parser().parseDocument( doc );

  // working with DOM here: replace all argument values of argName=argValue to argNewValue
  dom.getChildByClass( Template )
    .filter( template => template.findTitleText() === 'templateName' )
    .map( template => template.findPartByNameText( 'argName' ) )
    .filter( part => part != null )
    .filter( part => part.getValueAsString() === 'argValue' )
    .forEach( part => part.setValueAsString( 'argNewValue' ) );

  // serializing to wikitext (not XML) string preserving comments
  const newWikitext = toWikitext( false );
  // expected result: {{templateName|argName=argNewValue}}

  // Sending wikitext to server
  /* mw.Api().postWithToken(...) */
```

## Supported Elements
* ```comment``` (JavaScript class ```Comment```)
* ```ext``` (JavaScript class ```Extension```)
* ```h``` (JavaScript class ```Header```)
* ```ignore``` (JavaScript class ```Ignore```)
* ```root``` (JavaScript class ```Root```)
* ```template``` (JavaScript class ```Template```)
* ```tplarg``` (JavaScript class ```TemplateArgument```)
