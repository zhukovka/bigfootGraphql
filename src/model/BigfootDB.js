export default class BigfootDB {
    constructor (dbName, dbVersion) {
        // Make sure IndexedDB is supported before attempting to use it
        if (!window.indexedDB) {
            throw new Error("Indexed DB is not supported");
        }
        this.dbName = dbName;
        this.dbVersion = dbVersion;
    }

    connect () {
        return new Promise((resolve, reject) => {
            //open a new request for the database
            const db = window.indexedDB.open(this.dbName, this.dbVersion);

            //set up basic error logging
            db.onerror = function (event) {
                console.log("Database error: ", event.target.error);
                reject("Database error: " + event.target.error);
            };

            //database’s upgrade method, which will create 'matches' object store
            db.onupgradeneeded = function (event) {
                const db = event.target.result;
                const upgradeTransaction = event.target.transaction;
                let matchesStore;
                if (!db.objectStoreNames.contains("matches")) {
                    matchesStore = db.createObjectStore("matches",
                        {autoIncrement: true} //matches don't have ids, use autoincrement
                    );
                } else {
                    matchesStore = upgradeTransaction.objectStore("matches");
                }

                // if (!matchesStore.indexNames.contains("idx_status")) {
                //     matchesStore.createIndex("idx_status", "status", {unique: false});
                // }
            };

            db.onsuccess = function (event) {
                resolve(event.target.result);
            };
        });
    }

    async openStore (storeName, transactionMode) {
        const db = await this.connect();
        return db
            .transaction(storeName, transactionMode)
            .objectStore(storeName);
    };

    async populateMatches (matches) {
        const s = await this.openStore("matches", "readwrite");
        const success = async () => {
            const store = await this.openStore("matches", "readwrite");
            for (const match of matches) {
                store.add(match);
            }
        };
        s.clear().onsuccess = success;
    }

//    collection('matches').find();
    async collection (storeName, transactionMode = "readonly") {
        return new Promise(async (resolve, reject) => {
            const s = await this.openStore(storeName, transactionMode);
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
}