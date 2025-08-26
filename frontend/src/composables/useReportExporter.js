// frontend/src/composables/useReportExporter.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function useReportExporter() {
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const downloadLogReportPDF = (logs, filterValue) => {
        if (!logs || logs.length === 0) {
            // Usaremos toast na view, mas deixamos um retorno seguro aqui
            return;
        }
        
        const doc = new jsPDF();
        doc.text(`Relatório de Atividades - ${filterValue}`, 14, 15);
        const tableColumn = ["Data", "Trabalhador", "Status", "Fazenda", "Serviço", "Prod.", "Total"];
        const tableRows = logs.map(log => [
            new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            log.worker.name, log.status, log.farm?.name || 'N/A',
            log.service?.name || 'N/A', log.status === 'Presente' ? log.production : 'N/A',
            formatCurrency(log.totalPay)
        ]);

        const generationDate = new Date().toLocaleString('pt-BR');
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            didDrawPage: (data) => {
                const pageHeight = doc.internal.pageSize.getHeight();
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Relatório gerado em: ${generationDate}`, data.settings.margin.left, pageHeight - 10);
            },
        });

        // --- A MUDANÇA ESTÁ AQUI ---
        // Em vez de doc.save(), usamos doc.output() para abrir em uma nova guia.
        doc.output('dataurlnewwindow');
    };

    const downloadLogReportExcel = (logs, filterValue) => {
        if (!logs || logs.length === 0) {
            // Usaremos toast na view
            return;
        }

        const dataToExport = logs.map(log => ({
          'Data': new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          'Trabalhador': log.worker.name, 'Status': log.status, 'Fazenda': log.farm?.name || 'N/A',
          'Serviço': log.service?.name || 'N/A', 'Produção': log.status === 'Presente' ? log.production : 'N/A',
          'Preço Unit.': log.status === 'Presente' ? log.unitPrice : 'N/A', 'Pagamento Total': log.totalPay
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Atividades");
        XLSX.writeFile(workbook, `relatorio_atividades_${filterValue}.xlsx`);
    };

    // As funções para o relatório anual permanecem as mesmas
    const downloadAnnualReportPDF = (reportData, year) => {
        if (!reportData || reportData.length === 0) return alert('Não há dados para exportar.');
        
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.text(`Relatório Anual de Dias Trabalhados - ${year}`, 14, 15);
        const tableColumn = ["Trabalhador", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Total"];
        const tableRows = reportData.map(workerReport => {
            const row = [workerReport.workerName];
            for (let i = 1; i <= 12; i++) {
                const monthData = workerReport.monthlyData.find(m => m.month === i);
                row.push(monthData ? monthData.days : 0);
            }
            row.push(workerReport.totalDays);
            return row;
        });

        const generationDate = new Date().toLocaleString('pt-BR');
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            didDrawPage: (data) => {
                const pageHeight = doc.internal.pageSize.getHeight();
                doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Relatório gerado em: ${generationDate}`, data.settings.margin.left, pageHeight - 10);
            },
        });
        doc.output('dataurlnewwindow');
    };

    const downloadAnnualReportExcel = (reportData, year) => {
        if (!reportData || reportData.length === 0) return alert('Não há dados para exportar.');

        const getMonthName = (monthNum) => {
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return months[monthNum - 1];
        };

        const dataToExport = reportData.map(workerReport => {
            const row = { 'Trabalhador': workerReport.workerName };
            for (let i = 1; i <= 12; i++) {
                const monthName = getMonthName(i);
                const monthData = workerReport.monthlyData.find(m => m.month === i);
                row[monthName] = monthData ? monthData.days : 0;
            }
            row['Total Dias'] = workerReport.totalDays;
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Relatório Anual ${year}`);
        XLSX.writeFile(workbook, `relatorio_anual_${year}.xlsx`);
    };

    return { downloadLogReportPDF, downloadLogReportExcel, downloadAnnualReportPDF, downloadAnnualReportExcel };
}