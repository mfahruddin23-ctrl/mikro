/**
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
        // Check if headers match or need updating
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

/**
 * Format header row with dark terminal style
 */
function formatHeaderRow(sheet, numCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground("#151b26")
             .setFontColor("#00f2fe")
             .setFontWeight("bold")
             .setFontFamily("Consolas");
  sheet.setFrozenRows(1);
}

/**
 * Generate sequential ID: e.g. CFG-0001, LOG-0001, USR-0001, TPL-0001
 */
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

/**
 * Seed initial users if sheet has only headers
 */
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

/**
 * Seed initial templates if sheet has only headers
 */
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
    ],
    [
      "TPL-0002",
      "3-WAN Weighted PCC (50M : 30M : 20M)",
      "Load Balancing",
      "PCC dengan rasio bobot 5:3:2 untuk membagi bandwidth sesuai kapasitas masing-masing ISP.",
      JSON.stringify({
        routerName: "MikroTik-PCC-3WAN-Weighted",
        rosVersion: "v7",
        multiWanMode: "pcc_weighted",
        wans: [
          { id: "w1", name: "ether1-WAN1", comment: "ISP-50M", type: "static", ipAddress: "192.168.1.2/24", gateway: "192.168.1.1", weight: 5, distance: 1, checkGateway: true },
          { id: "w2", name: "ether2-WAN2", comment: "ISP-30M", type: "static", ipAddress: "192.168.2.2/24", gateway: "192.168.2.1", weight: 3, distance: 2, checkGateway: true },
          { id: "w3", name: "ether3-WAN3", comment: "ISP-20M", type: "static", ipAddress: "192.168.3.2/24", gateway: "192.168.3.1", weight: 2, distance: 3, checkGateway: true }
        ],
        lans: [
          { id: "l1", name: "bridge-lan", ipAddress: "10.0.0.1/24", dhcpEnabled: true, dhcpPoolStart: "10.0.0.10", dhcpPoolEnd: "10.0.0.250", leaseTime: "12h" }
        ],
        dnsServers: ["1.1.1.1", "8.8.8.8"],
        dnsAllowRemote: true,
        enableFasttrack: false,
        protectRouter: true,
        dropInvalid: true,
        blockDdosRaw: true
      })
    ],
    [
      "TPL-0003",
      "Failover Recursive Routing (Host Ping Check)",
      "Routing",
      "Pendeteksian ISP down akurat via public host 8.8.8.8 & 1.1.1.1 target-scope 30.",
      JSON.stringify({
        routerName: "MikroTik-Recursive-Failover",
        rosVersion: "v7",
        multiWanMode: "recursive",
        wans: [
          { id: "w1", name: "ether1-Primary", comment: "Fiber", type: "static", ipAddress: "192.168.1.2/24", gateway: "192.168.1.1", weight: 1, distance: 1, checkGateway: true },
          { id: "w2", name: "ether2-Secondary", comment: "4G-LTE", type: "static", ipAddress: "192.168.2.2/24", gateway: "192.168.2.1", weight: 1, distance: 2, checkGateway: true }
        ],
        lans: [
          { id: "l1", name: "bridge-lan", ipAddress: "192.168.1.1/24", dhcpEnabled: true, dhcpPoolStart: "192.168.1.20", dhcpPoolEnd: "192.168.1.200", leaseTime: "12h" }
        ],
        dnsServers: ["8.8.8.8", "1.1.1.1"],
        dnsAllowRemote: true,
        enableFasttrack: true,
        protectRouter: true,
        dropInvalid: true,
        blockDdosRaw: false
      })
    ]
  ];

  sheet.getRange(2, 1, dummyTemplates.length, dummyTemplates[0].length).setValues(dummyTemplates);
  Logger.log("Seed data templates berhasil ditambahkan.");
}
