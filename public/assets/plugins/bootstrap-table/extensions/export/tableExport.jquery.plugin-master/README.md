tableExport.jquery.plugin
=========================

<h3>Export HTML Table to</h3>
<ul>
<li> CSV
<li> TSV
<li> TXT
<li> JSON
<li> XML
<li> SQL
<li> XLS
<li> XLSX
<li> DOC
<li> PNG
<li> PDF
</ul>

Installation
============

To save the generated export files on client side, include in your html code:

```javascript
<script src="libs/FileSaver/FileSaver.min.js"></script>
```

To export the table in XLSX (Excel 2007+ XML Format) format, you need to include additionally:
```javascript
<script src="libs/js-xlsx/xlsx.core.min.js"></script>
```

To export the table as a PDF file the following includes are required:

```javascript
<script src="libs/jsPDF/jspdf.min.js"></script>
<script src="libs/jsPDF-AutoTable/jspdf.plugin.autotable.js"></script>
```

To export the table in PNG format, you need to include:

```javascript
<script src="libs/html2canvas/html2canvas.min.js"></script>
```

Regardless of the desired format, finally include:

```javascript
<script src="tableExport.min.js"></script>
```

Please keep this include order.



Examples
========

```javascript
$('#tableID').tableExport({type:'csv'});
```

```javascript
$('#tableID').tableExport({type:'pdf',
                           jspdf: {orientation: 'p',
                                   margins: {left:20, top:10},
                                   autotable: false}
                          });
```

```javascript
$('#tableID').tableExport({type:'pdf',
                           jspdf: {orientation: 'l',
                                   format: 'a3',
                                   margins: {left:10, right:10, top:20, bottom:20},
                                   autotable: {styles: {fillColor: 'inherit', 
                                                        textColor: 'inherit'},
                                               tableWidth: 'auto'}
                                  }
                          });
```

```javascript
function DoCellData(cell, row, col, data) {}
function DoBeforeAutotable(table, headers, rows, AutotableSettings) {}

$('table').tableExport({fileName: sFileName,
                        type: 'pdf',
                        jspdf: {format: 'bestfit',
                                margins: {left:20, right:10, top:20, bottom:20},
                                autotable: {styles: {overflow: 'linebreak'},
                                            tableWidth: 'wrap',
                                            tableExport: {onBeforeAutotable: DoBeforeAutotable,
                                                          onCellData: DoCellData}}}
                       });
```

Options (Default settings)
=======

```javascript
consoleLog: false
csvEnclosure: '"'
csvSeparator: ','
csvUseBOM: true
displayTableName: false
escape: false
excelstyles: []
fileName: 'tableExport'
htmlContent: false
ignoreColumn: []
ignoreRow: []
jsonScope: 'all'
jspdf: orientation: 'p'
       unit:'pt'
       format: 'a4'
       margins: left: 20
                right: 10
                top: 10
                bottom: 10
       autotable: styles: cellPadding: 2
                          rowHeight: 12
                          fontSize: 8
                          fillColor: 255
                          textColor: 50
                          fontStyle: 'normal'
                          overflow: 'ellipsize'
                          halign: 'left'
                          valign: 'middle'
                  headerStyles: fillColor: [52, 73, 94]
                                textColor: 255
                                fontStyle: 'bold'
                                halign: 'center'
                  alternateRowStyles: fillColor: 245
                  tableExport: onAfterAutotable: null
                               onBeforeAutotable: null
                               onAutotableText: null
                               onTable: null
                               outputImages: true
numbers: html: decimalMark: '.'
               thousandsSeparator: ','
         output: decimalMark: '.',
                 thousandsSeparator: ','
onCellData: null
onCellHtmlData: null
onMsoNumberFormat: null
outputMode: 'file'
tbodySelector: 'tr'
tfootSelector: 'tr'
theadSelector: 'tr'
tableName: 'myTableName'
type: 'csv'
worksheetName: 'xlsWorksheetName'
```

```ignoreColumn``` can be either an array of indexes (i.e. [0, 2]) or field names (i.e. ["id", "name"]).
* Indexes correspond to the position of the header elements `th` in the DOM starting at 0. (If the `th` elements are removed or added to the DOM, the indexes will be shifted so use the functionality wisely!)
* Field names should correspond to the values set on the "data-field" attribute of the header elements `th` in the DOM.
* "Nameless" columns without data-field attribute will be named by their index number (converted to a string)

To disable formatting of numbers in the exported output, which can be useful for csv and excel format, set the option ``` numbers: output ``` to ``` false ```.

The ``` excelstyles ``` option lets you define the css attributes of the original html table cells, that should be taken over when exporting to an excel table.

For jspdf options see the documentation of [jsPDF](https://github.com/MrRio/jsPDF) and [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) resp.

There is an extended setting for ``` jsPDF option 'format' ```. Setting the option value to ``` 'bestfit' ``` lets the tableExport plugin try to choose the minimum required paper format and orientation in which the table (or tables in multitable mode) completely fits without column adjustment.

Also there is an extended setting for the ``` jsPDF-AutoTable options 'fillColor', 'textColor' and 'fontStyle'```. When setting these option values to ``` 'inherit' ``` the original css values for background and text color will be used as fill and text color while exporting to pdf. A css font-weight >= 700 results in a bold fontStyle and the italic css font-style will be used as italic fontStyle.

When exporting to pdf the option ``` outputImages ``` lets you enable or disable the output of images that are located in the original html table.

To export in XSLX format [protobi/js-xlsx](https://github.com/protobi/js-xlsx) forked from [SheetJS/js-xlsx](https://github.com/SheetJS/js-xlsx) is used. Please note that the implementation of this format type lets you only export table data, but not any styling information of the html table.


Optional html data attributes
=============================
(can be applied while generating the table that you want to export)

<h3>data-tableexport-display</h3>

```html
<table style="display:none;" data-tableexport-display="always">...</table> -> a hidden table will be exported

<td style="display:none;" data-tableexport-display="always">...</td> -> a hidden cell will be exported

<td data-tableexport-display="none">...</td> -> this cell will not be exported

<tr data-tableexport-display="none">...</tr> -> all cells of this row will not be exported
```

<h3>data-tableexport-msonumberformat</h3>

```html
<td data-tableexport-msonumberformat="\@">...</td> -> data value will be used to style excel cells with mso-number-format
                                                      Examples:
                                                      "\@"       excel treats cell content alway as text, even numbers
                                                      "0"        excel will display no decimals for numbers
                                                      "0\.000"   excel displays numbers with 3 decimals
                                                      "0%"       excel will display a number as percent with no decimals
                                                      "Percent"  excel will display a number as percent with 2 decimals
```

<h3>data-tableexport-value</h3>

```html
<th data-tableexport-value="export title">title</th> -> "export title" instead of "title" will be exported

<td data-tableexport-value="export content">content</td> -> "export content" instead of "content" will be exported
```
