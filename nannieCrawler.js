var csv = require('csv')

const casper = require('casper').create({
    engine: 'slimerjs',
    verbose: true,
    logLevel: 'debug',
    exitOnError: false,
    ignoreSslErrors: true,
    pageSettings: {
        javascriptEnabled: true,
        loadImages: true,
        loadPlugins: true,
        localToRemoteUrlAccessEnabled: true,
        userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36',
        XSSAuditingEnabled: false,
        logLevel: 'debug'
    }
})

var qs = function(sel) {
	return document.querySelector(sel)
}

casper.start('https://www.dfps.state.tx.us/Child_Care/Search_Texas_Child_Care/ppFacilitySearchDayCare.asp')

casper.then(function() {
	this.echo('First page: ' + this.getTitle())
	this.echo('?')
	var num = 1
	var form = this.evaluate(function() {
		// this.echo(qs('form#daycareSearch'))
		return document.querySelector('form#daycareSearch')
	})
	this.fill('form#daycareSearch', {
		txt_Location_City: 'Houston'
	}, true)

})

casper.waitForUrl(
	'https://www.dfps.state.tx.us/Child_Care/Search_Texas_Child_Care/ppFacilitySearchResults.asp',
	function() {
		var html = this.evaluate(function() {
			return document.querySelector('body').innerHTML
		})
		casper.log(html)
	})


casper.run()