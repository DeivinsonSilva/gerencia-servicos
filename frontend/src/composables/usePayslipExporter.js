// frontend/src/composables/usePayslipExporter.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function usePayslipExporter() {
    const formatCurrency = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return '-';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const getMonthName = (monthNum) => {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return months[monthNum - 1];
    };

    const generatePDF = (payslipData, dateHeaders, filters, groupLabels) => {
        if (Object.keys(payslipData).length === 0) return alert('Não há dados para exportar.');

        const doc = new jsPDF({ orientation: 'landscape' });
        const generationDate = new Date().toLocaleString('pt-BR');
        const period = `${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`;
        let startY = 15;

        doc.setFontSize(16);
        doc.text("Folha de Pagamento", 14, startY);
        startY += 7;
        doc.setFontSize(10);
        doc.text(`Período: ${period}`, 14, startY);
        startY += 10;

        for (const groupKey in payslipData) {
            const groupData = payslipData[groupKey];
            if(groupData.length === 0) continue;

            doc.setFontSize(12);
            doc.setTextColor(40);
            doc.text(groupLabels[groupKey], 14, startY);

            const isRegistered = groupKey === 'registrados';
            const head = [['Nomes']];
            dateHeaders.forEach(h => head[0].push(`${h.dayOfMonth}\n${h.dayOfWeek}`));
            head[0].push('Salário Total');
            if(isRegistered) head[0].push('INSS', 'Sal. Família');
            head[0].push('Saldo', 'Desc. Eventual', 'Desc. Recorrente', 'Líquido a Receber');

            const body = groupData.map(item => {
                const row = [item.workerName];
                dateHeaders.forEach(day => row.push(item.dailyPayments[day.fullDate] ? item.dailyPayments[day.fullDate].toFixed(2) : '-'));
                row.push(formatCurrency(item.grossPay));
                if(isRegistered) {
                    row.push(formatCurrency(item.inssDeduction));
                    row.push(formatCurrency(item.salarioFamilia));
                }
                row.push(formatCurrency(item.saldo));
                row.push(formatCurrency(item.desconto));
                row.push(formatCurrency(item.recurringDiscount));
                row.push(formatCurrency(item.netPay));
                return row;
            });

            autoTable(doc, {
                head: head,
                body: body,
                startY: startY + 2,
                theme: 'grid',
                styles: { fontSize: 5, cellPadding: 1, halign: 'center' },
                headStyles: { fillColor: [41, 51, 65], fontSize: 5, halign: 'center' },
                columnStyles: { 0: { halign: 'left' } },
                didDrawPage: (data) => {
                    const pageHeight = doc.internal.pageSize.getHeight();
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(`Gerado em: ${generationDate}`, data.settings.margin.left, pageHeight - 10);
                }
            });

            startY = doc.lastAutoTable.finalY + 15;
            if (startY > doc.internal.pageSize.getHeight() - 30) {
                doc.addPage();
                startY = 15;
            }
        }
        doc.output('dataurlnewwindow');
    };

    const generateExcel = (payslipData, dateHeaders, filters, groupLabels) => {
         if (Object.keys(payslipData).length === 0) return alert('Não há dados para exportar.');

         const workbook = XLSX.utils.book_new();

         for (const groupKey in payslipData) {
            const groupData = payslipData[groupKey];
            if(groupData.length === 0) continue;
            const isRegistered = groupKey === 'registrados';

            const dataToExport = groupData.map(item => {
                const row = { 'Trabalhador': item.workerName };
                dateHeaders.forEach(day => {
                    row[`${day.dayOfMonth}/${day.dayOfWeek}`] = item.dailyPayments[day.fullDate] || 0;
                });
                row['Salário Total'] = item.grossPay;
                if(isRegistered) {
                    row['INSS'] = item.inssDeduction;
                    row['Sal. Família'] = item.salarioFamilia;
                }
                row['Saldo'] = item.saldo;
                row['Desc. Eventual'] = item.desconto;
                row['Desc. Recorrente'] = item.recurringDiscount;
                row['Líquido a Receber'] = item.netPay;
                return row;
            });
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            XLSX.utils.book_append_sheet(workbook, worksheet, groupLabels[groupKey].substring(0, 31)); // Limita o nome da aba
         }

        XLSX.writeFile(workbook, `folha_pagamento_${filters.startDate}_a_${filters.endDate}.xlsx`);
    };

    return { generatePDF, generateExcel };
}