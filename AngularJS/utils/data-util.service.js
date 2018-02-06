(function() {
    'use strict';

    angular
        .module('default')
        .factory('DataUtils', DataUtils);

    DataUtils.$inject = ['$window'];

    function DataUtils ($window) {

        var service = {
            abbreviate: abbreviate,
            byteSize: byteSize,
            openFile: openFile,
            toBase64: toBase64,
            toBase64WOonLoad: toBase64WOonLoad,
            downloadFile: downloadFile,
            downloadFileIE: downloadFileIE
        };

        return service;

        function abbreviate (text) {
            if (!angular.isString(text)) {
                return '';
            }
            if (text.length < 30) {
                return text;
            }
            return text ? (text.substring(0, 15) + '...' + text.slice(-10)) : '';
        }

        function byteSize (base64String) {
            if (!angular.isString(base64String)) {
                return '';
            }

            function endsWith(suffix, str) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
            }

            function paddingSize(base64String) {
                if (endsWith('==', base64String)) {
                    return 2;
                }
                if (endsWith('=', base64String)) {
                    return 1;
                }
                return 0;
            }

            function size(base64String) {
                return base64String.length / 4 * 3 - paddingSize(base64String);
            }

            function formatAsBytes(size) {
                return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' bytes';
            }

            return formatAsBytes(size(base64String));
        }

        function openFile (type, data) {
            $window.open('data:' + type + ';base64,' + data, '_blank', 'height=300,width=400');
        }

        function downloadFile(data, type, name) {
            var downloadLink      = document.createElement('a');
            downloadLink.target   = '_blank';
            downloadLink.download = name;

            // convert downloaded data to a Blob
            var blob = new Blob([base64ToArrayBuffer(data)], { type: type });

            // create an object URL from the Blob
            var URL = window.URL || window.webkitURL;
            var downloadUrl = URL.createObjectURL(blob);

            // set object URL as the anchor's href
            downloadLink.href = downloadUrl;

            // append the anchor to document body
            document.body.appendChild(downloadLink);

            // fire a click event on the anchor
            downloadLink.click();

            // cleanup: remove element and revoke object URL
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadUrl);
        }

        //MS IE API for download file without block
        function downloadFileIE(data,type, name) {
            var blob = new Blob([base64ToArrayBuffer(data)], { type: type });
            window.navigator.msSaveBlob(blob, name);
        }

        //base64 to binary file.
        function base64ToArrayBuffer(base64) {
            var binary_string =  window.atob(base64);
            var len = binary_string.length;
            var bytes = new Uint8Array( len );
            for (var i = 0; i < len; i++)        {
                bytes[i] = binary_string.charCodeAt(i);
            }
            return bytes.buffer;
        }

        //Slower method, result the base64 but breaks the angular binding and the data url can´t show it until a new event in the page DOM
        function toBase64 (file, cb) {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function (e) {
                var base64Data = e.target.result.substr(e.target.result.indexOf('base64,') + 'base64,'.length);
                cb(base64Data);
            };
        }

        //Faster method, to keep the file on memory, toBase64 should be called before send data to complete the file convertion
        function toBase64WOonLoad (file, cb) {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            cb(file);
        }
    }
})();
