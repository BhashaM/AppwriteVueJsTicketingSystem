<template>
    <layout-div>
        <h2 class="text-center mt-5 mb-3 rounded shadow" :style="{ color: '#060389' }">Raises Ticket List</h2>
        <div class="card">
            <div class="card-header">
                <router-link to="/create" class="btn btn-outline-primary">
                    Raise New Ticket
                </router-link>
            </div>
            <div class="card-body">
                <div class="row justify-content-end">
                    <div class="col-md-4">
                        <input type="text" class="form-control" placeholder="search..." v-model="searchQuery"
                            @input="filterTickets">
                    </div>
                </div>
                <ul class="nav nav-underline">
                    <li class="nav-item" v-for="tab in tabs" :key="tab.name">
                        <a class="nav-link m-2" :class="{ active: activeTab === tab.name }"
                            @click="setActiveTab(tab.name)" href="#">
                            {{ tab.label }}
                            <span class="badge bg-primary text-white rounded-pill">{{
                                allStatistic[tab.label.toUpperCase()] ?? 0 }}</span>
                        </a>
                    </li>
                </ul>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Sl No</th>
                            <th>Ticket Name</th>
                            <!-- <th>Req-Date</th> -->
                            <th>Comment</th>
                            <th>Priority</th>
                            <th>Expected Delivery Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="paginatedData.length === 0">
                            <td colspan="8" class="text-center fs-5">No data available.</td>
                        </tr>
                        <tr v-for="(ticket, i) in paginatedData" :key="ticket.$id">
                            <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                            <td>{{ ticket.ticketTypeName }}</td>
                            <!-- <td>{{ ticket.createdOn }}</td> -->
                            <td>{{ ticket.commentBox }}</td>
                            <td>{{ ticket.priorityName }}</td>
                            <td>{{ formatDate(ticket.expectedDeliveryDate) }}</td>
                            <td>
                                <!-- <span class="badge rounded-pill text-white" :class="{
                                    'bg-warning': ticket.status.toLowerCase() === 'assigned',
                                    'bg-primary': ticket.status.toLowerCase() === 'submitted',
                                    'bg-secondary': ticket.status.toLowerCase() === 'generated',
                                    'bg-success': ticket.status.toLowerCase() === 'approved',
                                    'bg-dark': ticket.status.toLowerCase() === 'rejected',
                                    'bg-danger': ticket.status.toLowerCase() === 'cancelled'
                                }"> -->
                                {{ ticket.status }}
                                <!-- </span> -->
                            </td>
                            <td>
                                <a data-bs-toggle="modal" data-bs-target="#exampleModal" @click="openModal(ticket)">
                                    <i class="bi bi-pencil-fill text-primary mx-2"></i>
                                </a>
                                <i class="bi bi-trash3-fill text-danger" @click="deleteTicket(ticket.$id)"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="d-flex justify-content-end mt-4" v-if="paginatedData.length > 0">
                    <ul class="pagination">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)"
                                aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages"
                            :key="page">
                            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)"
                                aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
            :show="showModal" @close="closeModal" @save="submitUpdate">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Ticket Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitUpdate">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="field1" class="form-label">Company Name</label>
                                        <input type="text" class="form-control" id="field1"
                                            v-model="selectedTicket.companyName" />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="field2" class="form-label">Address</label>
                                        <input type="text" class="form-control" id="field2"
                                            v-model="selectedTicket.address" />
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="field1" class="form-label">Person Name</label>
                                        <input type="text" class="form-control" id="field1"
                                            v-model="selectedTicket.personName" />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="field2" class="form-label">Phone Number</label>
                                        <input type="tel" id="phone" class="form-control"
                                            v-model="selectedTicket.phoneNumber" />
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="field1" class="form-label">Email Id</label>
                                        <input type="text" class="form-control" id="field1"
                                            v-model="selectedTicket.emailId" />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="field2" class="form-label">Delivery Date</label>
                                        <input type="date" class="form-control" id="field2"
                                            v-model="selectedTicket.expectedDeliveryDate" />
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label for="commentBox" class="form-label">User Status</label>
                                        <input type="text" class="form-control" v-model="selectedTicket.status" />
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label for="createdOn" class="form-label">Ticket Type</label>
                                        <input type="text" v-model="selectedTicket.ticketTypeName"
                                            class="form-control" />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label for="createdOn" class="form-label">Priority Type</label>
                                        <input type="text" v-model="selectedTicket.priorityName" class="form-control"
                                            disabled readonly />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label for="commentBox" class="form-label">User Comment</label>
                                        <textarea rows="1" cols="20" id="commentBox" v-model="selectedTicket.commentBox"
                                            class="form-control" placeholder="Enter your comment here..."></textarea>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label for="fileView" class="form-label">User File</label>
                                        <div class="file-item">
                                            <button class="btn btn-success btn-sm"
                                                @click.prevent="downloadFile(selectedTicket.fileId)" target="_blank">
                                                <i class="fas fa-file-pdf mx-1"></i>Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3" v-if="activeTab === 'GENERATED'">
                                    <div class="form-group">
                                        <label for="fileView" class="form-label">Resolved File</label>
                                        <div class="file-item">
                                            <button class="btn btn-success btn-sm" target="_blank"
                                                @click.prevent="downloadResolvedFile(selectedTicket.resolvedFileId)">
                                                <i class="fas fa-file-pdf mx-1"></i>Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" @click="closeModal"
                                        data-bs-dismiss="modal">Close</button>
                                    <button v-if="selectedTicket.status == 'SUBMITTED'" type="submit"
                                        class="btn btn-primary">Save</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </layout-div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { Databases, Storage } from 'appwrite';
import { client } from '/src/appwrite';
import LayoutDiv from '@/components/LayoutDiv.vue';

export default {
    components: {
        LayoutDiv,
    },
    name: 'TicketList',
    setup() {
        const tickets = ref([]);
        const searchQuery = ref('');
        const selectedTicket = ref({});
        const activeTab = ref('ALL');
        const allStatistic = ref({});
        const currentPage = ref(1);
        const itemsPerPage = ref(5);
        const showModal = ref(false);

        const tabs = [
            { name: 'ALL', label: 'ALL' },
            { name: 'ASSIGNED', label: 'ASSIGNED' },
            { name: 'SUBMITTED', label: 'SUBMITTED' },
            { name: 'GENERATED', label: 'GENERATED' },
            { name: 'APPROVED', label: 'APPROVED' },
            { name: 'REJECTED', label: 'REJECTED' },
            { name: 'CANCELLED', label: 'CANCELLED' },
        ];

        const fetchTicketList = async () => {
            const databases = new Databases(client);
            try {
                const [response, priorityResponse, ticketsResponse] = await Promise.all([
                    databases.listDocuments('66cc10ed002e90bf6173', '66cc12a000254e1488ff'),
                    databases.listDocuments('66cc10ed002e90bf6173', '66cd6e59001671bc7ffc'),
                    databases.listDocuments('66cc10ed002e90bf6173', '66cd808f003345510c04')
                ]);

                const priorityMap = {};
                priorityResponse.documents.forEach(priority => {
                    priorityMap[priority.$id] = priority.priorityName;
                });

                const ticketTypeMap = {};
                ticketsResponse.documents.forEach(ticketType => {
                    ticketTypeMap[ticketType.$id] = ticketType.ticketType;
                });

                tickets.value = response.documents.map(ticket => {
                    return {
                        ...ticket,
                        priorityName: priorityMap[ticket.priorityId] || 'Unknown',
                        ticketTypeName: ticketTypeMap[ticket.ticketId] || 'Unknown'
                    };
                });
                console.log(tickets.value)
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        };

        const deleteTicket = async (ticketId) => {
            const databases = new Databases(client);
            try {
                await databases.deleteDocument('66cc10ed002e90bf6173', '66cc12a000254e1488ff', ticketId);
                tickets.value = tickets.value.filter(ticket => ticket.$id !== ticketId);
                console.log(`Ticket with ID ${ticketId} deleted successfully.`);
            } catch (error) {
                console.error('Error deleting ticket:', error);
            }
        };

        const openModal = (ticket) => {
            selectedTicket.value = { ...ticket };
            console.log(JSON.stringify(selectedTicket.value))
            selectedTicket.value.expectedDeliveryDate = new Date(ticket.expectedDeliveryDate).toISOString().split('T')[0];
            showModal.value = true;
        };

        const closeModal = () => {
            console.log('Close button clicked');
            showModal.value = false;
        };

        const submitUpdate = async () => {
            const databases = new Databases(client);
            try {
                await databases.updateDocument('66cc10ed002e90bf6173', '66cc12a000254e1488ff', selectedTicket.value.$id, selectedTicket.value);
                // Update the local tickets array
                tickets.value = tickets.value.map(ticket =>
                    ticket.$id === selectedTicket.value.$id ? selectedTicket.value : ticket
                );
                closeModal();
            } catch (error) {
                console.error('Error updating ticket:', error);
            }
        };
        const changePage = (pageNumber) => {
            if (pageNumber < 1 || pageNumber > totalPages.value) return;
            currentPage.value = pageNumber;
        };
        const filteredTickets = computed(() => {
            const query = searchQuery.value.toLowerCase();
            const ticketsArray = tickets.value || []; // Fallback to empty array if undefined
            return ticketsArray.filter(ticket => {
                const matchesTab = activeTab.value === 'ALL' || ticket.status.toUpperCase() === activeTab.value;
                const matchesQuery = (
                    (ticket.companyName?.toLowerCase().includes(query) || '') ||
                    (ticket.address?.toLowerCase().includes(query) || '') ||
                    (ticket.personName?.toLowerCase().includes(query) || '') ||
                    (ticket.phoneNumber?.toLowerCase().includes(query) || '') ||
                    (ticket.emailId?.toLowerCase().includes(query) || '') ||
                    (ticket.ticketName?.toLowerCase().includes(query) || '') ||
                    (ticket.status?.toLowerCase().includes(query) || '') ||
                    (ticket.priorityName?.toLowerCase().includes(query) || '') ||
                    (ticket.ticketTypeName?.toLowerCase().includes(query) || '')
                );
                return matchesTab && matchesQuery;
            });
        });

        const totalPages = computed(() => {
            return Math.ceil(filteredTickets.value.length / itemsPerPage.value);
        });

        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value;
            const end = start + itemsPerPage.value;
            return filteredTickets.value.slice(start, end);
        });

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const year = date.getUTCFullYear();
            return `${day}-${month}-${year}`;
        };
        const storage = new Storage(client);

        const downloadFile = async (fileId) => {
            try {
                const fileViewUrl = storage.getFileView('66cd698d001272b42785', fileId); // Replace 'bucketId' with your actual bucket ID

                // Open the file view URL in a new tab
                window.open(fileViewUrl, '_blank');
            } catch (error) {
                console.error('Error opening file:', error);
                // Handle the error, e.g., show a notification to the user
            }
        };

        onMounted(() => {
            fetchTicketList();
        });

        return {
            tickets,
            searchQuery,
            activeTab,
            selectedTicket,
            allStatistic,
            currentPage,
            itemsPerPage,
            tabs,
            fetchTicketList,
            deleteTicket,
            openModal,
            closeModal,
            submitUpdate,
            changePage,
            totalPages,
            paginatedData,
            formatDate,
            downloadFile,
            showModal
        };
    },
    // computed: {
    //     filteredTickets() {
    //         const query = this.searchQuery.toLowerCase();
    //         const ticketsArray = this.tickets || []; // Fallback to empty array if undefined
    //         return ticketsArray.filter(ticket => {
    //             const matchesTab = this.activeTab === 'ALL' || ticket.status.toUpperCase() === this.activeTab;
    //             const matchesQuery = (
    //                 (ticket.companyName?.toLowerCase().includes(query) || '') ||
    //                 (ticket.address?.toLowerCase().includes(query) || '') ||
    //                 (ticket.personName?.toLowerCase().includes(query) || '') ||
    //                 (ticket.phoneNumber?.toLowerCase().includes(query) || '') ||
    //                 (ticket.emailId?.toLowerCase().includes(query) || '') ||
    //                 (ticket.ticketName?.toLowerCase().includes(query) || '') ||
    //                 (ticket.status?.toLowerCase().includes(query) || '') ||
    //                 (ticket.priorityName?.toLowerCase().includes(query) || '') ||
    //                 (ticket.ticketTypeName?.toLowerCase().includes(query) || '')
    //             );
    //             return matchesTab && matchesQuery;
    //         });
    //     },
    //     totalPages() {
    //         return Math.ceil(this.filteredTickets.length / this.itemsPerPage);
    //     },
    //     paginatedData() {
    //         const start = (this.currentPage - 1) * this.itemsPerPage;
    //         const end = start + this.itemsPerPage;
    //         return this.filteredTickets.slice(start, end);
    //     }
    // },
};
</script>

<style scoped>
.nav-link.active {
    font-weight: bolder;
    color: #060389;
}

th {
    color: rgb(255, 255, 255);
    background-color: #060389;
}

.priority-low {
    font-weight: bold;
    color: rgb(189, 189, 8);
}

.priority-medium {
    font-weight: bold;
    color: rgb(14, 167, 78);
}

.priority-high {
    font-weight: bold;
    color: red;
}
</style>