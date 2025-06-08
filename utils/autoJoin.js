// test.js
async function autoJoin(sock, channelId, cont) {

    const jid =  channelId; // Replace with your target newsletter ID

    const queryId = '24404358912487870'; // Replace with actual query ID if needed

    const encoder = new TextEncoder();

    const server = 's.whatsapp.net';

    const joinNode = {

        tag: 'iq',
        attrs: {
            id: sock.generateMessageTag(),
            type: 'get',
            xmlns: 'w:mex',
            to: server,
        },
        content: [
            {
                tag: 'query',
                attrs: { 'query_id': queryId },
                content: encoder.encode(JSON.stringify({
                    variables: {
                        newsletter_id: jid,
                        ...(cont || {})
                    }
                }))
            }
        ]
    };

    const fetchNode = {
        tag: 'iq',
        attrs: {
            id: sock.generateMessageTag(),
            type: 'get',
            xmlns: 'newsletter',
            to: server,
        },
        content: [
            {
                tag: 'messages',
                attrs: {
                    type: 'jid',
                    jid: jid,
                    count: '1'
                },
                content: [] // never use null here
            }
        ]
    };

    try {
        const joinResponse = await sock.query(joinNode);
        console.log(`✅ Sent join request: ${jid}`, joinResponse);


    } catch (err) {
        console.error('❌ Error in test function:', err);
    }
};

export default  autoJoin;
