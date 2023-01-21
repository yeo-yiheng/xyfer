const {MongoClient} = require('mongodb');
const bankAddresses = "bank_addresses";
const password = "Wqed6i6cOyCSSrED";

async function init() {
    const uri = `mongodb+srv://xyfer:${password}@xyfer.gsxxjli.mongodb.net/test`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
    } catch (e) {
        console.log(e);
    } 
    return client;
}

async function insertDocument(doc, db_name, collection_name) {
    const client = await init();
    console.log(`Inserting: ${doc}`)
    try {
        const database = client.db(db_name);
        const collection = database.collection(collection_name);
        const query = await collection.findOne(doc);
        if (query == null) {
            const res = await collection.insertOne(doc);
        }
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();   
    }
}

async function updateDocument(filter, doc, options, db_name, collection_name) {
    const client = await init();
    try {
        const database = client.db(db_name);
        const collection = database.collection(collection_name);
        const result = await collection.updateOne(filter, doc, options);
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }
}

async function insertMultipleDocuments(docs, db_name, collection_name) {
    const client = await init();
    try {
        const database = client.db(db_name);
        const collection = database.collection(collection_name);
        const options = { ordered: true };
        const res = await collection.insertMany(docs, options);
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }
}

async function createDatabase(db_name) {
    const client = await init();
    try {
        let dbList = await client.db().admin().listDatabases();
        let isDuplicate = false;
        dbList.databases.forEach(db => {
            if (db.name == db_name) {
                isDuplicate = true;
            }
        });
        if (!isDuplicate) {
            const database = client.db(db_name);
        }
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }
}

async function createCollection(db_name, collection_name) {
    console.log(db_name + " and " + collection_name);
    const client = await init();
    try {
        let isDuplicate = false;
        const collections = await client
        .db(db_name)
        .listCollections()
        .toArray();
        for (c of collections) {
            console.log(c);
            if (c['name'] == collection_name) {
                isDuplicate = true;
            }
        }

        if (!isDuplicate) {
            const collection = client.db(db_name).collection(collection_name);
        }
        
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }
}

async function queryCollection(query, options, db_name, collection_name) {
    const client = await init();
    try {
        const database = client.db(db_name);
        const collection = database.collection(collection_name);
        let res;
        if (options == null) {
            res = await collection.findOne(query);
        } else {
            res = await collection.findOne(query, options);
        }
        console.log("Found: " + JSON.stringify(res));
        return res;
    } catch(e) {
        console.log(e);
    } finally {
        await client.close();
    }
}
 
module.exports = {
    insertDocument,
    insertMultipleDocuments,
    createCollection,
    createDatabase,
    queryCollection,
    updateDocument
};