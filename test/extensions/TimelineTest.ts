import {assert} from 'chai';

import Timeline from '../../src/extensions/Timeline';
import Parser from '../../src/Parser';

// Test code from https://www.mediawiki.org/wiki/Extension:EasyTimeline/syntax
describe('Timeline', () => {

  describe('Timeline.findCommandData', () => {
    it('Can find plot data', () => {
      const src = '# In this example two sets of bars are drawn, in red and blue respectively,\r\n'
        + '# but in each set one bar (marking war periods) will be drawn in green.\r\n'
        + '\r\n'
        + 'PlotData =\r\n'
        + '  color:red fontsize:S                               # set defaults\r\n'
        + '  bar:USSR from:1919 till:1922 text:Lenin            # red bar\r\n'
        + '  bar:USSR from:1922 till:1953 text:Stalin           # red bar\r\n'
        + '  bar:USSR from:1939 till:1945 text:WWII color:green # green bar\r\n'
        + '  bar:USSR from:1953 till:1964 text:Krushchev        # red bar\r\n'
        + '   \r\n'
        + '  color:blue                                         # change default color\r\n'
        + '  bar:US from:1913 till:1921 text:Wilson             # blue bar\r\n'
        + '  bar:US from:1917 till:1918 text:WWI color:green    # green bar\r\n'
        + '  bar:US from:1921 till:1923 text:Harding            # blue bar\r\n'
        + '\r\n'
        + '#> this multiline comment does not end command PlotData,\r\n'
        + '   even when the previous line does not start with a space<#\r\n'
        + '\r\n'
        + '   bar:US from:1923 till:1929 text:Coolidge           # blue bar\r\n'
        + '\r\n'
        + 'TextData =                                           # now PlotData is considered complete\r\n'
        + '   tabs:...etc\r\n';

      const actual = Timeline.findCommandData(src, 'PlotData');
      const expected = ''
        + '  color:red fontsize:S                               \r\n'
        + '  bar:USSR from:1919 till:1922 text:Lenin            \r\n'
        + '  bar:USSR from:1922 till:1953 text:Stalin           \r\n'
        + '  bar:USSR from:1939 till:1945 text:WWII color:green \r\n'
        + '  bar:USSR from:1953 till:1964 text:Krushchev        \r\n'
        + '   \r\n'
        + '  color:blue                                         \r\n'
        + '  bar:US from:1913 till:1921 text:Wilson             \r\n'
        + '  bar:US from:1917 till:1918 text:WWI color:green    \r\n'
        + '  bar:US from:1921 till:1923 text:Harding            \r\n'
        + '\r\n'
        + '\r\n'
        + '\r\n'
        + '   bar:US from:1923 till:1929 text:Coolidge           ';
      assert.equal(actual, expected);
    });

  });

  describe('Timeline.findPlotDataBarsAttributes', () => {
    const xml = '<root><ext><name>timeline</name><attr/><inner>\r\n'
       + 'ImageSize = width:380 height:300\r\n'
       + 'PlotArea = left:30 right:40 top:20 bottom:20\r\n'
       + 'TimeAxis = orientation:vertical\r\n'
       + 'AlignBars = justify\r\n'
       + 'Colors =\r\n'
       + '  id:gray1 value:gray(0.9)\r\n'
       + 'DateFormat = yyyy\r\n'
       + 'Period = from:0 till:217\r\n'
       + 'ScaleMajor = unit:year increment:50 start:0 gridcolor:gray1\r\n'
       + 'PlotData =\r\n'
       + '  bar:1879 color:gray1 width:1 \r\n'
       + '   from:0 till:119 width:15  text:119 textcolor:red fontsize:8px\r\n'
       + '  bar:1910 color:gray1 width:1 \r\n'
       + '   from:0 till:188 width:15  text:188 textcolor:red fontsize:8px\r\n'
       + ' bar:1928 color:gray1 width:1 \r\n'
       + '   from:0 till:217 width:15 text:217 textcolor:red fontsize:8px\r\n'
       + '  bar:1958 color:gray1 width:1 \r\n'
       + '   from:0 till:99 width:15 text:99 textcolor:red fontsize:8px\r\n'
       + '  bar:1997 color:gray1 width:1 \r\n'
       + '   from:0 till:38 width:15  text:38 textcolor:red fontsize:8px\r\n'
       + '  bar:2002 color:gray1 width:1 \r\n'
       + '   from:0 till:35 width:15  text:35 textcolor:red fontsize:8px\r\n'
       + '  bar:2007 color:gray1 width:1 \r\n'
       + '   from:0 till:26 width:15  text:26 textcolor:red fontsize:8px\r\n'
       + '  bar:2010 color:gray1 width:1 \r\n'
       + '   from:0 till:16 width:15  text:16 textcolor:red fontsize:8px\r\n'
       + '  bar:2017 color:gray1 width:1 \r\n'
       + '   from:0 till:19 width:15 text:19 textcolor:red fontsize:8px\r\n'
       + '</inner><close>&lt;/timeline&gt;</close></ext>\r\n'
       + '</root>';
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const root = new Parser().parseDocument(doc);
    const timeline = root.children[0] as Timeline;

    const expected = timeline.findPlotDataBarsAttributes();

    assert.equal(expected?.['1879']?.bar, '1879');
    assert.equal(expected?.['1879']?.color, 'gray1');
    assert.equal(expected?.['1879']?.from, '0');
    assert.equal(expected?.['1879']?.till, '119');

    assert.equal(expected?.['2017']?.bar, '2017');
    assert.equal(expected?.['2017']?.color, 'gray1');
    assert.equal(expected?.['2017']?.from, '0');
    assert.equal(expected?.['2017']?.till, '19');
  });

  describe('Timeline.stripComments', () => {

    it('Can correctly strip comments (short)', () => {
      const src = '  color:red fontsize:S    # set defaults\r\n';
      const actual = Timeline.stripComments(src);
      const expected = '  color:red fontsize:S    \r\n';
      assert.equal(actual, expected);
    });

    it('Can correctly strip comments (multiline short)', () => {
      const src = '  qwerty #> comment here <# uiop\r\n';
      const actual = Timeline.stripComments(src);
      const expected = '  qwerty  uiop\r\n';
      assert.equal(actual, expected);
    });

    it('Can correctly strip comments (multiline long)', () => {
      const src = 'line 1\r\n#> line 2\r\n line 3<#\r\nline 4';
      const actual = Timeline.stripComments(src);
      const expected = 'line 1\r\n\r\nline 4';
      assert.equal(actual, expected);
    });

    it('Can correctly strip comments (full)', () => {
      const src = '# In this example two sets of bars are drawn, in red and blue respectively,\r\n'
        + '# but in each set one bar (marking war periods) will be drawn in green.\r\n'
        + '\r\n'
        + 'PlotData =\r\n'
        + '  color:red fontsize:S                               # set defaults\r\n'
        + '  bar:USSR from:1919 till:1922 text:Lenin            # red bar\r\n'
        + '  bar:USSR from:1922 till:1953 text:Stalin           # red bar\r\n'
        + '  bar:USSR from:1939 till:1945 text:WWII color:green # green bar\r\n'
        + '  bar:USSR from:1953 till:1964 text:Krushchev        # red bar\r\n'
        + '   \r\n'
        + '  color:blue                                         # change default color\r\n'
        + '  bar:US from:1913 till:1921 text:Wilson             # blue bar\r\n'
        + '  bar:US from:1917 till:1918 text:WWI color:green    # green bar\r\n'
        + '  bar:US from:1921 till:1923 text:Harding            # blue bar\r\n'
        + '\r\n'
        + '#> this multiline comment does not end command PlotData,\r\n'
        + '   even when the previous line does not start with a space<#\r\n'
        + '\r\n'
        + '   bar:US from:1923 till:1929 text:Coolidge           # blue bar\r\n'
        + '\r\n'
        + 'TextData =                                           # now PlotData is considered complete\r\n'
        + '   tabs:...etc\r\n';

      const actual = Timeline.stripComments(src);

      const expected = '\r\n'
        + '\r\n'
        + '\r\n'
        + 'PlotData =\r\n'
        + '  color:red fontsize:S                               \r\n'
        + '  bar:USSR from:1919 till:1922 text:Lenin            \r\n'
        + '  bar:USSR from:1922 till:1953 text:Stalin           \r\n'
        + '  bar:USSR from:1939 till:1945 text:WWII color:green \r\n'
        + '  bar:USSR from:1953 till:1964 text:Krushchev        \r\n'
        + '   \r\n'
        + '  color:blue                                         \r\n'
        + '  bar:US from:1913 till:1921 text:Wilson             \r\n'
        + '  bar:US from:1917 till:1918 text:WWI color:green    \r\n'
        + '  bar:US from:1921 till:1923 text:Harding            \r\n'
        + '\r\n'
        + '\r\n'
        + '\r\n'
        + '   bar:US from:1923 till:1929 text:Coolidge           \r\n'
        + '\r\n'
        + 'TextData =                                           \r\n'
        + '   tabs:...etc\r\n';

      assert.equal(actual, expected);
    });

  });

});
