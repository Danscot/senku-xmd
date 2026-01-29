// listProtoMessages.js
import { proto } from "baileys";

function listProtoMessageTypes() {
    console.log("=== All ProtocolMessage Types ===");
    const types = proto.Message.ProtocolMessage.proto;
    for (const [key, value] of Object.entries(types)) {
        console.log(`${key}: ${value}`);
    }
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    listProtoMessageTypes();
}

export default listProtoMessageTypes;
