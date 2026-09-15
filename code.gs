/**
 * MIKROTIK CONFIG BUILDER PRO - BACKEND CONTROLLER
 * File: code.gs
 * 
 * Safe Data Passing, Server-side Pagination, Anti-Lag, SpreadsheetApp.flush()
 */

/**
 * Serves the HTML Web App
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile("index");
  return template.evaluate()
    .setTitle("MIKROTIK CONFIG BUILDER PRO")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Save generated configuration script to Google Sheets
 */
function saveConfiguration(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return { success: false, message: "Spreadsheet aktif tidak ditemukan." };
    }

    var sheet = ss.getSheetByName("saved_configs");
    if (!sheet) {
      // If table does not exist, run setup migration safely
      setupDatabase();
      sheet = ss.getSheetByName("saved_configs");
    }

    var configId = generateSequentialId("saved_configs", "CFG", 4);
    var nowStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var userEmail = Session.getActiveUser().getEmail() || "anonymous@local";

    var routerName = String(payload.router_name || "MikroTik-Router");
    var rosVersion = String(payload.ros_version || "v7");
    var configType = String(payload.config_type || "Custom Config");
    var scriptContent = String(payload.script_content || "");
    var createdBy = String(payload.created_by || userEmail);

    sheet.appendRow([
      configId,
      routerName,
      rosVersion,
      configType,
      scriptContent,
      createdBy,
      nowStr
    ]);

    // Anti-lag: Flush write buffer immediately
    SpreadsheetApp.flush();

    // Log Activity
    logActivity("SAVE_CONFIG", routerName, "Saved configuration " + configId + " (" + configType + ")");

    return {
      success: true,
      data: {
        config_id: configId,
        router_name: routerName,
        ros_version: rosVersion,
        config_type: configType,
        script_content: scriptContent,
        created_by: createdBy,
        created_at: nowStr
      },
      message: "Konfigurasi " + configId + " berhasil disimpan ke Spreadsheet."
    };
  } catch (err) {
    Logger.log("Error in saveConfiguration: " + err.toString());
    return { success: false, message: err.toString() };
  }
}

/**
 * Server-side pagination and filtering for saved configs
 * Never sends the entire raw sheet to frontend.
 */
function fetchSavedConfigs(page, limit, search) {
  try {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;
    search = search ? String(search).trim().toLowerCase() : "";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return { data: [], total: 0, page: page, totalPages: 0 };

    var sheet = ss.getSheetByName("saved_configs");
    if (!sheet) return { data: [], total: 0, page: page, totalPages: 0 };

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { data: [], total: 0, page: 1, totalPages: 0 };
    }

    // Safe Data Passing: getDisplayValues() converts all numbers/dates to pure strings
    var values = sheet.getRange(2, 1, lastRow - 1, 7).getDisplayValues();

    // Invert to show newest first
    var filtered = [];
    for (var i = values.length - 1; i >= 0; i--) {
      var row = values[i];
      var configId = row[0] || "";
      var routerName = row[1] || "";
      var rosVersion = row[2] || "";
      var configType = row[3] || "";
      var scriptContent = row[4] || "";
      var createdBy = row[5] || "";
      var createdAt = row[6] || "";

      if (search) {
        var match = (
          configId.toLowerCase().indexOf(search) !== -1 ||
          routerName.toLowerCase().indexOf(search) !== -1 ||
          configType.toLowerCase().indexOf(search) !== -1 ||
          createdBy.toLowerCase().indexOf(search) !== -1
        );
        if (!match) continue;
      }

      filtered.push({
        config_id: configId,
        router_name: routerName,
        ros_version: rosVersion,
        config_type: configType,
        script_content: scriptContent,
        created_by: createdBy,
        created_at: createdAt
      });
    }

    var total = filtered.length;
    var totalPages = Math.ceil(total / limit) || 1;
    var offset = (page - 1) * limit;
    var pagedData = filtered.slice(offset, offset + limit);

    return {
      success: true,
      data: pagedData,
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages
    };
  } catch (err) {
    Logger.log("Error in fetchSavedConfigs: " + err.toString());
    return { success: false, data: [], total: 0, page: 1, totalPages: 0, message: err.toString() };
  }
}

/**
 * Log action activity to activity_logs sheet
 */
function logActivity(action, routerName, details) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;
    var sheet = ss.getSheetByName("activity_logs");
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName("activity_logs");
    }

    var logId = generateSequentialId("activity_logs", "LOG", 4);
    var nowStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var userEmail = Session.getActiveUser().getEmail() || "anonymous@local";

    sheet.appendRow([
      logId,
      nowStr,
      userEmail,
      String(routerName || "System"),
      String(action || "INFO"),
      String(details || "")
    ]);

    SpreadsheetApp.flush();
  } catch (err) {
    Logger.log("Error logging activity: " + err.toString());
  }
}

/**
 * Fetch industrial templates from sheet
 */
function getTemplates() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return { success: false, data: [] };

    var sheet = ss.getSheetByName("templates");
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName("templates");
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, data: [] };
    }

    var values = sheet.getRange(2, 1, lastRow - 1, 5).getDisplayValues();
    var templates = [];

    for (var i = 0; i < values.length; i++) {
      templates.push({
        template_id: values[i][0],
        title: values[i][1],
        category: values[i][2],
        description: values[i][3],
        config_json: values[i][4]
      });
    }

    return { success: true, data: templates };
  } catch (err) {
    Logger.log("Error getTemplates: " + err.toString());
    return { success: false, data: [], message: err.toString() };
  }
}
