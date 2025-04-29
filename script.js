function initializeDashboardCharts() {
            const propertyCanvas = document.getElementById('propertyPieChart');
            const paymentCanvas = document.getElementById('paymentOrderChart');
            const repairCanvas = document.getElementById('repairOrderChart');
            const visitorCanvas = document.getElementById('visitorChart');
            const reservationCanvas = document.getElementById('reservationChart');

            if (propertyCanvas) {
                new Chart(propertyCanvas.getContext('2d'), {
                    type: 'pie',
                    data: {
                        labels: ['已通过', '待审核'],
                        datasets: [{
                            data: [40, 60],
                            backgroundColor: ['#4bc0c0', '#ffcd56'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, animation: { duration: 0 } }
                });
            }

            if (paymentCanvas) {
                 new Chart(paymentCanvas.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['已完成', '待维修'],
                        datasets: [{
                            data: [70, 30],
                            backgroundColor: ['#4bc0c0', '#ffcd56'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } }, animation: { duration: 0 } }
                });
            }

            if (repairCanvas) {
                new Chart(repairCanvas.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['待缴费', '已缴费', '已取消'],
                        datasets: [{
                            data: [20, 65, 15],
                            backgroundColor: ['#ffcd56', '#4bc0c0', '#ff6384'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } }, animation: { duration: 0 } }
                });
            }

            if (visitorCanvas) {
                new Chart(visitorCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7'],
                        datasets: [{
                            label: '访客数',
                            data: [7, 12, 15, 15, 10, 15, 7],
                            backgroundColor: '#4c6ef5',
                            barPercentage: 0.6,
                            borderRadius: 2,
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 20, ticks: { stepSize: 5 }, grid: { color: '#eee', drawBorder: false } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } }, animation: { duration: 0 } }
                });
            }

            if(reservationCanvas) {
                new Chart(reservationCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7'],
                        datasets: [
                            { label: '场地1', data: [12, 8, 3, 6, 5, 8, 10], backgroundColor: '#4C6EF5', borderColor: '#4C6EF5', borderWidth: 1 },
                            { label: '场地2', data: [4, 11, 8, 2, 7, 6, 7], backgroundColor: '#20C997', borderColor: '#20C997', borderWidth: 1 },
                            { label: '场地3', data: [15, 7, 10, 13, 10, 12, 11], backgroundColor: '#FFD43B', borderColor: '#FFD43B', borderWidth: 1 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 20, ticks: { stepSize: 5 }, grid: { color: '#eee', drawBorder: false, borderDash: [5, 5] } }, x: { grid: { display: false } } }, plugins: { legend: { display: false }, tooltip: {} }, animation: { duration: 0 } }
                });
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            // Highlight active menu item based on current page
            const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html'; // Default to dashboard
            const menuItems = document.querySelectorAll('.sidebar .menu-item');
            menuItems.forEach(item => {
                const linkPath = item.getAttribute('href');
                // Adjust comparison for default index.html or specific dashboard.html
                if (linkPath === currentPath || (currentPath === 'index.html' && linkPath === 'dashboard.html')) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Initialize dashboard charts ONLY if on dashboard page (or related elements exist)
            if (document.getElementById('propertyPieChart')) {
                initializeDashboardCharts(); 
            }

            // --- Owner Management Logic --- 
            let allOwnerData = []; 
            let filteredOwnerData = [];
            let currentPage = 1;
            let totalPages = 1;
            let totalRecords = 0;
            let pageSize = 8; 
            let currentFilters = {
                status: ''
            };

            // Fetch all owner application data
            async function fetchOwnerData() {
                console.log("Fetching ALL owner data...");
                const loadingOverlay = document.getElementById('owner-table-loading');
                if(loadingOverlay) loadingOverlay.classList.add('active');

                const myHeaders = new Headers();
                myHeaders.append("communityId", "1");
                myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
                myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxIiwiZXhwIjoxODQyMDQ3MTc2fQ.eR8U4B92t6xoRjzKocEThKpVV3q674vb_oekgwgOr1Q"); 
                myHeaders.append("Accept", "*/*");
                myHeaders.append("Host", "property-func-dcwdljroao.cn-shenzhen.fcapp.run");
                myHeaders.append("Connection", "keep-alive");

                const url = `https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/authentication/all`; 
                
                const requestOptions = {
                   method: 'GET',
                   headers: myHeaders,
                   redirect: 'follow'
                };

                try {
                    const response = await fetch(url, requestOptions);
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`API Error (${response.status}): ${errorText}`);
                    }
                    const data = await response.json(); 
                    console.log("All Owner data fetched:", data);
                    if(loadingOverlay) loadingOverlay.classList.remove('active');
                    
                    allOwnerData = data.data || data || []; 
                    
                    applyFiltersAndDisplay(); 
                    
                } catch (error) {
                    console.error("Error fetching owner data:", error);
                     if(loadingOverlay) loadingOverlay.classList.remove('active');
                     alert(`获取业主列表失败: ${error.message}`);
                     allOwnerData = [];
                     applyFiltersAndDisplay(); 
                }
            }
            
            // Apply filters and update display
            function applyFiltersAndDisplay(resetPage = true) {
                console.log("Applying filters:", currentFilters);
                
                filteredOwnerData = allOwnerData.filter((owner, index) => {
                    const statusFilter = currentFilters.status;
                    let keep = true; 
                    
                    const ownerId = owner.applicationId || owner.id || `index-${index}`;
                    const rawOwnerStatus = owner.status; 
                    let effectiveOwnerStatus = rawOwnerStatus || '待审核'; 

                    if (statusFilter) { 
                        if (statusFilter === 'pending') {
                            if (effectiveOwnerStatus !== '待审核') keep = false;
                        } else if (statusFilter === 'approved') {
                            if (!(effectiveOwnerStatus === '通过' || effectiveOwnerStatus === '同意')) keep = false;
                        } else if (statusFilter === 'rejected') {
                            if (!(effectiveOwnerStatus === '不通过' || effectiveOwnerStatus === '拒绝')) keep = false;
                        }
                    }
                    // Add other filters here
                    return keep; 
                });
                
                console.log(`Filtered data count: ${filteredOwnerData.length}`);
                
                totalRecords = filteredOwnerData.length;
                totalPages = Math.ceil(totalRecords / pageSize);
                if (totalPages === 0) totalPages = 1;
                
                if (resetPage) {
                    currentPage = 1;
                } else {
                    if (currentPage > totalPages) {
                        currentPage = totalPages;
                    }
                }
                
                const pageData = getCurrentPageDataSlice();
                populateOwnerTable(pageData);
                updatePaginationUI();
            }

            // Get current page data slice
            function getCurrentPageDataSlice() {
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                return filteredOwnerData.slice(startIndex, endIndex);
            }

            // Update pagination UI
            function updatePaginationUI() {
                 const pagination = document.querySelector('.owner-table + .table-footer .pagination'); // More specific selector
                 if (!pagination) return;
                 
                 const totalInfoSpan = pagination.querySelector('span:first-child');
                 if (totalInfoSpan) {
                     const currentPageRecords = getCurrentPageDataSlice().length;
                     totalInfoSpan.textContent = `本页共${currentPageRecords}条/共${totalRecords}条`;
                 }
                 
                 const dynamicElements = pagination.querySelectorAll('a:not(:first-child):not(:last-child), span.dots-generated');
                 dynamicElements.forEach(el => el.remove());
                 
                 const nextPageLink = pagination.querySelector('a:last-of-type[href="#"]'); // Use last-of-type
                 const dotsTemplate = document.querySelector('.pagination .dots'); // Use specific template selector

                const maxPageButtons = 5;
                let startPage, endPage;

                if (totalPages <= maxPageButtons + 2) {
                    startPage = 1;
                    endPage = totalPages;
                } else {
                     if (currentPage <= maxPageButtons - 1) {
                         startPage = 1;
                         endPage = maxPageButtons;
                     } else if (currentPage >= totalPages - maxPageButtons + 2) {
                         startPage = totalPages - maxPageButtons + 1;
                         endPage = totalPages;
                     } else {
                         startPage = currentPage - Math.floor((maxPageButtons - 2) / 2);
                         endPage = currentPage + Math.ceil((maxPageButtons - 2) / 2);
                     }
                 }
                 
                 const createPageLink = (page) => {
                    const pageLink = document.createElement('a');
                    pageLink.href = '#';
                    pageLink.textContent = page;
                    if (page === currentPage) {
                        pageLink.classList.add('current');
                    }
                    pageLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (page !== currentPage) {
                            goToPage(page);
                        }
                    });
                    return pageLink;
                 };
                 
                 const createDots = () => {
                     if (!dotsTemplate) return null;
                     const dots = dotsTemplate.cloneNode(true);
                     dots.classList.add('dots-generated');
                     dots.style.display = 'inline';
                     return dots;
                 };
                 
                 const insertBeforeTarget = nextPageLink || pagination.querySelector('span[style*="跳转至"]');
                 
                 if (startPage > 1) {
                    pagination.insertBefore(createPageLink(1), insertBeforeTarget);
                    if (startPage > 2) {
                       const dots = createDots();
                       if(dots) pagination.insertBefore(dots, insertBeforeTarget);
                    }
                }

                for (let i = startPage; i <= endPage; i++) {
                    pagination.insertBefore(createPageLink(i), insertBeforeTarget);
                }

                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                        const dots = createDots();
                        if(dots) pagination.insertBefore(dots, insertBeforeTarget);
                    }
                    pagination.insertBefore(createPageLink(totalPages), insertBeforeTarget);
                }
                 
                const prevPageLink = pagination.querySelector('a:first-child');
                if (prevPageLink) {
                    prevPageLink.classList.toggle('disabled', currentPage === 1 || totalPages === 0);
                }
                if (nextPageLink) {
                    nextPageLink.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
                }
                
                const pageInput = pagination.querySelector('input[type="number"]');
                if (pageInput) {
                    pageInput.value = currentPage;
                    pageInput.max = totalPages > 0 ? totalPages : 1;
                    pageInput.min = 1;
                }
            }
            
            // Go to specific page
            function goToPage(page) {
                if (page < 1 || page > totalPages || page === currentPage) return;
                console.log(`跳转到第${page}页`);
                currentPage = page;
                
                const tableCheckboxes = document.querySelectorAll('#owner-management-view .owner-table tbody input[type="checkbox"]');
                tableCheckboxes.forEach(checkbox => checkbox.checked = false);
                 const headerCheckbox = document.querySelector('#owner-management-view .owner-table thead input[type="checkbox"]');
                 if (headerCheckbox) headerCheckbox.checked = false;
                
                const pageData = getCurrentPageDataSlice();
                populateOwnerTable(pageData);
                updatePaginationUI(); 
            }

            // Populate owner table
            function populateOwnerTable(pageData) {
                 const ownerTableBody = document.querySelector('.owner-table tbody'); // Simpler selector if unique
                 if (!ownerTableBody) {
                     console.error("populateOwnerTable: Table body not found!");
                     return;
                 }

                 ownerTableBody.innerHTML = ''; 
                 console.log("Populating table with page data:", pageData);

                 if (!Array.isArray(pageData) || pageData.length === 0) {
                     ownerTableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 20px;">${filteredOwnerData.length === 0 && allOwnerData.length > 0 ? '无符合条件的记录' : '暂无数据'}</td></tr>`;
                     return;
                 }

                 pageData.forEach((owner, index) => { 
                     const row = document.createElement('tr');
                     const appId = owner.applicationId || owner.id || `fallback-${currentPage}-${index}`;
                     if (appId === `fallback-${currentPage}-${index}`) {
                         console.warn(`Missing unique ID for owner object on page ${currentPage} at index ${index}:`, owner);
                     }
                     row.setAttribute('data-id', appId); 

                     let statusClass = 'status-pending';
                     let statusText = owner.status || '待审核'; 
                     if (statusText === '通过' || statusText === '同意') {
                         statusClass = 'status-approved';
                         statusText = '通过';
                     } else if (statusText === '不通过' || statusText === '拒绝') {
                          statusClass = 'status-rejected';
                          statusText = '不通过';
                     }

                     const creationTime = owner.creationTime ? new Date(owner.creationTime).toLocaleString('zh-CN', { hour12: false }) : '-';
                     const reviewTime = owner.reviewTime ? new Date(owner.reviewTime).toLocaleString('zh-CN', { hour12: false }) : '-';

                     row.innerHTML = `
                        <td><input type="checkbox" class="owner-checkbox"></td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>${owner.name || '-'}</td>
                        <td>${owner.phone || '-'}</td>
                        <td>${owner.building || '-'}</td>
                        <td>${owner.unit || '-'}</td>
                        <td>${owner.floor || '-'}</td>
                        <td>${owner.roomNumber || '-'}</td>
                        <td>${creationTime}</td>
                        <td>${reviewTime}</td>
                     `;
                     ownerTableBody.appendChild(row);
                 });
                 
                 console.log("Table population complete for the current page.");
             }

             // Refresh owner table data
             async function refreshOwnerTableData() {
                 console.log("Refreshing ALL owner data and reapplying filters...");
                 try {
                     await fetchOwnerData(); 
                 } catch (error) { 
                     console.error("Failed to refresh table data.");
                 }
             }

             // Call review API
             async function callReviewApi(applicationId, status) {
                 console.log(`调用真实审核 API: ID=${applicationId}, Status=${status}`);

                 const myHeaders = new Headers();
                 myHeaders.append("communityId", "1");
                 myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
                 myHeaders.append("Content-Type", "application/json");
                 myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxIiwiZXhwIjoxODQyMDQ3MTc2fQ.eR8U4B92t6xoRjzKocEThKpVV3q674vb_oekgwgOr1Q"); 
                 myHeaders.append("Accept", "*/*");
                 myHeaders.append("Host", "property-func-dcwdljroao.cn-shenzhen.fcapp.run");
                 myHeaders.append("Connection", "keep-alive");

                 const appIdNumber = parseInt(applicationId);
                 if (isNaN(appIdNumber)) {
                      console.error(`Invalid applicationId: ${applicationId}`);
                      throw new Error(`无效的申请ID: ${applicationId}`);
                 }

                 const raw = JSON.stringify({
                    "applicationId": appIdNumber,
                    "status": status 
                 });

                 const requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                 };

                 try {
                     const response = await fetch("https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/authentication/review", requestOptions);
                     
                     if (!response.ok) {
                         let errorBody = await response.text();
                          try { errorBody = JSON.parse(errorBody); } catch(e) { /* Keep as text */ }
                          console.error(`API Error ${response.status}:`, errorBody);
                          throw new Error(`审核请求失败 (状态 ${response.status})`);
                     }
                     
                     const result = await response.text(); 
                     console.log(`API Success for ID ${applicationId}:`, result);
                     
                     const itemIndex = allOwnerData.findIndex(item => (item.applicationId || item.id) == applicationId);
                     if (itemIndex > -1) {
                         allOwnerData[itemIndex].status = status === '同意' ? '通过' : '拒绝'; 
                         allOwnerData[itemIndex].reviewTime = new Date().toISOString();
                     } else {
                         console.warn(`Could not find item with ID ${applicationId} in allOwnerData to update after API success.`);
                     }
                     return result;

                 } catch (error) {
                      console.error("Fetch error during review API call:", error);
                      throw error;
                 }
             }

             // Show/Hide Modals (Globally accessible)
             window.showModal = function(modalId) { 
                 const modal = document.getElementById(modalId);
                 if (modal) {
                     modal.classList.add('active');
                 }
             }
             window.hideModal = function(modalId) { 
                 const modal = document.getElementById(modalId);
                 if (modal) {
                     modal.classList.remove('active');
                 }
             }
             window.showSuccessModal = function() {
                 console.log('显示成功模态框');
                 const successModal = document.getElementById('success-modal');
                 if (successModal) {
                     successModal.classList.add('active');
                     setTimeout(() => {
                          window.hideModal('success-modal');
                     }, 1500);
                 }
             }

             // Setup Owner Management Events (Filters, Pagination, Modal)
             function setupFilterAndPaginationEvents() {
                 console.log("Setting up Owner Management event listeners...");
                 const ownerView = document.querySelector('.owner-table'); // Check if owner table exists
                 if (!ownerView) {
                     console.log("Owner Management elements not found, skipping event setup.");
                     return; 
                 }
                 
                 const filterBar = document.querySelector('.filter-bar'); // Assuming one filter bar for now
                 const paginationControls = document.querySelector('.owner-table + .table-footer .pagination'); // Specific pagination
                 const ownerTableBody = ownerView.querySelector('tbody');

                 // Filter button
                 const searchButton = filterBar?.querySelector('.search-button');
                 if (searchButton && !searchButton.dataset.listenerAttached) { // Prevent multiple listeners
                     searchButton.addEventListener('click', () => {
                         currentFilters.status = filterBar.querySelector('select[name="status"]')?.value || '';
                         // Add other filter value retrievals here
                         applyFiltersAndDisplay(true);
                     });
                     searchButton.dataset.listenerAttached = 'true';
                 }

                 // Refresh button
                 const refreshButton = document.querySelector('.action-buttons .secondary-action[style*="margin-left: auto"]'); // Assuming unique refresh button
                 if (refreshButton && !refreshButton.dataset.listenerAttached) {
                     refreshButton.addEventListener('click', refreshOwnerTableData);
                     refreshButton.dataset.listenerAttached = 'true';
                 }
                 
                 // Pagination controls
                 if (paginationControls && !paginationControls.dataset.listenerAttached) {
                     const prevLink = paginationControls.querySelector('a:first-child');
                     if (prevLink) prevLink.addEventListener('click', (e) => { e.preventDefault(); if (!prevLink.classList.contains('disabled')) goToPage(currentPage - 1); });
                     
                     const nextLink = paginationControls.querySelector('a:last-of-type[href="#"]');
                     if (nextLink) nextLink.addEventListener('click', (e) => { e.preventDefault(); if (!nextLink.classList.contains('disabled')) goToPage(currentPage + 1); });
                     
                     const jumpButton = paginationControls.querySelector('button');
                     const pageInput = paginationControls.querySelector('input[type="number"]');
                     if (jumpButton && pageInput) {
                          jumpButton.addEventListener('click', () => {
                             const pageNum = parseInt(pageInput.value);
                             if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                                 goToPage(pageNum);
                             } else {
                                 alert(`请输入1-${totalPages}之间的有效页码`);
                                 pageInput.value = currentPage;
                             }
                         });
                     }
                     paginationControls.dataset.listenerAttached = 'true';
                 }

                 // Batch Review Modal Logic
                 const batchApproveButton = document.getElementById('batch-approve-button'); 
                 const reviewModal = document.getElementById('batch-review-modal');
                 const cancelReviewButton = reviewModal?.querySelector('#cancel-review-button');
                 const confirmReviewButton = reviewModal?.querySelector('#confirm-review-button');
                 const selectedCountSpan = reviewModal?.querySelector('#selected-count');
                 const statusButtons = reviewModal?.querySelectorAll('.status-buttons button');
                 
                 let selectedReviewStatus = '同意'; 
                 let selectedIds = [];

                 if (batchApproveButton && ownerTableBody && reviewModal && !batchApproveButton.dataset.listenerAttached) { 
                     batchApproveButton.addEventListener('click', () => {
                         selectedIds = []; 
                         const checkboxes = ownerTableBody.querySelectorAll('tr .owner-checkbox'); 
                         checkboxes.forEach(checkbox => {
                              if (checkbox.checked) {
                                 const row = checkbox.closest('tr'); 
                                 if(row) {
                                     const id = row.getAttribute('data-id');
                                     if (id) selectedIds.push(id);
                                 }
                             }
                         });

                         if (selectedIds.length === 0) {
                             alert("请至少选择一个审核对象！");
                             return;
                         }

                         if(selectedCountSpan) selectedCountSpan.textContent = `${selectedIds.length} 个`;
                         
                         if(statusButtons) {
                            statusButtons.forEach(btn => btn.classList.remove('selected'));
                            const agreeButton = reviewModal.querySelector('button[data-status="同意"]');
                            if(agreeButton) agreeButton.classList.add('selected');
                         }
                         selectedReviewStatus = '同意';
                         window.showModal('batch-review-modal');
                     });
                     batchApproveButton.dataset.listenerAttached = 'true';
                 }

                 // Modal status buttons
                 if(statusButtons && reviewModal) {
                      statusButtons.forEach(button => {
                         if (!button.dataset.listenerAttached) {
                             button.addEventListener('click', () => {
                                 reviewModal.querySelectorAll('.status-buttons button').forEach(btn => btn.classList.remove('selected'));
                                 button.classList.add('selected');
                                 selectedReviewStatus = button.getAttribute('data-status');
                             });
                             button.dataset.listenerAttached = 'true';
                         }
                     });
                 }

                 // Modal cancel button
                 if (cancelReviewButton && !cancelReviewButton.dataset.listenerAttached) {
                      cancelReviewButton.addEventListener('click', () => {
                         window.hideModal('batch-review-modal');
                     });
                     cancelReviewButton.dataset.listenerAttached = 'true';
                 }

                 // Modal confirm button
                 if (confirmReviewButton && ownerTableBody && !confirmReviewButton.dataset.listenerAttached) {
                      confirmReviewButton.addEventListener('click', async () => {
                         if (selectedIds.length === 0) return;

                         console.log(`确认审核 IDs: ${selectedIds.join(', ')}, Status: ${selectedReviewStatus}`);
                         confirmReviewButton.disabled = true;
                         confirmReviewButton.textContent = '处理中...';

                         try {
                             const apiPromises = selectedIds.map(id => callReviewApi(id, selectedReviewStatus));
                             await Promise.all(apiPromises);
                             
                             // Update UI after successful API calls
                             ownerTableBody.querySelectorAll('tr').forEach(row => {
                                 const checkbox = row.querySelector('.owner-checkbox');
                                 const currentId = row.getAttribute('data-id');
                                 if (checkbox && checkbox.checked && selectedIds.includes(currentId)) {
                                     const statusBadge = row.querySelector('.status-badge');
                                     if (statusBadge) {
                                         if(selectedReviewStatus === '同意') {
                                            statusBadge.className = 'status-badge status-approved';
                                            statusBadge.textContent = '通过';
                                         } else {
                                            statusBadge.className = 'status-badge status-rejected';
                                            statusBadge.textContent = '不通过';
                                         }
                                     }
                                     checkbox.checked = false;
                                 }
                             });
                             const headerCheckbox = document.querySelector('.owner-table thead input[type="checkbox"]');
                             if(headerCheckbox) headerCheckbox.checked = false;
                             window.hideModal('batch-review-modal');
                             window.showSuccessModal();
                             
                             // Optionally re-apply filters to reflect changes accurately if reviewTime matters
                             // applyFiltersAndDisplay(false); // Re-filter without resetting page

                         } catch (error) {
                              console.error("确认审核时出错:", error); 
                              alert(`批量审核时出错: ${error.message || '请检查API响应'}`);
                         } finally {
                              confirmReviewButton.disabled = false;
                              confirmReviewButton.textContent = '确定';
                         }
                     });
                     confirmReviewButton.dataset.listenerAttached = 'true';
                 }

                 // Header Checkbox Logic
                 const ownerViewHeaderCheckbox = document.querySelector('.owner-table thead input[type="checkbox"]');
                 if (ownerViewHeaderCheckbox && !ownerViewHeaderCheckbox.dataset.listenerAttached) { 
                     ownerViewHeaderCheckbox.addEventListener('change', (event) => {
                         const isChecked = event.target.checked;
                         ownerTableBody?.querySelectorAll('.owner-checkbox').forEach(checkbox => {
                             checkbox.checked = isChecked;
                         });
                     });
                     ownerViewHeaderCheckbox.dataset.listenerAttached = 'true';
                 }
                 console.log("Owner Management event listeners setup complete.");
                 // Initial data fetch for owner management if on the right page
                 fetchOwnerData();
             }
            
            // --- Work Order Management Logic --- 
            let allWorkOrderData = [];
            let filteredWorkOrderData = [];
            let currentWorkOrderPage = 1;
            let totalWorkOrderPages = 1;
            let totalWorkOrderRecords = 0;
            let workOrderPageSize = 8; 
            let currentWorkOrderFilters = {
                type: '',
                status: '',
                priority: '',
                area: '',
                date: '',
                search: ''
            };
            let workOrderDataFetched = false;

            // Fetch work order data
            async function fetchWorkOrderData() {
                if (workOrderDataFetched) return; // Prevent re-fetching if already done
                console.log("Fetching ALL work order data...");
                const loadingOverlay = document.getElementById('work-order-table-loading');
                if(loadingOverlay) loadingOverlay.classList.add('active');

                const statusesToFetch = ['待受理', '处理中', '已完成'];
                let combinedData = [];
                let fetchError = null;

                const myHeaders = new Headers();
                myHeaders.append("communityId", "1");
                myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
                myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxIiwiZXhwIjoxODQyMDQ3MTc2fQ.eR8U4B92t6xoRjzKocEThKpVV3q674vb_oekgwgOr1Q");
                myHeaders.append("Accept", "*/*");
                myHeaders.append("Host", "property-func-dcwdljroao.cn-shenzhen.fcapp.run");
                myHeaders.append("Connection", "keep-alive");
                
                const requestOptions = {
                   method: 'GET',
                   headers: myHeaders,
                   redirect: 'follow'
                };

                try {
                    for (const status of statusesToFetch) {
                        const encodedStatus = encodeURIComponent(status);
                        const url = `https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/repairOrder/getOrder?orderStatus=${encodedStatus}`;
                        
                        const response = await fetch(url, requestOptions);
                        if (!response.ok) {
                            let errorText = `Failed status ${status}`; 
                            try { errorText = await response.text(); } catch (e) { /* Ignore */ }
                            console.error(`WO API Error (${response.status}) for ${status}: ${errorText}`);
                            if (!fetchError) fetchError = new Error(`WO API Error (${response.status})`);
                        } else {
                            const data = await response.json();
                            const orders = data.data || data || [];
                            if (Array.isArray(orders)) {
                               combinedData = combinedData.concat(orders);
                            } else {
                                 console.warn(`WO Data for ${status} not array:`, orders);
                            }
                        }
                    }

                    allWorkOrderData = combinedData;
                    workOrderDataFetched = true; // Mark as fetched
                    
                    if (fetchError) throw fetchError;
                    
                    applyWorkOrderFiltersAndDisplay();
                    
                } catch (error) {
                     console.error("Error fetching work order data:", error);
                     alert(`获取工单列表失败: ${error.message}`);
                     allWorkOrderData = [];
                     applyWorkOrderFiltersAndDisplay();
                } finally {
                     if(loadingOverlay) loadingOverlay.classList.remove('active');
                }
            }

            // Apply work order filters
            function applyWorkOrderFiltersAndDisplay(resetPage = true) {
                 console.log("Applying work order filters:", currentWorkOrderFilters);
                 
                filteredWorkOrderData = allWorkOrderData.filter(order => {
                    // Status
                     const statusFilter = currentWorkOrderFilters.status;
                     if (statusFilter) {
                         let orderStatus = order.status; 
                         if (statusFilter === 'pending' && !['待受理', '待处理'].includes(orderStatus)) return false; // Include variations
                         if (statusFilter === 'processing' && orderStatus !== '处理中') return false;
                         if (statusFilter === 'completed' && orderStatus !== '已完成') return false;
                         // Add paid/unpaid if necessary based on API/data
                     }
                     // Priority
                     const priorityFilter = currentWorkOrderFilters.priority;
                      if (priorityFilter) {
                         let orderPriority = (order.priority || '低').toLowerCase(); // Normalize
                         if (priorityFilter === 'high' && orderPriority !== '高') return false;
                         if (priorityFilter === 'medium' && orderPriority !== '中') return false;
                         if (priorityFilter === 'low' && orderPriority !== '低') return false;
                      }
                    // Add other filters: type, area, date, search
                     const searchTerm = currentWorkOrderFilters.search?.toLowerCase();
                     if (searchTerm) {
                         const orderNum = order.orderNumber || order.id || '';
                         const desc = order.description || '';
                         if (!orderNum.toString().toLowerCase().includes(searchTerm) && !desc.toLowerCase().includes(searchTerm)) {
                             return false;
                         }
                     }

                     return true;
                 });

                totalWorkOrderRecords = filteredWorkOrderData.length;
                totalWorkOrderPages = Math.ceil(totalWorkOrderRecords / workOrderPageSize);
                if (totalWorkOrderPages === 0) totalWorkOrderPages = 1;
                
                if (resetPage) {
                    currentWorkOrderPage = 1;
                } else {
                    if (currentWorkOrderPage > totalWorkOrderPages) {
                        currentWorkOrderPage = totalWorkOrderPages;
                    }
                }
                
                const pageData = getCurrentWorkOrderPageSlice();
                populateWorkOrderTable(pageData);
                updateWorkOrderPaginationUI();
            }

            // Get work order page slice
            function getCurrentWorkOrderPageSlice() {
                const startIndex = (currentWorkOrderPage - 1) * workOrderPageSize;
                const endIndex = startIndex + workOrderPageSize;
                return filteredWorkOrderData.slice(startIndex, endIndex);
            }
            
            // Populate work order table
            function populateWorkOrderTable(pageData) {
                const tableBody = document.querySelector('.work-order-table tbody');
                if (!tableBody) {
                    console.error("Work order table body not found!");
                    return;
                }
                tableBody.innerHTML = '';
                if (!Array.isArray(pageData) || pageData.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;">${totalWorkOrderRecords === 0 ? '暂无工单数据' : '无符合条件的工单'}</td></tr>`;
                    return;
                }
                pageData.forEach(order => {
                    const row = document.createElement('tr');
                    const orderId = order.id || order.orderNumber || 'N/A';
                    row.setAttribute('data-id', orderId); 
                    let statusClass = 'status-pending';
                    let statusText = order.status || '待处理';
                    let statusClickable = true; // Assume clickable unless completed
                    if (statusText === '已完成') { statusClass = 'status-approved'; statusClickable = false; }
                    else if (statusText === '处理中') { statusClass = 'status-processing'; }
                    else if (statusText === '待处理' || statusText === '待受理') { statusClass = 'status-pending'; }
                     // Add other status mappings...
                    let priorityClass = 'low';
                    let priorityText = order.priority || '低';
                     if (priorityText === '高') { priorityClass = 'high'; }
                     else if (priorityText === '中') { priorityClass = 'medium'; }
                     
                    const creationTime = order.creationTime ? new Date(order.creationTime).toLocaleString('zh-CN', { hour12: false }) : '-';
                    // Adjust field names based on actual API response
                    const visitTime = order.visitTime || order.scheduledTime || '-'; 
                    const repairArea = order.repairArea || order.location || '-';
                    const description = order.description || order.details || '-';
                    const contact = order.contact || order.phone || '-';
                    const orderNumber = order.orderNumber || orderId;

                    row.innerHTML = `
                        <td><input type="checkbox" class="work-order-checkbox"></td>
                        <td><span class="status-badge ${statusClass} ${statusClickable ? 'work-order-status-clickable' : ''}" data-current-status="${statusText}" ${statusClickable ? 'style="cursor: pointer;" title="点击修改状态"' : ''}>${statusText}</span></td>
                        <td><span class="priority-level ${priorityClass}">${priorityText}</span></td>
                        <td>${orderNumber}</td>
                        <td>${repairArea}</td>
                        <td title="${description}">${description.substring(0, 30)}${ description.length > 30 ? '...' : '' }</td>
                        <td>${visitTime}</td>
                        <td>${contact}</td>
                        <td>${creationTime}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }

            // Update work order pagination UI
            function updateWorkOrderPaginationUI() {
                 const pagination = document.querySelector('.work-order-table + .table-footer .pagination'); // WO specific pagination
                 if (!pagination) return;
                 
                 const totalInfoSpan = pagination.querySelector('span:first-child');
                 if (totalInfoSpan) {
                     const currentPageRecords = getCurrentWorkOrderPageSlice().length;
                     totalInfoSpan.textContent = `本页共${currentPageRecords}条/共${totalWorkOrderRecords}条`;
                 }

                 const dynamicElements = pagination.querySelectorAll('a.page-link-generated, span.dots-generated');
                 dynamicElements.forEach(el => el.remove());

                 const nextPageLink = pagination.querySelector('a:last-of-type[href="#"]');
                 const dotsTemplate = document.querySelector('.pagination .dots');
                 
                const maxPageButtons = 5;
                let startPage, endPage;
                 if (totalWorkOrderPages <= maxPageButtons + 2) { 
                    startPage = 1;
                    endPage = totalWorkOrderPages;
                } else {
                     if (currentWorkOrderPage <= maxPageButtons - 1) {
                         startPage = 1;
                         endPage = maxPageButtons;
                     } else if (currentWorkOrderPage >= totalWorkOrderPages - maxPageButtons + 2) {
                         startPage = totalWorkOrderPages - maxPageButtons + 1;
                         endPage = totalWorkOrderPages;
                     } else {
                         startPage = currentWorkOrderPage - Math.floor((maxPageButtons - 2) / 2);
                         endPage = currentWorkOrderPage + Math.ceil((maxPageButtons - 2) / 2);
                     }
                 }
                 
                 const createPageLink = (page) => {
                     const pageLink = document.createElement('a');
                     pageLink.href = '#';
                     pageLink.classList.add('page-link-generated');
                     pageLink.textContent = page;
                     if (page === currentWorkOrderPage) {
                         pageLink.classList.add('current');
                     }
                     pageLink.addEventListener('click', (e) => {
                         e.preventDefault();
                         if (page !== currentWorkOrderPage) {
                             goToWorkOrderPage(page);
                         }
                     });
                     return pageLink;
                 };
                 const createDots = () => {
                     if (!dotsTemplate) return null;
                     const dots = dotsTemplate.cloneNode(true);
                     dots.classList.add('dots-generated'); 
                     dots.style.display = 'inline'; 
                     return dots;
                };

                 const insertBeforeTarget = nextPageLink || pagination.querySelector('span[style*="跳转至"]');
                 
                 if (startPage > 1) {
                    pagination.insertBefore(createPageLink(1), insertBeforeTarget);
                    if (startPage > 2) {
                       const dots = createDots();
                       if(dots) pagination.insertBefore(dots, insertBeforeTarget);
                    }
                }
                for (let i = startPage; i <= endPage; i++) {
                    pagination.insertBefore(createPageLink(i), insertBeforeTarget);
                }
                if (endPage < totalWorkOrderPages) {
                    if (endPage < totalWorkOrderPages - 1) {
                        const dots = createDots();
                        if(dots) pagination.insertBefore(dots, insertBeforeTarget);
                    }
                    pagination.insertBefore(createPageLink(totalWorkOrderPages), insertBeforeTarget);
                }

                const prevPageLink = pagination.querySelector('a:first-child');
                if (prevPageLink) {
                    prevPageLink.classList.toggle('disabled', currentWorkOrderPage === 1 || totalWorkOrderPages === 0);
                }
                if (nextPageLink) {
                     nextPageLink.classList.toggle('disabled', currentWorkOrderPage === totalWorkOrderPages || totalWorkOrderPages === 0);
                 }
                 
                 const pageInput = pagination.querySelector('input[type="number"]');
                 if (pageInput) {
                     pageInput.value = currentWorkOrderPage;
                     pageInput.max = totalWorkOrderPages > 0 ? totalWorkOrderPages : 1;
                     pageInput.min = 1;
                 }
            }

            // Go to work order page
            function goToWorkOrderPage(page) {
                 if (page < 1 || page > totalWorkOrderPages || page === currentWorkOrderPage) return;
                 currentWorkOrderPage = page;
                 
                 const checkboxes = document.querySelectorAll('.work-order-table input[type="checkbox"]');
                 checkboxes.forEach(cb => cb.checked = false);
                 
                 const pageData = getCurrentWorkOrderPageSlice();
                 populateWorkOrderTable(pageData);
                 updateWorkOrderPaginationUI(); 
            }
            
            // Refresh work order data
            async function refreshWorkOrderTableData() {
                 console.log("Refreshing ALL work order data...");
                 workOrderDataFetched = false; // Allow fetching again
                 await fetchWorkOrderData();
            }

            // Update work order status API call
            async function updateWorkOrderStatusApi(orderId, newStatus) {
                console.log(`Calling API to update Order ID ${orderId} to status ${newStatus}`);

                const myHeaders = new Headers();
                myHeaders.append("communityId", "1");
                myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxIiwiZXhwIjoxODQyMDQ3MTc2fQ.eR8U4B92t6xoRjzKocEThKpVV3q674vb_oekgwgOr1Q");
                myHeaders.append("Accept", "*/*");
                myHeaders.append("Host", "property-func-dcwdljroao.cn-shenzhen.fcapp.run");
                myHeaders.append("Connection", "keep-alive");

                const orderIdNumber = parseInt(orderId);
                if (isNaN(orderIdNumber)) {
                    throw new Error(`无效的工单ID: ${orderId}`);
                }

                const raw = JSON.stringify({
                   "status": newStatus,
                   "orderId": orderIdNumber
                });

                const requestOptions = {
                   method: 'POST',
                   headers: myHeaders,
                   body: raw,
                   redirect: 'follow'
                };

                const url = "https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/repairOrder/updateOrderStatus";

                try {
                    const response = await fetch(url, requestOptions);
                    
                    if (!response.ok) {
                        let errorBody = await response.text();
                        try { errorBody = JSON.parse(errorBody); } catch(e) { /* Keep text */ }
                        console.error(`API Error ${response.status} updating work order status:`, errorBody);
                        throw new Error(`更新工单状态失败 (状态 ${response.status})`);
                    }
                    
                    const result = await response.text(); 
                    console.log(`API Success updating Order ID ${orderId} status:`, result);
                    return result;

                } catch (error) {
                     console.error("Fetch error during work order status update:", error);
                     throw error;
                }
            }

            // Setup Work Order Events
            function setupWorkOrderEvents() {
                console.log("Setting up Work Order Management event listeners...");
                const workOrderView = document.querySelector('.work-order-table'); // Check if WO table exists
                if (!workOrderView) {
                    console.log("Work Order Management elements not found, skipping event setup.");
                    return;
                }

                const filterBar = document.querySelector('.filter-bar'); // Reuse filter bar selector, maybe make more specific if needed
                const paginationControls = document.querySelector('.work-order-table + .table-footer .pagination'); // WO specific pagination
                const tableBody = workOrderView.querySelector('tbody');

                // Filter search button
                const searchButton = filterBar?.querySelector('.search-button');
                 if (searchButton && !searchButton.dataset.woListenerAttached) {
                     searchButton.addEventListener('click', () => {
                         // Retrieve all filter values for work orders
                         currentWorkOrderFilters.type = filterBar.querySelector('select[name="workOrderType"]')?.value || '';
                         currentWorkOrderFilters.status = filterBar.querySelector('select[name="workOrderStatus"]')?.value || '';
                         currentWorkOrderFilters.priority = filterBar.querySelector('select[name="priority"]')?.value || '';
                         currentWorkOrderFilters.area = filterBar.querySelector('select[name="repairArea"]')?.value || '';
                         currentWorkOrderFilters.date = filterBar.querySelector('input[name="workOrderDate"]')?.value || '';
                         currentWorkOrderFilters.search = filterBar.querySelector('input[name="workOrderSearch"]')?.value || '';
                         applyWorkOrderFiltersAndDisplay(true);
                     });
                     searchButton.dataset.woListenerAttached = 'true'; // Use specific flag
                 }
                
                 // Filter reset button
                 const resetButton = filterBar?.querySelector('.reset-button');
                 if (resetButton && !resetButton.dataset.woListenerAttached) {
                    resetButton.addEventListener('click', () => {
                        // Reset filter inputs
                        filterBar.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
                        filterBar.querySelectorAll('input[type="text"], input[type="date"]').forEach(i => i.value = '');
                        // Reset filter object
                        currentWorkOrderFilters = { type: '', status: '', priority: '', area: '', date: '', search: '' };
                        // Re-apply filters (which will show all data)
                        applyWorkOrderFiltersAndDisplay(true);
                    });
                    resetButton.dataset.woListenerAttached = 'true';
                 }

                 // Refresh table button
                 const refreshButton = document.getElementById('refresh-work-order-table');
                 if (refreshButton && !refreshButton.dataset.woListenerAttached) {
                     refreshButton.addEventListener('click', refreshWorkOrderTableData);
                     refreshButton.dataset.woListenerAttached = 'true';
                 }
                 
                // Pagination
                 if (paginationControls && !paginationControls.dataset.woListenerAttached) {
                     const prevLink = paginationControls.querySelector('a:first-child');
                     if (prevLink) prevLink.addEventListener('click', (e) => { e.preventDefault(); if (!prevLink.classList.contains('disabled')) goToWorkOrderPage(currentWorkOrderPage - 1); });
                     
                     const nextLink = paginationControls.querySelector('a:last-of-type[href="#"]');
                     if (nextLink) nextLink.addEventListener('click', (e) => { e.preventDefault(); if (!nextLink.classList.contains('disabled')) goToWorkOrderPage(currentWorkOrderPage + 1); });
                     
                     const jumpButton = paginationControls.querySelector('button');
                     const pageInput = paginationControls.querySelector('input[type="number"]');
                     if (jumpButton && pageInput) {
                          jumpButton.addEventListener('click', () => {
                             const pageNum = parseInt(pageInput.value);
                             if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalWorkOrderPages) {
                                 goToWorkOrderPage(pageNum);
                             } else {
                                 alert(`请输入1-${totalWorkOrderPages}之间的有效页码`);
                                 pageInput.value = currentWorkOrderPage;
                             }
                         });
                     }
                     paginationControls.dataset.woListenerAttached = 'true';
                 }
                 
                // Footer buttons (Remind, Delete)
                const remindButton = document.getElementById('work-order-remind-button');
                if(remindButton && !remindButton.dataset.woListenerAttached) {
                     remindButton.addEventListener('click', () => alert('提醒功能待实现'));
                     remindButton.dataset.woListenerAttached = 'true';
                }
                const deleteButton = document.getElementById('work-order-delete-button');
                if(deleteButton && !deleteButton.dataset.woListenerAttached) {
                    deleteButton.addEventListener('click', () => alert('删除功能待实现'));
                    deleteButton.dataset.woListenerAttached = 'true';
                }

                // Header checkbox listener (if needed for batch actions)
                // const headerCheckbox = workOrderView.querySelector('thead input[type="checkbox"]');
                // if (headerCheckbox) { ... }

                // Status badge click listener (Event Delegation)
                if (tableBody && !tableBody.dataset.woListenerAttached) {
                    tableBody.addEventListener('click', (event) => {
                        const target = event.target;
                        if (target.classList.contains('work-order-status-clickable')) {
                            const row = target.closest('tr');
                            const orderId = row?.getAttribute('data-id');
                            const currentStatus = target.getAttribute('data-current-status');
                            
                            if (orderId) {
                               const changeModal = document.getElementById('change-work-order-status-modal');
                               if (changeModal) {
                                   changeModal.querySelector('#modal-wo-id').textContent = orderId;
                                   changeModal.querySelector('#modal-wo-current-status').textContent = currentStatus || 'N/A';
                                   changeModal.setAttribute('data-order-id', orderId);
                                   // Enable/disable buttons based on currentStatus
                                   changeModal.querySelectorAll('.status-buttons button').forEach(btn => {
                                       const newStatus = btn.getAttribute('data-new-status');
                                       // Disable button if it matches current status OR if it's an invalid transition
                                       // Example: Cannot go back from '已完成'
                                       let disable = (newStatus === currentStatus) || (currentStatus === '已完成');
                                       // Example: Cannot set to '待受理' if already '处理中' or '已完成'
                                       if (newStatus === '待受理' && (currentStatus === '处理中' || currentStatus === '已完成')) {
                                           disable = true;
                                       }
                                       // Example: Cannot set to '处理中' if already '已完成'
                                       if (newStatus === '处理中' && currentStatus === '已完成') {
                                            disable = true;
                                       }
                                       btn.disabled = disable;
                                   });
                                   window.showModal('change-work-order-status-modal');
                               } else {
                                   console.error("Change status modal not found!");
                               }
                            } else {
                                console.warn("Could not find order ID for clicked status badge.");
                            }
                        }
                    });
                    tableBody.dataset.woListenerAttached = 'true';
                }
                
                // Change status modal buttons listener
                const changeModalElement = document.getElementById('change-work-order-status-modal');
                if (changeModalElement && !changeModalElement.dataset.woListenerAttached) {
                    const cancelChangeBtn = changeModalElement.querySelector('#cancel-change-wo-status');
                    if (cancelChangeBtn) {
                        cancelChangeBtn.addEventListener('click', () => {
                            window.hideModal('change-work-order-status-modal');
                        });
                    }
                    
                    const statusChangeButtons = changeModalElement.querySelectorAll('.status-buttons button');
                    statusChangeButtons.forEach(button => {
                        button.addEventListener('click', async () => {
                            const newStatus = button.getAttribute('data-new-status');
                            const orderId = changeModalElement.getAttribute('data-order-id');
                            
                            if (!orderId || !newStatus) return;

                            button.disabled = true;
                            button.textContent = '处理中...';
                            let originalText = `设为 ${newStatus}`;
                            let success = false;

                            try {
                                await updateWorkOrderStatusApi(orderId, newStatus);
                                success = true;
                                const itemIndex = allWorkOrderData.findIndex(item => (item.id || item.orderNumber) == orderId);
                                if(itemIndex > -1) {
                                    allWorkOrderData[itemIndex].status = newStatus;
                                }
                                // Re-render the current page to reflect the change
                                applyWorkOrderFiltersAndDisplay(false); 
                                
                                window.hideModal('change-work-order-status-modal');
                                window.showSuccessModal();

                            } catch (error) {
                                 console.error(`Failed status update for ${orderId}:`, error);
                                 alert(`修改工单 ${orderId} 状态失败: ${error.message}`);
                            } finally {
                                // Re-enable buttons in the modal only if the modal wasn't hidden on success
                                // Or re-enable them unconditionally but reset text
                                changeModalElement.querySelectorAll('.status-buttons button').forEach(btn => {
                                     // Re-evaluate disabled state based on the *potentially* updated status
                                     const updatedItemIndex = allWorkOrderData.findIndex(item => (item.id || item.orderNumber) == orderId);
                                     let currentStatusAfterUpdate = changeModalElement.querySelector('#modal-wo-current-status').textContent; // Status before update
                                     if (updatedItemIndex > -1) {
                                        currentStatusAfterUpdate = allWorkOrderData[updatedItemIndex].status; // Get updated status
                                     }
                                     const btnStatus = btn.getAttribute('data-new-status');
                                     let disable = (btnStatus === currentStatusAfterUpdate) || (currentStatusAfterUpdate === '已完成');
                                     if (btnStatus === '待受理' && (currentStatusAfterUpdate === '处理中' || currentStatusAfterUpdate === '已完成')) disable = true;
                                     if (btnStatus === '处理中' && currentStatusAfterUpdate === '已完成') disable = true;
                                     
                                     btn.disabled = disable;
                                     btn.textContent = `设为 ${btnStatus}`;
                                });
                            }
                        });
                    });
                    changeModalElement.dataset.woListenerAttached = 'true';
                }

                console.log("Work Order Management event listeners setup complete.");
                // Initial data fetch for work orders if on the right page
                fetchWorkOrderData();
            }

            // Call setup functions based on element existence
            setupFilterAndPaginationEvents(); // For Owner Management
            setupWorkOrderEvents(); // For Work Order Management

         }); // End of DOMContentLoaded