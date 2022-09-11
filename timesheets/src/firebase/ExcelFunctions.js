const ExportJsonExcel = require("js-export-excel");

export function exportPayrollSheet(data) {
    var option = {};
    option.fileName = "Smiline Payroll - " + data.sDate + " to " + data.eDate;
    option.datas = [{
        sheetData: data.body,
        sheetHeader: ["Pay Period (MM/DD/YYYY)", "Start: " + data.sDate, "End: " + data.eDate],
        columnWidths: [10, 7.5, 7.5, 20],
    }];
    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
}

export function exportTimeSheet(data) {
    var option = {};
    option.fileName = "Smiline Timesheet - " + data.sDate + " to " + data.eDate;
    option.datas = [{
        sheetData: data.body,
        // sheetHeader: ["Pay Period (MM/DD/YYYY)", "Start: " + data.sDate, "End: " + data.eDate],
        // columnWidths: [10, 7.5, 7.5, 20],
    }];
    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
}
