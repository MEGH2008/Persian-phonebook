let phonebookData = []
let filteredData = []
let editId = null
let currentPage = 1
const rowsPerPage = 5
let sortColumn = null
let sortDirection = 1

const tableBody = document.getElementById("tableBody")
const searchBar = document.getElementById("searchBar")
const professionFilter = document.getElementById("professionFilter")
const btnAdd = document.getElementById("btnAdd")
const paginationDiv = document.getElementById("pagination")
const modalOverlay = document.getElementById("modalOverlay")
const modalTitle = document.getElementById("modalTitle")
const modalName = document.getElementById("modalName")
const modalJob = document.getElementById("modalJob")
const modalCode = document.getElementById("modalCode")
const modalPhone = document.getElementById("modalPhone")
const modalFavorite = document.getElementById("modalFavorite")
const saveBtn = document.getElementById("saveBtn")
const cancelBtn = document.getElementById("cancelBtn")
const exportModal = document.getElementById("exportModal")
const btnExport = document.getElementById("btnExport")
const btnExcel = document.getElementById("btnExcel")
const btnPdf = document.getElementById("btnPdf")
const btnWord = document.getElementById("btnWord")
const btnCsv = document.getElementById("btnCsv")
const btnJson = document.getElementById("btnJson")
const closeExportModal = document.getElementById("closeExportModal")
const notificationContainer = document.getElementById("notificationContainer")

window.addEventListener("DOMContentLoaded", init)

function init() {
  loadDataFromLocalStorage()
  searchBar.addEventListener("input", onSearch)
  professionFilter.addEventListener("change", onFilter)
  btnAdd.addEventListener("click", openModalForAdd)
  saveBtn.addEventListener("click", handleSave)
  cancelBtn.addEventListener("click", closeModal)
  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => onSort(th.getAttribute("data-col")))
  })
  btnExport.addEventListener("click", () => toggleExportModal(true))
  closeExportModal.addEventListener("click", () => toggleExportModal(false))
  btnExcel.addEventListener("click", exportToExcel)
  btnPdf.addEventListener("click", exportToPDF)
  btnWord.addEventListener("click", exportToWord)
  btnCsv.addEventListener("click", exportToCSV)
  btnJson.addEventListener("click", exportToJSON)
  render()
}

function loadDataFromLocalStorage() {
  const data = localStorage.getItem("phonebookDataV2")
  if (data) {
    phonebookData = JSON.parse(data)
  } else {
    phonebookData = [
      { id: 1, name: "علی احمدی", job: "مدیر", code: "101", phone: "09120000001", favorite: false },
      { id: 2, name: "فاطمه رضایی", job: "کارشناس", code: "202", phone: "09120000002", favorite: false },
      { id: 3, name: "حمید موسوی", job: "کارمند", code: "303", phone: "09120000003", favorite: false },
      { id: 4, name: "سارا کریمی", job: "طراح", code: "404", phone: "09120000004", favorite: true }
    ]
    saveDataToLocalStorage()
  }
  filteredData = [...phonebookData]
}

function saveDataToLocalStorage() {
  localStorage.setItem("phonebookDataV2", JSON.stringify(phonebookData))
}

function render() {
  applySort()
  updateProfessionFilter()
  applySearchFilter()
  applyProfessionFilter()
  renderTable()
  renderPagination()
}

function updateProfessionFilter() {
  const allJobs = new Set(phonebookData.map(i => i.job))
  const val = professionFilter.value
  professionFilter.innerHTML = "<option value=''>همه مشاغل</option>"
  allJobs.forEach(job => {
    const opt = document.createElement("option")
    opt.value = job
    opt.textContent = job
    professionFilter.appendChild(opt)
  })
  professionFilter.value = val
}

function renderTable() {
  tableBody.innerHTML = ""
  const start = (currentPage - 1) * rowsPerPage
  const end = start + rowsPerPage
  const pageData = filteredData.slice(start, end)
  pageData.forEach(item => {
    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.job}</td>
      <td>${item.code}</td>
      <td>${item.phone}</td>
      <td>${item.favorite ? "⭐" : ""}</td>
      <td>
        <button class="btn" onclick="editItem(${item.id})">ویرایش</button>
        <button class="btn" onclick="deleteItem(${item.id})">حذف</button>
      </td>
    `
    tableBody.appendChild(tr)
  })
}

function renderPagination() {
  paginationDiv.innerHTML = ""
  const pageCount = Math.ceil(filteredData.length / rowsPerPage)
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button")
    btn.innerText = i
    if (currentPage === i) btn.classList.add("active")
    btn.addEventListener("click", () => {
      currentPage = i
      render()
    })
    paginationDiv.appendChild(btn)
  }
}

function onSearch() {
  currentPage = 1
  render()
}

function onFilter() {
  currentPage = 1
  render()
}

function applySearchFilter() {
  const term = searchBar.value.toLowerCase()
  filteredData = phonebookData.filter(item => item.name.toLowerCase().includes(term))
}

function applyProfessionFilter() {
  const val = professionFilter.value
  if (val) {
    filteredData = filteredData.filter(item => item.job === val)
  }
}

function onSort(col) {
  if (sortColumn === col) {
    sortDirection *= -1
  } else {
    sortColumn = col
    sortDirection = 1
  }
  currentPage = 1
  render()
}

function applySort() {
  if (!sortColumn) return
  filteredData.sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return -1 * sortDirection
    if (a[sortColumn] > b[sortColumn]) return 1 * sortDirection
    return 0
  })
}

function openModalForAdd() {
  editId = null
  modalTitle.textContent = "افزودن مخاطب"
  modalName.value = ""
  modalJob.value = ""
  modalCode.value = ""
  modalPhone.value = ""
  modalFavorite.checked = false
  toggleModal(true)
}

function editItem(id) {
  const item = phonebookData.find(x => x.id === id)
  if (!item) return
  editId = id
  modalTitle.textContent = "ویرایش مخاطب"
  modalName.value = item.name
  modalJob.value = item.job
  modalCode.value = item.code
  modalPhone.value = item.phone
  modalFavorite.checked = item.favorite
  toggleModal(true)
}

function handleSave() {
  const name = modalName.value.trim()
  const job = modalJob.value.trim()
  const code = modalCode.value.trim()
  const phone = modalPhone.value.trim()
  const favorite = modalFavorite.checked
  if (!name || !job || !code || !phone) {
    showNotification("همه فیلدها اجباری هستند.", "error")
    return
  }
  if (!/^\d+$/.test(code)) {
    showNotification("کد سازمانی باید فقط عدد باشد.", "error")
    return
  }
  if (!/^\d{7,13}$/.test(phone)) {
    showNotification("شماره تلفن باید ۷ تا ۱۳ رقم باشد.", "error")
    return
  }
  if (editId) {
    const idx = phonebookData.findIndex(x => x.id === editId)
    phonebookData[idx].name = name
    phonebookData[idx].job = job
    phonebookData[idx].code = code
    phonebookData[idx].phone = phone
    phonebookData[idx].favorite = favorite
    showNotification("ویرایش انجام شد.", "success")
  } else {
    const newId = phonebookData.length ? Math.max(...phonebookData.map(x => x.id)) + 1 : 1
    phonebookData.push({ id: newId, name, job, code, phone, favorite })
    showNotification("مخاطب جدید افزوده شد.", "success")
  }
  saveDataToLocalStorage()
  toggleModal(false)
  render()
}

function deleteItem(id) {
  if (!confirm("آیا از حذف این مخاطب مطمئن هستید؟")) return
  phonebookData = phonebookData.filter(x => x.id !== id)
  saveDataToLocalStorage()
  showNotification("حذف انجام شد.", "info")
  currentPage = 1
  render()
}

function toggleModal(show) {
  if (show) {
    modalOverlay.classList.add("show")
  } else {
    modalOverlay.classList.remove("show")
    editId = null
  }
}

function closeModal() {
  toggleModal(false)
}

function toggleExportModal(show) {
  if (show) {
    exportModal.classList.add("show")
  } else {
    exportModal.classList.remove("show")
  }
}

function exportToExcel() {
  const wb = XLSX.utils.book_new()
  const data = [["نام","شغل","کد","تلفن","علاقه‌مندی"]]
  phonebookData.forEach(i => {
    data.push([i.name, i.job, i.code, i.phone, i.favorite ? "⭐" : ""])
  })
  const ws = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, "Phonebook")
  XLSX.writeFile(wb, "phonebook.xlsx")
}

function exportToPDF() {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  doc.text("دفترچه تلفن", 105, 20, null, null, "center")
  let y = 30
  phonebookData.forEach(item => {
    const line = [
      item.name, item.job, item.code, item.phone, item.favorite ? "⭐" : ""
    ].join(" | ")
    doc.text(line, 10, y)
    y += 10
  })
  doc.save("phonebook.pdf")
}

function exportToWord() {
  let html = "<table><tr><th>نام</th><th>شغل</th><th>کد</th><th>تلفن</th><th>علاقه‌مندی</th></tr>"
  phonebookData.forEach(item => {
    html += "<tr>"
    html += `<td>${item.name}</td><td>${item.job}</td><td>${item.code}</td><td>${item.phone}</td><td>${item.favorite ? "⭐" : ""}</td>`
    html += "</tr>"
  })
  html += "</table>"
  const blob = new Blob(['<html><head><meta charset="utf-8"></head><body>' + html + '</body></html>'], { type: 'application/msword' })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = "phonebook.doc"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function exportToCSV() {
  let csv = "نام,شغل,کد,تلفن,علاقه‌مندی\n"
  phonebookData.forEach(item => {
    csv += [
      item.name, item.job, item.code, item.phone, item.favorite ? "⭐" : ""
    ].join(",") + "\n"
  })
  downloadFile(csv, "text/csv", "phonebook.csv")
}

function exportToJSON() {
  downloadFile(JSON.stringify(phonebookData, null, 2), "application/json", "phonebook.json")
}

function downloadFile(content, mime, filename) {
  const blob = new Blob([content], { type: mime })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function showNotification(message, type) {
  const notif = document.createElement("div")
  notif.classList.add("notification", type)
  notif.textContent = message
  notificationContainer.appendChild(notif)
  setTimeout(() => {
    if (notificationContainer.contains(notif)) {
      notificationContainer.removeChild(notif)
    }
  }, 4000)
}