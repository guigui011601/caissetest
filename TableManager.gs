// Créez un nouveau fichier dans votre projet Apps Script nommé "TableManager.gs"
// Collez le code suivant :

// Module de gestion des tables pour Beach Club Management

const TABLES_SHEET = 'Plan de Salle';

/**
 * Fonction pour récupérer les tables du plan de salle
 */
function getTables() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Vérifier si l'onglet des tables existe, sinon le créer
    let tablesSheet = ss.getSheetByName(TABLES_SHEET);
    if (!tablesSheet) {
      tablesSheet = ss.insertSheet(TABLES_SHEET);
      
      // Ajouter l'en-tête
      tablesSheet.getRange("A1").setValue("ID");
      tablesSheet.getRange("B1").setValue("Numéro");
      tablesSheet.getRange("C1").setValue("Places");
      tablesSheet.getRange("D1").setValue("X");
      tablesSheet.getRange("E1").setValue("Y");
      tablesSheet.getRange("F1").setValue("Forme");
      tablesSheet.getRange("G1").setValue("Occupée");
      tablesSheet.getRange("H1").setValue("CommandeID");
      
      // Formatage de l'en-tête
      tablesSheet.getRange("A1:H1").setFontWeight("bold");
      tablesSheet.setFrozenRows(1);
      
      // Ajouter quelques tables par défaut
      const defaultTables = [
        [1, 1, 2, 50, 50, 'square', false, ""],
        [2, 2, 4, 150, 50, 'square', false, ""],
        [3, 3, 6, 250, 50, 'rectangle', false, ""],
        [4, 4, 8, 50, 150, 'round', false, ""]
      ];
      
      tablesSheet.getRange(2, 1, defaultTables.length, 8).setValues(defaultTables);
      
      Logger.log("Feuille des tables créée avec des valeurs par défaut");
    }
    
    // Lire les données
    const dataRange = tablesSheet.getDataRange();
    const values = dataRange.getValues();
    
    const tables = [];
    
    // Ignorer l'en-tête
    for (let i = 1; i < values.length; i++) {
      if (values[i][0]) { // Vérifier que l'ID existe
        tables.push({
          id: values[i][0],
          number: values[i][1],
          seats: values[i][2],
          x: values[i][3],
          y: values[i][4],
          shape: values[i][5],
          occupied: values[i][6],
          orderId: values[i][7] || ""
        });
      }
    }
    
    return tables;
  } catch (error) {
    Logger.log("Erreur dans getTables: " + error.toString());
    return [];
  }
}

/**
 * Fonction pour enregistrer les tables
 */
function saveTables(tables) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let tablesSheet = ss.getSheetByName(TABLES_SHEET);
    
    if (!tablesSheet) {
      // Si la feuille n'existe pas, la créer
      tablesSheet = ss.insertSheet(TABLES_SHEET);
      
      // Ajouter l'en-tête
      tablesSheet.getRange("A1").setValue("ID");
      tablesSheet.getRange("B1").setValue("Numéro");
      tablesSheet.getRange("C1").setValue("Places");
      tablesSheet.getRange("D1").setValue("X");
      tablesSheet.getRange("E1").setValue("Y");
      tablesSheet.getRange("F1").setValue("Forme");
      tablesSheet.getRange("G1").setValue("Occupée");
      tablesSheet.getRange("H1").setValue("CommandeID");
      
      // Formatage de l'en-tête
      tablesSheet.getRange("A1:H1").setFontWeight("bold");
      tablesSheet.setFrozenRows(1);
    }
    
    // Effacer les données existantes (sauf l'en-tête)
    if (tablesSheet.getLastRow() > 1) {
      tablesSheet.getRange(2, 1, tablesSheet.getLastRow() - 1, 8).clear();
    }
    
    // Préparer les données
    const tableData = tables.map(table => [
      table.id,
      table.number,
      table.seats,
      table.x,
      table.y,
      table.shape,
      table.occupied,
      table.orderId || ""
    ]);
    
    // Enregistrer les données
    if (tableData.length > 0) {
      tablesSheet.getRange(2, 1, tableData.length, 8).setValues(tableData);
    }
    
    return true;
  } catch (error) {
    Logger.log("Erreur dans saveTables: " + error.toString());
    return false;
  }
}

/**
 * Fonction pour récupérer une commande associée à une table
 */
function getTableOrder(tableId) {
  try {
    // Récupérer d'abord la table pour obtenir l'ID de commande
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tablesSheet = ss.getSheetByName(TABLES_SHEET);
    const tableData = tablesSheet.getDataRange().getValues();
    
    let orderId = null;
    
    // Chercher la table
    for (let i = 1; i < tableData.length; i++) {
      if (tableData[i][0] == tableId) {
        orderId = tableData[i][7];
        break;
      }
    }
    
    // Si pas d'ID de commande, retourner null
    if (!orderId) {
      return null;
    }
    
    // Chercher la commande dans l'historique
    const historiqueSheet = ss.getSheetByName(SHEETS.HISTORIQUE);
    const historiqueData = historiqueSheet.getDataRange().getValues();
    
    const items = [];
    let vendeur = '';
    
    // Parcourir l'historique pour trouver les éléments de la commande
    for (let i = 1; i < historiqueData.length; i++) {
      // Vérifier si la colonne 8 existe et si elle correspond à l'ID de commande
      if (historiqueData[i].length > 8 && historiqueData[i][8] === orderId) {
        items.push({
          name: historiqueData[i][2],
          price: parseFloat(historiqueData[i][3]),
          quantity: parseInt(historiqueData[i][4]),
          total: parseFloat(historiqueData[i][5]),
          category: historiqueData[i][7]
        });
        
        if (!vendeur) {
          vendeur = historiqueData[i][6];
        }
      }
    }
    
    if (items.length === 0) {
      return null;
    }
    
    return {
      items: items,
      vendeur: vendeur,
      orderId: orderId
    };
  } catch (error) {
    Logger.log("Erreur dans getTableOrder: " + error.toString());
    return null;
  }
}

/**
 * Fonction pour libérer une table
 */
function freeTable(tableId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tablesSheet = ss.getSheetByName(TABLES_SHEET);
    
    if (!tablesSheet) {
      return false;
    }
    
    const dataRange = tablesSheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == tableId) {
        // Marquer la table comme libre et supprimer l'ID de commande
        tablesSheet.getRange(i + 1, 7).setValue(false); // Colonne "Occupée"
        tablesSheet.getRange(i + 1, 8).setValue(""); // Colonne "CommandeID"
        return true;
      }
    }
    
    return false;
  } catch (error) {
    Logger.log("Erreur dans freeTable: " + error.toString());
    return false;
  }
}

/**
 * Fonction pour marquer une table comme occupée
 */
function setTableOccupied(tableId, orderId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tablesSheet = ss.getSheetByName(TABLES_SHEET);
    
    if (!tablesSheet) {
      return false;
    }
    
    const dataRange = tablesSheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == tableId) {
        // Marquer la table comme occupée et enregistrer l'ID de commande
        tablesSheet.getRange(i + 1, 7).setValue(true); // Colonne "Occupée"
        tablesSheet.getRange(i + 1, 8).setValue(orderId); // Colonne "CommandeID"
        return true;
      }
    }
    
    return false;
  } catch (error) {
    Logger.log("Erreur dans setTableOccupied: " + error.toString());
    return false;
  }
}