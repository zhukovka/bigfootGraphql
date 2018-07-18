export default class BigfootDB {

    constructor (dbName, dbVersion) {
        // Make sure IndexedDB is supported before attempting to use it
        if (!indexedDB) {
            throw new Error("Indexed DB is not supported");
        }
        this.dbName = dbName;
        this.dbVersion = dbVersion;
    }

    connect () {
        return new Promise((resolve, reject) => {
            //open a new request for the database
            const db = indexedDB.open(this.dbName, this.dbVersion);

            //set up basic error logging
            db.onerror = function (event) {
                console.log("Database error: ", event.target.error);
                reject("Database error: " + event.target.error);
            };

            //database’s upgrade method, which will create 'matches' and 'videos' object stores
            db.onupgradeneeded = (event) => {
                let matchesStore = this.createStore(event, "matches", {autoIncrement: true}); //matches don't have ids, use autoincrement

                //
                //TODO: create indices for matches
                // if (!matchesStore.indexNames.contains("idx_status")) {
                //     matchesStore.createIndex("idx_status", "status", {unique: false});
                // }

                let videosStore = this.createStore(event, "videos", {keyPath: "id"});

                //TODO: create indices for videos
                // if (!videosStore.indexNames.contains("idx_status")) {
                //     videosStore.createIndex("idx_status", "status", {unique: false});
                // }
            };

            db.onsuccess = function (event) {
                resolve(event.target.result);
            };
        });
    }

    createStore (event, storeName, options) {
        const db = event.target.result;
        const upgradeTransaction = event.target.transaction;
        let store;
        if (!db.objectStoreNames.contains(storeName)) {
            store = db.createObjectStore(storeName, options);
        } else {
            store = upgradeTransaction.objectStore(storeName);
        }
        return store;
    }

    /**
     *
     * @param storeName:string
     * @param transactionMode: IDBTransaction.mode
     * @returns {Promise<IDBObjectStore>}
     */
    async openStore (storeName, transactionMode) {
        const db = await this.connect();
        return db
            .transaction(storeName, transactionMode)
            .objectStore(storeName);
    };

    populate (storeName, matches) {
        //TODO: is it possible to make this in one step?
        return new Promise(async (resolve, reject) => {
            const s = await this.openStore(storeName, "readwrite");
            const populate = async () => {
                const store = await this.openStore(storeName, "readwrite");
                for (const match of matches) {
                    store.add(match);
                }
                resolve();
            };
            s.clear().onsuccess = populate;
        })
    }

    collection (storeName, transactionMode = "readonly") {
        const s = this.openStore(storeName, transactionMode);
        return new DBResult(s);
    }
}


class DBResult {

    /**
     *
     * @param store{Promise<IDBObjectStore>}
     */
    constructor (store) {
        this.store = store;
    }

    /**
     *
     * @param search
     * @returns {Promise<Array>}
     */
    find (search) {
        return new Promise(async (resolve, reject) => {
            const s = await this.store;
            const cursor = s.openCursor();
            let results = [];
            cursor.onsuccess = function (event) {
                let cursor = event.target.result;
                if (!cursor) {
                    return resolve(results);
                }
                results.push(cursor.value.match);
                cursor.continue();
            };
            cursor.onerror = reject;
        })
    }

    toArray () {

    }
}