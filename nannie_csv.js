var csv = require('csv'),
 	request = require('request'),
 	fs = require('fs'),
 	cheerio = require('cheerio'),
 	jsdom = require('jsdom')

var map = function(arr,cb) {
	return Array.prototype.map.call(arr,cb)
}

var promises = []

var fetchCenterData = function(row) {

	var fID = row['Facility ID'],
		name = row['Operation/Caregiver Name'],
		url = `https://www.dfps.state.tx.us/Child_Care/Search_Texas_Child_Care/CCLNET/Source/Provider/ppComplianceHistory.aspx?fid=${fID}&type=All`

	var parsePage = function(doc,res,rej){
			daWindow = doc
			console.log(`\nscraping from ${name}`)
			console.log(`url is ${url}`)
			console.log('here comes doc body', doc.querySelector('body').innerHTML)
			var tbl = doc.getElementById('ctl00_contentBase_tabSections_gridSummary_DXMainTable')
				try {
					var rows = tbl.getElementsByClassName('dxgvDataRow_Glass'),
					headerRow = tbl.querySelector('#ctl00_contentBase_tabSections_gridSummary_DXHeadersRow0'),
					fields = map(headerRow.getElementsByTagName('th'),el=>el.textContent.trim()),
					riskIndex = fields.indexOf('StandardRisk Level')
				}
				catch(error) {
					return rej(error,doc.querySelector('body').innerHTML)
				}
			var centerData = {
				name: name,
				fID: fID,
				violations: []
			}

			for (var i = 0; i < rows.length; i ++) {
				var rowObj = {},
					rowValues = map(rows[i].getElementsByTagName('td'),el=>el.textContent)
				fields.forEach((fieldName,j) => {
					rowObj[fieldName] = rowValues[j]
				})
				centerData.violations.push(rowObj)
				// console.log(els[i].getElementsByTagName('td')[riskIndex].textContent)
				
			}
			res(centerData)
		}

	var p = new Promise(function(res,rej) {
		jsdom.env(url, function(error,window) {
			if (error) {
				rej(error)
			}
			else {
				res(parsePage(window.document,res,rej))
			}
		})
	})
	var daWindow
	promises.push(p)
}

fs.readFile('ChildCareSearchResults.csv', 'utf8', function(err, contents) {
	var pat = /([^,\n\r])"([^,\n\r])/gm
	while (contents.match(pat)) {
		contents = contents.replace(pat, "$1$2")
	}
	csv.parse(contents,{
		columns: true,
		trim: true
	}, function(err,parsedData) {
		if (err) {
			console.log('*ERROR*: ' + err)
		}
		
		parsedData.slice(0,6).forEach(fetchCenterData)
		Promise.all(promises).then(
			vals=>console.log(vals.length), 
			function(err,html) {
				console.log("*ERROR*",err)
				console.log(html)
			}
		)
	})
})



