<template>
  <layout-div>
    <div class="container">
      <h2 class="text-center mt-5 mb-3 rounded shadow" :style="{ color: '#060389' }">Company List</h2>
      <div class="card">
        <div class="card-body">
          <div class="row justify-content-between mb-3">
            <div class="col-md-4">
              <button type="button" class="btn btn-outline-primary" @click="openModal()">Create Company</button>
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
                <th>Company Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedCompanies.length === 0">
                <td colspan="5" class="text-center fs-5">No data available.</td>
              </tr>
              <tr v-for="(company, index) in paginatedCompanies" :key="company.id">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ company.name }}</td>
                <td>{{ company.email }}</td>
                <td>{{ company.phone }}</td>
                <td>
                  <button @click="openModal(company)" class="btn btn-outline-info mx-1">Edit</button>
                  <i class="bi bi-trash3-fill text-danger" @click="deleteCompany(company.$id)"></i>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Controls -->
          <div class="d-flex justify-content-end mt-4" v-if="paginatedCompanies.length > 0">
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

    <!-- Create/Edit Company Modal -->
    <div class="modal fade" id="editCompanyModal" tabindex="-1" aria-labelledby="editCompanyModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editCompanyModalLabel">{{ isEditing ? 'Edit Company' : 'Create Company' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEditing ? updateCompany() : createCompany()">
              <div class="mb-3">
                <label for="companyName" class="form-label">Company Name</label>
                <input type="text" class="form-control" id="companyName" v-model="selectedCompany.name" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="selectedCompany.email" required>
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Phone</label>
                <input type="text" class="form-control" id="phone" v-model="selectedCompany.phone" required>
              </div>
              <button type="submit" class="btn btn-primary">{{ isEditing ? 'Update' : 'Create' }}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </layout-div>
</template>


<script>
import LayoutDiv from '../LayoutDiv.vue';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Databases } from 'appwrite';  // Ensure ID is imported along with Databases
import { client } from '/src/appwrite'; // Adjust the path if necessary
export default {
  name: 'CompanyList',
  components: {
    LayoutDiv,
  },
  data() {
    return {
      companies: [],
      selectedCompany: {
         id: '',
        name: '',
        email: '',
        phone: '',
      },
      isEditing: false,
      currentPage: 1,
      itemsPerPage: 5,
      searchQuery: '',
    };
  },
  created() {
    this.fetchCompanyList();
  },
  computed: {
    totalPages() {
      return Math.ceil(this.companies.length / this.itemsPerPage);
    },
    paginatedCompanies() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.companies.slice(start, end);
    },
  },
  methods: {
   
    filteredTickets() {
      const query = this.searchQuery.toLowerCase();
      return this.companies.filter(company => {
        const matchesQuery = (
          (company.name?.toLowerCase().includes(query) || '')
        );
        return matchesQuery;
      });
    },

//     fetchCompanyList() {
//       const databases = new Databases(client);
//   // Assuming 'companies' is your collection ID and 'databaseId' is your database ID
//   const databaseId = '66cc10ed002e90bf6173';
//   const collectionId = '66cf2d3f0024b79b4fbd';

//   databases.listDocuments(databaseId, collectionId)
//     .then(response => {
//       this.companies = response.documents;
//     })
//     .catch(error => {
//       console.error('Error fetching companies:', error.message);
//     });
// },

fetchEmployeeList() {
  const databases = new Databases(client); // Initialize the Databases service
  const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
  const collectionId = '66cfc6ec0005fdc28b38'; // Replace with your actual collection ID

  databases.listDocuments(dbId, collectionId)
    .then(response => {
      console.log('API Response:', response);
      this.employees = response.documents.map(doc => ({
        ...doc,
        id: doc.$id  // Ensure the ID is correctly assigned
      }));
    })
    .catch(error => {
      console.error('Error fetching employees:', error.message);
    });
}
,
    // fetchCompanyList() {
    //   axios.get('/api/getCompanylist')
    //     .then(response => {
    //       this.companies = response.data.data;
    //     })
    //     .catch(error => {
    //       console.error('Error fetching companies:', error);
    //     });
    // },
    openModal(company = null) {
      if (company) {
        this.selectedCompany = { ...company };
        console.log('Selected company:', this.selectedCompany);
        this.isEditing = true;
      } else {
        this.selectedCompany = {
          id: '',
          name: '',
          email: '',
          phone: '',
          userId:'',
        };
        this.isEditing = false;
      }
      const modal = new Modal(document.getElementById('editCompanyModal'));
      modal.show();
    },
    closeModal() {
      const modalElement = document.getElementById('editCompanyModal');
      const modalInstance = Modal.getInstance(modalElement);
      modalInstance.hide();
    },
    createCompany() {
     
      const databases = new Databases(client);
     
  // Assuming 'companies' is your collection ID and 'databaseId' is your database ID
  const databaseId = '66cc10ed002e90bf6173';
  const collectionId = '66cf2d3f0024b79b4fbd';


  databases.createDocument(databaseId, collectionId, 'unique()', this.selectedCompany)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Created',
        text: 'The company was created successfully',
      }).then(() => {
        this.fetchCompanyList();
        this.closeModal();
      });
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'There was a problem creating the company',
      });
    });
  
}
,
    // createCompany() {
    //   axios.post('/api/saveCompanyDetails', this.selectedCompany)
    //     .then(() => {
    //       Swal.fire({
    //         icon: 'success',
    //         title: 'Created',
    //         text: 'The company was created successfully',
    //       }).then(() => {
    //         this.fetchCompanyList();
    //         this.closeModal();
    //       });
    //     })
    //     .catch(error => {
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Error',
    //         text: error.response?.data?.message || 'There was a problem creating the company',
    //       });
    //     });
    // },
//     updateCompany() {
//       const databases = new Databases(client);
//   // Assuming 'companies' is your collection ID and 'databaseId' is your database ID
//    const databaseId = '66cc10ed002e90bf6173';
//   const collectionId = '66cf2d3f0024b79b4fbd';
//   console.log('Document ID:', this.selectedCompany.id);
//   databases.updateDocument(databaseId, collectionId, this.selectedCompany.$id, this.selectedCompany)
//     .then(() => {
//       Swal.fire({
//         icon: 'success',
//         title: 'Updated',
//         text: 'The company was updated successfully',
//       }).then(() => {
//         this.fetchCompanyList();
//         this.closeModal();
//       });
//     })
//     .catch(error => {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.message || 'There was a problem updating the company',
//       });
//     });
// }
// updateCompany() {
//   const databases = new Databases(client);
//   const databaseId = '66cc10ed002e90bf6173';
//   const collectionId = '66cf2d3f0024b79b4fbd';

//   if (!this.selectedCompany.id) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Error',
//       text: 'Document ID is missing or invalid.',
//     });
//     return;
//   }

//   // Clean the selectedCompany object
//   const { id, ...updateData } = this.selectedCompany;

//   databases.updateDocument(databaseId, collectionId, id, updateData)
//     .then(() => {
//       Swal.fire({
//         icon: 'success',
//         title: 'Updated',
//         text: 'The company was updated successfully',
//       }).then(() => {
//         this.fetchCompanyList();
//         this.closeModal();
//       });
//     })
//     .catch(error => {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.message || 'There was a problem updating the company',
//       });
//     });
// }
// updateCompany() {
//   const databases = new Databases(client);
//   const dbId = '66cc10ed002e90bf6173';
//   const cid = '66cf2d3f0024b79b4fbd';

//   // Check the structure of selectedCompany before updating
//   console.log('Document before update:', this.selectedCompany);

//   // Ensure only schema fields are included
//   const { id, ...updateData } = this.selectedCompany;

//   // Validate that id is correctly set
//   if (!id) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Error',
//       text: 'Document ID is missing or invalid.',
//     });
//     return;
//   }

//   databases.updateDocument(dbId, cid, id, updateData)
//     .then(() => {
//       Swal.fire({
//         icon: 'success',
//         title: 'Updated',
//         text: 'The company was updated successfully',
//       }).then(() => {
//         this.fetchCompanyList();
//         this.closeModal();
//       });
//     })
//     .catch(error => {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.message || 'There was a problem updating the company',
//       });
//     });
// }

updateCompany() {
  const databases = new Databases(client);
  const dbId = '66cc10ed002e90bf6173';
  const cid = '66cf2d3f0024b79b4fbd';

  // Check the structure of selectedCompany before updating
  console.log('Document before update:', this.selectedCompany);

  // Ensure only schema fields are included
  const { id, name, email, phone } = this.selectedCompany;

  // Validate that id is correctly set
  if (!id) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Document ID is missing or invalid.',
    });
    return;
  }

  // Create the payload with only the fields to be updated
  const payload = {
    name,
    email,
    phone
  };

  // Perform the update operation
  databases.updateDocument(dbId, cid, id, payload)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'The company was updated successfully',
      }).then(() => {
        this.fetchCompanyList();
        this.closeModal();
      });
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'There was a problem updating the company',
      });
    });
}

,
    // updateCompany() {
    //   axios.put(`/api/updateCompanyDetails/${this.selectedCompany.id}`, this.selectedCompany)
    //     .then(() => {
    //       Swal.fire({
    //         icon: 'success',
    //         title: 'Updated',
    //         text: 'The company was updated successfully',
    //       }).then(() => {
    //         this.fetchCompanyList();
    //         this.closeModal();
    //       });
    //     })
    //     .catch(error => {
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Error',
    //         text: error.response?.data?.message || 'There was a problem updating the company',
    //       });
    //     });
    // },
    // deleteCompany(id) {
    //   Swal.fire({
    //     title: 'Are you sure?',
    //     text: "You won't be able to revert this!",
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#3085d6',
    //     cancelButtonColor: '#d33',
    //     confirmButtonText: 'Yes, delete it!'
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       axios.delete(`/api/deleteCompanyDetails/${id}`)
    //         .then(() => {
    //           Swal.fire({
    //             icon: 'success',
    //             title: 'Company deleted successfully!',
    //             showConfirmButton: false,
    //             timer: 1500
    //           });
    //           this.fetchCompanyList(); // Refresh list after deletion
    //         })
    //         .catch(error => {
    //           Swal.fire({
    //             icon: 'error',
    //             title: 'An Error Occurred!',
    //             showConfirmButton: false,
    //             timer: 1500
    //           });
    //           console.error('Error deleting company:', error);
    //         });
    //     }
    //   });
    // },
    deleteCompany(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      const databases = new Databases(client);
      const dbId = '66cc10ed002e90bf6173'; // Your database ID
      const collectionId = '66cf2d3f0024b79b4fbd'; // Your collection ID

      // Perform the delete operation
      databases.deleteDocument(dbId, collectionId, id)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Company deleted successfully!',
            showConfirmButton: false,
            timer: 1500
          });
          this.fetchCompanyList(); // Refresh list after deletion
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'An Error Occurred!',
            text: error.message || 'There was a problem deleting the company',
            showConfirmButton: false,
            timer: 1500
          });
          console.error('Error deleting company:', error);
        });
    }
  });
}

,
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
};
</script>


<style scoped>
th {
  color: rgb(255, 255, 255);
  background-color: #060389;
}

.text-danger {
  cursor: pointer;
}

.table-bordered {
  border: 1px solid #dee2e6;
}
</style>