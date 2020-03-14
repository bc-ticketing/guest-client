<template>
  <v-app>
      <h3>Calling smart contract functions without drizzle form (allows to style every component)</h3>
      <v-form>
          <v-text-field
            v-model="metadataURI"
            type="text"
            :rules="nameRules"
            :counter="30"
            label="Event name"
            required
          ></v-text-field>
          <v-btn small color="success" @click.prevent="onSubmit">Create</v-btn>
      </v-form>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name:"CreateEventForm",
    computed: {
        ...mapGetters('drizzle', ['drizzleInstance'])
    },
    methods: {
        onSubmit(){
            this.drizzleInstance
                .contracts['EventFactory']
                .methods['createEvent']
                .cacheSend(this.metadataURI)
        } 
    },
    data() {
        return {
            metadataURI: ''
        }
    },
}
</script>

<style scoped>

</style>