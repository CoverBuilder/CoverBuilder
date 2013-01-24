/*

--------------------------------------------

	CB_Break_Frames.jsx          	(CoverBuilder Helper)
	An InDesign CS5 Javascript      (Tested in CS6)
	Version 0.1 Alpha
	
	Bruno Herfst 2013
	mail@brunoherfst.com
	
	This script breaks graphic frames over pages using pathfinder commands.

--------------------------------------------

*/
#target InDesign;



//////////////
// SETTINGS //
//////////////
doTextFrames = false;



//Make certain that user interaction (display of dialogs, etc.) is turned on.
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;

if (app.documents.length != 0) {
	//global vars
    var myCover = app.activeDocument;
    if(breakSpreadsOn(myCover)) {
    	alert("Done!");
    }
} else {
	alert("Can’t find any open documents.");
}

function breakSpreadsOn(myCover){
	var ruleror = myCover.viewPreferences.rulerOrigin;
	myCover.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;

	//For all spreads
	var spreadsLen = myCover.spreads.length;
	for (i=spreadsLen-1; i>=0; i--){
		var myPages = new Array();
		//For all pages
		var pagesLen = myCover.spreads[i].pages.length;
		for (j=pagesLen-1; j>=0; j--){
			myPages.push(myCover.spreads[i].pages[j]);
		}
		if(myPages.length > 1) {
			breakFramesTo(myPages);
		}
	}
	myCover.viewPreferences.rulerOrigin = ruleror;
	return true;
}

function cleanPageItems(items){
	for (i = items.length-1; i>=0; i--) {
		switch(items[i].constructor.name){
			case "PDF":
				 //lines need a bounds reset.
				items.splice(i,1);
				break;
			case "GraphicLine":
				 //lines need a bounds reset.
				items.splice(i,1);
				break;
			case "TextFrame":
				if(!doTextFrames){
					items.splice(i,1);
				}
				break;
			default:
				break;
		}
	}
	return items;
}

function breakFramesTo(myPages){
	for ( page=myPages.length-1; page>=0; page-- ) {
		var myPage 			= myPages[page];
		var myPageItems		= cleanPageItems(myPages[page].allPageItems);
		
		if(page == 0){
			var myFrameBounds	= getBounds(myPage,1);
		} else if (page == myPages.length-1){
			var myFrameBounds	= getBounds(myPage,3);
		} else {
			var myFrameBounds	= getBounds(myPage,2);
		}

		//For all page items
		var itemLen = myPageItems.length;
		for (item=itemLen-1; item>=0; item--){
			var myItem = myPageItems[item];
			var myLayer = myItem.itemLayer;
			//make sure layer is unlocked
			var myLayerLock = myLayer.locked;
			if(myLayerLock){
				myLayer.locked = false;
			}

			/////////////////////////////////////////////////
			// WE CAN NOW FINALLY PLAY WITH THE PATHFINDER //
			/////////////////////////////////////////////////
			var myDupItem = myItem.duplicate();
			var rect = myPage.rectangles.add(myLayer,{geometricBounds:myFrameBounds, fillColor:"None", strokeColor:"None"});

			var subbool = true;
			try {
				rect.subtractPath(myDupItem);
			} catch(e) {
				//alert(e.description);
				subbool = false;
				myDupItem.remove();
				rect.remove();
			}
			
			if(subbool){
				//draw the rect again
				rect = myPage.rectangles.add(myLayer,{geometricBounds:myFrameBounds, fillColor:"None", strokeColor:"None"});
				rect.sendToBack();
				try {
					rect.intersectPath(myItem);
				} catch(e) {
					alert(e.description);
				}
			}
			/////////////////////////////////////////////////

			//set original lock
			if(myLayerLock){
				myLayer.locked = true;
			}
		}
	}
}

function getBounds(myPage,selector){
	var myBleedBounds = myPage.bounds; //[y1, x1, y2, x2]
	//get doc bleed settings
	var bBot 	= myCover.documentPreferences.documentBleedBottomOffset;
	var bTop 	= myCover.documentPreferences.documentBleedTopOffset;
	var bLeft 	= myCover.documentPreferences.documentBleedInsideOrLeftOffset;
	var bRight 	= myCover.documentPreferences.documentBleedOutsideOrRightOffset;

	myBleedBounds[0] -= bTop;
	myBleedBounds[2] += bBot;

	switch (selector){
		case 2:
			return myBleedBounds;
			break;
		case 3:
			myBleedBounds[1] -= bRight;
			return myBleedBounds;
			break;
		case 1:
			myBleedBounds[3] += bLeft;
			return myBleedBounds;
			break;
		default: // Return pagebounds without bleed
            return myPage.bounds;
            break;
	}
}