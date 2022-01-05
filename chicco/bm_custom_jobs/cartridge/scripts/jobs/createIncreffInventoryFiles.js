var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');


var Logger = require('dw/system/Logger').getLogger('increff');
var Status = require('dw/system/Status');

function getSavedInventoryCustomObjects() {
    var increffInvenotryObjects = CustomObjectMgr.getAllCustomObjects('IncreffInventory');
    return increffInvenotryObjects;
}

function buildInventorySchema(inventories, workingDir, reqeustId, listID) {
    var File = require('dw/io/File');
    var FileWriter = require('dw/io/FileWriter');
    var XMLStreamWriter = require('dw/io/XMLStreamWriter');
    var Site = require('dw/system/Site').getCurrent();
    var increffInveotryListId = listID;
    var writeDir = new File(workingDir);
    writeDir.mkdirs();

    var inventoryListFile = new File(workingDir + 'InventoryListExport_' + Site.getID() + '_' + reqeustId + '.xml');
    inventoryListFile.createNewFile();

    var inventoryListFileWriter = new FileWriter(inventoryListFile, 'UTF-8');
    var inventroyListStreamWriter = new XMLStreamWriter(inventoryListFileWriter);

    inventroyListStreamWriter.writeStartElement('inventory');
    inventroyListStreamWriter.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/inventory/2007-05-31');
    inventroyListStreamWriter.writeCharacters('\n');
    inventroyListStreamWriter.writeStartElement('inventory-list');
    inventroyListStreamWriter.writeCharacters('\n');
    inventroyListStreamWriter.writeStartElement('header');
    inventroyListStreamWriter.writeAttribute('list-id', increffInveotryListId);
    inventroyListStreamWriter.writeStartElement('default-instock');
    inventroyListStreamWriter.writeCharacters(false);
    inventroyListStreamWriter.writeEndElement();
    inventroyListStreamWriter.writeEndElement();
    inventroyListStreamWriter.writeCharacters('\n');
    inventroyListStreamWriter.writeStartElement('records');
    inventories.forEach(function (inventory) {
        inventroyListStreamWriter.writeCharacters('\n');
        inventroyListStreamWriter.writeStartElement('record');
        Logger.info('Writing records for productID {0} and its quantity {1}',  inventory.channelSkuCode, inventory.quantity);
        inventroyListStreamWriter.writeAttribute('product-id', inventory.channelSkuCode);
        inventroyListStreamWriter.writeStartElement('allocation');
        inventroyListStreamWriter.writeCharacters(inventory.quantity);
        inventroyListStreamWriter.writeEndElement();
        inventroyListStreamWriter.writeEndElement();
    });
    // records
    inventroyListStreamWriter.writeCharacters('\n');
    inventroyListStreamWriter.writeEndElement();

    // inventory list
    inventroyListStreamWriter.writeCharacters('\n');
    inventroyListStreamWriter.writeEndElement();

    // inventory
    inventroyListStreamWriter.writeCharacters('\n');
    inventroyListStreamWriter.writeEndElement();

     // inventory
    //  inventroyListStreamWriter.writeCharacters('\n');
    //  inventroyListStreamWriter.writeEndElement();

    inventroyListStreamWriter.close();
    inventoryListFileWriter.close();
}


function execute(args) {
    try {
        var customObjects = getSavedInventoryCustomObjects();
        while (customObjects.hasNext()) {
            customObject = customObjects.next();
            var inventoryObje = JSON.parse(customObject.custom.inventoryJSON);
            buildInventorySchema(inventoryObje.inventories, args.workingDir, customObject.custom.IncreffInventory, args.listId);
            Transaction.wrap( function() {
                CustomObjectMgr.remove(customObject);
            });
        }
    } catch (error) {
        Logger.error('Error occured while create increffInvenotry files \n Error: {0} \n Stack Trace : {1}',
        error.message, error.stack);
        return new Status(Status.ERROR, 'ERROR', error.message);
    }
}

module.exports = {
    execute: execute
}