/*
   _____                    ____        _ _     _           
  / ____|                  |  _ \      (_) |   | |          
 | |     _____   _____ _ __| |_) |_   _ _| | __| | ___ _ __ 
 | |    / _ \ \ / / _ \ '__|  _ <| | | | | |/ _` |/ _ \ '__|
 | |___| (_) \ V /  __/ |  | |_) | |_| | | | (_| |  __/ |   
  \_____\___/ \_/ \___|_|  |____/ \__,_|_|_|\__,_|\___|_|   

*/

// Product: CoverBuilder
// Description: InDesign CS5+ Startup JavaScript
// + Create template book and magazine covers
// + coverbuilder.brunoherfst.com

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

#targetengine "CoverBuilder"

var appVersion = "3.1.1";

// While most localised strings live at CoverBuilder.Localise
// These are some strings needed before we the plugin is loaded
$.localize = true; // enable ExtendScript localisation engine

var localLocalised = {
    Unsupported_Platform          : { en: "Platform not supported: ",
                                      de: "Plattform nicht unterstützte: ",
                                      nl: "Platform niet ondersteund: ",
                                      fr: "Plate-forme non supportée: " },

    Cant_find_Module              : { en: "Can't find necessary module. ",
                                      de: "Kann das erforderliche Modul nicht finden. ",
                                      nl: "Kan de benodigde module niet vinden. ",
                                      fr: "Impossible de trouver le module nécessaire. " },    

    Expected_File_at_Location     : { en: "I expected to find a file at: ",
                                      de: "Ich erwartete eine Datei zu finden unter: ",
                                      nl: "Ik verwachtte een bestand te vinden op: ",
                                      fr: "Je m'attendais à trouver un fichier à: " },

    Build_Fail                    : { en: "Could not build CoverBuilder.",
                                      de: "CoverBuilder kann nicht erstellt werden.",
                                      nl: "Het bouwen van CoverBuilder is mislukt.",
                                      fr: "Impossible de créer CoverBuilder." },  
    
    MenuLoad_Fail                 : { en: "Loading of CoverBuilder menus failed.",
                                      de: "Das Laden von CoverBuilder-Menüs ist fehlgeschlagen.",
                                      nl: "Het laden van CoverBuilder-menu's is mislukt.",
                                      fr: "Le chargement des menus de CoverBuilder a échoué." }

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// STARTUP FUNCTIONS
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function coverBuilderAlert( MSG ){
    alert("CoverBuilder\n" + MSG);
}

function getPlatformInfo(){
    var platform = File.fs;
    if(platform == 'Windows'){
        var trailSlash = "\\";
    } else if(platform == "Macintosh") {
        var trailSlash = "/";
    } else {
        var trailSlash = undefined;
        coverBuilderAlert( localLocalised.Unsupported_Platform  + platform );
    }
    return {name : platform, trailSlash : trailSlash, appVersion : appVersion};
}

function cleanPath(p){
    // Remove filename from path
    var r = /[^\\\/]*$/;
    return p.toString().replace(r, '');
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// MAIN
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function main(){

    // Resolve paths
    //--------------
    var PlatformInfo = getPlatformInfo();
    
    var PathTo = {
           plugin : cleanPath($.fileName)
    }
    
    PathTo.scriptFolder = PathTo.plugin + "JSXINC" + PlatformInfo.trailSlash;
    PathTo.factory      = PathTo.scriptFolder + "coverbuilder.Factory.jsxinc";
    
    // Only the InDesign plugin (master) can set path to plugin to path to self!
    // Other scripts plugins can read the path to this plugin from settings.
    PlatformInfo.pathToPlugin = PathTo.plugin;
    
    // Locate factory file
    //---------------------
    var FF = new File(PathTo.factory);

    if(!FF.exists){
        coverBuilderAlert( localLocalised.Cant_find_Module + localLocalised.Expected_File_at_Location + PathTo.factory );
        return;
    }

    // Run the file
    //--------------
    var Factory = $.evalFile( FF );

    if(!Factory.hasOwnProperty("build4InDesign")) {
        coverBuilderAlert( localLocalised.Build_Fail );
        return;
    }

    // Initialise plugin
    //------------------
    var CoverBuilder = Factory.build4InDesign(PlatformInfo);

    // Load InDesign menus
    //--------------------
    if(CoverBuilder.hasOwnProperty("IDmenu")) {
        CoverBuilder.IDmenu.load_All_Menus( CoverBuilder );
    } else {
        coverBuilderAlert( localLocalised.MenuLoad_Fail );
        return;
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// START
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
try {
    main();
} catch ( err ) {
    // Let us know if something does not go to plan
    coverBuilderAlert( err.message + " (Line " + err.line + " in file " + err.fileName + ")");
}

// EOF
