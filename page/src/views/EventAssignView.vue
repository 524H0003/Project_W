<template>
  <FormContainerComp
    btn-label="Assign"
    :btn-handle="handleAssign"
    :alert="alert"
    name="Create event"
  >
    <FormTextInputComp
      name="Title"
      placeholder="Your event name"
      v-model="input.title"
      type="text"
    />
    <FormTextInputComp
      name="Description"
      placeholder="Event description"
      v-model="input.description"
      type="text"
    />
    <FormSelectInputComp
      name="Event type"
      v-model="input.type"
      :list="new Map(Object.entries(EventType))"
    />
    <FormSelectInputComp
      name="Event status"
      v-model="input.status"
      :list="new Map(Object.entries(EventStatus))"
    />
    <FormTextInputComp
      name="Maximum participant"
      v-model="input.maxParticipants"
      type="text"
      placeholder="Enter a number"
      icon="people"
    />
    <FormTextInputComp
      name="Location"
      v-model="input.location"
      type="text"
      placeholder="Enter location"
      icon="location_on"
    />
    <FormTextInputComp
      name="Required skills"
      v-model="input.requiredSkills"
      icon="draw"
      type="text"
    />
    <FormDateInputComp name="Start date" v-model="input.startDate" />
    <FormDateInputComp name="End date" v-model="input.endDate" />
    <FormDateInputComp
      name="Application deadline"
      v-model="input.applicationDeadline"
    />
  </FormContainerComp>
</template>

<script setup lang="ts">
import { alert, apiErrorHandler, assignEvent } from '@/auth.service'
import FormContainerComp from '@/components/FormContainerComp.vue'
import FormDateInputComp from '@/components/FormDateInputComp.vue'
import FormSelectInputComp from '@/components/FormSelectInputComp.vue'
import FormTextInputComp from '@/components/FormTextInputComp.vue'
import { EventStatus, EventType, IEventInfo } from 'project-w-backend'
import { reactive } from 'vue'

const input = reactive<IEventInfo>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    type: EventType.Internship,
    status: EventStatus.Draft,
    positionsAvailable: 0,
    maxParticipants: 0,
    location: '',
    applicationDeadline: new Date(),
    requiredSkills: '',
    additionalFields: '',
  }),
  handleAssign = () => apiErrorHandler(assignEvent(input))
</script>
