<template>
  <layout-div>
    <div class="container">
      <h2 class="text-center mt-5 mb-3 rounded shadow" :style="{ color: '#060389' }">Priority Type</h2>
      <!-- Modal -->
      <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Create Priority Type</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="form-group">
                  <label for="field1" class="form-label">Priority Type</label>
                  <input type="text" class="form-control" id="field1" v-model="selectedPriority.priorityName" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click="savePriority">Save changes</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body">
          <div class="row justify-content-between mb-3">
            <div class="col-md-4">
              <button type="button" class="btn btn-outline-primary" @click="openCreateModal">
                Create Priority Type
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
                <th>Priority Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(priority, i) in paginatedPriorities" :key="priority.id">
                <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                <td>{{ priority.priorityName }}</td>
                <td>
                  <a data-bs-toggle="modal" data-bs-target="#exampleModal" @click="openModal(priority)">
                    <i class="bi bi-pencil-fill text-primary mx-2"></i>
                  </a>
                  <i class="bi bi-trash3-fill text-danger" @click="handleDelete(priority.$id)"></i>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Controls -->
          <div class="d-flex justify-content-end mt-4" v-if="paginatedPriorities.length > 0">
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
import { Databases, ID } from 'appwrite';  // Ensure ID is imported along with Databases
import { client } from '/src/appwrite'; // Adjust the path if necessary

export default {
  name: 'PriorityType',
  components: {
    LayoutDiv,
  },
  data() {
    return {
      priorities: [],
      selectedPriority: {
        priorityName: '',
      },
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: 0,
      searchQuery: '',
    };
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
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    paginatedPriorities() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.priorities.slice(start, end);
    },
  },
  created() {
    this.fetchPriorities();
  },
    
  methods: {
    async fetchPriorities() {
    try {
      const databases = new Databases(client);
      const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
      const collectionId = '66cd6e59001671bc7ffc'; // Replace with your actual collection ID

      const prioritiesResponse = await databases.listDocuments(dbId, collectionId);
      this.priorities = prioritiesResponse.documents;

      console.log('Priorities:', this.priorities);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  },
    openModal(priority) {
      this.selectedPriority = priority ? { ...priority } : { priorityName: '' };
    },
    openCreateModal() {
      this.selectedPriority = { priorityName: '' };
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
    getAllPriority() {
      axios.get('/api/getAllPriority')
        .then(response => {
          this.priorities = response.data.data;
          this.totalItems = response.data.data.length;
        })
        .catch(error => {
          console.error(error);
        });
    },

    // savePriority() {
    //   const payload = {
    //     priorityName: this.selectedPriority.priorityName,
    //   };
    //   const url = this.selectedPriority.id ? `/api/updatePriority/${this.selectedPriority.id}` : '/api/savePriority';
    //   const method = this.selectedPriority.id ? 'put' : 'post';
    //   axios({ method, url, data: payload })
    //     .then(() => {
    //       Swal.fire({
    //         icon: 'success',
    //         title: method === 'put' ? 'Updated' : 'Saved',
    //         text: `The priority type was ${method === 'put' ? 'updated' : 'saved'} successfully`,
    //       }).then(() => {
    //         this.closeModal();
    //         this.getAllPriority();
    //       });
    //     })
    //     .catch(error => {
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Error',
    //         text: error.response?.data?.message || `There was a problem ${method === 'put' ? 'updating' : 'saving'} the priority type`,
    //       });
    //     });
    // },

    savePriority() {
  const databases = new Databases(client); // Initialize the Databases object with the client
  const payload = {
    priorityName: this.selectedPriority.priorityName,
  };

  if (this.selectedPriority.id) {
    // Update existing priority
    databases.updateDocument(
      '66cc10ed002e90bf6173', // Replace with your actual database ID
      '66cd6e59001671bc7ffc', // Replace with your actual collection ID
       this.selectedPriority.id, // The document ID to update
      payload
    )
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'The priority type was updated successfully',
      }).then(() => {
        this.closeModal();
        this.fetchPriorities();
      });
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'There was a problem updating the priority type',
      });
    });
  } else {
    // Create a new priority
    databases.createDocument(
      '66cc10ed002e90bf6173', // Replace with your actual database ID
      '66cd6e59001671bc7ffc', // Replace with your actual collection ID
      ID.unique(), // Automatically generate a unique document ID
      payload
    )
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'The priority type was saved successfully',
      }).then(() => {
        this.closeModal();
        this.fetchPriorities();
      });
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'There was a problem saving the priority type',
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

      databases.deleteDocument(
        '66cc10ed002e90bf6173', // Replace with your actual database ID
        '66cd6e59001671bc7ffc', // Replace with your actual collection ID
        id // The document ID to delete
      )
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'The priority type was deleted successfully',
        });
        this.fetchPriorities(); // Refresh the list of priorities
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'There was a problem deleting the priority type',
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
  
  // async mounted() {
  //   try {
  //     const databases = new Databases(client);

  //     // Use Promise.all to handle multiple API calls simultaneously
  //     const [priorityResponse] = await Promise.all([
  //       databases.listDocuments('66cc10ed002e90bf6173', '66cd6e59001671bc7ffc')
  //     ]);

  //     this.priorities = priorityResponse.documents;
    

  //     console.log('Priorities:', this.priorities);
      

  //   } catch (error) {
  //     console.error("Failed to fetch data:", error);
  //   }
  // }
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
