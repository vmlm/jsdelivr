// SpryCSVDataSet.js - version 0.2 - Spry Pre-Release 1.6.1
//
// Copyright (c) 2007. Adobe Systems Incorporated.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   * Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//   * Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//   * Neither the name of Adobe Systems Incorporated nor the names of its
//     contributors may be used to endorse or promote products derived from this
//     software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

Spry.Data.CSVDataSet = function(dataSetURL, dataSetOptions)
{
	// Call the constructor for our HTTPSourceDataSet base class so that
	// our base class properties get defined.

	Spry.Data.HTTPSourceDataSet.call(this, dataSetURL, dataSetOptions);

	this.firstRowAsHeaders = true;
	this.columnNames = [];

	Spry.Utils.setOptions(this, dataSetOptions);
}; // End of Spry.Data.CSVDataSet() constructor.

Spry.Data.CSVDataSet.prototype = new Spry.Data.HTTPSourceDataSet();
Spry.Data.CSVDataSet.prototype.constructor = Spry.Data.CSVDataSet;

// Override the inherited version of getDataRefStrings() with our
// own version that returns the strings memebers we maintain that
// may have data references in them.

Spry.Data.CSVDataSet.prototype.getDataRefStrings = function()
{
	var strArr = [];
	if (this.url) strArr.push(this.url);
	return strArr;
};

Spry.Data.CSVDataSet.prototype.getDocument = function() { return this.doc; };

// Utility routine for copying properties from one object to another.

Spry.Data.CSVDataSet.cleanFieldString = function(str)
{
	str = str.replace(/\s*(\r\n)\s*/g, "$1");
	str = str.replace(/^[ \t]*"?|"?\s*,?\s*$/g, "");
	return str.replace(/""/g, '"');
};

Spry.Data.CSVDataSet.prototype.columnNumberToColumnName = function(colNum)
{
	var colName = this.columnNames[colNum];
	if (!colName)
		colName = "column" + colNum;
	return colName;
};

// Translate the raw CSV string (rawDataDoc) into an array of row objects.

Spry.Data.CSVDataSet.prototype.loadDataIntoDataSet = function(rawDataDoc)
{
	var data = new Array();
	var dataHash = new Object();

	var s = rawDataDoc ? rawDataDoc : "";
	var strLen = s.length;
	var i = 0;
	var done = false;

	var firstRowAsHeaders = this.firstRowAsHeaders;

	var searchStartIndex = 0;
	var regexp = /([ \t]*"([^"]|"")*"[ \t]*,?)|([ \t]*[^",\r\n]+[ \t]*,?)|[ \t]*(\r\n|\r|\n)/mg;

	var results = regexp.exec(s);
	var rowObj = null;
	var columnNum = -1;
	var rowID = 0;

	while (results && results[0])
	{
		var f = Spry.Data.CSVDataSet.cleanFieldString(results[0]);
		if (f == "\r\n" || f == "\r" || f == "\n")
		{
			if (!firstRowAsHeaders)
			{
				rowObj.ds_RowID = rowID++;
				data.push(rowObj);
				dataHash[rowObj.ds_RowID] = rowObj;
				rowObj = null;
			}
			firstRowAsHeaders = false;
			columnNum = -1;
		}
		else
		{
			if (firstRowAsHeaders)
				this.columnNames[++columnNum] = f;
			else
			{
				if (++columnNum == 0)
					rowObj = new Object;
				rowObj[this.columnNumberToColumnName(columnNum)] = f;
			}
		}

		searchStartIndex = regexp.lastIndex;
		results = regexp.exec(s);
	}
	
	this.doc = rawDataDoc;
	this.data = data;
	this.dataHash = dataHash;
	this.dataWasLoaded = (this.doc != null);
};
