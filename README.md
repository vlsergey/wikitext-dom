# MediaWiki Wikitext XML DOM

JavaScript library for working with Wikitext XML of wikitext content model.

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

## Cookbook

### Extract plot data from timeline inner with regexp
```js
const plotDataLines = dom.getChildByClass( Extension )
  .filter( ext => ext.getNameAsString() === 'timeline' )
  .map( tl => tl.getInnerAsString() )
  .filter( inner => !!inner )
  .flatMap( inner => inner.split('\n') )
  .map( line => line.trim() )
  .filter( line => line.match(/^bar\:(\d+) from\:0 till:(\d+)$/) );
```

### Extract population data from timeline inner with additional Timeline class
```js
const populationItems = dom.getChildByClass( Extension )
  .filter( ext => ext.getNameAsString() === 'timeline' )
  .map( tl => tl.findPlotDataBarsAttributes() )
  .filter( data => !!data )
  .flatMap( data => Object.values( data ) )
  .filter( attr => /^\d+$/.exec( attr.bar ) && "0" === attr.from && /^\d+$/.exec( attr.till ) )
  .map( attr => ( { year: Number( attr.bar ), population: Number( attr.till ) } ) );
```

### Extract population data from USCensusPop templates
```js
const populationImtes = dom.getChildByClass( Template )
    .filter( tpl => ( tpl.getTitleAsString() || '' ).trim() === 'USCensusPop' )
    .flatMap( tpl => {
      const result = [];

      tpl.findPartNamesAsStrings()
        .filter( name => isNumeric( name.trim() ) )
        .filter( name => isNumeric( tpl.getValueByNameAsString( name ) ) )
        .map( name => ( {
          determinationMethod: 'census',
          population: Number( tpl.getValueByNameAsString( name ) ),
          year: Number( name ),
        } ) )
        .forEach( r => result.push( r ) );

      const estPop = tpl.getValueByNameAsString( 'estimate' );
      const estYear = tpl.getValueByNameAsString( 'estyear' );
      if ( isNumeric( estPop ) && isNumeric( estYear ) ) {
        result.push( {
          determinationMethod: 'estimating',
          population: Number( estPop ),
          year: Number( estYear ),
        } );
      }

      return result;
    }
```
