/*
    CB_Export_Cover.jsx         (A CoverBuilder Helper Script)
    An InDesign JavaScript      (Tested in CS6)
    
    Version 1.0

    Can exports multiple covers (Complete or front cover only):
    [PressReady PDF, HighRes PDF, MidRes PDF, LowRes PDF, HighRes JPG, LowRes JPG]

    Bruno Herfst 2012
    coverbuilder.brunoHerfst.com


====================================================================================================
 Quick overview of settings

=====================================================================================================
|            | PressReady PDF | HighRes PDF  | MidRes PDF   | LowRes PDF | HighRes JPG | LowRes JPG |
|============|================|==============|==============|============|=============|============|
| Colour     | CMYK+SPOT      | CMYK         | CMYK         | RGB        | RGB         | RGB        |
|------------+----------------+--------------+--------------+------------+-------------+------------+
| Resolution | Unchanged      | 300*         | 150*         | 100*       | 300         | 100        |
|------------+----------------+--------------+--------------+------------+-------------+------------+
| Cropmarks  | Yes            | No           | Yes          | No         | No          | No         |
|------------+----------------+--------------+--------------+------------+-------------+------------+
| Bleed      | Yes            | No           | Yes          | No         | No          | No         |
=====================================================================================================

 *Downsamling only
=====================================================================================================

*/

#target InDesign;

///////////////////////
// GLOBAL VARIABLES //
//////////////////////
var myPresets = { thisVersion    : "V1.0" }


main();

//--------------------------------------- F U N C T I O N S -----------------------------------------
//////////
// MAIN //
//////////
function main(){
    //Make certain that user interaction (display of dialogs, etc.) is turned on.
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    if (app.documents.length != 0){
        myPresets.doc = app.activeDocument;

        var myPreflightProcess = myPresets.doc.activeProcess;
        var result = myPreflightProcess.aggregatedResults;
        if(result[2] != ""){
            var PF = confirm("Preflight panel found errors!\nAre you sure you want to continue");
            if(!PF){
                return;
            }
        }

        myPresets.documentName = seperate(myPresets.doc.name,!myPresets.doc.name.match(/\./)); //get rid of extension if there is one
        myPresets.slug = myPresets.doc.documentPreferences.documentBleedTopOffset+5; //I could use slug but this is better for files not build with CoverBuilder

        //check if cover is build with CoverBuilder
        var myDocXMP = myPresets.doc.metadataPreferences;
        var destNamespace = "http://brunoherfst.com/";
        var destContName = "Settings";
        var myXMP = myDocXMP.getProperty(destNamespace,destContName + "[1]");
        if(myXMP == ""){
            var visit = confirm("This document is not build with CoverBuilder.\nDo you want to download CoverBuilder now?");
            if(visit){
                var linkJumper = File(Folder.temp.fullName+"/contact.html");
                linkJumper.open("w");
                var linkBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=http://coverbuilder.brunoherfst.com/"></head><body> <p></body></html>'
                linkJumper.write(linkBody);
                linkJumper.close();
                linkJumper.execute();
            }
        }

        var orders = getOrders();
        
        if(orders.length > 0 ){
            //get the export location
            var myFolder = Folder.selectDialog ("Where do you want to save these covers?");
            if(myFolder == null){
                alert("Make up your mind!");
                exit();
            }
            myPresets.folder = myFolder;
            var len = orders.length-1;
            for(var order = len; order >= 0; order--){
                if(orders[order].name.match(/PDF/)){
                    var res = orders[order].name.substr(-2);
                    myPresets.order = orders[order];
                    switch (res){
                        case "PR": // Press Ready
                            myPresets.kind = "PR";
                            exportPDF(myPresets);
                            break;
                        case "HR": // High-Res
                            myPresets.kind = "HR";
                            exportPDF(myPresets);
                            break;
                        case "MR": // Mid-Res
                            myPresets.kind = "MR";
                            exportPDF(myPresets);
                            break;
                        case "LR": // Low-Res
                            myPresets.kind = "LR";
                            exportPDF(myPresets);
                            break;
                        default:
                            alert("OOPS");
                            break;
                    }
                } else { //JPG
                    var res = orders[order].name.substr(-2);
                    myPresets.order = orders[order];
                    switch (res){
                        case "HR": // High-Res
                            myPresets.kind = "HR";
                            exportJPG(myPresets);
                            break;
                        case "LR": // Low-Res
                            myPresets.kind = "LR";
                            exportJPG(myPresets);
                            break;
                        default:
                            alert("OOPS");
                            break;
                    }
                }
            }//orders loop
            alert("CoverBuilder Export\nYour files are ready!");
        } //orders check (else: user OKed without selection)
    } else {
        alert ("No documents are open.");
    }
}

function exportPDF(myPresets){
    ///////////////////////////
    // PDF Export Preference //
    ///////////////////////////
    //global vars
    var pdfpref                         = app.pdfExportPreferences;
    var myExportName                    = "CoverBuilder Export";
    var documentName                    = myPresets.documentName;
    //STANDARDS (Press Ready)
    pdfpref.acrobatCompatibility        = AcrobatCompatibility.ACROBAT_4;       //Make sure its a PDF 1.3 (Overprint plates will come out correctly) 
    pdfpref.bleedBottom                 = 0;                                    //using useDocumentBleedWithPDF
    pdfpref.bleedInside                 = 0;                                    //using useDocumentBleedWithPDF
    pdfpref.bleedMarks                  = 0;                                    //using useDocumentBleedWithPDF
    pdfpref.bleedOutside                = 0;                                    //using useDocumentBleedWithPDF
    pdfpref.bleedTop                    = 0;                                    //using useDocumentBleedWithPDF
    pdfpref.colorBars                   = false;                                //these are shit. Better off placing your own
    pdfpref.colorBitmapCompression      = BitmapCompression.NONE;
    pdfpref.colorBitmapSampling         = Sampling.NONE;
    pdfpref.compressTextAndLineArt      = false;                                //if set to true it will render fonts without hinting (YUK!)
    pdfpref.compressionType             = PDFCompressionType.COMPRESS_NONE;
    pdfpref.cropImagesToFrames          = true;                                 //always, can make a file a lot smaller without loss of quality
    pdfpref.cropMarks                   = true;
    pdfpref.exportGuidesAndGrids        = false;                                //ADD TO SETTINGS (can be handy)
    pdfpref.exportLayers                = false;                                //ADD TO SETTINGS (can be handy)
    pdfpref.exportNonprintingObjects    = false;                                //ADD TO SETTINGS (can be handy)
    pdfpref.exportWhichLayers           = ExportLayerOptions.EXPORT_VISIBLE_PRINTABLE_LAYERS; //ADD TO SETTINGS (can be handy)
    pdfpref.generateThumbnails          = true;
    pdfpref.grayscaleBitmapCompression  = BitmapCompression.NONE;
    pdfpref.includeBookmarks            = false;                                //It’s a cover!
    pdfpref.includeHyperlinks           = false;                                //It’s a cover!
    pdfpref.includeICCProfiles          = ICCProfiles.INCLUDE_ALL;              //ADD TO SETTINGS (can be handy)
    pdfpref.includeSlugWithPDF          = true;
    pdfpref.includeStructure            = false;                                //tagged PDF
    pdfpref.monochromeBitmapCompression = MonoBitmapCompression.NONE;
    pdfpref.monochromeBitmapSampling    = Sampling.NONE;
    pdfpref.optimizePDF                 = false;                                //Compresses text and line art (Ugly screen viewing)
    pdfpref.pageInformationMarks        = false;                                //ADD TO SETTINGS (can be handy)
    pdfpref.pageMarksOffset             = myPresets.slug;                       //should be the same as document bleed
    pdfpref.pdfColorSpace               = PDFColorSpace.REPURPOSE_CMYK;            
    pdfpref.pdfMarkType                 = MarkTypes.DEFAULT_VALUE;              //preserve numbers
    pdfpref.printerMarkWeight           = PDFMarkWeight.P125PT;
    pdfpref.registrationMarks           = true;
    pdfpref.standardsCompliance         = PDFXStandards.PDFX1A2001_STANDARD;    
    pdfpref.subsetFontsBelow            = 0;                                    //include whole font (It’s worth the extra bagage)
    pdfpref.useDocumentBleedWithPDF     = true;
    pdfpref.useSecurity                 = false;
    pdfpref.viewJDF                     = false;                                //ADD TO SETTINGS (can be handy)
    pdfpref.viewPDF                     = true;                                 //ADD TO SETTINGS (can be handy)
    pdfpref.omitBitmaps                 = false;                                //please no!
    pdfpref.omitEPS                     = false;                                //please no!
    pdfpref.omitPDF                     = false;                                //please no!
    pdfpref.pdfXProfile                 = PDFProfileSelector.WORKING;
    pdfpref.pdfDestinationProfile       = PDFProfileSelector.WORKING;           //ADD TO SETTINGS (can be handy)
    pdfpref.simulateOverprint           = false;

    var HR_BMP, HR_IMG; //resolution
    switch (myPresets.kind) {
        case "LR":
            pdfpref.standardsCompliance         = PDFXStandards.NONE;                  //RGB
            HR_BMP = 300;
            HR_IMG = 100;
            pdfpref.acrobatCompatibility        = AcrobatCompatibility.ACROBAT_4;      //Make sure its a PDF 1.3 (No transparency) 
            pdfpref.colorBitmapCompression      = BitmapCompression.AUTO_COMPRESSION;  //must come after acrobatCompatibility
            pdfpref.grayscaleBitmapCompression  = BitmapCompression.AUTO_COMPRESSION;
            pdfpref.monochromeBitmapCompression = MonoBitmapCompression.ZIP;
            pdfpref.colorBitmapQuality          = CompressionQuality.HIGH;
            pdfpref.grayscaleBitmapQuality      = CompressionQuality.HIGH;
            pdfpref.colorBitmapSampling         = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.grayscaleBitmapSampling     = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.monochromeBitmapSampling    = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.colorBitmapSamplingDPI      = HR_IMG;
            pdfpref.grayscaleBitmapSamplingDPI  = HR_IMG;
            pdfpref.monochromeBitmapSamplingDPI = HR_BMP;
            thresholdToCompressColor            : HR_IMG;
            thresholdToCompressGray             : HR_IMG;
            thresholdToCompressMonochrome       : HR_BMP;
            pdfpref.compressionType             = PDFCompressionType.COMPRESS_OBJECTS; //good for email
            pdfpref.cropMarks                   = false;
            pdfpref.useDocumentBleedWithPDF     = false;
            pdfpref.registrationMarks           = false;
            pdfpref.generateThumbnails          = false;                               //good for email (smaller size)
            pdfpref.includeSlugWithPDF          = false;
            pdfpref.pdfColorSpace               = PDFColorSpace.RGB;
            pdfpref.pdfDestinationProfile       = "sRGB IEC61966-2.1";                 //ADD TO SETTINGS (can be handy)
            pdfpref.simulateOverprint           = true;                                //PDF 1.3 only
            break;
        case "MR":
            HR_BMP = 600;
            HR_IMG = 150;
            pdfpref.acrobatCompatibility        = AcrobatCompatibility.ACROBAT_4;      //Make sure its a PDF 1.3 (No transparency) 
            pdfpref.colorBitmapCompression      = BitmapCompression.AUTO_COMPRESSION;  //must come after acrobatCompatibility
            pdfpref.grayscaleBitmapCompression  = BitmapCompression.AUTO_COMPRESSION;
            pdfpref.monochromeBitmapCompression = MonoBitmapCompression.ZIP;
            pdfpref.colorBitmapQuality          = CompressionQuality.LOW;
            pdfpref.grayscaleBitmapQuality      = CompressionQuality.LOW;
            pdfpref.colorBitmapSampling         = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.monochromeBitmapSampling    = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.grayscaleBitmapSampling     = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.colorBitmapSamplingDPI      = HR_IMG;
            pdfpref.grayscaleBitmapSamplingDPI  = HR_IMG;
            pdfpref.monochromeBitmapSamplingDPI = HR_BMP;
            thresholdToCompressColor            : HR_IMG;
            thresholdToCompressGray             : HR_IMG;
            thresholdToCompressMonochrome       : HR_BMP;
            pdfpref.simulateOverprint           = true;
            break;
        case "HR":
            HR_BMP = 1200;
            HR_IMG = 300;
            pdfpref.acrobatCompatibility        = AcrobatCompatibility.ACROBAT_4;      //Make sure its a PDF 1.3 (No transparency) 
            pdfpref.colorBitmapCompression      = BitmapCompression.ZIP;               //must come after acrobatCompatibility
            pdfpref.grayscaleBitmapCompression  = BitmapCompression.ZIP;
            pdfpref.monochromeBitmapCompression = MonoBitmapCompression.ZIP;
            pdfpref.colorBitmapQuality          = CompressionQuality.EIGHT_BIT;
            pdfpref.grayscaleBitmapQuality      = CompressionQuality.EIGHT_BIT;
            pdfpref.colorBitmapSampling         = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.monochromeBitmapSampling    = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.grayscaleBitmapSampling     = Sampling.BICUBIC_DOWNSAMPLE;
            pdfpref.colorBitmapSamplingDPI      = HR_BMP;
            pdfpref.grayscaleBitmapSamplingDPI  = HR_BMP;
            pdfpref.monochromeBitmapSamplingDPI = HR_BMP;
            thresholdToCompressColor            : HR_IMG;
            thresholdToCompressGray             : HR_IMG;
            thresholdToCompressMonochrome       : HR_BMP;
            pdfpref.cropMarks                   = false;
            pdfpref.useDocumentBleedWithPDF     = false;
            pdfpref.registrationMarks           = false;
            pdfpref.includeSlugWithPDF          = false;
            pdfpref.simulateOverprint           = true;
            break;
        default:
            HR_BMP = 1200;
            HR_IMG = 300;
            break;
    }

    //////////////////////
    // Flattener Preset //
    //////////////////////
    var flattenerPreset;
    flattenerPreset                         = app.flattenerPresets.itemByName(myExportName);
    if(flattenerPreset != null){
        flattenerPreset.remove();
    }
    flattenerPreset                         = app.flattenerPresets.add( {
        name                                : myExportName,
        rasterVectorBalance                 : FlattenerLevel.LOW,
        lineArtAndTextResolution            : HR_BMP,
        gradientAndMeshResolution           : HR_IMG,
        convertAllTextToOutlines            : false, //looks better on screen
        convertAllStrokesToOutlines         : true,
        clipComplexRegions                  : false
    });

    
    appliedFlattenerPreset                    = myExportName;

    //////////////
    // CVR/CVR1 //
    //////////////
    //-----------START PAGERANGE
    if(myPresets.order.name.match(/CVR1/)){
        pdfpref.pageRange = "3";
        pdfpref.exportReaderSpreads         = false;
        pdfpref.useDocumentBleedWithPDF     = false;
        if(myPresets.documentName.match(/CVR/)){
            documentName.replace(/CVR/,"CVR1");
        } else {
            documentName += "_CVR1_";
        }
    } else {
        pdfpref.pageRange = "All";
        pdfpref.exportReaderSpreads = true;
        if(!myPresets.documentName.match(/CVR/)){
            documentName += "_CVR_";
        }
    }
    //-----------END PAGERANGE

    //////////
    // FILE //
    //////////
    var res = myPresets.order.name.substr(-2);
    documentName += res;
    var myFilePath = myPresets.folder + "/" + documentName + ".pdf";
    var myFile = new File(myFilePath);

    //EXPORT PDF
    myPresets.doc.exportFile(ExportFormat.PDF_TYPE, File(myFile), false);
}

function exportJPG(myPresets){
    ///////////////////////////
    // JPG Export Preference //
    ///////////////////////////
    //global vars
    var documentName                    = myPresets.documentName;
    var jpgpref                         = app.jpegExportPreferences;

    //STANDARDS
    jpgpref.antiAlias                   = true;
    jpgpref.embedColorProfile           = true;
    jpgpref.jpegColorSpace              = JpegColorSpaceEnum.RGB;
    jpgpref.jpegRenderingStyle          = JPEGOptionsFormat.BASELINE_ENCODING;
    jpgpref.simulateOverprint           = true;
    jpgpref.useDocumentBleeds           = false;

    var eProofLayer = null; //If e-PROOF
    try{
        eProofLayer = myPresets.doc.layers.item("E-PROOF");
        if(eProofLayer.isValid){
            eProofLayer.printable = true;
        }
    } catch(e) {
        alert(e.description);
    }

    var HR_IMG; //resolution
    switch (myPresets.kind) {
        case "HR":
            HR_IMG = 300;
            jpgpref.jpegQuality         = JPEGOptionsQuality.MAXIMUM;
            break;
        case "LR":
            HR_IMG = 100;
            jpgpref.jpegQuality         = JPEGOptionsQuality.HIGH;
            break;
    }
    
    jpgpref.exportResolution            = HR_IMG;

    //////////////
    // CVR/CVR1 //
    //////////////
    //-----------START PAGERANGE
    if(myPresets.order.name.match(/CVR1/)){
        jpgpref.jpegExportRange         = ExportRangeOrAllPages.EXPORT_RANGE;
        jpgpref.pageString              = "3";
        jpgpref.exportingSpread         = false;
        if(myPresets.documentName.match(/CVR/)){
            documentName.replace(/CVR/,"CVR1");
        } else {
            documentName += "_CVR1_";
        }
    } else {
        jpgpref.jpegExportRange         = ExportRangeOrAllPages.EXPORT_ALL;
        jpgpref.pageString              = "1-3";
        jpgpref.exportingSpread         = true;
        if(!myPresets.documentName.match(/CVR/)){
            documentName += "_CVR_";
        }
    }
    //-----------END PAGERANGE

    //////////
    // FILE //
    //////////
    var res = myPresets.order.name.substr(-2);
    documentName += res;
    var myFilePath = myPresets.folder + "/" + documentName + ".jpg";
    var myFile = new File(myFilePath);

    //EXPORT JPG
    myPresets.doc.exportFile(ExportFormat.JPG, myFile, false);
    if(eProofLayer != null){
        eProofLayer.printable = false;
    }
}

/////////////
// HELPERS //
/////////////
function seperate(myFileName,extension) {
    if (extension == true){
        return myFileName.replace(/^.*\./,'');
    } else {
        return myFileName.replace(/.[^.]+$/,'');
    }
}

////////////
// DIALOG //
////////////
function getOrders() {
    var myWin = new Window ("dialog","CoverBuilder Export "+myPresets.thisVersion);
    myWin.orientation = "row";
    myWin.alignChildren = "top";

        var td10 = myWin.add ("group");
            td10.orientation = "column";
            td10.add ("statictext", [0,0,40,20], "CVR");
            var check_CVR_PDF_PR = td10.add ("checkbox", [0,0,40,20], "");
            var check_CVR_PDF_HR = td10.add ("checkbox", [0,0,40,20], "");
            var check_CVR_JPG_HR = td10.add ("checkbox", [0,0,40,20], "");
            var check_CVR_PDF_MR = td10.add ("checkbox", [0,0,40,20], "");
            var check_CVR_PDF_LR = td10.add ("checkbox", [0,0,40,20], "");
            var check_CVR_JPG_LR = td10.add ("checkbox", [0,0,40,20], "");

        var td20 = myWin.add ("group");
            td20.orientation = "column";
            td20.add ("statictext", [0,0,40,20], "CVR1");
            td20.add ("statictext", [0,0,40,20], "");
            var check_CVR1_PDF_HR = td20.add ("checkbox", [0,0,40,20], "");
            var check_CVR1_JPG_HR = td20.add ("checkbox", [0,0,40,20], "");
            var check_CVR1_PDF_MR = td20.add ("checkbox", [0,0,40,20], "");
            var check_CVR1_PDF_LR = td20.add ("checkbox", [0,0,40,20], "");
            var check_CVR1_JPG_LR = td20.add ("checkbox", [0,0,40,20], "");

        var td00 = myWin.add ("group");
            td00.orientation = "column";
            td00.alignChildren = "right";
            td00.add ("statictext", [0,0,120,20], "");
            td00.add ("statictext", [0,0,120,20], "PDF Press-Ready");
            td00.add ("statictext", [0,0,120,20], "PDF High-Res");
            td00.add ("statictext", [0,0,120,20], "JPG High-Res");
            td00.add ("statictext", [0,0,120,20], "PDF Mid-Res");
            td00.add ("statictext", [0,0,120,20], "PDF Low-Res");
            td00.add ("statictext", [0,0,120,20], "JPG Low-Res");

        var td30 = myWin.add ("group");
            td30.orientation = "column";
            td30.add ("button", [0,0,80,20], "OK");
            td30.add ("button", [0,0,80,20], "Cancel");
            //td30.add ("button", [0,0,80,20], "Settings");
    
    var orders = new Array(),
        myReturn = myWin.show();
    if (myReturn == true){
            //CVR
            orders.push({name : "CVR_PDF_PR", state : check_CVR_PDF_PR.value});
            orders.push({name : "CVR_PDF_HR", state : check_CVR_PDF_HR.value});
            orders.push({name : "CVR_PDF_MR", state : check_CVR_PDF_MR.value});
            orders.push({name : "CVR_PDF_LR", state : check_CVR_PDF_LR.value});
            orders.push({name : "CVR_JPG_HR", state : check_CVR_JPG_HR.value});
            orders.push({name : "CVR_JPG_LR", state : check_CVR_JPG_LR.value});
            //CVR1
            orders.push({name : "CVR1_PDF_HR", state : check_CVR1_PDF_HR.value});
            orders.push({name : "CVR1_PDF_MR", state : check_CVR1_PDF_MR.value});
            orders.push({name : "CVR1_PDF_LR", state : check_CVR1_PDF_LR.value});
            orders.push({name : "CVR1_JPG_HR", state : check_CVR1_JPG_HR.value});
            orders.push({name : "CVR1_JPG_LR", state : check_CVR1_JPG_LR.value});
        
        //clean orders
        var len = orders.length-1;
        for(var order = len; order >= 0; order--){
            if(orders[order].state == false){
                orders.splice (order, 1);
            }
        }
    }
    return orders;
}

//EOF