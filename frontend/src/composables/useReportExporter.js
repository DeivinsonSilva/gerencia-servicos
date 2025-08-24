// frontend/src/composables/useReportExporter.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper para formatar moeda
const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Helper para obter o nome do mês
const getMonthName = (monthNum) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[monthNum - 1];
};

export function useReportExporter() {
    
    // --- EXPORTADORES PARA RELATÓRIO DE LOGS (DIÁRIO/MENSAL) ---

    const downloadLogReportPDF = (logs, filterValue) => {
        if (!logs || logs.length === 0) return alert('Não há dados para exportar.');
        
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
                doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Relatório gerado em: ${generationDate}`, data.settings.margin.left, pageHeight - 10);
            },
        });
        doc.save(`relatorio_atividades_${filterValue}.pdf`);
    };

    const downloadLogReportExcel = (logs, filterValue) => {
        if (!logs || logs.length === 0) return alert('Não há dados para exportar.');

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

    // --- NOVOS EXPORTADORES PARA RELATÓRIO ANUAL ---

    const downloadAnnualReportPDF = (reportData, year) => {
        if (!reportData || reportData.length === 0) return alert('Não há dados para exportar.');
        
        const doc = new jsPDF({ orientation: 'landscape' }); // PDF deitado para caber mais colunas
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
        doc.save(`relatorio_anual_${year}.pdf`);
    };

    const downloadAnnualReportExcel = (reportData, year) => {
        if (!reportData || reportData.length === 0) return alert('Não há dados para exportar.');

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