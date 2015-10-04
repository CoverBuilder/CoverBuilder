/*
    Remove_CoverBuilder_Menu.jsx
    
    A CoverBuilder Helper Script
    
    This script removes all CoverBuilder menu items

    Version 1.0

    Bruno Herfst 2015
    coverbuilder.brunoHerfst.com

*/

#target "InDesign"

try {
    app.menus.item("$ID/Main").submenus.item("CoverBuilder 2.9.2").remove();
}catch(e){}
try {
    app.menus.item("$ID/Main").submenus.item("CoverBuilder 2.9.3").remove();
}catch(e){}
try {
    app.menus.item("$ID/Main").submenus.item("CoverBuilder").remove();
}catch(e){}
