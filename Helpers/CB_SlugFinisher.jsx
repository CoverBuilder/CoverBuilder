/*

--------------------------------------------

	CB_SlugFinisher.jsx    			(A CoverBuilder Helper Script)
	An InDesign CS5 Javascript      (Tested in CS6)
	Version 0.9 Beta
	
	Bruno Herfst 2013

--------------------------------------------

*/

#target InDesign;

var myCMYKSwatches = [{
    name: "Cyan"
}, {
    name: "Magenta"
}, {
    name: "Yellow"
}, {
    name: "Black"
}];
var myFinishes = [{
    name: "Lamination (Gloss)"
}, {
    name: "Lamination (Matte)"
}, {
    name: "Lamination (Silk)"
}, {
    name: "Lamination (Satin)"
}, {
    name: "Varnish (Gloss)"
}, {
    name: "Varnish (Matte)"
}];

try {
    if (app.documents.length != 0) {
        //global vars
        var myDoc = app.activeDocument;
        main();
    } else {
        alert("Please open a document and try again.");
    }
} catch (err) {
    var txt = err.description;
    alert(txt);
    exit();
}


function main() {
    if (app.selection.length != 0) {
        mS = myDoc.selection[0];
        if (mS.constructor.name == "TextFrame") {
            var swatchOBJ = finischUI(getSpotSwatches());
            //alert(swatchOBJ.process);
            setText(mS, swatchOBJ);
        } else {
            alert("This is a " + app.activeDocument.selection[0].constructor.name + "\nPlease select a TextFrame");
            exit();
        }
    } else {
        alert("Nothing selected\nPlease select a TextFrame");
        exit();
    }
}

function getSpotSwatches() {
    mySwatches = myDoc.swatches;
    var i = mySwatches.length - 1;
    var spotSwatches = [];
    while (i--) {
        if (mySwatches[i + 1].model == ColorModel.SPOT) {
            spotSwatches.push(mySwatches[i + 1]);
        }
    }
    return spotSwatches;
}

function finischUI(mySpotSwatches) {
    var i = mySpotSwatches.length;
    var mySpotCheckboxes = new Array();
    var myCMYKCheckboxes = new Array();
    var myFinishRadio = null;

    var myDialog = app.dialogs.add({
        name: "Insert Colours and Finish",
        canCancel: true
    });
    with(myDialog) {
        with(dialogColumns.add()) {
            with(dialogRows.add()) {
                // P R O C E S S
                with(borderPanels.add()) {
                    staticTexts.add({
                        staticLabel: "PROCESS:"
                    });
                    with(dialogColumns.add()) {

                        for (myCounter = 0; myCounter < myCMYKSwatches.length; myCounter++) {
                            var myCheckbox;
                            myCMYKCheckboxes.push(myCheckbox);
                            myCMYKCheckboxes[myCounter] = checkboxControls.add({
                                staticLabel: myCMYKSwatches[myCounter].name,
                                checkedState: true
                            });
                        }
                    }
                }
                // S P O T
                with(borderPanels.add()) {
                    staticTexts.add({
                        staticLabel: "SPOT:"
                    });
                    with(dialogColumns.add()) {
                        for (myCounter = 0; myCounter < i; myCounter++) {
                            var myCheckbox;
                            mySpotCheckboxes.push(myCheckbox);
                            mySpotCheckboxes[myCounter] = checkboxControls.add({
                                staticLabel: mySpotSwatches[myCounter].name,
                                checkedState: true
                            });
                        }
                    }
                }
                // F I N I S H
                with(borderPanels.add()) {
                    staticTexts.add({
                        staticLabel: "FINISH:"
                    });
                    with(dialogColumns.add()) {
                        with(myFinishRadio = radiobuttonGroups.add()) {
                            for (myCounter = 0; myCounter < myFinishes.length; myCounter++) {
                                radiobuttonControls.add({
                                    staticLabel: myFinishes[myCounter].name,
                                    checkedState: false
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    //Display the dialog box.
    if (myDialog.show() == true) {
        //Get process
        var i = myCMYKCheckboxes.length;
        var processSwatches = [];
        while (i--) {
            if (myCMYKCheckboxes[i].checkedState == true) {
                processSwatches.push(myCMYKSwatches[i].name);
            }
        }
        //Get Spot
        var i = mySpotCheckboxes.length;
        var spotSwatches = [];
        while (i--) {
            if (mySpotCheckboxes[i].checkedState == true) {
                spotSwatches.push(mySpotSwatches[i].name);
            }
        }
        //Get Finish
        var myFinishSelect = new Array();
        if (myFinishRadio.selectedButton >= 0) {
            myFinishSelect.push(myFinishes[myFinishRadio.selectedButton].name);
        }
        return {
            process: processSwatches,
            spot: spotSwatches,
            finish: myFinishSelect
        }
    }
}

function setText(tf, swatchOBJ) {
    var tempString = "";
    var first = true;
    tf.contents = "";

    if (swatchOBJ.process.length > 0) {
        myColorAdd(myDoc, "CB_Cyan", ColorModel.PROCESS, [100, 0, 0, 0]);
        myColorAdd(myDoc, "CB_Magenta", ColorModel.PROCESS, [0, 100, 0, 0]);
        myColorAdd(myDoc, "CB_Yellow", ColorModel.PROCESS, [0, 0, 100, 0]);
        myColorAdd(myDoc, "CB_Black", ColorModel.PROCESS, [0, 0, 0, 100]);

        var i = swatchOBJ.process.length;
        while (i--) {
            if (!first) {
                insertPoint = tf.insertionPoints[-1].index;
                tf.contents += " + ";
                addonText = tf.characters.itemByRange(tf.insertionPoints[insertPoint],
                    tf.insertionPoints[-1]);
                addonText.fillColor = "Registration";
                addonText.fontStyle = "Regular";
            }
            insertPoint = tf.insertionPoints[-1].index;
            tf.contents += swatchOBJ.process[i];
            addonText = tf.characters.itemByRange(tf.insertionPoints[insertPoint],
                tf.insertionPoints[-1]);
            addonText.fillColor = "CB_" + swatchOBJ.process[i];
            addonText.fontStyle = "Bold";
            var first = false;
        }
    }

    if (swatchOBJ.spot.length > 0) {
        var i = swatchOBJ.spot.length;
        while (i--) {
            if (!first) {
                insertPoint = tf.insertionPoints[-1].index;
                tf.contents += " + ";
                addonText = tf.characters.itemByRange(tf.insertionPoints[insertPoint],
                    tf.insertionPoints[-1]);
                addonText.fillColor = "Registration";
                addonText.fontStyle = "Regular";
            }
            insertPoint = tf.insertionPoints[-1].index;
            tf.contents += swatchOBJ.spot[i];
            addonText = tf.characters.itemByRange(tf.insertionPoints[insertPoint],
                tf.insertionPoints[-1]);
            addonText.fillColor = swatchOBJ.spot[i];
            addonText.fontStyle = "Bold";
            var first = false;
        }
    }
    if (swatchOBJ.finish.length > 0) {
        var i = swatchOBJ.finish.length;
        while (i--) {
            if (!first) {
                insertPoint = tf.insertionPoints[-1].index;
                tf.contents += " + ";
                addonText = tf.characters.itemByRange(tf.insertionPoints[insertPoint],
                    tf.insertionPoints[-1]);
                addonText.fillColor = "Registration";
                addonText.fontStyle = "Regular";
            }
            insertPoint = tf.insertionPoints[-1].index;
            tf.contents += swatchOBJ.finish[i];
            addonText = tf.characters.itemByRange(tf.insertionPoints[insertPoint],
                tf.insertionPoints[-1]);
            addonText.fillColor = "Registration";
            addonText.fontStyle = "Bold";
            var first = false;
        }
    }


}

//This awesome function found here: http://tomaxxi.com/2010/09/quicktip-add-custom-cmykrgbhex-colors-to-document/
//Example: myColorAdd(myDoc, "My New Colour", ColorModel.PROCESS, [16,0,0,55]);
function myColorAdd(myDocument, myColorName, myColorModel, myColorValue) {
    if (myColorValue instanceof Array == false) {
        myColorValue = [(parseInt(myColorValue, 16) >> 16) & 0xff, (parseInt(myColorValue, 16) >> 8) & 0xff, parseInt(myColorValue, 16) & 0xff];
        myColorSpace = ColorSpace.RGB;
    } else {
        if (myColorValue.length == 3)
            myColorSpace = ColorSpace.RGB;
        else
            myColorSpace = ColorSpace.CMYK;
    }
    try {
        myColor = myDocument.colors.item(myColorName);
        myName = myColor.name;
    } catch (myError) {
        myColor = myDocument.colors.add();
        myColor.properties = {
            name: myColorName,
            model: myColorModel,
            space: myColorSpace,
            colorValue: myColorValue
        };
    }
    return myColor;
}