let state = {
    peer:null,
    connection:[],
    connection_ids:[],
    autoconnect:true
};

const BC_URL = "http://127.0.0.1:8080/";

function start() {

    // setup networking information
    state.peer = new Peer(uuidv4());
    state.peer.metadata = state.peer.id;
    state.connections = [];
    state.connection_ids = [];

    // display info
    setText('#title', `PEER: ${state.peer.id}`);

    // setup connection listener
    state.peer.on('connection', onConnection);

    //document.querySelector("#navcontrol").style.display = "none";
}

function onConnection(conn) {

    document.querySelector("#mainlink").click();
    startClientPage();

    // display conneciton
    logMessage("Connection - " + conn.peer);

    // if not connected already and auto connect to incoming connections is enabled
    if (state.connection_ids.includes(conn.peer) == false && state.autoconnect) {
        // return connection to incoming peer
        let return_connect = state.peer.connect(conn.peer);
        // save connections to state
        state.connections.push(return_connect);
        state.connection_ids.push(conn.peer);

        
    }
    // setup incoming data listener
    conn.on('data', (data) => {
        onData(conn, data);
    });
}

function onData(conn, data) {
    // log message
    logMessage(`${trimId(conn.peer)}: ${data}`);

    if (data.header == 2) {
        recievedBlockchain(data);
    }

    // forward message to other connected peers
    state.connections.forEach(c => {
        if (c.peer != conn.peer) {
            c.send(data);
        }
    });
}

/**
 * Set the text of a DOM Node.
 * @param {String} id 
 * @param {String} val 
 */
function setText(id, val) {
    document.querySelector(id).innerHTML = val;
}


function connect() {
    let id = document.querySelector("#ct").value;
    let connection = state.peer.connect(id);
    state.connections.push(connection);
    state.connection_ids.push(connection.peer);
}

/**
 * Broadcasts a message to all connected peers
 * @param {JSON} msg 
 */
function broadcast(msg) {
    //let msg = document.querySelector("#mt").value;
    state.connections.forEach(c => {
        c.send(msg);
    });
}

function appendText(text) {
    let node = document.createTextNode(text);
    let br = document.createElement('br');
    document.body.appendChild(node);
    document.body.appendChild(br);
}

function logMessage(text) {
    let streambox = document.querySelector("#streamBox");
    streambox.value += text + "\n";
}

function trimId(id) {
    let section = id.split('-')[0];
    section += "...";
    return section;
}

function startClientPage() {
    getPublicKey();
}

function getPublicKey() {
    axios.get(BC_URL + 'pubkey').then( (res) => {
        setText("#pubkey", `Public Key ${res.data}`);
    });
}

function getBlockchain() {
    axios.get(BC_URL + 'blockchain').then( (res) => {
        console.log(res)
    });
}

function broadcastBlockchain() {
    axios.get(BC_URL + 'blockchain').then( (res) => {
        res.data.header = 2; // blockchain flag
        broadcast(res.data);
    });
}

function recievedBlockchain(data) {
    console.log("That's a blockchain: ");
    console.log(data);
}



// start automatically
start();
