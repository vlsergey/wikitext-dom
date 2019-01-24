import Extension from '../Extension';

export default class Timeline extends Extension {

  static findCommandData( code, command ) {
    if ( !code ) return null;
    code = Timeline.stripComments( code );

    const regexp = /(\n|^)([^\s]\w+)\s*=/;
    const splitted = code.split( regexp );
    const index = splitted.findIndex( value => value === command );
    if ( index === -1 || index >= splitted.length - 1 ) return null;
    let commandData = splitted[ index + 1 ];
    while ( /^(\r|\n)/.exec( commandData ) )
      commandData = commandData.replace( /^(\r|\n)/, '' );
    while ( /(\r|\n)$/.exec( commandData ) )
      commandData = commandData.replace( /(\r|\n)$/, '' );
    return commandData;
  }

  static parse( parser, node, asExtension ) {
    return new Timeline( asExtension.children );
  }

  static stripComments( text ) {
    return text
      .replace( /#>(.|\r|\n)*<#/gm, '' )
      .replace( /#(.|)*(\r?\n)/gm, '$2' );
  }

  findPlotData() {
    return Timeline.findCommandData( this.getInnerAsString(), 'PlotData' );
  }

  findPlotDataBarsAttributes() {
    const plotData = this.findPlotData();
    if ( !plotData ) return null;
    let splitted = plotData.split( /\s+/ );

    // join texts (quotas)
    for ( let i = 1; i < splitted.length; i++ ) {
      const prev = splitted[ i - 1 ];
      if ( prev.startsWith( '"' ) && !prev.endsWith( '"' ) ) {
        splitted[ i - 1 ] += splitted[ i ];
        splitted = splitted.splice( i, 1 );
        i--;
      }
    }

    const perBarAttributes = {};
    let barAttributes = {};
    splitted.forEach( str => {
      if ( str.startsWith( 'bar:' ) ) {
        const newBarId = str.substr( 4 );
        barAttributes = {};
        perBarAttributes[newBarId] = barAttributes;
      }
      const semicolonIndex = str.indexOf( ':' );
      if ( semicolonIndex !== -1 ) {
        barAttributes[ str.substr( 0, semicolonIndex ) ] = str.substr( semicolonIndex + 1 );
      }
    } );

    return perBarAttributes;
  }

}
