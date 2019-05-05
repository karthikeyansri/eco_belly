function buildMetadata(sample) {

    // @TODO: Complete the following function that builds the metadata panel

    // Use `d3.json` to fetch the metadata for a sample
    var metadata_url = `/metadata/${sample}`;

    d3.json(metadata_url).then(function(metaData, error){
        if(error) return;
        console.log("err: " + error);

        console.log("metaData: " + metaData);

        // Use d3 to select the panel with id of `#sample-metadata`
        var panel = d3.select("#sample-metadata");

        // Use `.html("") to clear any existing metadata
        panel.html("");

        var wFreq = 0;
        // Use `Object.entries` to add each key and value pair to the panel
        // Hint: Inside the loop, you will need to use d3 to append new
        // tags for each key-value in the metadata.
        Object.entries(metaData).forEach(function(record) {
            var liItem = panel.append("li");
            liItem.text(`${record[0]}: ${record[1]}`);
            if(record[0] == 'WFREQ')
                wFreq = record[1];
        });

        // BONUS: Build the Gauge Chart
        buildGauge(wFreq);
    });


}

function buildGauge(wFreq) {

    level = wFreq * 20;
    console.log(wFreq);
    var radius = .5, degrees = 180 - level;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    var data = [{ type: 'scatter',
        x: [0], y:[0],
            marker: {size: 12, color:'850000'},
            showlegend: false,
            name: 'Freq',
            text: wFreq,
            hoverinfo: 'text+name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9,
                    50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8', '7', '6', '5', '4', '3', '2', '1', '0'],
        textinfo: 'text',
        textposition:'inside',
        marker: {
            colors:[
                'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
                'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
        labels: ['8', '7', '6', '5', '4', '3', '2', '1', '0'],
        hoverinfo: 'label',
        hole: 0.65,
        type: 'pie',
        showlegend: false
        }];
    var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
            }],
        title: 'Scrubs per Week',
        height: 500,
        xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
        };
    Plotly.newPlot("gauge", data, layout);
}

function buildCharts(sample) {

    // @TODO: Use `d3.json` to fetch the sample data for the plots
    var sampleURL = `/samples/${sample}`
    d3.json(sampleURL).then(function(response, error){
        if (error) return console.log(error);

        var otuIDs = response.otu_ids;
        var sampleValues = response.sample_values
        var otuDescriptions = response.otu_labels;

        // @TODO: Build a Pie Chart
        // HINT: You will need to use slice() to grab the top 10 sample_values,
        // otu_ids, and labels (10 each).
        var labels = otuIDs.slice(0, 10);
        var values = sampleValues.slice(0, 10);
        var hoverText = otuDescriptions.slice(0, 10);

        var trace = {
            values: values,
            labels: labels,
            type: "pie",
            hovertext: hoverText,
            hoverinfo: "hovertext"
        };
        var data = [trace]
        var layout = {
            margin: { t: 0, l: 0 }
        };

        Plotly.newPlot("pie", data, layout);

        // @TODO: Build a Bubble Chart using the sample data
        var trace = {
            x: otuIDs,
            y: sampleValues,
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: sampleValues,
                color: otuIDs,
                colorscale: "Rainbow"
            },
            text: otuDescriptions,
          };
        var data = [trace]
        Plotly.newPlot("bubble", data)
    });




}

function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json("/names").then(function(sampleNames, error) {
        sampleNames.forEach(function(sample) {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });

        // Use the first sample from the list to build the initial plots
        const firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
        });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
