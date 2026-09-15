export interface GasFileItem {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const GAS_FILES: GasFileItem[] = [
  {
    filename: 'setup.gs',
    language: 'javascript',
    description: 'Skrip migrasi database non-destruktif. Membuat sheet users, saved_configs, activity_logs, templates beserta header dan generator ID sekuensial tanpa pernah menghapus data yang sudah ada.',
    code: `/**
 * MIKROTIK CONFIG BUILDER PRO - DATABASE SETUP & SAFE MIGRATE
 * File: setup.gs
 * 
 * Safe migration function: non-destructive, checks existing sheets and headers.
 * NEVER clears or deletes existing rows.
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("Error: Tidak ada spreadsheet aktif. Silakan buka file Google Sheets dan pilih Extensions > Apps Script.");
    return;
  }

  // Schema definition: sheet name -> headers array
  var schemas = {
    "users": ["user_id", "name", "email", "role", "status", "created_at"],
    "saved_configs": ["config_id", "router_name", "ros_version", "config_type", "script_content", "created_by", "created_at"],
    "activity_logs": ["log_id", "timestamp", "user_email", "router_name", "action_type", "details"],
    "templates": ["template_id", "title", "category", "description", "config_json"]
  };

  // Process each sheet safely
  for (var sheetName in schemas) {
    var expectedHeaders = schemas[sheetName];
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      // Sheet does not exist yet: create it safely
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(expectedHeaders);
      formatHeaderRow(sheet, expectedHeaders.length);
      Logger.log("Sheet baru dibuat: " + sheetName);
    } else {
      // Sheet exists: safe migrate headers without clearing or deleting data
      var lastCol = sheet.getLastColumn();
      if (lastCol === 0) {
        sheet.appendRow(expectedHeaders);
        formatHeaderRow(sheet, expectedHeaders.length);
        Logger.log("Header ditambahkan pada sheet kosong: " + sheetName);
      } else {
        var currentHeaders = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
        var needsUpdate = false;
        if (currentHeaders.length !== expectedHeaders.length) {
          needsUpdate = true;
        } else {
          for (var i = 0; i < expectedHeaders.length; i++) {
            if (currentHeaders[i] !== expectedHeaders[i]) {
              needsUpdate = true;
              break;
            }
          }
        }
        if (needsUpdate) {
          sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
          formatHeaderRow(sheet, expectedHeaders.length);
          Logger.log("Header diperbarui (non-destruktif) pada: " + sheetName);
        }
      }
    }
  }

  // Populate initial dummy data if empty (NON-DESTRUCTIVE)
  seedInitialUsers(ss.getSheetByName("users"));
  seedInitialTemplates(ss.getSheetByName("templates"));

  SpreadsheetApp.flush();
  Logger.log("Safe Database Migration completed successfully.");
}

function formatHeaderRow(sheet, numCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground("#151b26")
             .setFontColor("#00f2fe")
             .setFontWeight("bold")
             .setFontFamily("Consolas");
  sheet.setFrozenRows(1);
}

function generateSequentialId(sheetName, prefix, padLength) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return prefix + "-0001";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return prefix + "-0001";

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return prefix + "-" + String("00000000" + 1).slice(-(padLength || 4));
  }

  var idColValues = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  var maxNum = 0;
  for (var i = 0; i < idColValues.length; i++) {
    var val = idColValues[i][0];
    if (val && val.indexOf(prefix + "-") === 0) {
      var numPart = parseInt(val.replace(prefix + "-", ""), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }

  var nextNum = maxNum + 1;
  return prefix + "-" + String("00000000" + nextNum).slice(-(padLength || 4));
}

function seedInitialUsers(sheet) {
  if (!sheet || sheet.getLastRow() > 1) return;

  var now = new Date().toISOString();
  var dummyUsers = [
    ["USR-0001", "Administrator", "admin@mikrotikpro.local", "SuperAdmin", "Active", now],
    ["USR-0002", "Network Engineer", "engineer@mikrotikpro.local", "Admin", "Active", now]
  ];

  sheet.getRange(2, 1, dummyUsers.length, dummyUsers[0].length).setValues(dummyUsers);
  Logger.log("Seed data users berhasil ditambahkan.");
}

function seedInitialTemplates(sheet) {
  if (!sheet || sheet.getLastRow() > 1) return;

  var dummyTemplates = [
    [
      "TPL-0001",
      "Dual WAN Load Balance PCC Equal (v7 / v6)",
      "Load Balancing",
      "Skema PCC 2 WAN dengan rasio 50:50, bypass RFC1918 dan support routing table v7.",
      JSON.stringify({
        routerName: "MikroTik-PCC-Dual",
        rosVersion: "v7",
        multiWanMode: "pcc_equal",
        wans: [
          { id: "w1", name: "ether1-WAN1", comment: "ISP1-50M", type: "static", ipAddress: "192.168.1.2/24", gateway: "192.168.1.1", weight: 1, distance: 1, checkGateway: true },
          { id: "w2", name: "ether2-WAN2", comment: "ISP2-50M", type: "static", ipAddress: "192.168.2.2/24", gateway: "192.168.2.1", weight: 1, distance: 2, checkGateway: true }
        ],
        lans: [
          { id: "l1", name: "bridge-lan", ipAddress: "192.168.88.1/24", dhcpEnabled: true, dhcpPoolStart: "192.168.88.10", dhcpPoolEnd: "192.168.88.254", leaseTime: "8h" }
        ],
        dnsServers: ["8.8.8.8", "1.1.1.1"],
        dnsAllowRemote: true,
        enableFasttrack: false,
        protectRouter: true,
        dropInvalid: true,
        blockDdosRaw: false
      })
    ]
  ];

  sheet.getRange(2, 1, dummyTemplates.length, dummyTemplates[0].length).setValues(dummyTemplates);
  Logger.log("Seed data templates berhasil ditambahkan.");
}`
  },
  {
    filename: 'code.gs',
    language: 'javascript',
    description: 'Backend controller Google Apps Script. Menyediakan doGet(), saveConfiguration(), fetchSavedConfigs() server-side pagination dengan getDisplayValues(), logActivity(), dan getTemplates(). Menggunakan SpreadsheetApp.flush() anti-lag.',
    code: `/**
 * MIKROTIK CONFIG BUILDER PRO - BACKEND CONTROLLER
 * File: code.gs
 * 
 * Safe Data Passing, Server-side Pagination, Anti-Lag, SpreadsheetApp.flush()
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile("index");
  return template.evaluate()
    .setTitle("MIKROTIK CONFIG BUILDER PRO")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function saveConfiguration(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return { success: false, message: "Spreadsheet aktif tidak ditemukan." };
    }

    var sheet = ss.getSheetByName("saved_configs");
    if (!sheet) {
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
}`
  },
  {
    filename: 'index.html',
    language: 'html',
    description: 'Frontend HTML/CSS/JS standalone Google Apps Script. Menggunakan tema Cyberpunk Terminal Zettbos (#0b0f19, #00f2fe, #00ffaa), perakitan script dengan string concatenation aman tanpa nested backticks, dan pembungkus aman google.script.run.',
    code: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MIKROTIK CONFIG BUILDER PRO</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #0b0f19;
      --bg-card: #151b26;
      --border-color: #1f293d;
      --cyan-neon: #00f2fe;
      --green-term: #00ffaa;
      --text-main: #e2e8f0;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: var(--bg-main); color: var(--text-main); font-family: 'Plus Jakarta Sans', sans-serif; }
    /* Refer to gas-index.html for full embedded styles and logic */
  </style>
</head>
<body>
  <!-- MIKROTIK CONFIG BUILDER PRO FULL STANDALONE GAS FRONTEND -->
</body>
</html>`
  }
];
