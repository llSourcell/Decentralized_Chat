<template>
	<div>
		Key generation password: <input v-model="sympw" @input="updateKey" /><br>
		Symmetric key ID: {{symKeyId || "Type a password to start generating the key"}}
	</div>
</template>

<script>
export default {
	props: ['symKeyId'],

	data() {
		return {
			sympw: ""
		}
	},

	methods: {
		updateKey() {
			this.$emit('update-sym-key', this.sympw);
		}
	}
}
</script>