<template>
	<div>
		Asymetric key id: {{keyId || "Click button to start generating the key"}}<br>
		My Public key: {{pubKey || ""}}
		<p><button v-if="!keyId" @click="generateKey">Generate Asym Keys</button></p>
	</div>
</template>

<script>
export default {
	props: ["pubKey", "keyId"],

	methods: {
		generateKey() {
			this.$emit('update-asym-key');
		}
	}
}
</script>
