<template>
  <layout-div>
    <div class="container">
      <h2 class="text-center mt-5 mb-3 rounded shadow" :style="{ color: '#060389' }">Ticket Type</h2>
      <!-- Modal -->
      <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Create Ticket Type</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveTicket">
                <div class="row">
                  <div class="form-group">
                    <label for="field1" class="form-label">Ticket Type</label>
                    <input type="text" class="form-control" id="field1" v-model="selectedPriority.ticketType" />

                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body">
          <div class="row justify-content-between mb-3">
            <div class="col-md-4">
              <button type="button" class="btn btn-outline-primary" @click="openCreateModal">
                Create Ticket Type
              </button>
            </div>
            <div class="col-md-4">
              <input type="text" class="form-control" placeholder="search..." v-model="searchQuery"
                @input="filterTickets">
            </div>
          </div>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Ticket Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedData.length === 0">
                <td colspan="3" class="text-center fs-5">No data available.</td>
              </tr>
              <tr v-for="(ticket, i) in paginatedData" :key="ticket.id">
                <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                <td>{{ ticket.ticketType }}</td>
                <td>
                  <a data-bs-toggle="modal" data-bs-target="#exampleModal" @click="openModal(ticket)">
                    <i class="bi bi-pencil-fill text-primary mx-2"></i>
                  </a>
                  <i class="bi bi-trash3-fill text-danger mx-2" @click="handleDelete(ticket.$id)"></i>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- Pagination -->
          <div class="d-flex justify-content-end mt-4" v-if="paginatedData.length > 0">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </layout-div>
</template>

<script>
import axios from 'axios';
import LayoutDiv from '../LayoutDiv.vue';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Databases,ID } from 'appwrite';  // Ensure ID is imported along with Databases
import { client } from '/src/appwrite'; // Adjust the path if necessary
export default {
  name: 'TicketList',
  components: {
    LayoutDiv,
  },

  data() {
    return {
      tickets: [],
      ticketType: '',
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: 0,
      searchQuery: '',
      selectedPriority: {
        ticketType: '',
      },
    };
  },
  // async mounted() {
  //   try {
  //     const databases = new Databases(client);

  //     // Use Promise.all to handle multiple API calls simultaneously
  //     const [ ticketsResponse] = await Promise.all([
  //       databases.listDocuments('66cc10ed002e90bf6173', '66cd808f003345510c04')
  //     ]);

  //     this.tickets = ticketsResponse.documents;
  //     console.log('Tickets:', this.tickets);

  //   } catch (error) {
  //     console.error("Failed to fetch data:", error);
  //   }
  // },
  created() {
    this.fetchTickets();
  },
  computed: {
    filteredTickets() {
      const query = this.searchQuery.toLowerCase();
      return this.tickets.filter(ticket => {
        const matchesQuery = (
          (ticket.ticketName?.toLowerCase().includes(query) || '')
        );
        return matchesQuery;
      });
    },
    totalPages() {
      return Math.ceil(this.tickets.length / this.itemsPerPage);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tickets.slice(start, end);
    },
  },
  methods: {
    async fetchTickets() {
    try {
      const databases = new Databases(client);
      const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
      const collectionId = '66cd808f003345510c04'; // Replace with your actual collection ID

      const ticketsResponse = await databases.listDocuments(dbId, collectionId);
      this.tickets = ticketsResponse.documents;
      console.log('Tickets:', this.tickets);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  },
    openModal(ticket) {
      console.log(ticket)
      this.selectedPriority = ticket ? { ...ticket } : { ticketType: '' };
    },
    openCreateModal() {
      this.selectedPriority = { ticketType: '' };
      const modalElement = document.getElementById('exampleModal');
      const modalInstance = new Modal(modalElement);
      modalInstance.show();
    },
    closeModal() {
      const modalElement = document.getElementById('exampleModal');
      const modalInstance = Modal.getInstance(modalElement);
      modalInstance.hide();
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.parentNode.removeChild(backdrop);
      }
    },
    getAllTicketType() {
      axios.get('api/getAllTicketType')
        .then(response => {
          this.tickets = response.data.data;
          this.totalItems = response.data.data.length;
        })
        .catch(error => {
          console.error(error);
        });
    },
    // saveTicket() {
    //   const payload = { ticketName: this.selectedPriority.ticketName };
    //   const url = this.selectedPriority.id ? `/api/updateTicketType/${this.selectedPriority.id}` : '/api/saveTicketType';
    //   const method = this.selectedPriority.id ? 'put' : 'post';
    //   axios({ method, url, data: payload })
    //     .then(() => {
    //       Swal.fire({
    //         icon: 'success',
    //         title: method === 'put' ? 'Updated' : 'Saved',
    //         text: `The ticket type was ${method === 'put' ? 'updated' : 'saved'} successfully`,
    //       }).then(() => {
    //         this.closeModal();
    //         this.getAllTicketType();
    //       });
    //     })
    //     .catch(error => {
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Error',
    //         text: error.response?.data?.message || `There was a problem ${method === 'put' ? 'updating' : 'saving'} the priority type`,
    //       });
    //     });
    //  }
    saveTicket() {
  const databases = new Databases(client); // Initialize the Databases object with the client
  const payload = { ticketType: this.selectedPriority.ticketType };
  const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
  const collectionId = '66cd808f003345510c04'; // Replace with your actual collection ID

  if (this.selectedPriority.$id) {
    // Update existing ticket
    databases.updateDocument(dbId, collectionId, this.selectedPriority.$id, payload)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: 'The ticket type was updated successfully',
        }).then(() => {
          this.closeModal();
          this.fetchTickets();
        });
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'There was a problem updating the ticket type',
        });
      });
  } else {
    // Create new ticket
    databases.createDocument(dbId, collectionId, ID.unique(), payload)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Saved',
          text: 'The ticket type was saved successfully',
        }).then(() => {
          this.closeModal();
          this.fetchTickets();
        });
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'There was a problem saving the ticket type',
        });
      });
  }
},



handleDelete(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      const databases = new Databases(client); // Initialize Databases object with the client
      const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
      const collectionId = '66cd808f003345510c04'; // Replace with your actual collection ID

      databases.deleteDocument(dbId, collectionId, id)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'The ticket type was deleted successfully',
          });
          this.fetchTickets(); // Refresh the list of ticket types
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'There was a problem deleting the ticket type',
          });
        });
    }
  });
},

    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
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
</style>
