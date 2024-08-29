<template>
  <layout-div>
    <div class="container">
      <h2 class="text-center mt-5 mb-3 rounded shadow" :style="{ color: '#060389' }">Employee List</h2>
      <div class="card">
        <div class="card-body">
          <div class="row justify-content-between mb-3">
            <div class="col-md-2">
              <router-link to="../admin/employeecreate" class="btn btn-outline-primary">
                Create Employee
              </router-link>
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
                <th>First Name</th>
                <th>Last Name</th>
                <th>Company Name</th>
                <th>Phone Number</th>
                <th>Email Id</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedData.length === 0">
                <td colspan="8" class="text-center fs-5">No data available.</td>
              </tr>
              <tr v-for="(employee, i) in paginatedData" :key="employee.id">
                <td>{{ i + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ employee.firstName }}</td>
                <td>{{ employee.lastName }}</td>
                <td>{{ employee.companyName }}</td>
                <td>{{ employee.phoneNumber }}</td>
                <td>{{ employee.emailId }}</td>
                <td>{{ employee.address }}</td>
                <td>
                  <i class="bi bi-pencil-fill text-primary mx-2" @click="openModal(employee)"></i>
                  <i class="bi bi-trash3-fill text-danger" @click="handleDelete(employee.$id)"></i>
                </td>
              </tr>
            </tbody>
          </table>
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

    <!-- Edit Employee Modal -->
    <div class="modal fade" id="editEmployeeModal" tabindex="-1" aria-labelledby="editEmployeeModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editEmployeeModalLabel">Edit Employee</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateEmployee">
              <div class="mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <input type="text" class="form-control" id="firstName" v-model="selectedEmployee.firstName">
              </div>
              <div class="mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <input type="text" class="form-control" id="lastName" v-model="selectedEmployee.lastName">
              </div>
              <div class="mb-3">
                <label for="companyName" class="form-label">Company Name</label>
                <input type="text" class="form-control" id="companyName" v-model="selectedEmployee.companyName">
              </div>
              <div class="mb-3">
                <label for="phoneNumber" class="form-label">Phone Number</label>
                <input type="text" class="form-control" id="phoneNumber" v-model="selectedEmployee.phoneNumber">
              </div>
              <div class="mb-3">
                <label for="emailId" class="form-label">Email Id</label>
                <input type="email" class="form-control" id="emailId" v-model="selectedEmployee.emailId">
              </div>
              <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <input type="text" class="form-control" id="address" v-model="selectedEmployee.address">
              </div>
              <button type="submit" class="btn btn-primary">Update</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </layout-div>
</template>

<script>
//import axios from 'axios';
import LayoutDiv from '../LayoutDiv.vue';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Databases } from 'appwrite';  // Ensure ID is imported along with Databases
import { client } from '/src/appwrite';
export default {
  name: 'EmployeeList',
  components: {
    LayoutDiv,
  },
  data() {
    return {
      employees: [],
      selectedEmployee: {
        firstName: '',
        lastName: '',
        companyName: '',
        phoneNumber: '',
        emailId: '',
        address: '',
      },
      activeTab: 'ALL',
      tabs: [
        { name: 'ALL', label: 'ALL' },
        // Add other tabs if needed
      ],
      currentPage: 1,
      itemsPerPage: 5, // Number of items per page
    };
  },
  created() {
    this.fetchEmployeeList();
  },
  computed: {
    totalPages() {
      return Math.ceil(this.employees.length / this.itemsPerPage);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.employees.slice(start, end);
    },
  },

  methods: {
    setActiveTab(tabName) {
      this.activeTab = tabName;
      // Filter employees based on activeTab if needed
    },
    // fetchEmployeeList() {
    //   axios.get('/api/getEmployeelist')
    //     .then(response => {
    //       this.employees = response.data.data;
    //       console.log(this.employees);
    //     })
    //     .catch(error => {
    //       console.error('Error fetching employees:', error);
    //     });
    // },
    fetchEmployeeList() {
  const databases = new Databases(client); // Initialize the Databases service
  const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
  const collectionId = '66cfc6ec0005fdc28b38'; // Replace with your actual collection ID


  databases.listDocuments(dbId, collectionId)
    .then(response => {
      this.employees = response.documents; // Get the list of documents (employees)
      console.log(this.employees);
    })
    .catch(error => {
      console.error('Error fetching employees:', error);
    });
}
,
    openModal(employee) {
      this.selectedEmployee = { ...employee };
      const modal = new Modal(document.getElementById('editEmployeeModal'));
      modal.show();
    },
    closeModal() {
      const modalElement = document.getElementById('editEmployeeModal');
      const modalInstance = Modal.getInstance(modalElement);
      modalInstance.hide();
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.parentNode.removeChild(backdrop);
      }
    },

    // closeModal() {
    //   const modalElement = document.getElementById('editEmployeeModal');
    //   const modalInstance = Modal.getInstance(modalElement);
    //   modalInstance.hide();
    // },
    // updateEmployee() {
    //   axios.put('/api/updateUser', this.selectedEmployee)
    //     .then(response => {
    //       console.log(response);
    //       Swal.fire({
    //         icon: 'success',
    //         title: 'Updated',
    //         text: 'The employee was updated successfully',
    //       }).then(() => {
    //         const modalElement = document.getElementById('editEmployeeModal');
    //         const modalInstance = Modal.getInstance(modalElement);
    //         modalInstance.hide();
    //         this.fetchEmployeeList();
    //       });
    //     })
    //     .catch(error => {
    //       console.log(error);
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Error',
    //         text: 'There was a problem updating the employee',
    //       });
    //     });
    // },
    updateEmployee() {
  const databases = new Databases(client);
  const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
  const collectionId = '66cfc6ec0005fdc28b38'; // Replace with your actual collection ID

  // Check the structure of selectedEmployee before updating
  console.log('Document before update:', this.selectedEmployee);
 
  // Destructure the necessary fields from the selectedEmployee object
  const { $id, firstName, lastName, companyName, phoneNumber, emailId, address} = this.selectedEmployee;

  // Validate that $id is correctly set
  if (!$id) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Employee ID is missing or invalid.',
    });
    return;
  }

  // Create the payload with only the fields to be updated
  const payload = {
        firstName,
        lastName,
        companyName,
        phoneNumber,
        emailId,
        address,
  };

  // Perform the update operation
  databases.updateDocument(dbId, collectionId, $id, payload)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'The employee was updated successfully',
      }).then(() => {
        
        this.closeModal(); // Assuming you have a method to close the modal
        this.fetchEmployeeList();
      });
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'There was a problem updating the employee',
      });
    });
}

,
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // handleDelete(id) {
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
    //       axios.delete(`/api/deleteEmployee/${id}`)
    //         .then(() => {
    //           Swal.fire({
    //             icon: 'success',
    //             title: 'Employee deleted successfully!',
    //             showConfirmButton: false,
    //             timer: 1500
    //           });
    //           this.fetchEmployeeList();
    //         })
    //         .catch(error => {
    //           Swal.fire({
    //             icon: 'error',
    //             title: 'An Error Occurred!',
    //             showConfirmButton: false,
    //             timer: 1500
    //           });
    //           console.error('Error deleting employee:', error);
    //         });
    //     }
    //   });
    // },
    handleDelete(id) {
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
      const databases = new Databases(client); // Initialize Databases object with the client
      const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
      const collectionId = '66cfc6ec0005fdc28b38'; // Replace with your actual collection ID

      // Perform the delete operation
      databases.deleteDocument(dbId, collectionId, id)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Employee deleted successfully!',
            showConfirmButton: false,
            timer: 1500
          });
          this.fetchEmployeeList(); // Refresh the list after deletion
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'An Error Occurred!',
            showConfirmButton: false,
            timer: 1500
          });
          console.error('Error deleting employee:', error);
        });
    }
  });
}

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

.text-danger {
  cursor: pointer;
}

.table-bordered {
  border: 1px solid #dee2e6;
}
</style>
