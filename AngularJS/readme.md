# AngularJS
Those are examples of the code that I wrote for AngularJS applications

## Development

AngularJS 1.5.8 - 1.6.2:

1. Chart.
   
2. Directives.

3. Utils.

4. Requirement.

### Chart

This example is a poll detail with a chart, the chart library used is [NVD3][], all the data is retrieved using [angular-azure-mobile-services.js][] because the API is made with ASP .Net MVC and hosted on Azure.


### Directives 

1. disallow-spaces, this directive is intended to block the capture of blanks in form fields. 

2. scroll-block, this directive fix an incompatibility of Angular Material Select and bootstrap where the main page scroll was not disabled after the select was open.

### Utils

1. browser-util, this util was used for know which browser is the user using and use the correct browser API.

2. data-util, this data util, was created for file management using the document DOM and JS API's. The function `openFile(type, data)` allow us to open and preview a file on the browser using data URL's this was working before Firefox 58, Google Chrome 56. the function `downloadFileIE(data,type, name)` was for downloading files on IE without block, for Firefox and Chrome we use the function `downloadFile(data, type, name)`. The function `toBase64WOonLoad` and `toBase64` are utils for read files and upload them using a base64 string, the diference is that when we use the function `toBase64` takes more time, so what we do is don't call the `fileReader.onload` and do it before the file is uploaded. The function `base64ToArrayBuffer(base64)` allow us to download a base64 as a binary file.

### Requirement

This section has the main process for an app on AngularJS which use a Java API, the app was made for an "Acquisition Control" which had the purpose of manage all the  request for buy items or services as bidding, direct contract or agreement in the goverment. 

[NVD3]: http://nvd3.org/
[angular-azure-mobile-services.js]: https://github.com/TerryMooreII/angular-azure-mobile-service
