var assets = ee.data.listAssets('projects/aruba-tdf/assets/1-images/')

var imageNames = assets.assets.map(function (asset) {
    return asset.id.split('/').pop();  // Split by '/' and get the last part
});

imageNames = imageNames.reverse()

// Define the folders
var folderImages = 'projects/aruba-tdf/assets/1-images/';
var folderClass = 'projects/aruba-tdf/assets/2-mainClasses/';
var folderHerb = 'projects/aruba-tdf/assets/3-subClasses/Herbaceous_wetland/';
var folderTree = 'projects/aruba-tdf/assets/3-subClasses/Tree_cover/';
var folderSparse = 'projects/aruba-tdf/assets/3-subClasses/Sparse/';
var folderBuild = 'projects/aruba-tdf/assets/3-subClasses/Build_environment/';

// Define the region of interest (roi)
var roi = crudeBorders

// Visualization parameters for Landsat images
var sentinel2Vis = {
    bands: ['B4', 'B3', 'B2'],  // Red, Green, Blue for Sentinel-2
    min: 0,
    max: 3500,  // Reflectance values range
};

// Define the class palette in JavaScript
var classPalette = [
    '0000FF', // Permanent Water: Blue
    'ff0cf6', // Mangroves: Purple
    '00FF00', // Herbaceous wetland: Bright Green
    '008000', // Tree Cover: Dark Green
    'A52A2A', // Shrubland: Brown
    'FFFF00', // Bare or sparse vegetation: Yellow
    '808080'  // Built environment: Grey
];

// Define the visualization parameters
var classVis = {
    min: 0,
    max: 6,
    palette: classPalette
};

// Logical names for classVis
var classNames = [
    'Permanent Water',
    'Mangroves',
    'Herbaceous wetland',
    'Tree Cover',
    'Shrubland',
    'Bare or sparse vegetation',
    'Built environment'
];

var vis;
var subClassNames;
var subClassPalette;

var herbPalette = [
    '00FF00',  // Dam/Tanki: Deep Sky Blue
    'A9A9A9',  // Salina: Light Blue
    '228B22'   // Wetland_Other: Forest Green
];

var herbVis = {
    min: 0,
    max: 2,
    palette: herbPalette
};

// Logical names for herbVis
var herbNames = [
    'Dam & Tanki',
    'Salina',
    'Wetland Other'
];

var treePalette = [
    '556B2F',  // Cactus_Dominated: Dark Olive Green
    '3CB371'   // Deciduous_Dominated: Medium Sea Green
];

var treeVis = {
    min: 0,
    max: 1,
    palette: treePalette
};

// Logical names for treeVis
var treeNames = [
    'Cactus Dominated',
    'Deciduous Dominated'
];

var sparsePalette = [
    '282828',  // Quarry: Dark Orange
    'DC143C',  // Degraded_Land: Crimson
    'F4A460',  // Sandcoast: Sandy Brown
    '708090',  // Rockcoast: Slate Gray
    'A0522D',  // Rockformations: Sienna
    '9932CC'   // Dead Mangrove: Dark Orchid
];

var sparseVis = {
    min: 0,
    max: 5,
    palette: sparsePalette
};

// Logical names for sparseVis
var sparseNames = [
    'Quarry',
    'Degraded Land',
    'Sand coast',
    'Rock coast',
    'Rock formations',
    'Dead Mangrove'
];

var buildPalette = [
    '000000',  // Road: Black
    'FF0000',  // Building: Red
    '1E90FF'   // Sportfield: Dodger Blue
];

var buildVis = {
    min: 0,
    max: 2,
    palette: buildPalette
};

// Logical names for buildVis
var buildNames = [
    'Road',
    'Building',
    'Sportfield'
];

// Function to get image IDs from a folder
function getImagesFromFolder(folder) {
    var images = ee.data.listAssets(folder).assets;
    return images;
}

// Get images from the folders
var imagesFolderImages = getImagesFromFolder(folderImages);
var imagesFolderClass = getImagesFromFolder(folderClass);
var imagesFolderHerb = getImagesFromFolder(folderHerb);
var imagesFolderTree = getImagesFromFolder(folderTree);
var imagesFolderSparse = getImagesFromFolder(folderSparse);
var imagesFolderBuild = getImagesFromFolder(folderBuild);

// Create a panel to hold the UI components
var panel = ui.Panel({
    style: { width: '400px', position: 'bottom-right' }
});

// Add title to the panel
panel.add(ui.Label({
    value: 'Display Resulting Maps',
    style: { fontSize: '20px', fontWeight: 'bold' }
}));

// Create labels for the dropdowns
var labelImages = ui.Label('Composite satellite images:');
var labelClass = ui.Label('Main classes:');
var labelHerb = ui.Label('Herbaceous wetland subclasses:');
var labelTree = ui.Label('Tree cover subclasses:');
var labelSparse = ui.Label('Sparse subclasses:');
var labelBuild = ui.Label('Build environment subclasses:');

//------- Create the yearly picture dropdown -------------//
var legend = ui.Panel({
    style: {
        position: 'bottom-left',
        padding: '8px 15px'
    }
});
Map.add(legend);

var imageSelectImage = ui.Select({
    items: imageNames,
    placeholder: 'Select an image',
    onChange: function (selected) {
        legend.clear()
        // Find the selected image by its formatted name
        var selectedIndex = imageNames.indexOf(selected);
        var selectedImage = ee.Image(imagesFolderImages[selectedIndex].id);

        // Clear only the map layers, keep the UI components
        Map.layers().reset();

        // Add the composite image to the map
        Map.addLayer(selectedImage, sentinel2Vis, selected);
    }
});

// Create dropdowns for all images
var imageSelectClass = ui.Select({
    items: imageNames,
    placeholder: 'Select an image',
    onChange: function (selected) {
        // Find the selected image by its formatted name
        var selectedIndex = imageNames.indexOf(selected);
        var selectedImage = ee.Image(imagesFolderClass[selectedIndex].id);

        // Clear only the map layers, keep the UI components
        Map.layers().reset();

        // Add the selected image to the map
        Map.addLayer(selectedImage, classVis, selected);
        makeLegend('Classes', classNames, classPalette);
    }
});

var imageSelectHerb = ui.Select({
    items: imageNames,
    placeholder: 'Select an image',
    onChange: function (selected) {

        // Find the selected image by its formatted name
        var selectedIndex = imageNames.indexOf(selected);
        var selectedImage = ee.Image(imagesFolderHerb[selectedIndex].id);

        // Clear only the map layers, keep the UI components
        Map.layers().reset();

        vis = herbVis; subClassNames = herbNames; subClassPalette = herbPalette;


        // Add the selected image to the map
        Map.addLayer(selectedImage, vis, selected);
        makeLegend('Subclasses', subClassNames, subClassPalette);
    }
});

var imageSelectTree = ui.Select({
    items: imageNames,
    placeholder: 'Select an image',
    onChange: function (selected) {

        // Find the selected image by its formatted name
        var selectedIndex = imageNames.indexOf(selected);
        var selectedImage = ee.Image(imagesFolderTree[selectedIndex].id);

        // Clear only the map layers, keep the UI components
        Map.layers().reset();

        vis = treeVis; subClassNames = treeNames; subClassPalette = treePalette;

        // Add the selected image to the map
        Map.addLayer(selectedImage, vis, selected);
        makeLegend('Subclasses', subClassNames, subClassPalette);
    }
});

var imageSelectSparse = ui.Select({
    items: imageNames,
    placeholder: 'Select an image',
    onChange: function (selected) {

        // Find the selected image by its formatted name
        var selectedIndex = imageNames.indexOf(selected);
        var selectedImage = ee.Image(imagesFolderSparse[selectedIndex].id);

        // Clear only the map layers, keep the UI components
        Map.layers().reset();

        vis = sparseVis; subClassNames = sparseNames; subClassPalette = sparsePalette;

        // Add the selected image to the map
        Map.addLayer(selectedImage, vis, selected);
        makeLegend('Subclasses', subClassNames, subClassPalette);
    }
});

var imageSelectBuild = ui.Select({
    items: imageNames,
    placeholder: 'Select an image',
    onChange: function (selected) {

        // Find the selected image by its formatted name
        var selectedIndex = imageNames.indexOf(selected);
        var selectedImage = ee.Image(imagesFolderBuild[selectedIndex].id);

        // Clear only the map layers, keep the UI components
        Map.layers().reset();

        vis = buildVis; subClassNames = buildNames; subClassPalette = buildPalette;

        // Add the selected image to the map
        Map.addLayer(selectedImage, vis, selected);
        makeLegend('Subclasses', subClassNames, subClassPalette);
    }
});

// Create horizontal panels to hold the labels and dropdowns
var horizontalPanel1 = ui.Panel({
    widgets: [labelImages, imageSelectImage],
    layout: ui.Panel.Layout.flow('horizontal')
});
var horizontalPanel2 = ui.Panel({
    widgets: [labelClass, imageSelectClass],
    layout: ui.Panel.Layout.flow('horizontal')
});

var horizontalPanel3 = ui.Panel({
    widgets: [labelHerb, imageSelectHerb],
    layout: ui.Panel.Layout.flow('horizontal')
});

var horizontalPanel4 = ui.Panel({
    widgets: [labelTree, imageSelectTree],
    layout: ui.Panel.Layout.flow('horizontal')
});

var horizontalPanel5 = ui.Panel({
    widgets: [labelSparse, imageSelectSparse],
    layout: ui.Panel.Layout.flow('horizontal')
});

var horizontalPanel6 = ui.Panel({
    widgets: [labelBuild, imageSelectBuild],
    layout: ui.Panel.Layout.flow('horizontal')
});

var makeLegend = function (title, labels, colors) {
    legend.clear()
    // Create the legend title
    var legendTitle = ui.Label({
        value: title,
        style: {
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '0 0 4px 0',
            padding: '0'
        }
    });

    // Add the title to the panel
    legend.add(legendTitle);

    // Function to create a row in the legend
    var makeRow = function (color, name) {
        // Create the color box
        var colorBox = ui.Label({
            style: {
                backgroundColor: color,
                padding: '8px',
                margin: '0 0 4px 0'
            }
        });

        // Create the label
        var description = ui.Label({
            value: name,
            style: { margin: '0 0 4px 6px' }
        });

        // Return the panel
        return ui.Panel({
            widgets: [colorBox, description],
            layout: ui.Panel.Layout.Flow('horizontal')
        });
    };

    // Add color and names to the legend
    for (var i = 0; i < labels.length; i++) {
        legend.add(makeRow(colors[i], labels[i]));
    }

}

// Add the horizontal panels to the main panel
panel.add(horizontalPanel1);
panel.add(horizontalPanel2);
panel.add(horizontalPanel3);
panel.add(horizontalPanel4);
panel.add(horizontalPanel5);
panel.add(horizontalPanel6);

// ////// --------------- showing indicators ----------------- ///////////////
// var arubanSize = 180.56

// // create popup
// function createPopup(message) {
//   popupPanel.clear();

//   var popup = ui.Label({
//     value: message,
//     style: {
//       position: 'top-center',
//       padding: '8px',
//       fontSize: '16px',
//       color: 'black',
//       backgroundColor: 'white'
//     }
//   });

//   popupPanel.add(popup);
// }

// // Calculate Feature Areas
// function calculate_area5000(feature) {
//   var landcover = feature.get('landcover');

//   // Check if landcover is 1
//   if (ee.Number(landcover).eq(1)) {
//     // Calculate area in square meters with a maximum error of 10 meters
//     var area = feature.geometry().area(10);

//     // Check if the area is greater than 5000m2 as desired from sdg def
//     if (area.gt(5000)) {
//       return ee.Feature(null, {'area': area});
//     }
//   }

//   // Return a feature with area 0 if conditions are not met
//   return ee.Feature(null, {'area': 0});
// }

// function calculate_area(feature) {
//   var landcover = feature.get('landcover');
//   // Check if landcover is 1
//   if (ee.Number(landcover).eq(1)) {
//     // Calculate area in square meters with a maximum error of 10 meters
//     var area = feature.geometry().area(10);

//     return ee.Feature(null, {'area': area});
//   }

//   // Return a feature with area 0 if conditions are not met
//   return ee.Feature(null, {'area': 0});
// }

// var areas;
// // Calculate total areas
// function getAreaClass(image, classPos, SDG1511constraint) {
//   var maskedImage = image.updateMask(image.select('classification').eq(classPos));

//   var vectorImage = maskedImage.addBands(image).reduceToVectors({
//     geometry: roi,
//     crs: image.projection(),
//     scale: 30,
//     geometryType: 'polygon',
//     eightConnected: false,
//     labelProperty: 'landcover',
//     reducer: ee.Reducer.mean()
//   });

//   if (SDG1511constraint) {areas = vectorImage.map(calculate_area5000);}
//   else {areas = vectorImage.map(calculate_area);}
//   var totalArea = areas.aggregate_sum('area');
//   return totalArea
// }

// // SDG 15.1.1
// var SDG1511Int = ui.Select({
//   items: imageNames,
//   placeholder: 'Select a year',
//   onChange: function(selected) {
//     var formattedDate = selected + '-07'
//     var classImage = ee.Image('projects/aruba-tdf/assets/classImages/' + formattedDate);
//     var TreeImage = ee.Image('projects/aruba-tdf/assets/subClassImages/' + formattedDate + '_Tree_Cover');

//     var totalArea;
//     var mangroveArea = getAreaClass(classImage, 1, true).getInfo()
//     var decidArea = getAreaClass(TreeImage, 1, true).getInfo()

//     totalArea = mangroveArea + decidArea

//     var SDG = (totalArea/1000000/arubanSize*100).toFixed(2)
//     var message = 'International SDG 15.1.1 for ' + formattedDate.split('-')[0] + ' = ' + SDG + "%"
//     createPopup(message);
//   }
// });

// // SDG 15.1.1
// var SDG1511Loc = ui.Select({
//   items: imageNames,
//   placeholder: 'Select a year',
//   onChange: function(selected) {
//     var formattedDate = selected + '-07'
//     var classImage = ee.Image('projects/aruba-tdf/assets/classImages/' + formattedDate);
//     var TreeImage = ee.Image('projects/aruba-tdf/assets/subClassImages/' + formattedDate + '_Tree_Cover');

//     var totalArea;
//     var mangroveArea = getAreaClass(classImage, 1, true).getInfo()
//     var decidArea = getAreaClass(TreeImage, 1, true).getInfo()
//     var cactusArea = getAreaClass(TreeImage, 0, true).getInfo()

//     totalArea = mangroveArea + decidArea + cactusArea

//     var SDG = (totalArea/1000000/arubanSize*100).toFixed(2)

//     var message = 'Local SDG 15.1.1 for ' + formattedDate.split('-')[0] + ' = ' + SDG + "%"
//     createPopup(message);
//   }
// });

// // SDG 15.3.1
// var SDG1531 = ui.Select({
//   items: imageNames,
//   placeholder: 'Select a year',
//   onChange: function(selected) {
//     var formattedDate = selected + '-07'
//     var sparseImage = ee.Image('projects/aruba-tdf/assets/subClassImages/' + formattedDate + '_Sparse');
//     var buildImage = ee.Image('projects/aruba-tdf/assets/subClassImages/' + formattedDate + '_Build_Environment');


//     var quarryArea = getAreaClass(sparseImage, 0, false).getInfo()
//     var degrArea = getAreaClass(sparseImage, 1, false).getInfo()
//     var deadArea = getAreaClass(sparseImage, 5, false).getInfo()
//     var sportfieldArea = getAreaClass(buildImage, 2, false).getInfo()

//     var totalArea = quarryArea + degrArea + deadArea + sportfieldArea

//     var SDG = (totalArea/1000000/arubanSize*100).toFixed(2)

//     var message = 'SDG 15.3.1 for ' + formattedDate.split('-')[0] + ' = ' + SDG + "%"
//     createPopup(message);
//   }
// });

// // GBF A.2
// var GBFA2 = ui.Select({
//   items: imageNames,
//   placeholder: 'Select a year',
//   onChange: function(selected) {
//     var formattedDate = selected + '-07'
//     var classImage = ee.Image('projects/aruba-tdf/assets/classImages/' + formattedDate);
//     var sparseImage = ee.Image('projects/aruba-tdf/assets/subClassImages/' + formattedDate + '_Sparse');

//     var mangroveArea = getAreaClass(classImage, 1, false).getInfo()
//     var herbArea = getAreaClass(classImage, 2, false).getInfo()
//     var treeArea = getAreaClass(classImage, 3, false).getInfo()
//     var shrubArea = getAreaClass(classImage, 4, false).getInfo()

//     var sandcoastArea = getAreaClass(sparseImage, 2, false).getInfo()
//     var rockcoastArea = getAreaClass(sparseImage, 3, false).getInfo()
//     var rockformArea = getAreaClass(sparseImage, 4, false).getInfo()

//     var totalArea = mangroveArea + herbArea + treeArea + shrubArea + sandcoastArea + rockcoastArea + rockformArea

//     var SDG = (totalArea/1000000/arubanSize*100).toFixed(2)

//     var message = 'GBF A.2 for ' + formattedDate.split('-')[0] + ' = ' + SDG + "%"
//     createPopup(message);
//   }
// });

// // add to main panel
// var labelSDG1511Int = ui.Label('SDG 15.1.1 International:');
// var horizontalPanel4 = ui.Panel({
//   widgets: [labelSDG1511Int, SDG1511Int],
//   layout: ui.Panel.Layout.flow('horizontal')
// });
// panel.add(horizontalPanel4)

// var labelSDG1511Loc = ui.Label('SDG 15.1.1 Local:');
// var horizontalPanel5 = ui.Panel({
//   widgets: [labelSDG1511Loc, SDG1511Loc],
//   layout: ui.Panel.Layout.flow('horizontal')
// });
// panel.add(horizontalPanel5)

// var labelSDG1531 = ui.Label('SDG 15.3.1:');
// var horizontalPanel6 = ui.Panel({
//   widgets: [labelSDG1531, SDG1531],
//   layout: ui.Panel.Layout.flow('horizontal')
// });
// panel.add(horizontalPanel6)

// var labelGBFA2 = ui.Label('GBF A.2:');
// var horizontalPanel7 = ui.Panel({
//   widgets: [labelGBFA2, GBFA2],
//   layout: ui.Panel.Layout.flow('horizontal')
// });
// panel.add(horizontalPanel7)

// Create a global UI panel to hold the popup
// var popupPanel = ui.Panel({
//   style: {
//     position: 'top-center',
//     padding: '8px',
//     fontSize: '16px',
//     color: 'black',
//     backgroundColor: 'white'
//   }
// });

// // Add the popup panel to the map
// Map.add(popupPanel);

// Add the main panel to the map
ui.root.insert(1, panel);

// Center the map to a specific location (optional)
Map.setCenter(-69.978, 12.516, 10); // Adjust coordinates and zoom level as needed
