<template>
  <layout-div>
    <h2 class="text-center mt-5 mb-3 rounded shadow" :style="{ color: '#060389' }">Raise New Ticket</h2>
    <div class="card rounded">
      <!-- <div class="card-header">
        <button type="button" @click="user.logout()">
          Logout
        </button>
      </div> -->
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="companyName" class="form-label">Company Name</label>
              <input type="text" id="companyName" v-model="form.companyName" @input="clearError('companyName')"
                class="form-control shadow" :class="{ 'is-invalid': errors.companyName }" />
              <div v-if="errors.companyName" class="text-danger">{{ errors.companyName }}</div>
            </div>

            <div class="col-md-4 mb-3">
              <label for="address" class="form-label">Address</label>
              <input type="text" id="address" v-model="form.address" @input="clearError('address')"
                class="form-control shadow" :class="{ 'is-invalid': errors.address }" />
              <div v-if="errors.address" class="text-danger">{{ errors.address }}</div>
            </div>

            <div class="col-md-4 mb-3">
              <label for="personName" class="form-label">Person Name</label>
              <input type="text" id="personName" v-model="form.personName" @input="clearError('personName')"
                class="form-control shadow" :class="{ 'is-invalid': errors.personName }" />
              <div v-if="errors.personName" class="text-danger">{{ errors.personName }}</div>
            </div>

            <!-- Phone Number Field -->
            <div class="col-md-4 mb-3">
              <label for="phoneNumber" class="form-label">Phone Number</label>
              <input type="text" id="phoneNumber" v-model="form.phoneNumber" @input="clearError('phoneNumber')"
                class="form-control shadow" :class="{ 'is-invalid': errors.phoneNumber }" />
              <div v-if="errors.phoneNumber" class="text-danger">{{ errors.phoneNumber }}</div>
            </div>

            <!-- Email ID Field -->
            <div class="col-md-4 mb-3">
              <label for="emailId" class="form-label">Email ID</label>
              <input type="email" id="emailId" v-model="form.emailId" @input="clearError('emailId')"
                class="form-control shadow" :class="{ 'is-invalid': errors.emailId }" />
              <div v-if="errors.emailId" class="text-danger">{{ errors.emailId }}</div>
            </div>

            <!-- Expected Delivery Date Field -->
            <div class="col-md-4 mb-3">
              <label for="expectedDeliveryDate" class="form-label">Expected Delivery Date</label>
              <input type="date" id="expectedDeliveryDate" v-model="form.expectedDeliveryDate"
                @input="clearError('expectedDeliveryDate')" class="form-control shadow"
                :class="{ 'is-invalid': errors.expectedDeliveryDate }" />
              <div v-if="errors.expectedDeliveryDate" class="text-danger">{{ errors.expectedDeliveryDate }}</div>
            </div>

            <div class="col-md-4 mb-3">
              <label for="ticketId" class="form-label">Ticket ID</label>
              <select id="ticketId" v-model="form.ticketId"  @change="clearError('ticketId')" class="form-control shadow"
                :class="{ 'is-invalid': errors.ticketId }">
                <option value="" disabled>Select ticket</option>
                <option v-for="ticket in tickets" :key="ticket.$id" :value="ticket.$id">
                  {{ ticket.ticketType }}
                </option>
              </select>
              <div v-if="errors.ticketId" class="text-danger">{{ errors.ticketId }}</div>
            </div>

            <div class="col-md-4 mb-3">
              <label for="priorityId" class="form-label">Priority</label>
              <select id="priorityId" v-model="form.priorityId" @change="clearError('priorityId')"
                class="form-control shadow" :class="{ 'is-invalid': errors.priorityId }">
                <option value="" disabled>Select priority</option>
                <option v-for="priority in priorities" :key="priority.$id" :value="priority.$id">
                  {{ priority.priorityName }}
                </option>
              </select>
              <div v-if="errors.priorityId" class="text-danger">{{ errors.priorityId }}</div>
            </div>


            <div class="col-md-4 mb-3">
              <label for="commentBox" class="form-label">Comment</label>
              <textarea id="commentBox" v-model="form.commentBox" @input="clearError('commentBox')"
                class="form-control shadow" :class="{ 'is-invalid': errors.commentBox }"></textarea>
              <div v-if="errors.commentBox" class="text-danger">{{ errors.commentBox }}</div>
            </div>

            <!-- File Upload Field -->
            <div class="col-md-4 mb-3">
              <label for="file" class="form-label">Upload File</label>
              <input type="file" id="file" @change="handleFileUpload" class="form-control shadow" />
            </div>

            <!-- Submit & Cancel Buttons -->
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
import LayoutDiv from '../LayoutDiv.vue';
import Swal from 'sweetalert2';
import { Databases, Storage, ID } from 'appwrite';
import { client,account } from '/src/appwrite'; // Adjust the path
// import { mapState } from 'vuex';

export default {
  name: 'TicketCreate',
  components: {
    LayoutDiv,
  },

  data() {
    return {
      form: {
        companyName: '',
        address: '',
        personName: '',
        phoneNumber: '',
        emailId: '',
        expectedDeliveryDate: '',
        ticketId: '',
        priorityId: '',
        commentBox: '',
        file: null,
        userId: ''
      },
      priorities: [],
      tickets: [],
      errors: {},
      isSaving: false,
      submitted: false
    };
  },


  async mounted() {
    try {
      const databases = new Databases(client);

      // Use Promise.all to handle multiple API calls simultaneously
      const [priorityResponse, ticketsResponse] = await Promise.all([
        databases.listDocuments('66cc10ed002e90bf6173', '66cd6e59001671bc7ffc'),
        databases.listDocuments('66cc10ed002e90bf6173', '66cd808f003345510c04')
      ]);

      this.priorities = priorityResponse.documents;
      this.tickets = ticketsResponse.documents;

      console.log('Priorities:', this.priorities);
      console.log('Tickets:', this.tickets);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    try {
      const userDetails = await account.get();
      this.userId = userDetails.$id; // Store userId in a data property
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  }
  ,
  methods: {
    async handleSubmit() {
      // this.submitted = true;
      this.form.userId=this.userId;
      alert(this.userId)
      this.errors = {};
      // Validation
      if (!this.form.companyName) this.errors.companyName = 'Company Name is required';
      if (!this.form.address) this.errors.address = 'Address is required';
      if (!this.form.personName) this.errors.personName = 'Person Name is required';
      if (!this.form.phoneNumber) this.errors.phoneNumber = 'Phone Number is required';
      if (!this.form.emailId) this.errors.emailId = 'Email ID is required';
      if (!this.form.expectedDeliveryDate) this.errors.expectedDeliveryDate = 'Expected Delivery Date is required';
      if (!this.form.ticketId) this.errors.ticketId = 'Ticket ID is required';
      if (!this.form.priorityId) this.errors.priorityId = 'Priority is required';
      if (!this.form.commentBox) this.errors.commentBox = 'Comment is required';

      // Proceed if there are no errors
      if (Object.keys(this.errors).length === 0) {
        this.isSaving = true;

        try {

          const databases = new Databases(client);
          const storage = new Storage(client);
          // // Get user ID from localStorage
          // const userId = localStorage.getItem('userId');
          // console.log(userId)
          // if (!userId) {
          //   throw new Error("User ID is not available");
          // }
          // Upload the file if it exists
          let fileId = null;
          if (this.form.file) {
            const file = await storage.createFile(
              '66cd698d001272b42785', // Replace with your bucket ID
              ID.unique(),
              this.form.file
            );
            fileId = file.$id;
          }

          // Insert form data into the database
          await databases.createDocument(
            '66cc10ed002e90bf6173', // Replace with your database ID
            '66cc12a000254e1488ff', // Replace with your collection ID
            ID.unique(),
            {
              companyName: this.form.companyName,
              address: this.form.address,
              personName: this.form.personName,
              phoneNumber: this.form.phoneNumber,
              emailId: this.form.emailId,
              expectedDeliveryDate: this.form.expectedDeliveryDate,
              ticketId: this.form.ticketId,
              priorityId: this.form.priorityId,
              commentBox: this.form.commentBox,
              fileId: fileId,
              userId: this.form.userId
              // userName: this.form.userName,
            }
          );

          Swal.fire({
            icon: 'success',
            title: 'Ticket raised successfully!',
            showConfirmButton: true,
            timer: 1500,
          }).then(() => {
            this.$router.push('/list');
          });

          this.isSaving = false;
          this.resetForm();
        } catch (error) {
          this.isSaving = false;
          Swal.fire({
            icon: 'error',
            title: 'An Error Occurred!',
            showConfirmButton: false,
            timer: 1500
          });
        }
      }
    },
    clearError(field) {
      this.errors[field] = '';
    },
    resetForm() {
      this.form = {
        companyName: '',
        address: '',
        personName: '',
        phoneNumber: '',
        emailId: '',
        expectedDeliveryDate: '',
        ticketId: '',
        priorityId: '',
        file: null,
        commentBox: ''
      };
      this.errors = {};
      this.submitted = false;
    },
    handleFileUpload(event) {
      this.form.file = event.target.files[0];
    }
  }
};
</script>

<style scoped></style>
