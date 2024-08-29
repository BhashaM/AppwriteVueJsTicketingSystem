<template>
  <layout-div>
    <h2 class="text-center mt-5 mb-3 rounded shadow" :style="{ color: '#060389' }">Employee Create</h2>
    <div class="card rounded">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-4 mb-2">
              <label for="firstName" class="form-label">First Name</label>
              <input type="text" id="firstName" v-model="form.firstName" @input="clearError('firstName')"
                class="form-control shadow" :class="{ 'is-invalid': errors.firstName }" />
              <div v-if="errors.firstName" class="text-danger">{{ errors.firstName }}</div>
            </div>
            <div class="col-md-4 mb-2">
              <label for="lastName" class="form-label">Last Name</label>
              <input type="text" id="lastName" v-model="form.lastName" @input="clearError('lastName')"
                class="form-control shadow" :class="{ 'is-invalid': errors.lastName }" />
              <div v-if="errors.lastName" class="text-danger">{{ errors.lastName }}</div>
            </div>
            <div class="col-md-4 mb-2">
              <label for="companyName" class="form-label">Company Name</label>
              <input type="text" id="companyName" v-model="form.companyName" @input="clearError('companyName')"
                class="form-control shadow" :class="{ 'is-invalid': errors.companyName }" />
              <div v-if="errors.companyName" class="text-danger">{{ errors.companyName }}</div>
            </div>
            <div class="col-md-4 mb-2">
              <label for="phoneNumber" class="form-label">Phone Number</label>
              <input type="tel" id="phoneNumber" v-model="form.phoneNumber" @input="clearError('phoneNumber')"
                class="form-control shadow" :class="{ 'is-invalid': errors.phoneNumber }" />
              <div v-if="errors.phoneNumber" class="text-danger">{{ errors.phoneNumber }}</div>
            </div>
            <div class="col-md-4 mb-2">
              <label for="emailId" class="form-label">Email Id</label>
              <input type="email" id="emailId" v-model="form.emailId" @input="clearError('emailId')"
                class="form-control shadow" :class="{ 'is-invalid': errors.emailId }" />
              <div v-if="errors.emailId" class="text-danger">{{ errors.emailId }}</div>
            </div>
            <div class="col-md-4 mb-2">
              <label for="address" class="form-label">Address</label>
              <input type="text" id="address" v-model="form.address" @input="clearError('address')"
                class="form-control shadow" :class="{ 'is-invalid': errors.address }" />
              <div v-if="errors.address" class="text-danger">{{ errors.address }}</div>
            </div>
            <div class="col-md-4 mb-2">
              <label for="userName" class="form-label">Username</label>
              <input type="text" id="userName" v-model="form.userName" @input="clearError('userName')"
                class="form-control shadow" :class="{ 'is-invalid': errors.userName }" />
              <div v-if="errors.userName" class="text-danger">{{ errors.userName }}</div>
            </div>
            <div class="col-md-4 mb-2">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" v-model="form.password" @input="clearError('password')"
                class="form-control shadow" :class="{ 'is-invalid': errors.password }" />
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
            </div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <button class="btn btn-danger me-md-2" type="button" @click="resetForm">Cancel</button>
              <button class="btn btn-success" type="submit" :disabled="isSaving">Submit</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </layout-div>
</template>

<script>
// import axios from 'axios';
import Swal from 'sweetalert2';
import { Databases,ID } from 'appwrite';  // Ensure ID is imported along with Databases
import { client } from '/src/appwrite';
export default {
  name: 'EmployeeCreate',
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        companyName: '',
        phoneNumber: '',
        emailId: '',
        address: '',
        userName: '',
        password: ''
      },
      errors: {},
      isSaving: false,
      submitted: false // Added flag
    };
  },
  methods: {
    handleSubmit() {
  this.submitted = true; // Set flag to true when form is submitted
  this.errors = {}; // Clear previous errors

  // Validate form before sending the request
  if (!this.validateForm()) {
    this.isSaving = false;
    return;
  }

  // Send data to AppWrite
  this.isSaving = true;

  const databases = new Databases(client); // Initialize the Databases service
  const dbId = '66cc10ed002e90bf6173'; // Replace with your actual database ID
  const collectionId = '66cfc6ec0005fdc28b38'; // Replace with your actual collection ID

  databases.createDocument(dbId, collectionId, ID.unique(), this.form)
    .then(response => {
      // Check if the document was created successfully
      if (response.$id) {
        Swal.fire({
          icon: 'success',
          title: 'Employee details saved successfully!',
          showConfirmButton: true,
          timer: 1500
        }).then(() => {
          // Redirect to the employee list page after the message is shown
          this.$router.push('/employeelist');
        });
        this.resetForm();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'An error occurred while saving employee details!',
          text: 'Unexpected error occurred',
          showConfirmButton: true
        });
      }
    })
    .catch(error => {
      // Handle error response
      console.error('Error occurred:', error);
      Swal.fire({
        icon: 'error',
        title: 'An error occurred while saving employee details!',
        text: error.message || 'Unexpected error occurred',
        showConfirmButton: true
      });
    })
    .finally(() => {
      this.isSaving = false; // Reset saving flag
    });
}
,
    // handleSubmit() {
    //   this.submitted = true; // Set flag to true when form is submitted
    //   this.errors = {}; // Clear previous errors

    //   // Validate form before sending the request
    //   if (!this.validateForm()) {
    //     this.isSaving = false;
    //     return;
    //   }

    //   // Send POST request to the backend with JSON data
    //   this.isSaving = true;
    //   axios.post('/api/saveEmployeeDetails', this.form, {
    //     headers: {
    //       'Content-Type': 'application/json' // Set the content type to JSON
    //     }
    //   })
    //   .then(response => {
    //       // Check if the overallStatus indicates success
    //       if (response.data.overallStatus === 'success') {
    //         // Handle successful response
    //         Swal.fire({
    //           icon: 'success',
    //           title: 'Employee details saved successfully!',
    //           showConfirmButton: true,
    //           timer: 1500
    //         }).then(() => {
    //           // Redirect to the employee list page after the message is shown
    //           this.$router.push('/user/admin/employeelist');
    //         });
    //         this.resetForm();
    //       } else {
    //         // If the overallStatus is not success, treat it as an error
    //         Swal.fire({
    //           icon: 'error',
    //           title: 'An error occurred while saving employee details!',
    //           text: response.data.message || 'Unexpected error occurred',
    //           showConfirmButton: true
    //         });
    //       }
    //     })
    //   // .catch(error => {
    //   //   // Handle error response
    //   //   console.error('Error occurred:', error.response ? error.response.data : error.message);
    //   //   Swal.fire({
    //   //     icon: 'error',
    //   //     title: 'An error occurred while saving employee details!',
    //   //     text: error.response ? error.response.data.message : error.message,
    //   //     showConfirmButton: true
    //   //   });
    //   // })
    //   // .finally(() => {
    //   //   this.isSaving = false; // Reset saving flag
    //   // });
    // },
    validateForm() {
      let valid = true;
      // First Name validation
      if (!this.form.firstName) {
        this.errors.firstName = 'First name is required.';
        valid = false;
      } else if (this.form.firstName.length < 2) {
        this.errors.firstName = 'First name must be at least 2 characters long.';
        valid = false;
      }
      // Last Name validation
      if (!this.form.lastName) {
        this.errors.lastName = 'Last name is required.';
        valid = false;
      } else if (this.form.lastName.length < 2) {
        this.errors.lastName = 'Last name must be at least 2 characters long.';
        valid = false;
      }
      // Company Name validation
      if (!this.form.companyName) {
        this.errors.companyName = 'Company name is required.';
        valid = false;
      }
      // Phone Number validation
      if (!this.form.phoneNumber) {
        this.errors.phoneNumber = 'Phone number is required.';
        valid = false;
      } else if (!/^\d{10}$/.test(this.form.phoneNumber)) {
        this.errors.phoneNumber = 'Phone number must be 10 digits.';
        valid = false;
      }
      // Email Id validation
      if (!this.form.emailId) {
        this.errors.emailId = 'Email ID is required.';
        valid = false;
      } else if (!/\S+@\S+\.\S+/.test(this.form.emailId)) {
        this.errors.emailId = 'Email ID must be valid.';
        valid = false;
      }
      // Address validation
      if (!this.form.address) {
        this.errors.address = 'Address is required.';
        valid = false;
      }
      // Username validation
      if (!this.form.userName) {
        this.errors.userName = 'Username is required.';
        valid = false;
      }
      // Password validation
      if (!this.form.password) {
        this.errors.password = 'Password is required.';
        valid = false;
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters long.';
        valid = false;
      }
      return valid;
    },
    clearError(field) {
      this.errors[field] = '';
    },
    resetForm() {
      this.form = {
        firstName: '',
        lastName: '',
        companyName: '',
        phoneNumber: '',
        emailId: '',
        address: '',
        userName: '',
        password: ''
      };
      this.errors = {};
      this.submitted = false; // Reset flag
    }
  }
};
</script>

<style scoped>
.is-invalid {
  border-color: red;
}
</style>
