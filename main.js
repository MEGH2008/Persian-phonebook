const tableBody = document.getElementById("tableBody");
    const searchBar = document.getElementById("searchBar");
    const professionFilter = document.getElementById("professionFilter");

    // Add Row
    function addRow() {
        const row = document.createElement("tr");

        const fields = ['نام جدید', 'شغل', 'کد', 'شماره'];
        fields.forEach(text => {
            const td = document.createElement("td");
            td.contentEditable = false;
            td.innerText = text;
            row.appendChild(td);
        });

        const actionTd = document.createElement("td");
        actionTd.className = "actions";
        actionTd.innerHTML = `
            <button class="edit-btn" onclick="editRow(this)">✏️ ویرایش</button>
            <button class="delete-btn" onclick="deleteRow(this)">🗑 حذف</button>`;
        row.appendChild(actionTd);
        tableBody.appendChild(row);

        updateProfessionFilter();
    }

    // Delete Row
    function deleteRow(btn) {
        if (confirm("آیا مطمئن هستید؟")) {
            const row = btn.closest("tr");
            row.remove();
        }
    }

    // Edit Row
    function editRow(btn) {
        const row = btn.closest("tr");
        const cells = row.querySelectorAll("td:not(.actions)");

        const isEditing = cells[0].contentEditable === "true";
        if (isEditing) {
            if (confirm("آیا مطمئن هستید که می‌خواهید ذخیره کنید؟")) {
                cells.forEach(cell => cell.contentEditable = "false");
                btn.innerText = "✏️ ویرایش";
            }
        } else {
            cells.forEach(cell => cell.contentEditable = "true");
            btn.innerText = "✔ ذخیره";
        }
    }

    // Search Filter
    searchBar.addEventListener("input", () => {
        const term = searchBar.value.toLowerCase();
        Array.from(tableBody.rows).forEach(row => {
            const nameCell = row.cells[0];
            row.style.display = nameCell.textContent.toLowerCase().includes(term) ? "" : "none";
        });
    });

    // Profession Filter
    professionFilter.addEventListener("change", () => {
        const selected = professionFilter.value;
        Array.from(tableBody.rows).forEach(row => {
            const profession = row.cells[1].textContent;
            row.style.display = selected === "" || profession === selected ? "" : "none";
        });
    });

    // Update Profession Dropdown
    function updateProfessionFilter() {
        const professions = new Set();
        Array.from(tableBody.rows).forEach(row => {
            const job = row.cells[1].textContent;
            professions.add(job);
        });

        professionFilter.innerHTML = '<option value="">همه مشاغل</option>';
        professions.forEach(prof => {
            const opt = document.createElement("option");
            opt.value = prof;
            opt.textContent = prof;
            professionFilter.appendChild(opt);
        });
    }

    // Export Popup
    function toggleExportPopup() {
        const popup = document.getElementById("exportPopup");
        popup.style.display = (popup.style.display === "block") ? "none" : "block";
    }

    // Export to Excel
    function exportToExcel() {
        const wb = XLSX.utils.book_new();
        const data = [["نام", "شغل", "کد سازمانی", "شماره تلفن"]];
        Array.from(tableBody.rows).forEach(row => {
            const rowData = Array.from(row.cells).slice(0, 4).map(td => td.textContent);
            data.push(rowData);
        });
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Phonebook");
        XLSX.writeFile(wb, "phonebook.xlsx");
    }

    // Export to PDF
    async function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("دفترچه تلفن", 105, 20, null, null, "center");

        let y = 30;
        Array.from(tableBody.rows).forEach((row, i) => {
            const rowData = Array.from(row.cells).slice(0, 4).map(td => td.textContent);
            doc.text(rowData.join(" | "), 10, y);
            y += 10;
        });
        doc.save("phonebook.pdf");
    }

    // Export to Word
    function exportToWord() {
        let html = "<table><tr><th>نام</th><th>شغل</th><th>کد سازمانی</th><th>شماره تلفن</th></tr>";
        Array.from(tableBody.rows).forEach(row => {
            html += "<tr>";
            Array.from(row.cells).slice(0, 4).forEach(cell => {
                html += `<td>${cell.textContent}</td>`;
            });
            html += "</tr>";
        });
        html += "</table>";

        const blob = new Blob(['<html><head><meta charset="utf-8"></head><body>' + html + '</body></html>'], {
            type: 'application/msword'
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "phonebook.doc";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Initial call
    updateProfessionFilter();
    function saveToLocalStorage() {
    const data = [];
    Array.from(tableBody.rows).forEach(row => {
        const rowData = Array.from(row.cells).slice(0, 4).map(td => td.textContent);
        data.push(rowData);
    });
    localStorage.setItem("phonebookData", JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("phonebookData"));
    if (data && Array.isArray(data)) {
        tableBody.innerHTML = ""; // Clear default rows
        data.forEach(rowData => {
            const row = document.createElement("tr");
            rowData.forEach(text => {
                const td = document.createElement("td");
                td.contentEditable = false;
                td.textContent = text;
                row.appendChild(td);
            });
            const actionTd = document.createElement("td");
            actionTd.className = "actions";
            actionTd.innerHTML = `
                <button class="edit-btn" onclick="editRow(this)">✏️ ویرایش</button>
                <button class="delete-btn" onclick="deleteRow(this)">🗑 حذف</button>`;
            row.appendChild(actionTd);
            tableBody.appendChild(row);
        });
    }
    updateProfessionFilter();
}
function addRow() {
    const row = document.createElement("tr");
    const fields = ['نام جدید', 'شغل', 'کد', 'شماره'];
    fields.forEach(text => {
        const td = document.createElement("td");
        td.contentEditable = false;
        td.innerText = text;
        row.appendChild(td);
    });
    const actionTd = document.createElement("td");
    actionTd.className = "actions";
    actionTd.innerHTML = `
        <button class="edit-btn" onclick="editRow(this)">✏️ ویرایش</button>
        <button class="delete-btn" onclick="deleteRow(this)">🗑 حذف</button>`;
    row.appendChild(actionTd);
    tableBody.appendChild(row);
    updateProfessionFilter();
    saveToLocalStorage(); // 🔸 Save after add
}

function editRow(btn) {
    const row = btn.closest("tr");
    const cells = row.querySelectorAll("td:not(.actions)");
    const isEditing = cells[0].contentEditable === "true";
    if (isEditing) {
        if (confirm("آیا مطمئن هستید که می‌خواهید ذخیره کنید؟")) {
            cells.forEach(cell => cell.contentEditable = "false");
            btn.innerText = "✏️ ویرایش";
            saveToLocalStorage(); // 🔸 Save after edit
            updateProfessionFilter();
        }
    } else {
        cells.forEach(cell => cell.contentEditable = "true");
        btn.innerText = "✔ ذخیره";
    }
}

function deleteRow(btn) {
    if (confirm("آیا مطمئن هستید؟")) {
        const row = btn.closest("tr");
        row.remove();
        saveToLocalStorage(); // 🔸 Save after delete
        updateProfessionFilter();
    }
}




    window.onload = function () {
        loadFromLocalStorage(); // Load saved data
    };