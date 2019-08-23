<template>
	<div>
		<h1>Whisper Example Chat Application</h1>
		<div v-if="!configured">
			<input type="checkbox" v-model="asym"/> Asymmetric<br>
			<asymmetric-key-config v-if="asym" @update-asym-key="updateAsymKey" :pub-key="asymPubKey" :key-id="asymKeyId"></asymmetric-key-config>
			<symmetric-key-config v-else @update-sym-key="updateSymKey" :sym-key-id="symKeyId"></symmetric-key-config>
			Set Username: <input v-model="name"/> <br>
			Set Topic: <input v-model="topic"/>
			<button @click="configWithKey" v-if="(asymKeyId || symKeyId) && name">Start</button>
		</div>
		<div v-else>
			<div v-if="asym">
				Current Topic: {{topic}} <br>
				My public key: {{asymPubKey}} <br> <br>
				Recipient's public key: <input  v-model="recipientPubKey" /> <br>
			</div>
			<div v-else>
				Current Topic: {{topic}} <br>
				Symetric Key: {{symKeyId}} <br>
			</div>
			<p v-for="m in msgs">
				<b>{{m.name}}</b>: {{m.text}}
			</p>
			Please type a message: <input v-model="text" @keyup.enter="sendMessage" />
			<button @click="sendMessage">Send</button>
		</div>		
	</div>
</template>

<script>
//import Web3 from 'web3';
import web3 from './web3';
import SymmetricKeyConfig from './SymmetricKeyConfig.vue';
import AsymmetricKeyConfig from './AsymmetricKeyConfig.vue';
import {decodeFromHex, encodeToHex} from './hexutils';

const defaultRecipientPubKey = "";
const defaultTopic = "0x5a4ea131";

export default {
	data() {
		//this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        this.web3 = web3;
		this.shh = this.web3.shh;

		let data = {
			msgs: [],
			text: "",
			symKeyId: "",
			name: "",
			asymKeyId: "",
			asym: true,
			configured: false,
			topic: defaultTopic,
			recipientPubKey: defaultRecipientPubKey,
			asymPubKey: ""
		};

		return data;
	},

	components: {AsymmetricKeyConfig, SymmetricKeyConfig},

	methods: {
		sendMessage() {
			let msg = {
				text: this.text,
				name: this.name
			};


			let postData = {
				ttl: 7,
				topic: this.topic,
				powTarget: 2.01,
				powTime: 100,
				payload: encodeToHex(JSON.stringify(msg)),
			};

			if (this.asym) {
				postData.pubKey = this.recipientPubKey;
				postData.sig = this.asymKeyId;
				this.msgs.push(msg);
			} else
				postData.symKeyID = this.symKeyId;

			this.shh.post(postData);

			this.text = "";
		},

		updateAsymKey() {
			this.shh.newKeyPair().then(id =>{
				this.asymKeyId = id;
				return this.shh.getPublicKey(id).then(pubKey => this.asymPubKey = pubKey).catch(console.log);
			}).catch(console.log);
		    console.log('updated asym keys');
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
				topics: [this.topic],
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
