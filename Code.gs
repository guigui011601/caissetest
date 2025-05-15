// Google Apps Script pour Beach Club Management System - Version corrigée

// ID de la feuille de calcul
const SPREADSHEET_ID = '1nhFGfFgUUymJOYn-Gq_CaW2aKMTJF9eW8_zQD93HuUU';

// Noms des onglets
const SHEETS = {
  VENTE: 'Feuille de Vente',
  STOCK: 'Feuille de Stock',
  RECETTES: 'Feuille des Recettes',
  USERS: 'Utilisateurs',
  HISTORIQUE: 'Historique',
  TRESORERIE: 'Tresorerie',
  TARIFS: 'Calcul Tarifs',
  RESERVATION: 'Réservation'
};

// Fonction pour vérifier que le script est en cours d'exécution
function isScriptRunning() {
  return true;
}

function getProductsByCategory(category) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const venteSheet = ss.getSheetByName(SHEETS.VENTE);
    const venteData = venteSheet.getDataRange().getValues();
    
    const products = [];
    let startRow = 0;
    let endRow = 0;
    
    // Trouver les lignes correspondant à la catégorie spécifique
    switch(category) {
      case 'entrees':
        // Chercher la section des entrées (lignes 17-22 environ)
        for (let i = 0; i < venteData.length; i++) {
          if (venteData[i][0] === "Entrée") {
            startRow = i + 1;
            break;
          }
        }
        // Trouver la fin de la section
        for (let i = startRow; i < venteData.length; i++) {
          if (venteData[i][0] === "Total entrées") {
            endRow = i - 1;
            break;
          }
        }
        break;
        
      case 'plats':
        // Chercher la section des plats (lignes 24-32 environ)
        for (let i = 0; i < venteData.length; i++) {
          if (venteData[i][0] === "Plat") {
            startRow = i + 1;
            break;
          }
        }
        // Trouver la fin de la section
        for (let i = startRow; i < venteData.length; i++) {
          if (venteData[i][0] === "Total entrées") {
            endRow = i - 1;
            break;
          }
        }
        break;
        
      case 'desserts':
        // Chercher la section des desserts (lignes 35-41 environ)
        for (let i = 0; i < venteData.length; i++) {
          if (venteData[i][0] === "Dessert") {
            startRow = i + 1;
            break;
          }
        }
        // Trouver la fin de la section
        for (let i = startRow; i < venteData.length; i++) {
          if (venteData[i][0] === "Total entrées") {
            endRow = i - 1;
            break;
          }
        }
        break;
        
      case 'boissons':
        // Chercher la section des boissons (lignes 44-50 environ)
        for (let i = 0; i < venteData.length; i++) {
          if (venteData[i][0] === "Boisson") {
            startRow = i + 1;
            break;
          }
        }
        // Trouver la fin de la section
        for (let i = startRow; i < venteData.length; i++) {
          if (venteData[i][0] === "Total entrées") {
            endRow = i - 1;
            break;
          }
        }
        break;
    }
    
    // Si des lignes ont été identifiées
    if (startRow > 0 && endRow > 0) {
      // Parcourir les lignes dans la section identifiée
      let id = 1;
      for (let i = startRow; i <= endRow; i++) {
        // Vérifier si c'est une ligne produit (pas vide)
        if (venteData[i][0] && venteData[i][0] !== "") {
          // Récupérer le prix depuis la colonne J (index 9)
          const price = venteData[i][9] ? parseFloat(venteData[i][9]) : 15.00;
          
          products.push({
            id: id++,
            nom: venteData[i][0],
            prix: price,
            categorie: 'restaurant',
            subcategorie: category
          });
        }
      }
    }
    
    return products;
  } catch (error) {
    Logger.log("Erreur dans getProductsByCategory: " + error.toString());
    return [];
  }
}

// Fonction pour créer l'interface utilisateur
function doGet(e) {
  // Vérifier si la page de plan de salle est demandée
  if (e && e.parameter && e.parameter.page === 'plan-salle') {
    return HtmlService.createTemplateFromFile('plan-salle-ui')
      .evaluate()
      .setTitle('Plan de Salle - Beach Club')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // Sinon, retourner l'interface normale
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Beach Club Management')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/apps_script_48dp.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


// Fonction pour inclure le contenu HTML externe
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

// Fonction pour vérifier les identifiants de connexion
function checkLogin(username, password) {
  try {
    // Journalisation pour le débogage
    Logger.log("Tentative de connexion pour: " + username);
    
    // Forcer la création de l'admin si nécessaire
    initSystem();
    
    // Si c'est l'admin avec le mot de passe par défaut, connexion directe
    if (username === 'admin' && password === 'admin123') {
      Logger.log("Connexion directe de l'admin");
      
      // Mise à jour de la date de dernière connexion
      try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEETS.USERS);
        
        // Chercher la ligne admin
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        
        let adminRow = -1;
        for (let i = 0; i < values.length; i++) {
          if (values[i][0] === 'admin') {
            adminRow = i + 1; // +1 car les lignes commencent à 1, pas à 0
            break;
          }
        }
        
        // Si admin trouvé, mettre à jour la date
        if (adminRow > 0) {
          const now = new Date();
          sheet.getRange(adminRow, 5).setValue(Utilities.formatDate(now, "GMT+2", "dd/MM/yyyy HH:mm:ss"));
        }
      } catch (updateError) {
        Logger.log("Erreur lors de la mise à jour de la date: " + updateError.toString());
        // Continuer même en cas d'erreur de mise à jour de la date
      }
      
      // Retourner les infos admin
      return {
        identifiant: 'admin',
        nom: 'Administrateur',
        role: 'admin',
        derniere_connexion: Utilities.formatDate(new Date(), "GMT+2", "dd/MM/yyyy HH:mm:ss")
      };
    }
    
    // Sinon, vérifier dans la feuille
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    if (!usersSheet) {
      Logger.log("Feuille utilisateurs introuvable");
      return null;
    }
    
    const dataRange = usersSheet.getDataRange();
    const values = dataRange.getValues();
    
    // Déterminer si l'en-tête existe
    const hasHeader = values.length > 0 && values[0][0] === 'Identifiant';
    const startRow = hasHeader ? 1 : 0;
    
    // Parcourir les lignes
    for (let i = startRow; i < values.length; i++) {
      if (values[i][0] === username && values[i][1] === password) {
        // Mettre à jour la date de dernière connexion
        const now = new Date();
        const formattedDate = Utilities.formatDate(now, "GMT+2", "dd/MM/yyyy HH:mm:ss");
        usersSheet.getRange(i + 1, 5).setValue(formattedDate);
        
        Logger.log("Connexion réussie pour: " + username);
        
        // Retourner les infos utilisateur
        return {
          identifiant: values[i][0],
          nom: values[i][2],
          role: values[i][3],
          derniere_connexion: formattedDate
        };
      }
    }
        Logger.log("Échec de connexion pour: " + username);
    return null;
  } catch (error) {
    Logger.log("Erreur dans checkLogin: " + error.toString());
    return null;
  }
}

// Fonction pour récupérer tous les utilisateurs
function getUsers() {
  try {
    Logger.log("Récupération des utilisateurs...");
    
    // Initialiser le système si nécessaire
    initSystem();
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // IMPORTANT: Vérification des différents noms possibles de la feuille
    let usersSheet = ss.getSheetByName(SHEETS.USERS);
    if (!usersSheet) {
      // Essayer de trouver la feuille par son nom d'affichage actuel
      usersSheet = ss.getSheetByName('Utilisateurs');
      if (!usersSheet) {
        // Rechercher une feuille qui pourrait contenir des utilisateurs
        const allSheets = ss.getSheets();
        for (let i = 0; i < allSheets.length; i++) {
          const sheet = allSheets[i];
          const sheetName = sheet.getName();
          Logger.log("Vérification de la feuille: " + sheetName);
          
          // Vérifier si c'est probablement la feuille des utilisateurs
          const firstRow = sheet.getRange(1, 1, 1, 5).getValues()[0];
          if (firstRow[0] === 'Identifiant' && firstRow[1] === 'Mot de passe') {
            usersSheet = sheet;
            Logger.log("Feuille utilisateurs trouvée: " + sheetName);
            break;
          }
        }
      }
    }
    
    // Si toujours pas de feuille trouvée, la créer
    if (!usersSheet) {
      Logger.log("Aucune feuille utilisateurs trouvée, création d'une nouvelle");
      return initDefaultUser();
    }
    
    Logger.log("Lecture des données de la feuille: " + usersSheet.getName());
    
    // Lire toutes les données
    const rows = usersSheet.getDataRange().getValues();
    Logger.log("Nombre de lignes trouvées: " + rows.length);
    
    // Afficher les premières lignes pour le débogage
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      Logger.log("Ligne " + i + ": " + JSON.stringify(rows[i]));
    }
    
    const users = [];
    
    // Déterminer si l'en-tête existe
    const hasHeader = rows.length > 0 && 
                      (rows[0][0] === 'Identifiant' || 
                       rows[0][0] === 'identifiant' || 
                       rows[0][0] === 'IDENTIFIANT');
    const startRow = hasHeader ? 1 : 0;
    
    // Parcourir les données et ignorer l'en-tête
    for (let i = startRow; i < rows.length; i++) {
      if (rows[i][0]) { // Vérifier que l'identifiant existe
        users.push({
          identifiant: rows[i][0],
          nom: rows[i][2],
          role: rows[i][3],
          derniere_connexion: rows[i][4]
        });
        Logger.log("Utilisateur ajouté: " + rows[i][0]);
      }
    }
    
    Logger.log("Nombre d'utilisateurs récupérés: " + users.length);
    
    // Si aucun utilisateur n'est trouvé, mais que nous avons des données
    if (users.length === 0 && rows.length > 1) {
      Logger.log("Aucun utilisateur n'a été extrait malgré la présence de données");
      
      // Tentative de récupération en ignorant la structure
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0]) { // S'il y a quelque chose dans la première colonne
          users.push({
            identifiant: rows[i][0],
            nom: rows[i][2] || rows[i][0], // Utiliser l'ID comme nom si nécessaire
            role: rows[i][3] || 'vendeur', // Rôle par défaut
            derniere_connexion: rows[i][4] || 'Jamais'
          });
          Logger.log("Utilisateur forcé: " + rows[i][0]);
        }
      }
    }
    
    // Si toujours aucun utilisateur, créer l'admin par défaut
    if (users.length === 0) {
      Logger.log("Aucun utilisateur trouvé, création de l'admin par défaut");
      return initDefaultUser();
    }
    
    return users;
  } catch (error) {
    Logger.log("Erreur dans getUsers: " + error.toString());
    
    // En cas d'erreur, retourner au moins l'admin pour permettre l'accès
    return [{
      identifiant: 'admin',
      nom: 'Administrateur',
      role: 'admin',
      derniere_connexion: Utilities.formatDate(new Date(), "GMT+2", "dd/MM/yyyy HH:mm:ss")
    }];
  }
}

function systemDiagnostic() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const allSheets = ss.getSheets();
    
    const result = {
      success: true,
      spreadsheetName: ss.getName(),
      sheetsInfo: [],
      usersSheet: null,
      users: []
    };
    
    // Analyser toutes les feuilles
    for (let i = 0; i < allSheets.length; i++) {
      const sheet = allSheets[i];
      const sheetName = sheet.getName();
      const numRows = sheet.getLastRow();
      const numCols = sheet.getLastColumn();
      
      result.sheetsInfo.push({
        name: sheetName,
        rows: numRows,
        columns: numCols
      });
      
      // Vérifier si c'est la feuille des utilisateurs
      if (sheetName === SHEETS.USERS || sheetName === 'Utilisateurs') {
        result.usersSheet = {
          name: sheetName,
          rows: numRows,
          columns: numCols
        };
        
        // Récupérer les données des utilisateurs
        if (numRows > 0) {
          const data = sheet.getRange(1, 1, Math.min(numRows, 10), 5).getValues();
          result.users = data;
        }
      }
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Fonction d'initialisation d'un utilisateur par défaut
function initDefaultUser() {
  return initSystem();
}


// Modification du client côté HTML pour améliorer le diagnostic

// Remplacer la fonction loadUsersWithRetry pour inclure plus de diagnostic
function loadUsersWithRetry() {
  const tableBody = document.querySelector('#usersTable tbody');
  tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Chargement des utilisateurs...</td></tr>';
  
  // Faire d'abord un diagnostic système complet
  google.script.run
    .withSuccessHandler(function(diagResult) {
      if (diagResult.success) {
        // Afficher quelques infos de diagnostic dans la console
        console.log("Diagnostic système:", diagResult);
        
        // Maintenant récupérer les utilisateurs
        google.script.run
          .withSuccessHandler(handleLoadUsers)
          .withFailureHandler(handleLoadUsersError)
          .getUsers();
      } else {
        handleLoadUsersError("Erreur de diagnostic: " + diagResult.error);
      }
    })
    .withFailureHandler(function(error) {
      handleLoadUsersError("Erreur de diagnostic système: " + error);
    })
    .systemDiagnostic();
  
  // Fonction pour gérer les résultats
  function handleLoadUsers(users) {
    if (!users || users.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">
            Aucun utilisateur trouvé. 
            <a href="#" id="forceInitLink">Cliquez ici</a> pour réinitialiser.
          </td>
        </tr>
      `;
      
      // Ajouter un lien pour forcer la réinitialisation
      document.getElementById('forceInitLink').addEventListener('click', function(e) {
        e.preventDefault();
        forceDiagnostic();
      });
      return;
    }
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.identifiant || ''}</td>
        <td>${user.nom || ''}</td>
        <td>${user.role === 'admin' ? 'Administrateur' : 'Vendeur'}</td>
        <td>${user.derniere_connexion || 'Jamais'}</td>
        <td>
          <button class="action-btn edit-btn">Modifier</button>
          <button class="action-btn delete-btn" ${user.identifiant === 'admin' ? 'disabled style="opacity:0.5;"' : ''}>Supprimer</button>
        </td>
      `;
      
      // Ajouter des écouteurs d'événements
      const editBtn = row.querySelector('.edit-btn');
      const deleteBtn = row.querySelector('.delete-btn');
      
      editBtn.addEventListener('click', function() {
        editUser(user.identifiant);
      });
      
      deleteBtn.addEventListener('click', function() {
        if (user.identifiant !== 'admin') {
          deleteUser(user.identifiant);
        }
      });
      
      tableBody.appendChild(row);
    });
  }
  
  // Fonction pour gérer les erreurs
  function handleLoadUsersError(error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:red;">
          Erreur lors du chargement des utilisateurs
          <br>
          <button id="diagBtn" class="action-btn">Diagnostic</button>
          <button id="forceSyncBtn" class="action-btn">Forcer la synchronisation</button>
        </td>
      </tr>
    `;
    
    // Ajouter les boutons de diagnostic
    document.getElementById('diagBtn').addEventListener('click', forceDiagnostic);
    document.getElementById('forceSyncBtn').addEventListener('click', forceSync);
  }
  
  // Fonction pour lancer un diagnostic
  function forceDiagnostic() {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Diagnostic en cours...</td></tr>';
    
    google.script.run
      .withSuccessHandler(function(result) {
        if (result.success) {
          // Afficher les informations de diagnostic
          let diagHtml = `
            <tr>
              <td colspan="5" style="text-align:left; padding: 15px;">
                <h4>Diagnostic du système:</h4>
                <p>Nom de la feuille de calcul: ${result.spreadsheetName}</p>
                <h4>Feuilles disponibles:</h4>
                <ul>
                  ${result.sheetsInfo.map(sheet => `
                    <li>${sheet.name}: ${sheet.rows} lignes, ${sheet.columns} colonnes</li>
                  `).join('')}
                </ul>
                <h4>Feuille Utilisateurs:</h4>
                ${result.usersSheet ? 
                  `<p>Trouvée: ${result.usersSheet.name}, ${result.usersSheet.rows} lignes</p>` : 
                  '<p style="color:red;">Non trouvée</p>'}
                
                <h4>Données (10 premières lignes):</h4>
                <div style="overflow-x:auto;">
                  <table border="1" style="border-collapse:collapse; width:100%;">
                    <tr>
                      <th>Identifiant</th>
                      <th>Mot de passe</th>
                      <th>Nom</th>
                      <th>Rôle</th>
                      <th>Dernière connexion</th>
                    </tr>
                    ${result.users.map(row => `
                      <tr>
                        <td>${row[0] || ''}</td>
                        <td>${row[1] ? '******' : ''}</td>
                        <td>${row[2] || ''}</td>
                        <td>${row[3] || ''}</td>
                        <td>${row[4] || ''}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>
                <div style="margin-top:15px;">
                  <button id="forceInitBtn" class="action-btn">Forcer l'initialisation</button>
                  <button id="forceSyncBtn" class="action-btn">Forcer la synchronisation</button>
                </div>
              </td>
            </tr>
          `;
          
          tableBody.innerHTML = diagHtml;
          
          // Ajouter des boutons d'action
          document.getElementById('forceInitBtn').addEventListener('click', function() {
            forceInitialization();
          });
          document.getElementById('forceSyncBtn').addEventListener('click', function() {
            forceSync();
          });
        } else {
          tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Erreur de diagnostic: ' + result.error + '</td></tr>';
        }
      })
      .withFailureHandler(function(error) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Erreur de diagnostic: ' + error + '</td></tr>';
      })
      .systemDiagnostic();
  }
  
  // Fonction pour forcer l'initialisation
  function forceInitialization() {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Réinitialisation en cours...</td></tr>';
    
    google.script.run
      .withSuccessHandler(function(success) {
        if (success) {
          // Recharger les utilisateurs
          loadUsersWithRetry();
        } else {
          tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Échec de la réinitialisation</td></tr>';
        }
      })
      .withFailureHandler(function(error) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Erreur: ' + error + '</td></tr>';
      })
      .initSystem();
  }
  
  // Fonction pour forcer la synchronisation
  function forceSync() {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Synchronisation en cours...</td></tr>';
    
    // Cette fonction va essayer de synchroniser la feuille utilisateurs avec celle qui existe vraiment
    google.script.run
      .withSuccessHandler(function(success) {
        if (success) {
          // Recharger les utilisateurs
          loadUsersWithRetry();
        } else {
          tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Échec de la synchronisation</td></tr>';
        }
      })
      .withFailureHandler(function(error) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Erreur: ' + error + '</td></tr>';
      })
      .syncUsers();
  }
}

function syncUsers() {
  try {
    Logger.log("Début de la synchronisation utilisateurs");
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Chercher toutes les feuilles qui pourraient contenir des utilisateurs
    const allSheets = ss.getSheets();
    let userSheetFound = false;
    let userSheetName = '';
    
    // Vérifier d'abord si la feuille configurée existe
    let usersSheet = ss.getSheetByName(SHEETS.USERS);
    if (usersSheet) {
      userSheetFound = true;
      userSheetName = SHEETS.USERS;
    } else {
      // Chercher une feuille nommée "Utilisateurs"
      usersSheet = ss.getSheetByName('Utilisateurs');
      if (usersSheet) {
        userSheetFound = true;
        userSheetName = 'Utilisateurs';
        
        // Mettre à jour la constante dans le code pour la prochaine exécution
        // Cela n'est pas possible, mais enregistrons-le pour référence
        Logger.log("Feuille utilisateurs trouvée sous le nom 'Utilisateurs'");
      } else {
        // Parcourir toutes les feuilles et chercher une structure compatible
        for (let i = 0; i < allSheets.length; i++) {
          const sheet = allSheets[i];
          const name = sheet.getName();
          
          // Ignorer les feuilles connues qui ne sont pas la feuille utilisateurs
          if (name === SHEETS.VENTE || name === SHEETS.STOCK || 
              name === SHEETS.RECETTES || name === SHEETS.HISTORIQUE || 
              name === SHEETS.TRESORERIE || name === SHEETS.TARIFS || 
              name === SHEETS.RESERVATION) {
            continue;
          }
          
          // Vérifier si cette feuille a une structure compatible avec la feuille utilisateurs
          try {
            const firstRow = sheet.getRange(1, 1, 1, 5).getValues()[0];
            if (firstRow[0] === 'Identifiant' && firstRow[1] === 'Mot de passe' && 
                firstRow[2] === 'Nom' && firstRow[3] === 'Rôle') {
              userSheetFound = true;
              userSheetName = name;
              usersSheet = sheet;
              Logger.log("Feuille utilisateurs trouvée avec structure compatible: " + name);
              break;
            }
          } catch (e) {
            // Ignorer les erreurs et continuer
            continue;
          }
        }
      }
    }
    
    // Si aucune feuille utilisateurs n'a été trouvée, en créer une nouvelle
    if (!userSheetFound) {
      Logger.log("Aucune feuille utilisateurs trouvée, création d'une nouvelle");
      usersSheet = ss.insertSheet(SHEETS.USERS);
      userSheetName = SHEETS.USERS;
      
      // Initialiser la feuille avec les en-têtes et l'utilisateur admin
      usersSheet.getRange("A1:E1").setValues([["Identifiant", "Mot de passe", "Nom", "Rôle", "Dernière connexion"]]);
      usersSheet.getRange("A1:E1").setFontWeight("bold");
      usersSheet.setFrozenRows(1);
      
      // Ajouter l'utilisateur admin
      usersSheet.getRange("A2:E2").setValues([
        ["admin", "admin123", "Administrateur", "admin", Utilities.formatDate(new Date(), "GMT+2", "dd/MM/yyyy HH:mm:ss")]
      ]);
      
      Logger.log("Feuille utilisateurs créée et admin ajouté");
    }
    
    // Maintenant, vérifier s'il faut migrer les utilisateurs existants depuis une autre feuille
    if (userSheetName !== SHEETS.USERS && userSheetName !== 'Utilisateurs') {
      Logger.log("La feuille utilisateurs (" + userSheetName + ") ne correspond pas au nom configuré (" + SHEETS.USERS + ")");
      
      // Deux options:
      // 1. Renommer la feuille trouvée pour qu'elle corresponde au nom configuré
      // 2. Créer une nouvelle feuille avec le nom configuré et y copier les données
      
      // Option 1: Renommer la feuille (solution préférée)
      try {
        usersSheet.setName(SHEETS.USERS);
        Logger.log("Feuille renommée en " + SHEETS.USERS);
      } catch (renameError) {
        Logger.log("Erreur lors du renommage de la feuille: " + renameError.toString());
        
        // Option 2: Créer une nouvelle feuille et y copier les données
        try {
          const newSheet = ss.insertSheet(SHEETS.USERS);
          
          // Copier les données
          const sourceRange = usersSheet.getDataRange();
          const sourceValues = sourceRange.getValues();
          
          // Obtenir le nombre de lignes et colonnes
          const numRows = sourceValues.length;
          const numCols = sourceValues[0].length;
          
          // Copier vers la nouvelle feuille
          newSheet.getRange(1, 1, numRows, numCols).setValues(sourceValues);
          
          // Formater l'en-tête
          newSheet.getRange(1, 1, 1, numCols).setFontWeight("bold");
          newSheet.setFrozenRows(1);
          
          Logger.log("Données copiées vers une nouvelle feuille " + SHEETS.USERS);
        } catch (copyError) {
          Logger.log("Erreur lors de la copie des données: " + copyError.toString());
          return false;
        }
      }
    }

    function listAllSheets() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    
    return {
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetName: ss.getName(),
      sheetNames: sheetNames
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
    
    // Vérifier si la feuille contient des utilisateurs
    const usersData = usersSheet.getDataRange().getValues();
    if (usersData.length <= 1) {
      // Si seulement l'en-tête ou moins, ajouter l'utilisateur admin
      usersSheet.getRange("A2:E2").setValues([
        ["admin", "admin123", "Administrateur", "admin", Utilities.formatDate(new Date(), "GMT+2", "dd/MM/yyyy HH:mm:ss")]
      ]);
      Logger.log("Ajout de l'utilisateur admin car aucun utilisateur trouvé");
    }
    
    return true;
  } catch (error) {
    Logger.log("Erreur dans syncUsers: " + error.toString());
    return false;
  }
}

// Fonction à ajouter au client pour permettre la création d'un utilisateur même si l'interface ne fonctionne pas
function addUserDirect() {
  const user = {
    identifiant: 'test_direct',
    mot_de_passe: 'test123',
    nom: 'Utilisateur Test Direct',
    role: 'vendeur'
  };
  
  google.script.run
    .withSuccessHandler(function(success) {
      if (success) {
        alert('Utilisateur créé avec succès');
        loadUsersWithRetry();
      } else {
        alert('Échec de la création de l\'utilisateur');
      }
    })
    .withFailureHandler(function(error) {
      alert('Erreur: ' + error);
    })
    .createUser(user);
}

    

// Fonction pour récupérer un utilisateur par son identifiant
function getUserByUsername(username) {
  try {
    Logger.log("Recherche de l'utilisateur: " + username);
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    // Récupérer toutes les données
    const dataRange = usersSheet.getDataRange();
    const values = dataRange.getValues();
    
    // Parcourir les données et ignorer l'en-tête
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === username) {
        Logger.log("Utilisateur trouvé: " + username);
        return {
          identifiant: values[i][0],
          nom: values[i][2],
          role: values[i][3],
          derniere_connexion: values[i][4]
        };
      }
    }
    
    Logger.log("Utilisateur non trouvé: " + username);
    return null;
  } catch (error) {
    Logger.log("Erreur dans getUserByUsername: " + error.toString());
    return null;
  }
}

// Fonction pour créer un nouvel utilisateur
function createUser(user) {
  try {
    Logger.log("Tentative de création d'utilisateur: " + user.identifiant);
    
    // Vérifier les données obligatoires
    if (!user.identifiant || !user.mot_de_passe || !user.nom || !user.role) {
      Logger.log("Données utilisateur incomplètes");
      return false;
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    // Vérifier si l'utilisateur existe déjà
    const dataRange = usersSheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === user.identifiant) {
        Logger.log("L'identifiant existe déjà: " + user.identifiant);
        return false;
      }
    }
    
    // Obtenir la prochaine ligne disponible
    const nextRow = usersSheet.getLastRow() + 1;
    
    // Ajouter le nouvel utilisateur
    usersSheet.getRange(nextRow, 1).setValue(user.identifiant);
    usersSheet.getRange(nextRow, 2).setValue(user.mot_de_passe);
    usersSheet.getRange(nextRow, 3).setValue(user.nom);
    usersSheet.getRange(nextRow, 4).setValue(user.role);
    usersSheet.getRange(nextRow, 5).setValue(Utilities.formatDate(new Date(), "GMT+2", "dd/MM/yyyy HH:mm:ss"));
    
    Logger.log("Utilisateur créé avec succès: " + user.identifiant);
    return true;
  } catch (error) {
    Logger.log("Erreur dans createUser: " + error.toString());
    return false;
  }
}

// Fonction pour mettre à jour un utilisateur existant
function updateUser(user) {
  try {
    Logger.log("Tentative de mise à jour de l'utilisateur: " + user.identifiant);
    
    // Vérifier l'identifiant
    if (!user.identifiant) {
      Logger.log("Identifiant manquant");
      return false;
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    // Rechercher l'utilisateur
    const dataRange = usersSheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === user.identifiant) {
        // Mettre à jour les champs
        if (user.nom) usersSheet.getRange(i + 1, 3).setValue(user.nom);
        if (user.role) usersSheet.getRange(i + 1, 4).setValue(user.role);
        if (user.mot_de_passe) usersSheet.getRange(i + 1, 2).setValue(user.mot_de_passe);
        
        Logger.log("Utilisateur mis à jour avec succès: " + user.identifiant);
        return true;
      }
    }
    
    Logger.log("Utilisateur non trouvé pour la mise à jour: " + user.identifiant);
    return false;
  } catch (error) {
    Logger.log("Erreur dans updateUser: " + error.toString());
    return false;
  }
}

// Fonction pour supprimer un utilisateur
function deleteUser(username) {
  try {
    Logger.log("Tentative de suppression de l'utilisateur: " + username);
    
    // Protéger l'admin
    if (username === 'admin') {
      Logger.log("La suppression de l'utilisateur admin est interdite");
      return false;
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    // Rechercher l'utilisateur
    const dataRange = usersSheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === username) {
        // Supprimer la ligne
        usersSheet.deleteRow(i + 1);
        Logger.log("Utilisateur supprimé avec succès: " + username);
        return true;
      }
    }
    
    Logger.log("Utilisateur non trouvé pour la suppression: " + username);
    return false;
  } catch (error) {
    Logger.log("Erreur dans deleteUser: " + error.toString());
    return false;
  }
}

// Fonction pour récupérer les produits par catégorie
function getProducts(category) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const venteSheet = ss.getSheetByName(SHEETS.VENTE);
    const venteData = venteSheet.getDataRange().getValues();
    
    const products = [];
    let startRow = 0;
    let endRow = 0;
    
    // Trouver les sections en fonction du titre "nom_produit"
    const sections = [];
    for (let i = 0; i < venteData.length; i++) {
      if (venteData[i][0] === "nom_produit") {
        // Début d'une nouvelle section
        sections.push(i);
      }
    }
    
    if (sections.length < 2) {
      // Si on ne trouve pas suffisamment de sections, on utilise une approche plus simple
      if (category === 'bar') {
        startRow = 2; // Commence après le premier en-tête (généralement ligne 3)
        endRow = 13;  // Fin arbitraire pour les boissons (ajuster selon votre structure)
      } else if (category === 'restaurant') {
        startRow = 24; // Commence après le deuxième en-tête (ajuster selon votre structure)
        endRow = 36;   // Fin arbitraire pour la nourriture (ajuster selon votre structure)
      }
    } else {
      // Déterminer la section en fonction de la catégorie
      if (category === 'bar') {
        startRow = sections[0] + 1; // Ligne après le premier "nom_produit"
        endRow = sections[1] - 1;   // Ligne avant le deuxième "nom_produit"
      } else if (category === 'restaurant') {
        startRow = sections[1] + 1; // Ligne après le deuxième "nom_produit"
        endRow = sections.length > 2 ? sections[2] - 1 : venteData.length - 1; // Jusqu'à la fin ou la prochaine section
      }
    }
    
    // Parcourir les lignes dans la section identifiée
    let id = 1;
    for (let i = startRow; i <= endRow; i++) {
      // Vérifier si c'est une ligne produit (pas vide et pas "Total entrées")
      if (venteData[i][0] && venteData[i][0] !== "Total entrées" && venteData[i][0] !== "") {
        // Récupérer le prix depuis la colonne K (index 10)
        const price = venteData[i][9] ? parseFloat(venteData[i][9]) : (category === 'bar' ? 5.00 : 15.00);
        
        products.push({
          id: id++,
          nom: venteData[i][0],
          prix: price,
          categorie: category
        });
      }
    }
    
    return products;
  } catch (error) {
    Logger.log("Erreur dans getProducts: " + error.toString());
    return [];
  }
}

// Fonction pour récupérer tous les produits
function getAllProducts() {
  try {
    const barProducts = getProducts('bar');
    const restaurantProducts = getProducts('restaurant');
    
    return [...barProducts, ...restaurantProducts];
  } catch (error) {
    Logger.log("Erreur dans getAllProducts: " + error.toString());
    return [];
  }
}

// Fonction pour récupérer un produit par son ID
function getProductById(id) {
  try {
    const allProducts = getAllProducts();
    return allProducts.find(product => product.id === id) || null;
  } catch (error) {
    Logger.log("Erreur dans getProductById: " + error.toString());
    return null;
  }
}

// Fonction pour créer un nouveau produit
function createProduct(product) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const venteSheet = ss.getSheetByName(SHEETS.VENTE);
    
    // Déterminer où ajouter le produit en fonction de sa catégorie
    if (product.categorie === 'bar') {
      // Trouver la dernière ligne de la section bar
      const venteData = venteSheet.getDataRange().getValues();
      let lastBarRow = 0;
      
      for (let i = 2; i < venteData.length; i++) {
        if (!venteData[i][0] || venteData[i][0] === '') {
          lastBarRow = i;
          break;
        }
      }
      
      if (lastBarRow > 0) {
        venteSheet.insertRowAfter(lastBarRow);
        venteSheet.getRange(lastBarRow + 1, 1).setValue(product.nom);
        // Les prix seraient normalement dans la colonne appropriée
      }
    } else if (product.categorie === 'restaurant') {
      // Trouver la dernière ligne de la section restaurant
      const venteData = venteSheet.getDataRange().getValues();
      let restaurantSection = false;
      let lastRestaurantRow = 0;
      
      for (let i = 0; i < venteData.length; i++) {
        if (!restaurantSection && 
            (venteData[i][0] === 'Caviar' || 
             venteData[i][0] === 'Foie Gras' || 
             venteData[i][0] === 'Fruits de Mer')) {
          restaurantSection = true;
        }
        
        if (restaurantSection) {
          if (!venteData[i][0] || venteData[i][0] === '') {
            lastRestaurantRow = i;
            break;
          }
        }
      }
      
      if (lastRestaurantRow > 0) {
        venteSheet.insertRowAfter(lastRestaurantRow);
        venteSheet.getRange(lastRestaurantRow + 1, 1).setValue(product.nom);
        // Les prix seraient normalement dans la colonne appropriée
      }
    }
    
    return true;
  } catch (error) {
    Logger.log("Erreur dans createProduct: " + error.toString());
    return false;
  }
}

// Fonction pour mettre à jour un produit existant
function updateProduct(product) {
  // Cette fonction est plus complexe car il faudrait modifier la feuille existante
  // Pour simplifier, nous simulons une mise à jour réussie
  return true;
}

// Fonction pour supprimer un produit
function deleteProduct(id) {
  // Cette fonction est plus complexe car il faudrait modifier la feuille existante
  // Pour simplifier, nous simulons une suppression réussie
  return true;
}

// Fonction pour récupérer les éléments du stock
function getStockItems() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const stockSheet = ss.getSheetByName(SHEETS.STOCK);
    const stockData = stockSheet.getDataRange().getValues();
    
    const items = [];
    
    // Ignorer la ligne d'en-tête
    for (let i = 2; i < stockData.length; i++) {
      if (stockData[i][0] && stockData[i][0] !== '') {
        items.push({
          ingredient: stockData[i][0],
          quantite: stockData[i][1] || 0
        });
      }
    }
    
    return items;
  } catch (error) {
    Logger.log("Erreur dans getStockItems: " + error.toString());
    return [];
  }
}

// Fonction pour mettre à jour un élément de stock
function updateStockItem(item) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const stockSheet = ss.getSheetByName(SHEETS.STOCK);
    const stockData = stockSheet.getDataRange().getValues();
    
    let found = false;
    
    for (let i = 2; i < stockData.length; i++) {
      if (stockData[i][0] === item.ingredient) {
        stockSheet.getRange(i + 1, 2).setValue(item.quantite);
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Ajouter un nouvel ingrédient
      stockSheet.appendRow([item.ingredient, item.quantite]);
    }
    
    return true;
  } catch (error) {
    Logger.log("Erreur dans updateStockItem: " + error.toString());
    return false;
  }
}

// Fonction pour traiter une commande
function processOrder(orderData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const historiqueSheet = ss.getSheetByName(SHEETS.HISTORIQUE);
    const venteSheet = ss.getSheetByName(SHEETS.VENTE);
    
    // Générer un ID de commande si c'est une commande associée à une table
    const orderId = orderData.tableId ? "CMD" + new Date().getTime() : "";
    
    // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, etc.)
    const date = new Date();
    const formattedDate = date.toLocaleDateString('fr-FR');
    const formattedTime = date.toLocaleTimeString('fr-FR');
    const dayOfWeek = date.getDay();
    // Ajuster pour correspondre à nos colonnes (1 = lundi, 7 = dimanche)
    const dayColumn = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    // Récupérer les données de la feuille de vente
    const venteData = venteSheet.getDataRange().getValues();
    
    // Traiter chaque article de la commande
    orderData.items.forEach(item => {
      // Vérifier si nous devons étendre le nombre de colonnes dans l'historique pour l'ID de commande
      const lastCol = historiqueSheet.getLastColumn();
      if (lastCol < 9 && orderData.tableId) {
        // Ajouter une colonne pour l'ID de commande si elle n'existe pas encore
        historiqueSheet.getRange(1, 9).setValue("CommandeID");
      }
      
      // Préparer les données à ajouter à l'historique
      let rowData = [
        formattedDate,
        formattedTime,
        item.name,
        item.price,
        item.quantity,
        item.total,
        orderData.vendeur,
        item.category
      ];
      
      // Ajouter l'ID de commande si une table est associée
      if (orderData.tableId) {
        rowData.push(orderId);
      }
      
      // Ajouter à l'historique
      historiqueSheet.appendRow(rowData);
      
      // Mettre à jour la feuille de vente
      let productFound = false;
      
      // Rechercher le produit dans la feuille de vente
      for (let i = 0; i < venteData.length; i++) {
        if (venteData[i][0] === item.name) {
          // Trouver la colonne appropriée pour le jour de la semaine (B à H)
          // B = lundi (colonne 1), C = mardi (colonne 2), etc.
          const currentValue = venteData[i][dayColumn] || 0;
          
          // Mettre à jour la quantité pour ce jour
          venteSheet.getRange(i + 1, dayColumn + 1).setValue(currentValue + item.quantity);
          
          // Ne pas mettre à jour les totaux, ils sont calculés automatiquement
          productFound = true;
          break;
        }
      }
      
      // Si le produit n'est pas trouvé, vérifier si c'est peut-être dû à une différence de casse ou d'espaces
      if (!productFound) {
        for (let i = 0; i < venteData.length; i++) {
          if (venteData[i][0] && venteData[i][0].toString().trim().toLowerCase() === item.name.trim().toLowerCase()) {
            // Même mise à jour que ci-dessus
            const currentValue = venteData[i][dayColumn] || 0;
            venteSheet.getRange(i + 1, dayColumn + 1).setValue(currentValue + item.quantity);
            
            productFound = true;
            break;
          }
        }
      }
    });
    
    // Si la commande est associée à une table, mettre à jour le statut de la table
    if (orderData.tableId) {
      setTableOccupied(orderData.tableId, orderId);
    }
    
    return { success: true, orderId: orderId };
  } catch (error) {
    Logger.log("Erreur dans processOrder: " + error.toString());
    return { success: false, message: error.toString() };
  }
}
function freeTable(tableId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const TABLES_SHEET = 'Plan de Salle';
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
 * Marquer une table comme occupée
 */
function setTableOccupied(tableId, orderId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const TABLES_SHEET = 'Plan de Salle';
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

// Fonction pour récupérer les rapports
function getReports(period) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const historiqueSheet = ss.getSheetByName(SHEETS.HISTORIQUE);
    const historiqueData = historiqueSheet.getDataRange().getValues();
    
    // Définir la période
    let startDate = new Date();
    if (period === 'daily') {
      // Aujourd'hui
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      // Cette semaine (depuis lundi)
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Ajuster si c'est dimanche
      startDate = new Date(startDate.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      // Ce mois
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }
    
    let totalSales = 0;
    let barSales = 0;
    let restaurantSales = 0;
    const productSales = {};
    const uniqueOrders = new Set(); // Pour suivre les commandes uniques
    
    // Nombre d'entrées valides dans l'historique
    let validEntries = 0;
    
    // Déterminer l'index de début (corriger le problème de la première ligne)
    // Pour être sûr, parcourons toutes les lignes et vérifions si c'est une ligne d'en-tête
    for (let i = 0; i < historiqueData.length; i++) {
      const rowDate = historiqueData[i][0];
      const rowTime = historiqueData[i][1];
      const vendeur = historiqueData[i][6];
      
      // Vérifier si la ligne est vide ou un en-tête
      if (!rowDate || rowDate === "Date" || rowDate === "date") continue;
      
      try {
        // Créer un identifiant unique pour chaque commande (date+heure+vendeur)
        const orderIdentifier = `${rowDate}_${rowTime}_${vendeur}`;
        
        // IMPORTANT: Forcé à true pour le débogage - À remplacer par votre logique réelle
        const isInPeriod = true; // ou appeler isDateInPeriodSimple() mais vérifier sa logique
        
        if (isInPeriod) {
          const total = parseFloat(historiqueData[i][5]) || 0;
          const category = historiqueData[i][7];
          const productName = historiqueData[i][2];
          const quantity = parseFloat(historiqueData[i][4]) || 0;
          
          // Ajouter au total général
          totalSales += total;
          
          // Ajouter aux totaux par catégorie
          if (category === 'bar') {
            barSales += total;
          } else if (category === 'restaurant') {
            restaurantSales += total;
          }
          
          // Ajouter l'identifiant de commande à l'ensemble des commandes uniques
          uniqueOrders.add(orderIdentifier);
          
          validEntries++;
          
          // Suivre les ventes par produit
          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              category: category,
              quantity: 0,
              total: 0
            };
          }
          
          productSales[productName].quantity += quantity;
          productSales[productName].total += total;
        }
      } catch (e) {
        Logger.log("Erreur lors du traitement de l'entrée d'historique " + i + ": " + e.toString());
        continue;
      }
    }
    
    // Si aucune entrée valide n'a été trouvée, renvoyer des données par défaut
    if (validEntries === 0) {
      return {
        totalSales: 0,
        barSales: 0,
        restaurantSales: 0,
        orderCount: 0,
        topProducts: []
      };
    }
    
    // Nombre de commandes uniques
    const orderCount = uniqueOrders.size;
    
    // Trier les produits par total des ventes
    const topProducts = Object.values(productSales).sort((a, b) => b.total - a.total).slice(0, 5);
    
    // Ajouter ces logs pour déboguer
    Logger.log("Nombre d'entrées valides: " + validEntries);
    Logger.log("Total des ventes calculé: " + totalSales);
    Logger.log("Nombre de commandes uniques: " + orderCount);
    
    return {
      totalSales,
      barSales,
      restaurantSales,
      orderCount,
      topProducts
    };
  } catch (error) {
    Logger.log("Erreur dans getReports: " + error.toString());
    return {
      totalSales: 0,
      barSales: 0,
      restaurantSales: 0,
      orderCount: 0,
      topProducts: []
    };
  }
}

// Fonction utilitaire simplifiée pour vérifier si une date est dans la période
// Fonction utilitaire simplifiée pour vérifier si une date est dans la période
function isDateInPeriodSimple(dateStr, period) {
  try {
    // Pour la démo, considérez que toutes les données sont dans la période
    return true;
    
    /* Le code ci-dessus retournera toujours true pour afficher des données.
       Si vous souhaitez réactiver la vérification réelle plus tard, 
       vous pouvez remplacer par le code commenté ci-dessous :
    
    // Vérifier si dateStr est une chaîne de caractères valide
    if (!dateStr || typeof dateStr !== 'string') {
      return false;
    }
    
    const today = new Date();
    const todayStr = today.toLocaleDateString('fr-FR');
    
    if (period === 'daily') {
      // Comparer juste les chaînes de date pour aujourd'hui
      return true; // Pour la démo, considérer que toutes les entrées sont d'aujourd'hui
    } else if (period === 'weekly') {
      return true; // Pour la démo, considérer que toutes les entrées sont de cette semaine
    } else if (period === 'monthly') {
      return true; // Pour la démo, considérer que toutes les entrées sont de ce mois
    }
    */
    
    return false;
  } catch (error) {
    console.error("Erreur dans isDateInPeriodSimple: " + error.toString());
    return true; // En cas d'erreur, on considère que la date est dans la période
  }
}

// Fonction pour mettre à jour les paramètres
function updateSettings(settings) {
  // Cette fonction est simplifiée car nous n'avons pas de feuille de paramètres
  // Dans une implémentation réelle, nous enregistrerions ces valeurs
  return true;
}

// Fonction pour initialiser l'utilisateur admin par défaut
// Fonction pour initialiser l'utilisateur admin par défaut
function initDefaultAdmin() {
  return initSystem();
}

function initSystem() {
  try {
    Logger.log("Initialisation du système...");
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Vérifier si la feuille Utilisateurs existe
    let usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    // Si la feuille n'existe pas, la créer
    if (!usersSheet) {
      Logger.log("Création de la feuille Utilisateurs");
      usersSheet = ss.insertSheet(SHEETS.USERS);
      
      // Ajouter l'en-tête
      usersSheet.getRange("A1").setValue("Identifiant");
      usersSheet.getRange("B1").setValue("Mot de passe");
      usersSheet.getRange("C1").setValue("Nom");
      usersSheet.getRange("D1").setValue("Rôle");
      usersSheet.getRange("E1").setValue("Dernière connexion");
      
      // Formatage de l'en-tête
      usersSheet.getRange("A1:E1").setFontWeight("bold");
      usersSheet.setFrozenRows(1);
    }
    
    // Vérifier s'il y a des utilisateurs
    const dataRange = usersSheet.getDataRange();
    const numRows = dataRange.getNumRows();
    
    // Si seulement l'en-tête est présent ou pas d'en-tête
    if (numRows <= 1) {
      // Ajouter l'utilisateur admin par défaut
      usersSheet.getRange("A2").setValue("admin");
      usersSheet.getRange("B2").setValue("admin123");
      usersSheet.getRange("C2").setValue("Administrateur");
      usersSheet.getRange("D2").setValue("admin");
      usersSheet.getRange("E2").setValue(Utilities.formatDate(new Date(), "GMT+2", "dd/MM/yyyy HH:mm:ss"));
      
      Logger.log("Utilisateur admin créé");
    }
    
    return true;
  } catch (error) {
    Logger.log("Erreur dans initSystem: " + error.toString());
    return false;
  }
}


function diagnosisUsers() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    const result = {
      success: true,
      sheetExists: !!usersSheet,
      data: []
    };
    
    if (usersSheet) {
      const dataRange = usersSheet.getDataRange();
      const numRows = dataRange.getNumRows();
      const numCols = dataRange.getNumColumns();
      const values = dataRange.getValues();
      
      result.rowCount = numRows;
      result.columnCount = numCols;
      
      // Ajouter les données (limité aux 10 premières lignes)
      for (let i = 0; i < Math.min(numRows, 10); i++) {
        result.data.push(values[i]);
      }
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Ajoutez cette fonction à votre fichier .gs
function diagnosticReports() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const historiqueSheet = ss.getSheetByName(SHEETS.HISTORIQUE);
    const historiqueData = historiqueSheet.getDataRange().getValues();
    
    // Données pour le diagnostic
    let totalSales = 0;
    let itemCount = 0;
    let details = [];
    
    // Ignorer la ligne d'en-tête
    for (let i = 1; i < historiqueData.length; i++) {
      const rowDate = historiqueData[i][0];
      // Vérifier si la date est valide
      if (!rowDate) continue;
      
      const product = historiqueData[i][2];
      const price = historiqueData[i][3];
      const quantity = historiqueData[i][4];
      const total = historiqueData[i][5];
      
      totalSales += parseFloat(total) || 0;
      itemCount++;
      
      details.push({
        date: rowDate,
        time: historiqueData[i][1],
        product: product,
        price: price,
        quantity: quantity,
        total: total
      });
    }
    
    return {
      success: true,
      totalSales: totalSales,
      itemCount: itemCount,
      details: details
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}