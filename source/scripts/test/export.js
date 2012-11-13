'use strict';

//============================================================

btk.define({
    name: 'export@test',
    //load: true,
    libs: {
        btk: 'btk@btk'
    },
    when: [ 'state::document.loaded' ],
    init: function(libs, exports) {
        var URL = window.URL || window.webkitURL
        
        var x = {};
        
        x.doc = [
        "BlobBuilder = WebKitBlobBuilder",
        "URL = webkitURL",
        ];

        x.URL = URL;
        x.createObjectURL = x.URL.createObjectURL;
        x.revokeObjectURL = x.URL.revokeObjectURL;

        x.popup = function(params) {
            params = params || {};
            
            params.url = params.url || x.bookmarks.url;
            params.type = 'popup';

            chrome.windows.create(params);
        };
        
        x.bookmarks = {};
        
        x.bookmarks.build = function() {
            var pad = function(x) {
                if (x < 10) {
                    return '0' + x;
                }
                else {
                    return x;
                }
            };
            
            var d = new Date();
            
            x.bookmarks.stamp = {
                'year': d.getFullYear(),
                'month': pad(d.getMonth()+1),
                'day': pad(d.getDate()),
                'hours': pad(d.getHours()),
                'minutes': pad(d.getMinutes())
            };
            
            var s = x.bookmarks.stamp;
            var dd = [
                s.year,
                '.',
                s.month,
                '.',
                s.day,
                ':',
                s.hours,
                '.',
                s.minutes
            ];
            var data = {
                'description': 'BOOKMARKS-OLD no data',
                'timestamp': dd.join(''),
                'data': {}
            };
            
            x.bookmarks.data = data;
            
            if (page.bookmarks) {
                data.description = 'BOOKMARKS-OLD backup';
                data.data = page.bookmarks;
            }
            
            return x.bookmarks;
        };
        
        x.bookmarks.stringify = function() {
            if (!x.bookmarks.data) {
                x.bookmarks.build();
            }
            
            x.bookmarks.sdata = JSON.stringify(x.bookmarks.data);
            
            return x.bookmarks;
        };
        
        x.bookmarks.blobify = function() {
            if (!x.bookmarks.sdata) {
                x.bookmarks.stringify();
            }
            
            x.bookmarks.blob = new Blob([x.bookmarks.sdata], {type:'text/plain'});
            //x.bookmarks.blob = new Blob([x.bookmarks.sdata], {type:'application/json'});
            
            return x.bookmarks;
        };
        
        x.bookmarks.urlify = function() {
            if (!x.bookmarks.blob) {
                x.bookmarks.blobify();
            }
            
            x.bookmarks.url = x.createObjectURL(x.bookmarks.blob);
            
            return x.bookmarks;
        };
        
        x.bookmarks.view = function() {
            if (!x.bookmarks.url) {
                x.bookmarks.urlify();
            }

            x.popup({'focused':true});
            
            return x.bookmarks;
        };
        
        x.bookmarks.createExportPage = function() {
            if (!x.bookmarks.url) {
                x.bookmarks.urlify();
            }
            
            var s = x.bookmarks.stamp;
            var ss = [s.year,s.month,'-',s.day,].join('');
            
            var page = {};
            page.text = [
                '<html>',
                '<head>',
                '<title>' + 'Exporter' + '</title>',
                '</head>',
                '<body>',
                '<a href="',
                x.bookmarks.url,
                '" download="bookmarks-',
                ss,
                '.txt">Click this link to export the bookmarks</a>',
                '</body>',
                '</html>'
            ].join('');

            page.blob = new Blob([page.text],{type:'text/html'});
            page.url = x.createObjectURL(page.blob);
            
            x.bookmarks.page = page;
            
            return x.bookmarks;
        };
        
        x.bookmarks.showExportPage = function() {
            if (!x.bookmarks.page) {
                x.bookmarks.createExportPage();
            }
            
            if (!x.bookmarks.page.url) {
                x.bookmarks.createExportPage();
            }
            
            x.popup({
                'url':x.bookmarks.page.url,
                'width': 300,
                'height': 150
            });
            
            return x.bookmarks;
        };
        
        x.bookmarks.clean = function() {
            if (x.bookmarks.page.url) {
                x.revokeObjectURL(x.bookmarks.page.url);
            }
            
            if (x.bookmarks.url) {
                x.revokeObjectURL(x.bookmarks.url);
            }
            
            x.bookmarks = {};
            
            return x.bookmarks;
        };
        
        
        //------------------------------------------------------------
        
        btk.global.x = x;
        return x;
        
    }   // end init
});     // end define

