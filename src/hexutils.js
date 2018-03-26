// hexutils.js - Helper functions for hex string to ascii string conversion

export function decodeFromHex(hex) {
	if (!hex || hex.length < 4 || hex[0] != "0" || hex[1] != "x" || hex.length % 2 != 0) {
		console.log(`Invalid hex string: ${hex}`);
		return "";
	} else {
		let result = "";

		for (let i = 2; i<hex.length; i+=2) {
			let n = parseInt(hex.slice(i, i+2), 16);
			result += String.fromCharCode(n);
		}

		try {
			return JSON.parse(result);
		} catch (e) {
			return "Error: message could not be decrypted";
		}
	}
}

export function encodeToHex(string) {
	let hexEncodedMessage = "0x";

	try {
		for (let c of string) {
			hexEncodedMessage += c.charCodeAt(0).toString(16);
		}
	} catch(e) {
		
	}

	return hexEncodedMessage;
}