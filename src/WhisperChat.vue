<template>
	<div>
		<h1>Whisper Example Chat Application</h1>
		<div v-if="!configured">
			<input type="checkbox" v-model="asym" /> Asymmetric<br>
			<asymmetric-key-config v-if="asym" :pub-key="asymPubKey" :key-id="asymKeyId"></asymmetric-key-config>
			<symmetric-key-config v-else @update-sym-key="updateSymKey" :sym-key-id="symKeyId"></symmetric-key-config>

			username: <input v-model="name" /><br>
			<button @click="configWithKey" v-if="(asymKeyId || symKeyId) && name">Start</button>
		</div>
		<div v-else>
			<div v-if="asym">
				My publick key: {{asymPubKey}}
				Recipient's public key: <input  v-model="recipientPubKey" />
			</div>
			<div v-else>
				Key: {{symKeyId}}
			</div>
			<p v-for="m of msgs">
				<b>{{m.name}}</b>: {{m.text}}
			</p>
			Please type a message: <input v-model="text" @keyup.enter="sendMessage" />
			<button @click="sendMessage">Send</button>
		</div>
	</div>
</template>

<script>
import Web3 from 'web3';
import SymmetricKeyConfig from './SymmetricKeyConfig.vue';
import AsymmetricKeyConfig from './AsymmetricKeyConfig.vue';
import {decodeFromHex, encodeToHex} from './hexutils';

const defaultRecipientPubKey = "0x04ffb2647c10767095de83d45c7c0f780e483fb2221a1431cb97a5c61becd3c22938abfe83dd6706fc1154485b80bc8fcd94aea61bf19dd3206f37d55191b9a9c4";
const defaultTopic = "0x5a4ea131";

export default {
	data() {
		this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
		this.shh = this.web3.shh;

		let data = {
			msgs: [],
			text: "",
			symKeyId: null,
			name: "",
			asymKeyId: null,
			sympw: "",
			asym: true,
			configured: false,
			topic: defaultTopic,
			recipientPubKey: defaultRecipientPubKey,
			asymPubKey: ""
		};

		this.shh.newKeyPair().then(id => {
			data.asymKeyId = id;
			return this.shh.getPublicKey(id).then(pubKey => this.asymPubKey = pubKey).catch(console.log);
		}).catch(console.log);

		return data;
	},

	components: {AsymmetricKeyConfig, SymmetricKeyConfig},

	methods: {
		sendMessage() {
			let msg = {
				text: this.text,
				name: this.name
			};

			this.msgs.push(msg);

			let postData = {
				ttl: 7,
				topic: '0x07678231',
				powTarget: 2.01,
				powTime: 100,
				payload: encodeToHex(JSON.stringify(msg)),
			};

			if (this.asym) {
				postData.pubKey = this.recipientPubKey;
				postData.sig = this.asymKeyId;
			} else
				postData.symKeyID = this.symKeyId;

			this.shh.post(postData);

			this.text = "";
		},

		updateSymKey(sympw) {
			this.shh.generateSymKeyFromPassword(sympw).then(symKeyID => this.symKeyId = symKeyID)
		},

		configWithKey() {
			// TODO use a form
			if (!this.name || this.name.length == 0) {
				alert("Please pick a username");
				return;
			}

			let filter = {
				topics: ['0xdeadbeef']
			};

			if (this.asym) {
				if(!this.asymKeyId) {
					alert("No valid asymmetric key");
				return;
			}

				filter.privateKeyID = this.asymKeyId;
			} else {
				if (!this.symKeyId || this.symKeyId.length == 0) {
					alert("please enter a pasword to generate a key!");
				return;
			}

				filter.symKeyID = this.symKeyId;
			}

			this.msgFilter = this.shh.newMessageFilter(filter).then(filterId => {
				setInterval(() => {
					this.shh.getFilterMessages(filterId).then(messages => {
						for (let msg of messages) {
							let message = decodeFromHex(msg.payload);
							this.msgs.push({
								name: message.name,
								text: message.text
							});
						}
					});
				}, 1000);
			});

			this.configured = true;
		}
	}
};
</script>
